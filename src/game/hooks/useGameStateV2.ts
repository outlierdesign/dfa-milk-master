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
  spillWarningActive: boolean; // Warning shown but can still fill
  spillAcknowledged: boolean; // Popup dismissed
  showSpillPopup: boolean; // Show the farmer text message popup
  emptyCapacity: number;
  milkLeftBehind: number;

  // Time tracking
  timeDelta: number; // +/- minutes from decisions
  nudgeCount: number;

  // Timing metrics for receipt
  fillStartTime: number | null;
  fillEndTime: number | null;
  totalFillDuration: number; // seconds
  flowRateSamples: number[]; // for calculating average
  averageFlowRate: number;
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
  GAME_SPEED_MULTIPLIER: number;
}

const createInitialSession = (config: GameConfig): GameSessionV2 => ({
  usePiperSampling: false,
  useWeighbridge: false,
  currentFill: 0,
  farmTankLevel: config.FARM_TANK_CAPACITY_L,
  currentFlowRate: config.FLOW_RATE_MIN_LPS,
  spillAmount: 0,
  spillTriggered: false,
  spillWarningActive: false,
  spillAcknowledged: false,
  showSpillPopup: false,
  emptyCapacity: 0,
  milkLeftBehind: 0,
  timeDelta: 0,
  nudgeCount: 0,
  // Timing metrics
  fillStartTime: null,
  fillEndTime: null,
  totalFillDuration: 0,
  flowRateSamples: [],
  averageFlowRate: 0,
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

  // Filling loop - allows continued filling during overfill warning
  useEffect(() => {
    if (isFilling && !session.spillAcknowledged) {
      lastTickRef.current = performance.now();

      fillIntervalRef.current = window.setInterval(() => {
        const now = performance.now();
        const deltaTime = (now - lastTickRef.current) / 1000; // seconds
        lastTickRef.current = now;

        setSession((prev) => {
          // Don't fill if spill already acknowledged (popup dismissed)
          if (prev.spillAcknowledged) return prev;

          // Apply speed multiplier to fill rate (not to displayed time)
          const speedMultiplier = configRef.current.GAME_SPEED_MULTIPLIER || 1;
          const fillDelta = prev.currentFlowRate * deltaTime * speedMultiplier;
          let newFill = prev.currentFill + fillDelta;
          let newFarmLevel = prev.farmTankLevel - fillDelta;

          // Check for overfill - track spill amount but don't stop filling
          let spillAmount = prev.spillAmount;
          let spillWarningActive = prev.spillWarningActive;

          if (newFill > configRef.current.TANKER_CAPACITY_L) {
            // Calculate how much we're over capacity
            spillAmount = newFill - configRef.current.TANKER_CAPACITY_L;
            spillWarningActive = true;
            // Cap the visual fill at capacity, but track the overflow
            newFill = configRef.current.TANKER_CAPACITY_L;
          }

          // Don't drain below 0
          newFarmLevel = Math.max(0, newFarmLevel);

          // Sample flow rate for averaging (use raw flow rate, not multiplied)
          const newFlowRateSamples = [...prev.flowRateSamples, prev.currentFlowRate];

          return {
            ...prev,
            currentFill: newFill,
            farmTankLevel: newFarmLevel,
            spillAmount,
            spillWarningActive,
            flowRateSamples: newFlowRateSamples,
          };
        });
      }, 16); // ~60fps

      return () => {
        if (fillIntervalRef.current) {
          clearInterval(fillIntervalRef.current);
        }
      };
    }
  }, [isFilling, session.spillAcknowledged]);

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
    // Allow filling if spill not yet acknowledged
    if (!session.spillAcknowledged) {
      setIsFilling(true);
      // Record fill start time if this is the first fill
      setSession((prev) => ({
        ...prev,
        fillStartTime: prev.fillStartTime ?? performance.now(),
      }));
    }
  }, [session.spillAcknowledged]);

  // Stop filling - show popup if there was spillage
  const stopFilling = useCallback(() => {
    setIsFilling(false);
    // Record end time for duration calculation
    setSession((prev) => {
      // If there was spillage and we haven't shown popup yet, show it now
      if (prev.spillWarningActive && prev.spillAmount > 0 && !prev.spillAcknowledged) {
        return {
          ...prev,
          fillEndTime: performance.now(),
          spillTriggered: true,
          showSpillPopup: true,
        };
      }
      return {
        ...prev,
        fillEndTime: performance.now(),
      };
    });
  }, []);

  // Acknowledge spill (dismiss popup)
  const acknowledgeSpill = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      showSpillPopup: false,
      spillAcknowledged: true,
    }));
  }, []);

  // Nudge (small increment)
  const nudgeFill = useCallback(() => {
    // Block nudge if spill already acknowledged
    if (session.spillAcknowledged) return;

    setSession((prev) => {
      let newFill = prev.currentFill + configRef.current.NUDGE_AMOUNT_L;
      let newFarmLevel = prev.farmTankLevel - configRef.current.NUDGE_AMOUNT_L;

      // Check for overfill
      let spillAmount = prev.spillAmount;
      let spillWarningActive = prev.spillWarningActive;
      let spillTriggered = prev.spillTriggered;
      let showSpillPopup = prev.showSpillPopup;

      if (newFill > configRef.current.TANKER_CAPACITY_L) {
        spillAmount = newFill - configRef.current.TANKER_CAPACITY_L;
        newFill = configRef.current.TANKER_CAPACITY_L;
        spillWarningActive = true;
        // For nudge, immediately trigger the popup since it's a discrete action
        spillTriggered = true;
        showSpillPopup = true;
      }

      newFarmLevel = Math.max(0, newFarmLevel);

      return {
        ...prev,
        currentFill: newFill,
        farmTankLevel: newFarmLevel,
        spillAmount,
        spillWarningActive,
        spillTriggered,
        showSpillPopup,
        nudgeCount: prev.nudgeCount + 1,
      };
    });
  }, [session.spillAcknowledged]);

  // Complete load and go to penalty reveal
  const completeLoad = useCallback(() => {
    setIsFilling(false);

    // Calculate final values including timing metrics
    setSession((prev) => {
      const targetFill = configRef.current.TARGET_FILL_L;
      const emptyCapacity = Math.max(0, targetFill - prev.currentFill);
      const milkLeftBehind = prev.farmTankLevel;

      // Calculate total fill duration
      const endTime = prev.fillEndTime ?? performance.now();
      const startTime = prev.fillStartTime ?? endTime;
      const totalFillDuration = (endTime - startTime) / 1000; // Convert to seconds

      // Calculate average flow rate
      const averageFlowRate =
        prev.flowRateSamples.length > 0
          ? prev.flowRateSamples.reduce((a, b) => a + b, 0) / prev.flowRateSamples.length
          : prev.currentFlowRate;

      return {
        ...prev,
        emptyCapacity,
        milkLeftBehind,
        fillEndTime: endTime,
        totalFillDuration,
        averageFlowRate,
      };
    });

    setGameState("penaltyReveal");
  }, []);

  // Transition from penalty reveal to lead capture
  const showLeadCapture = useCallback(() => {
    setGameState("leadCapture");
  }, []);

  // Transition from lead capture to results
  const showResults = useCallback(() => {
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
    showLeadCapture,
    showResults,
    resetToAttract,
    acknowledgeSpill,
  };
}
