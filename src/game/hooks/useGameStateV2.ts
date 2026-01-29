import { useState, useCallback, useRef, useEffect } from "react";
import { GAME_CONFIG_V2, GameStateV2 } from "../constantsV2";

export interface GameSessionV2 {
  // Pre-load decisions
  usePiperSampling: boolean;
  useWeighbridge: boolean;

  // Fill state
  currentFill: number;
  farmTankLevel: number;
  currentFlowRate: number;

  // Outcomes
  spillAmount: number;
  spillTriggered: boolean;
  emptyCapacity: number;
  milkLeftBehind: number;

  // Time tracking
  timeDelta: number; // +/- minutes from decisions
  nudgeCount: number;
}

const createInitialSession = (): GameSessionV2 => ({
  usePiperSampling: false,
  useWeighbridge: false,
  currentFill: 0,
  farmTankLevel: GAME_CONFIG_V2.FARM_TANK_CAPACITY_L,
  currentFlowRate: GAME_CONFIG_V2.FLOW_RATE_MIN_LPS,
  spillAmount: 0,
  spillTriggered: false,
  emptyCapacity: 0,
  milkLeftBehind: 0,
  timeDelta: 0,
  nudgeCount: 0,
});

export function useGameStateV2() {
  const [gameState, setGameState] = useState<GameStateV2>("attract");
  const [session, setSession] = useState<GameSessionV2>(createInitialSession());
  const [isFilling, setIsFilling] = useState(false);

  // Flow rate variance timer
  const flowRateIntervalRef = useRef<number | null>(null);
  const fillIntervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Random flow rate generator
  const getRandomFlowRate = useCallback(() => {
    const min = GAME_CONFIG_V2.FLOW_RATE_MIN_LPS;
    const max = GAME_CONFIG_V2.FLOW_RATE_MAX_LPS;
    return Math.random() * (max - min) + min;
  }, []);

  // Start flow rate variance when playing
  useEffect(() => {
    if (gameState === "playing") {
      flowRateIntervalRef.current = window.setInterval(() => {
        setSession((prev) => ({
          ...prev,
          currentFlowRate: getRandomFlowRate(),
        }));
      }, GAME_CONFIG_V2.FLOW_VARIANCE_INTERVAL_MS);

      return () => {
        if (flowRateIntervalRef.current) {
          clearInterval(flowRateIntervalRef.current);
        }
      };
    }
  }, [gameState, getRandomFlowRate]);

  // Filling loop
  useEffect(() => {
    if (isFilling && !session.spillTriggered) {
      lastTickRef.current = performance.now();

      fillIntervalRef.current = window.setInterval(() => {
        const now = performance.now();
        const deltaTime = (now - lastTickRef.current) / 1000; // seconds
        lastTickRef.current = now;

        setSession((prev) => {
          // Don't fill if already spilled
          if (prev.spillTriggered) return prev;

          const fillDelta = prev.currentFlowRate * deltaTime;
          let newFill = prev.currentFill + fillDelta;
          let newFarmLevel = prev.farmTankLevel - fillDelta;

          // Check for spill
          let spillAmount = 0;
          let spillTriggered = false;

          if (newFill > GAME_CONFIG_V2.TANKER_CAPACITY_L) {
            spillAmount = newFill - GAME_CONFIG_V2.TANKER_CAPACITY_L;
            newFill = GAME_CONFIG_V2.TANKER_CAPACITY_L;
            spillTriggered = true;
          }

          // Don't drain below 0
          newFarmLevel = Math.max(0, newFarmLevel);

          return {
            ...prev,
            currentFill: newFill,
            farmTankLevel: newFarmLevel,
            spillAmount: prev.spillAmount + spillAmount,
            spillTriggered,
          };
        });
      }, 16); // ~60fps

      return () => {
        if (fillIntervalRef.current) {
          clearInterval(fillIntervalRef.current);
        }
      };
    }
  }, [isFilling, session.spillTriggered]);

  // Start game from attract mode
  const startGame = useCallback(() => {
    setSession(createInitialSession());
    setGameState("questions");
  }, []);

  // Complete pre-load questions
  const completeQuestions = useCallback(
    (usePiperSampling: boolean, useWeighbridge: boolean) => {
      // Calculate time delta from decisions
      let timeDelta = 0;

      // Piper sampling: YES = +20 mins saved, NO = -20 mins lost
      if (usePiperSampling) {
        timeDelta += GAME_CONFIG_V2.AGITATION_TIME_SAVED;
      } else {
        timeDelta -= GAME_CONFIG_V2.AGITATION_TIME_SAVED;
      }

      // Weighbridge: YES = -10 mins, NO (Piper) = 0
      if (useWeighbridge) {
        timeDelta -= GAME_CONFIG_V2.WEIGHBRIDGE_TIME_COST;
      }

      setSession((prev) => ({
        ...prev,
        usePiperSampling,
        useWeighbridge,
        timeDelta,
        currentFlowRate: getRandomFlowRate(),
      }));

      setGameState("playing");
    },
    [getRandomFlowRate]
  );

  // Start filling
  const startFilling = useCallback(() => {
    if (!session.spillTriggered) {
      setIsFilling(true);
    }
  }, [session.spillTriggered]);

  // Stop filling
  const stopFilling = useCallback(() => {
    setIsFilling(false);
  }, []);

  // Nudge (small increment)
  const nudgeFill = useCallback(() => {
    if (session.spillTriggered) return;

    setSession((prev) => {
      let newFill = prev.currentFill + GAME_CONFIG_V2.NUDGE_AMOUNT_L;
      let newFarmLevel = prev.farmTankLevel - GAME_CONFIG_V2.NUDGE_AMOUNT_L;

      // Check for spill
      let spillAmount = 0;
      let spillTriggered = false;

      if (newFill > GAME_CONFIG_V2.TANKER_CAPACITY_L) {
        spillAmount = newFill - GAME_CONFIG_V2.TANKER_CAPACITY_L;
        newFill = GAME_CONFIG_V2.TANKER_CAPACITY_L;
        spillTriggered = true;
      }

      newFarmLevel = Math.max(0, newFarmLevel);

      return {
        ...prev,
        currentFill: newFill,
        farmTankLevel: newFarmLevel,
        spillAmount: prev.spillAmount + spillAmount,
        spillTriggered,
        nudgeCount: prev.nudgeCount + 1,
      };
    });
  }, [session.spillTriggered]);

  // Complete load and go to results
  const completeLoad = useCallback(() => {
    setIsFilling(false);

    // Calculate final values
    setSession((prev) => {
      const targetFill = GAME_CONFIG_V2.TARGET_FILL_L;
      const emptyCapacity = Math.max(0, targetFill - prev.currentFill);
      const milkLeftBehind = prev.farmTankLevel;

      return {
        ...prev,
        emptyCapacity,
        milkLeftBehind,
      };
    });

    setGameState("results");
  }, []);

  // Reset to attract mode
  const resetToAttract = useCallback(() => {
    setSession(createInitialSession());
    setIsFilling(false);
    setGameState("attract");
  }, []);

  // Calculated costs (for display)
  const calculateCosts = useCallback(() => {
    const spillCost = session.spillAmount * GAME_CONFIG_V2.MILK_VALUE_PER_L;

    const emptyCapacityPercent =
      session.emptyCapacity / GAME_CONFIG_V2.TANKER_CAPACITY_L;
    const haulageWasteCost =
      emptyCapacityPercent * GAME_CONFIG_V2.HAULAGE_COST_PER_LOAD;

    const nudgeTimePenalty =
      session.nudgeCount * (GAME_CONFIG_V2.NUDGE_TIME_PENALTY_SEC / 60);
    const totalTimeMin = Math.abs(session.timeDelta) + nudgeTimePenalty;
    const timeCost =
      session.timeDelta < 0
        ? totalTimeMin * GAME_CONFIG_V2.TIME_COST_PER_MIN
        : 0;

    const totalLoadCost = spillCost + haulageWasteCost + timeCost;
    const dailyCost = totalLoadCost * GAME_CONFIG_V2.FARM_LOADS_PER_DAY;
    const annualCost = dailyCost * GAME_CONFIG_V2.DAYS_PER_YEAR;

    return {
      spillCost,
      haulageWasteCost,
      timeCost,
      totalLoadCost,
      dailyCost,
      annualCost,
    };
  }, [session]);

  return {
    gameState,
    session,
    isFilling,
    costs: calculateCosts(),

    // Actions
    startGame,
    completeQuestions,
    startFilling,
    stopFilling,
    nudgeFill,
    completeLoad,
    resetToAttract,
  };
}
