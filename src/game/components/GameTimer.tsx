import { useState, useEffect } from "react";
import { GameConfig } from "../constantsV2";

interface GameTimerProps {
  fillStartTime: number | null;
  isFilling: boolean;
  usePiperSampling: boolean;
  useWeighbridge: boolean;
  nudgeCount: number;
  spillTriggered: boolean;
  config: GameConfig;
}

export function GameTimer({ fillStartTime, isFilling, usePiperSampling, useWeighbridge, spillTriggered, config }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const speedMultiplier = config.gameSpeedMultiplier || 1;

  const agitationPenalty = !usePiperSampling ? config.agitationMinutes : 0;
  const weighbridgePenalty = useWeighbridge ? config.weighScaleMinutes : 0;
  const hasPenalties = agitationPenalty + weighbridgePenalty > 0;

  useEffect(() => {
    if (!fillStartTime) { setElapsedTime(0); return; }
    const update = () => setElapsedTime((performance.now() - fillStartTime) / 1000);
    update();
    if (isFilling && !spillTriggered) {
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
  }, [fillStartTime, isFilling, spillTriggered, speedMultiplier]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
  };

  const formatPenalty = (minutes: number) => `+${Math.floor(minutes).toString().padStart(2, "0")}:${Math.round((minutes % 1) * 60).toString().padStart(2, "0")}`;

  const timerState = spillTriggered ? "spill" : hasPenalties ? "penalty" : isFilling ? "filling" : "idle";

  const stateStyles: Record<string, string> = {
    idle: "border-slate-600 bg-slate-800/80",
    filling: "border-sky-500 bg-sky-900/50 animate-pulse",
    penalty: "border-amber-500 bg-amber-900/30",
    spill: "border-red-500 bg-red-900/50",
  };

  const timeStyles: Record<string, string> = {
    idle: "text-slate-300",
    filling: "text-sky-400",
    penalty: "text-amber-400",
    spill: "text-red-400",
  };

  return (
    <div className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl border-2 transition-all duration-300 ${stateStyles[timerState]}`}>
      <div className="text-[10px] md:text-xs text-slate-400 text-center mb-0.5 md:mb-1 flex items-center justify-center gap-1">
        <span>⏱️</span><span>LOAD TIME</span>
      </div>
      <div className={`text-xl md:text-3xl font-mono font-bold text-center ${timeStyles[timerState]}`}>
        {formatTime(elapsedTime)}
      </div>
      {hasPenalties && (
        <div className="hidden md:block mt-2 pt-2 border-t border-slate-600/50">
          <div className="text-xs text-amber-400 flex items-center justify-center gap-1 mb-1"><span>⚠️</span><span>PENDING:</span></div>
          <div className="flex flex-col gap-0.5 text-xs">
            {!usePiperSampling && <div className="flex justify-between text-amber-300/80"><span>Agitation</span><span className="font-mono">{formatPenalty(agitationPenalty)}</span></div>}
            {useWeighbridge && <div className="flex justify-between text-amber-300/80"><span>Weighbridge</span><span className="font-mono">{formatPenalty(weighbridgePenalty)}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
