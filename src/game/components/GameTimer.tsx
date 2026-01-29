import { useState, useEffect } from "react";
import { GameConfig } from "../hooks/useGameStateV2";

interface GameTimerProps {
  fillStartTime: number | null;
  isFilling: boolean;
  usePiperSampling: boolean;
  useWeighbridge: boolean;
  nudgeCount: number;
  spillTriggered: boolean;
  config: GameConfig;
}

export function GameTimer({
  fillStartTime,
  isFilling,
  usePiperSampling,
  useWeighbridge,
  nudgeCount,
  spillTriggered,
  config,
}: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate pending penalties
  const agitationPenalty = !usePiperSampling ? config.AGITATION_TIME_SAVED : 0;
  const weighbridgePenalty = useWeighbridge ? config.WEIGHBRIDGE_TIME_COST : 0;
  const nudgePenalty = nudgeCount * (config.NUDGE_TIME_PENALTY_SEC / 60); // Convert to minutes
  const totalPenaltyMinutes = agitationPenalty + weighbridgePenalty;
  const hasPenalties = totalPenaltyMinutes > 0;

  // Update elapsed time during filling
  useEffect(() => {
    if (!fillStartTime) {
      setElapsedTime(0);
      return;
    }

    const updateTimer = () => {
      const now = performance.now();
      setElapsedTime((now - fillStartTime) / 1000);
    };

    // Initial update
    updateTimer();

    // Only continue updating if actively filling and not spilled
    if (isFilling && !spillTriggered) {
      const interval = setInterval(updateTimer, 100);
      return () => clearInterval(interval);
    }
  }, [fillStartTime, isFilling, spillTriggered]);

  // Format time as MM:SS.d
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
  };

  // Format penalty time as +MM:SS
  const formatPenalty = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `+${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine timer state for styling
  const getTimerState = () => {
    if (spillTriggered) return "spill";
    if (hasPenalties) return "penalty";
    if (isFilling) return "filling";
    return "idle";
  };

  const timerState = getTimerState();

  const stateStyles = {
    idle: "border-slate-600 bg-slate-800/80",
    filling: "border-sky-500 bg-sky-900/50 animate-pulse",
    penalty: "border-amber-500 bg-amber-900/30",
    spill: "border-red-500 bg-red-900/50",
  };

  const timeStyles = {
    idle: "text-slate-300",
    filling: "text-sky-400",
    penalty: "text-amber-400",
    spill: "text-red-400",
  };

  return (
    <div
      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${stateStyles[timerState]}`}
    >
      {/* Timer Label */}
      <div className="text-xs text-slate-400 text-center mb-1 flex items-center justify-center gap-1">
        <span>⏱️</span>
        <span>LOAD TIME</span>
      </div>

      {/* Main Timer Display */}
      <div
        className={`text-3xl font-mono font-bold text-center ${timeStyles[timerState]}`}
      >
        {formatTime(elapsedTime)}
      </div>

      {/* Pending Penalties Warning */}
      {hasPenalties && (
        <div className="mt-2 pt-2 border-t border-slate-600/50">
          <div className="text-xs text-amber-400 flex items-center justify-center gap-1 mb-1">
            <span>⚠️</span>
            <span>PENDING PENALTIES:</span>
          </div>
          <div className="flex flex-col gap-0.5 text-xs">
            {!usePiperSampling && (
              <div className="flex justify-between text-amber-300/80">
                <span>Agitation required</span>
                <span className="font-mono">{formatPenalty(agitationPenalty)}</span>
              </div>
            )}
            {useWeighbridge && (
              <div className="flex justify-between text-amber-300/80">
                <span>Weighbridge stop</span>
                <span className="font-mono">{formatPenalty(weighbridgePenalty)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nudge Penalty (shown separately as it accumulates) */}
      {nudgeCount > 0 && (
        <div className="mt-1 text-xs text-amber-400/70 text-center">
          +{(nudgePenalty * 60).toFixed(0)}s from {nudgeCount} nudge{nudgeCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
