import { useState, useEffect } from "react";
import { GameConfig } from "../constantsV2";
import { RoundPhase } from "../hooks/useGameStateV2";

interface GameTimerProps {
  fillStartTime: number | null;
  isFilling: boolean;
  usePiperSampling: boolean;
  useWeighbridge: boolean;
  nudgeCount: number;
  spillTriggered: boolean;
  roundPhase: RoundPhase;
  config: GameConfig;
}

export function GameTimer({ fillStartTime, isFilling, usePiperSampling, useWeighbridge, spillTriggered, roundPhase, config }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const speedMultiplier = config.gameSpeedMultiplier || 1;

  const agitationPenalty = !usePiperSampling ? config.agitationMinutes : 0;
  const weighbridgePenalty = useWeighbridge ? config.weighScaleMinutes : 0;
  const hasPenalties = agitationPenalty + weighbridgePenalty > 0;

  // Timer runs during agitation AND loading phases; stops when spill or fill locked
  const timerRunning = fillStartTime !== null && (roundPhase === "agitation" || (roundPhase === "loading" && !spillTriggered));

  useEffect(() => {
    if (!fillStartTime) { setElapsedTime(0); return; }
    const update = () => setElapsedTime(((performance.now() - fillStartTime) / 1000) * speedMultiplier);
    update();
    if (timerRunning) {
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
  }, [fillStartTime, timerRunning, speedMultiplier]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
  };

  const formatPenalty = (minutes: number) => `+${Math.floor(minutes).toString().padStart(2, "0")}:${Math.round((minutes % 1) * 60).toString().padStart(2, "0")}`;

  // Label and style per phase
  type TimerStateKey = "idle" | "agitation" | "filling" | "penalty" | "spill" | "locked";

  const getTimerState = (): TimerStateKey => {
    if (!fillStartTime) return "idle";
    if (spillTriggered) return "spill";
    if (roundPhase === "agitation") return "agitation";
    if (hasPenalties && roundPhase === "loading" && !isFilling) return "penalty";
    if (roundPhase === "loading" && isFilling) return "filling";
    if (roundPhase === "weighbridge" || roundPhase === "complete") return "locked";
    return "idle";
  };

  const timerState = getTimerState();

  const stateStyles: Record<TimerStateKey, string> = {
    idle: "border-slate-600 bg-slate-800/80",
    agitation: "border-amber-500 bg-amber-900/30 animate-pulse",
    filling: "border-sky-500 bg-sky-900/50 animate-pulse",
    penalty: "border-amber-500 bg-amber-900/30",
    spill: "border-red-500 bg-red-900/50",
    locked: "border-slate-600 bg-slate-800/80",
  };

  const timeStyles: Record<TimerStateKey, string> = {
    idle: "text-slate-300",
    agitation: "text-amber-400",
    filling: "text-sky-400",
    penalty: "text-amber-400",
    spill: "text-red-400",
    locked: "text-slate-300",
  };

  const labelMap: Record<TimerStateKey, string> = {
    idle: "LOAD TIME",
    agitation: "AGITATION",
    filling: "LOAD TIME",
    penalty: "LOAD TIME",
    spill: "LOAD TIME",
    locked: "TOTAL TIME",
  };

  return (
    <div className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl border-2 transition-all duration-300 ${stateStyles[timerState]}`}>
      <div className="text-[10px] md:text-xs text-slate-400 text-center mb-0.5 md:mb-1 flex items-center justify-center gap-1">
        <span>⏱️</span><span>{labelMap[timerState]}</span>
      </div>
      <div className={`text-xl md:text-3xl font-mono font-bold text-center ${timeStyles[timerState]}`}>
        {formatTime(elapsedTime)}
      </div>
      {/* Penalties still calculated but hidden visually */}
    </div>
  );
}
