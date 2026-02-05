import { useState, useCallback, useRef, useEffect } from "react";
import { GAME_CONFIG_V2, GameStateV2 } from "../constantsV2";

export interface GameSessionV2 {
  // Pre-load decisions
  usePiperSampling: boolean; // Now means "using Piper System" (visual mode)
  useWeighbridge: boolean;

  // Fill state
  currentFill: number;
  farmTankLevel: number;
  currentFlowRate: number;

  // One-shot fill mechanics
  hasStartedFilling: boolean; // Prevent multiple presses
  fillLocked: boolean; // After release, cannot restart

  // Outcomes
  spillAmount: number;
  spillTriggered: boolean;
  spillWarningActive: boolean;
  spillAcknowledged: boolean;
  showSpillPopup: boolean;
  emptyCapacity: number;
  milkLeftBehind: number;

  // Time tracking
  timeDelta: number;

  // Timing metrics for receipt
  fillStartTime: number | null;
  fillEndTime: number | null;
  totalFillDuration: number;
  flowRateSamples: number[];
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
  FLOW_RATE_BASE_LPS: number;
  FLOW_VARIANCE_PERCENT: number;
  FLOW_VARIANCE_INTERVAL_MS: number;
  PIPER_SLOWDOWN_THRESHOLD: number;
  PIPER_SLOWDOWN_FACTOR: number;
  RESULTS_DISPLAY_TIME: number;
  ATTRACT_IDLE_TIME: number;
  TARGET_FILL_L: number;
  GAME_SPEED_MULTIPLIER: number;
  CURRENCY: string;
}

const createInitialSession = (config: GameConfig): GameSessionV2 => ({
  usePiperSampling: false,
  useWeighbridge: false,
  currentFill: 0,
  farmTankLevel: config.FARM_TANK_CAPACITY_L,
  currentFlowRate: config.FLOW_RATE_BASE_LPS,
  hasStartedFilling: false,
  fillLocked: false,
  spillAmount: 0,
  spillTriggered: false,
  spillWarningActive: false,
  spillAcknowledged: false,
  showSpillPopup: false,
  emptyCapacity: 0,
  milkLeftBehind: 0,
  timeDelta: 0,
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

  // Random flow rate with ±5% variance
  const getRandomFlowRate = useCallback(() => {
    const base = configRef.current.FLOW_RATE_BASE_LPS;
    const variance = configRef.current.FLOW_VARIANCE_PERCENT / 100;
    const min = base * (1 - variance);
    const max = base * (1 + variance);
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
    if (isFilling && !session.fillLocked) {
      lastTickRef.current = performance.now();

      fillIntervalRef.current = window.setInterval(() => {
        const now = performance.now();
        const deltaTime = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        setSession((prev) => {
          if (prev.fillLocked) return prev;

          const speedMultiplier = configRef.current.GAME_SPEED_MULTIPLIER || 1;
          
          // Calculate effective flow rate with Piper slowdown
          let effectiveFlowRate = prev.currentFlowRate;
          
          if (prev.usePiperSampling) {
            const fillPercent = prev.currentFill / configRef.current.TANKER_CAPACITY_L;
            const threshold = configRef.current.PIPER_SLOWDOWN_THRESHOLD;
            
            if (fillPercent > threshold) {
              // Progressive slowdown from threshold to 100%
              const slowProgress = (fillPercent - threshold) / (1 - threshold);
              const slowFactor = 1 - (slowProgress * (1 - configRef.current.PIPER_SLOWDOWN_FACTOR));
              effectiveFlowRate *= slowFactor;
            }
          }

          const fillDelta = effectiveFlowRate * deltaTime * speedMultiplier;
          let newFill = prev.currentFill + fillDelta;
          let newFarmLevel = prev.farmTankLevel - fillDelta;

          let spillAmount = prev.spillAmount;
          let spillWarningActive = prev.spillWarningActive;
          let spillTriggered = prev.spillTriggered;

          if (newFill > configRef.current.TANKER_CAPACITY_L) {
            spillAmount = newFill - configRef.current.TANKER_CAPACITY_L;
            spillWarningActive = true;
            spillTriggered = true;
            newFill = configRef.current.TANKER_CAPACITY_L;
          }

          newFarmLevel = Math.max(0, newFarmLevel);

          const newFlowRateSamples = [...prev.flowRateSamples, effectiveFlowRate];

          return {
            ...prev,
            currentFill: newFill,
            farmTankLevel: newFarmLevel,
            spillAmount,
            spillWarningActive,
            spillTriggered,
            flowRateSamples: newFlowRateSamples,
          };
        });
      }, 16);

      return () => {
        if (fillIntervalRef.current) {
          clearInterval(fillIntervalRef.current);
        }
      };
    }
  }, [isFilling, session.fillLocked]);

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

      // Piper system: YES = +X mins saved, NO = -X mins lost (agitation time)
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

  // Start filling - only works once
  const startFilling = useCallback(() => {
    if (session.hasStartedFilling || session.fillLocked) {
      return; // Already started or locked - no second chances
    }
    
    setIsFilling(true);
    setSession((prev) => ({
      ...prev,
      hasStartedFilling: true,
      fillStartTime: performance.now(),
    }));
  }, [session.hasStartedFilling, session.fillLocked]);

  // Stop filling - locks permanently
  const stopFilling = useCallback(() => {
    if (!isFilling) return;
    
    setIsFilling(false);
    setSession((prev) => ({
      ...prev,
      fillLocked: true,
      fillEndTime: performance.now(),
      showSpillPopup: prev.spillTriggered && prev.spillAmount > 0,
    }));
  }, [isFilling]);

  // Acknowledge spill (for splat screen)
  const acknowledgeSpill = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      showSpillPopup: false,
      spillAcknowledged: true,
    }));
  }, []);

  // Complete load and go to penalty reveal
  const completeLoad = useCallback(() => {
    setIsFilling(false);

    setSession((prev) => {
      const targetFill = configRef.current.TARGET_FILL_L;
      const emptyCapacity = Math.max(0, targetFill - prev.currentFill);
      const milkLeftBehind = prev.farmTankLevel;

      const endTime = prev.fillEndTime ?? performance.now();
      const startTime = prev.fillStartTime ?? endTime;
      const speedMultiplier = configRef.current.GAME_SPEED_MULTIPLIER || 1;
      const totalFillDuration = ((endTime - startTime) / 1000) * speedMultiplier;

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

    const totalTimeMin = Math.abs(session.timeDelta);
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
    completeLoad,
    showLeadCapture,
    showResults,
    resetToAttract,
    acknowledgeSpill,
  };
}
