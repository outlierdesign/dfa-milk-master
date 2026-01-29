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

// Config type that can be overridden by admin settings
export interface GameConfig {
  TANKER_CAPACITY_L: number;
  FARM_TANK_CAPACITY_L: number;
  TARGET_FILL_PERCENT: number;
  MILK_VALUE_PER_L: number;
  HAULAGE_COST_PER_LOAD: number;
  TIME_COST_PER_MIN: number;
  FARM_LOADS_PER_DAY: number;
  DAYS_PER_YEAR: number;
  AGITATION_TIME_SAVED: number;
  WEIGHBRIDGE_TIME_COST: number;
  FLOW_RATE_MIN_LPS: number;
  FLOW_RATE_MAX_LPS: number;
  FLOW_VARIANCE_INTERVAL_MS: number;
  NUDGE_AMOUNT_L: number;
  NUDGE_TIME_PENALTY_SEC: number;
  RESULTS_DISPLAY_TIME: number;
  ATTRACT_IDLE_TIME: number;
  TARGET_FILL_L: number;
}

const createInitialSession = (config: GameConfig): GameSessionV2 => ({
  usePiperSampling: false,
  useWeighbridge: false,
  currentFill: 0,
  farmTankLevel: config.FARM_TANK_CAPACITY_L,
  currentFlowRate: config.FLOW_RATE_MIN_LPS,
  spillAmount: 0,
  spillTriggered: false,
  emptyCapacity: 0,
  milkLeftBehind: 0,
  timeDelta: 0,
  nudgeCount: 0,
});

export function useGameStateV2(config: GameConfig = GAME_CONFIG_V2 as unknown as GameConfig) {
  const [gameState, setGameState] = useState<GameStateV2>("attract");
  const [session, setSession] = useState<GameSessionV2>(() => createInitialSession(config));
  const [isFilling, setIsFilling] = useState(false);

  // Store config ref for use in intervals
  const configRef = useRef(config);
  configRef.current = config;

  // Flow rate variance timer
  const flowRateIntervalRef = useRef<number | null>(null);
  const fillIntervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Random flow rate generator
  const getRandomFlowRate = useCallback(() => {
    const min = configRef.current.FLOW_RATE_MIN_LPS;
    const max = configRef.current.FLOW_RATE_MAX_LPS;
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
      }, config.FLOW_VARIANCE_INTERVAL_MS);

      return () => {
        if (flowRateIntervalRef.current) {
          clearInterval(flowRateIntervalRef.current);
        }
      };
    }
  }, [gameState, getRandomFlowRate, config.FLOW_VARIANCE_INTERVAL_MS]);

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

          if (newFill > configRef.current.TANKER_CAPACITY_L) {
            spillAmount = newFill - configRef.current.TANKER_CAPACITY_L;
            newFill = configRef.current.TANKER_CAPACITY_L;
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
    setSession(createInitialSession(configRef.current));
    setGameState("questions");
  }, []);

  // Complete pre-load questions
  const completeQuestions = useCallback(
    (usePiperSampling: boolean, useWeighbridge: boolean) => {
      // Calculate time delta from decisions
      let timeDelta = 0;

      // Piper sampling: YES = +X mins saved, NO = -X mins lost
      if (usePiperSampling) {
        timeDelta += configRef.current.AGITATION_TIME_SAVED;
      } else {
        timeDelta -= configRef.current.AGITATION_TIME_SAVED;
      }

      // Weighbridge: YES = -X mins, NO (Piper) = 0
      if (useWeighbridge) {
        timeDelta -= configRef.current.WEIGHBRIDGE_TIME_COST;
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
      let newFill = prev.currentFill + configRef.current.NUDGE_AMOUNT_L;
      let newFarmLevel = prev.farmTankLevel - configRef.current.NUDGE_AMOUNT_L;

      // Check for spill
      let spillAmount = 0;
      let spillTriggered = false;

      if (newFill > configRef.current.TANKER_CAPACITY_L) {
        spillAmount = newFill - configRef.current.TANKER_CAPACITY_L;
        newFill = configRef.current.TANKER_CAPACITY_L;
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
      const targetFill = configRef.current.TARGET_FILL_L;
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
    setSession(createInitialSession(configRef.current));
    setIsFilling(false);
    setGameState("attract");
  }, []);

  // Calculated costs (for display)
  const calculateCosts = useCallback(() => {
    const cfg = configRef.current;
    const spillCost = session.spillAmount * cfg.MILK_VALUE_PER_L;

    const emptyCapacityPercent = session.emptyCapacity / cfg.TANKER_CAPACITY_L;
    const haulageWasteCost = emptyCapacityPercent * cfg.HAULAGE_COST_PER_LOAD;

    const nudgeTimePenalty = session.nudgeCount * (cfg.NUDGE_TIME_PENALTY_SEC / 60);
    const totalTimeMin = Math.abs(session.timeDelta) + nudgeTimePenalty;
    const timeCost = session.timeDelta < 0 ? totalTimeMin * cfg.TIME_COST_PER_MIN : 0;

    const totalLoadCost = spillCost + haulageWasteCost + timeCost;
    const dailyCost = totalLoadCost * cfg.FARM_LOADS_PER_DAY;
    const annualCost = dailyCost * cfg.DAYS_PER_YEAR;

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
