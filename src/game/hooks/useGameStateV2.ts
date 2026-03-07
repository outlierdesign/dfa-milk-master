import { useState, useCallback, useRef, useEffect } from "react";
import { GameStateV2, GameConfig, RoundResult } from "../constantsV2";

export type RoundPhase = "agitation" | "loading" | "weighbridge" | "complete";

export interface GameSessionV2 {
  // Pre-load decisions (apply to all 3 rounds)
  usePiperSampling: boolean;
  useWeighbridge: boolean;

  // Round tracking
  currentRound: number; // 1, 2, or 3
  totalRounds: number; // always 3
  rounds: RoundResult[]; // completed round data
  isFired: boolean;

  // Round sub-phase
  roundPhase: RoundPhase;
  agitationComplete: boolean; // whether agitation has finished for this round

  // Current round fill state (lbs)
  currentFill: number;
  currentFlowRate: number; // lbs/min
  hasStartedFilling: boolean;
  fillLocked: boolean;

  // Spill state
  spillAmount: number;
  spillTriggered: boolean;
  spillWarningActive: boolean;
  spillAcknowledged: boolean;
  showSpillPopup: boolean;

  // Time tracking
  // fillStartTime: set at agitation start — accumulates full round time
  fillStartTime: number | null;
  fillEndTime: number | null;
  totalFillDuration: number;
  flowRateSamples: number[];
  averageFlowRate: number;
}

const createInitialSession = (): GameSessionV2 => ({
  usePiperSampling: false,
  useWeighbridge: false,
  currentRound: 1,
  totalRounds: 3,
  rounds: [],
  isFired: false,
  roundPhase: "loading",
  agitationComplete: false,
  currentFill: 0,
  currentFlowRate: 0,
  hasStartedFilling: false,
  fillLocked: false,
  spillAmount: 0,
  spillTriggered: false,
  spillWarningActive: false,
  spillAcknowledged: false,
  showSpillPopup: false,
  fillStartTime: null,
  fillEndTime: null,
  totalFillDuration: 0,
  flowRateSamples: [],
  averageFlowRate: 0,
});

const resetRoundState = (session: GameSessionV2, flowRate: number): GameSessionV2 => ({
  ...session,
  roundPhase: "loading",
  agitationComplete: false,
  currentFill: 0,
  currentFlowRate: flowRate,
  hasStartedFilling: false,
  fillLocked: false,
  spillAmount: 0,
  spillTriggered: false,
  spillWarningActive: false,
  spillAcknowledged: false,
  showSpillPopup: false,
  fillStartTime: null,
  fillEndTime: null,
  totalFillDuration: 0,
  flowRateSamples: [],
  averageFlowRate: 0,
});

export function useGameStateV2(config: GameConfig) {
  const [gameState, setGameState] = useState<GameStateV2>("attract");
  const [session, setSession] = useState<GameSessionV2>(createInitialSession);
  const [isFilling, setIsFilling] = useState(false);

  const configRef = useRef(config);
  configRef.current = config;

  // Keep a ref to the agitation timeout so we can cancel it on reset
  const agitationTimerRef = useRef<number | null>(null);
  const flowRateIntervalRef = useRef<number | null>(null);
  const fillIntervalRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Helper: start the agitation countdown for the current config
  const startAgitationTimer = useCallback((onComplete: () => void) => {
    if (agitationTimerRef.current) clearTimeout(agitationTimerRef.current);
    const cfg = configRef.current;
    const realMs = cfg.agitationRealDurationMs || 5000;
    agitationTimerRef.current = window.setTimeout(onComplete, realMs);
  }, []);

  // Random flow rate with jitter
  const getRandomFlowRate = useCallback(() => {
    const base = configRef.current.flowRateLbsPerMin;
    const variance = configRef.current.flowJitterPercent / 100;
    const min = base * (1 - variance);
    const max = base * (1 + variance);
    return Math.random() * (max - min) + min;
  }, []);

  // Flow rate variance timer
  useEffect(() => {
    if (gameState === "playing") {
      flowRateIntervalRef.current = window.setInterval(() => {
        setSession((prev) => ({
          ...prev,
          currentFlowRate: getRandomFlowRate(),
        }));
      }, config.flowVarianceIntervalMs);

      return () => {
        if (flowRateIntervalRef.current) clearInterval(flowRateIntervalRef.current);
      };
    }
  }, [gameState, getRandomFlowRate, config.flowVarianceIntervalMs]);

  // Filling loop
  useEffect(() => {
    if (isFilling && !session.fillLocked) {
      lastTickRef.current = performance.now();

      fillIntervalRef.current = window.setInterval(() => {
        const now = performance.now();
        const deltaTime = (now - lastTickRef.current) / 1000; // seconds
        lastTickRef.current = now;

        setSession((prev) => {
          if (prev.fillLocked) return prev;

          const cfg = configRef.current;
          const speedMultiplier = cfg.gameSpeedMultiplier || 1;

          const effectiveFlowRate = prev.currentFlowRate;

          // Flow rate is lbs/min, deltaTime is seconds — divide by 60 to convert
          const fillDelta = effectiveFlowRate * (deltaTime / 60) * speedMultiplier;
          let newFill = prev.currentFill + fillDelta;

          let spillAmount = prev.spillAmount;
          let spillWarningActive = prev.spillWarningActive;
          let spillTriggered = prev.spillTriggered;

          const target = cfg.targetLoadLbs;
          const maxAllowed = cfg.maxAllowedFill;

          if (newFill > target) {
            spillWarningActive = true;

            if (newFill > maxAllowed) {
              spillTriggered = true;
              newFill = maxAllowed; // cap FIRST
            }

            spillAmount = newFill - target; // compute AFTER capping
          }

          // Auto-stop at max overfill
          if (spillTriggered && cfg.stopAutomaticallyAtMaxOverfill) {
            return {
              ...prev,
              currentFill: newFill,
              spillAmount,
              spillWarningActive,
              spillTriggered,
              fillLocked: true,
              fillEndTime: performance.now(),
              showSpillPopup: true,
              flowRateSamples: [...prev.flowRateSamples, effectiveFlowRate],
            };
          }

          return {
            ...prev,
            currentFill: newFill,
            spillAmount,
            spillWarningActive,
            spillTriggered,
            flowRateSamples: [...prev.flowRateSamples, effectiveFlowRate],
          };
        });
      }, 16);

      return () => {
        if (fillIntervalRef.current) clearInterval(fillIntervalRef.current);
      };
    }
  }, [isFilling, session.fillLocked]);

  // Advance from agitation → loading (agitation complete, player can now fill)
  const advanceFromAgitation = useCallback(() => {
    setSession((prev) => ({ ...prev, roundPhase: "loading", agitationComplete: true }));
  }, []);

  // Start game from attract
  const startGame = useCallback(() => {
    const initial = createInitialSession();
    initial.useWeighbridge = true;
    initial.currentFlowRate = getRandomFlowRate();
    // Round starts in "loading" — agitation triggers on first tap
    initial.roundPhase = "loading";
    initial.agitationComplete = false;
    setSession(initial);
    setGameState("playing");
  }, [getRandomFlowRate]);

  // Complete pre-load questions
  const completeQuestions = useCallback(
    (usePiperSampling: boolean, useWeighbridge: boolean) => {
      setSession((prev) => ({
        ...prev,
        usePiperSampling,
        useWeighbridge,
        currentFlowRate: getRandomFlowRate(),
        roundPhase: "loading",
        agitationComplete: false,
      }));
      setGameState("playing");
    },
    [getRandomFlowRate]
  );

  // Start filling — first tap triggers agitation, second tap (after agitation) starts filling
  const startFilling = useCallback(() => {
    if (session.fillLocked) return;
    if (session.roundPhase !== "loading") return;

    // If agitation hasn't happened yet, trigger it now
    if (!session.agitationComplete) {
      setSession((prev) => ({
        ...prev,
        roundPhase: "agitation",
        fillStartTime: performance.now(),
      }));
      startAgitationTimer(advanceFromAgitation);
      return;
    }

    // Agitation done — actually start filling
    if (session.hasStartedFilling) return;
    setIsFilling(true);
    setSession((prev) => ({
      ...prev,
      hasStartedFilling: true,
    }));
  }, [session.hasStartedFilling, session.fillLocked, session.roundPhase, session.agitationComplete, startAgitationTimer, advanceFromAgitation]);

  // Stop filling — locks permanently for this round
  const stopFilling = useCallback(() => {
    if (!isFilling) return;
    setIsFilling(false);
    setSession((prev) => ({
      ...prev,
      fillLocked: true,
      fillEndTime: performance.now(),
      showSpillPopup: prev.spillAmount > 0,
      spillTriggered: prev.spillTriggered || prev.spillAmount > 0,
    }));
  }, [isFilling]);

  // Acknowledge spill popup
  const acknowledgeSpill = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      showSpillPopup: false,
      spillAcknowledged: true,
    }));
  }, []);

  // Complete current round — enter weighbridge phase
  const completeLoad = useCallback(() => {
    setIsFilling(false);
    setSession((prev) => ({ ...prev, roundPhase: "weighbridge" }));
  }, []);

  // Called by WeighbridgeDepartureOverlay after animation — calculate results & go to roundResult
  const advanceFromWeighbridge = useCallback(() => {
    setIsFilling(false);

    setSession((prev) => {
      const cfg = configRef.current;
      const endTime = prev.fillEndTime ?? performance.now();
      const startTime = prev.fillStartTime ?? endTime;
      const speedMultiplier = cfg.gameSpeedMultiplier || 1;
      const totalFillDuration = ((endTime - startTime) / 1000) * speedMultiplier;

      const averageFlowRate =
        prev.flowRateSamples.length > 0
          ? prev.flowRateSamples.reduce((a, b) => a + b, 0) / prev.flowRateSamples.length
          : prev.currentFlowRate;

      const fillLbs = prev.currentFill;
      const creditedLbs = Math.min(fillLbs, cfg.targetLoadLbs);
      const spillLbs = Math.max(0, fillLbs - cfg.targetLoadLbs);
      const isOverfill = fillLbs > cfg.targetLoadLbs;

      const roundResult: RoundResult = {
        roundNumber: prev.currentRound,
        fillLbs,
        creditedLbs,
        spillLbs,
        isOverfill,
        fillDuration: totalFillDuration,
        averageFlowRate,
      };

      const rounds = [...prev.rounds, roundResult];

      return {
        ...prev,
        roundPhase: "complete",
        totalFillDuration,
        averageFlowRate,
        rounds,
      };
    });

    setGameState("roundResult");
  }, []);

  // Advance to next round or to scoring
  const nextRound = useCallback(() => {
    if (agitationTimerRef.current) clearTimeout(agitationTimerRef.current);

    setSession((prev) => {
      const cfg = configRef.current;
      const nextRoundNum = prev.currentRound + 1;

      if (nextRoundNum > prev.totalRounds) {
        // All rounds done — check fired
        const overfillCount = prev.rounds.filter((r) => r.isOverfill).length;
        if (cfg.fireOnThreeOverfills && overfillCount >= 3) {
          return { ...prev, currentRound: nextRoundNum, isFired: true };
        }
        return { ...prev, currentRound: nextRoundNum };
      }

      // Reset for next round
      return resetRoundState(
        { ...prev, currentRound: nextRoundNum },
        getRandomFlowRate()
      );
    });

    // Use setTimeout to read updated session
    setTimeout(() => {
      setSession((prev) => {
        if (prev.isFired) {
          setGameState("fired");
          return prev;
        }
        if (prev.currentRound > prev.totalRounds) {
          setGameState("penaltyReveal");
          return prev;
        }

        // New round starts in loading — agitation triggers on first tap
        setGameState("playing");
        return prev;
      });
    }, 0);
  }, [getRandomFlowRate, startAgitationTimer, advanceFromAgitation]);

  // Transition from penalty reveal to lead capture
  const showLeadCapture = useCallback(() => {
    setGameState("leadCapture");
  }, []);

  // Transition from lead capture to savings reveal
  const showSavingsReveal = useCallback(() => {
    setGameState("savingsReveal");
  }, []);

  // Transition from savings reveal to results
  const showResults = useCallback(() => {
    setGameState("results");
  }, []);

  // Reset to attract mode
  const resetToAttract = useCallback(() => {
    if (agitationTimerRef.current) clearTimeout(agitationTimerRef.current);
    setSession(createInitialSession());
    setIsFilling(false);
    setGameState("attract");
  }, []);

  return {
    gameState,
    session,
    isFilling,
    startGame,
    completeQuestions,
    startFilling,
    stopFilling,
    completeLoad,
    advanceFromWeighbridge,
    nextRound,
    showLeadCapture,
    showResults,
    resetToAttract,
    acknowledgeSpill,
  };
}
