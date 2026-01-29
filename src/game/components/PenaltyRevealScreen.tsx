import { useState, useEffect, useMemo } from "react";
import { GameConfig } from "../hooks/useGameStateV2";
import piperLogo from "@/assets/piper-logo.png";

interface PenaltyRevealScreenProps {
  fillDuration: number;
  usePiperSampling: boolean;
  useWeighbridge: boolean;
  nudgeCount: number;
  config: GameConfig;
  onComplete: () => void;
}

interface Penalty {
  id: string;
  label: string;
  minutes: number;
  icon: string;
  isWarning: boolean;
}

export function PenaltyRevealScreen({
  fillDuration,
  usePiperSampling,
  useWeighbridge,
  nudgeCount,
  config,
  onComplete,
}: PenaltyRevealScreenProps) {
  const [phase, setPhase] = useState(0);
  const [visiblePenalties, setVisiblePenalties] = useState(0);

  // Build penalty list based on decisions
  const penalties = useMemo(() => {
    const list: Penalty[] = [];

    if (!usePiperSampling) {
      list.push({
        id: "agitation",
        label: "Agitation Required",
        minutes: config.AGITATION_TIME_SAVED,
        icon: "⚠️",
        isWarning: true,
      });
    }

    if (useWeighbridge) {
      list.push({
        id: "weighbridge",
        label: "Weighbridge Stop",
        minutes: config.WEIGHBRIDGE_TIME_COST,
        icon: "⚠️",
        isWarning: true,
      });
    }

    if (nudgeCount > 0) {
      const nudgeSeconds = nudgeCount * config.NUDGE_TIME_PENALTY_SEC;
      list.push({
        id: "nudges",
        label: `Nudges (${nudgeCount}× ${config.NUDGE_TIME_PENALTY_SEC}s)`,
        minutes: nudgeSeconds / 60,
        icon: "⏱️",
        isWarning: false,
      });
    }

    return list;
  }, [usePiperSampling, useWeighbridge, nudgeCount, config]);

  // Calculate totals
  const totalPenaltyMinutes = penalties.reduce((sum, p) => sum + p.minutes, 0);
  const fillTimeMinutes = fillDuration / 60;
  const grandTotalMinutes = fillTimeMinutes + totalPenaltyMinutes;
  const costPerMinute = config.TIME_COST_PER_MIN;
  const totalCost = totalPenaltyMinutes * costPerMinute;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
  };

  const formatMinutes = (minutes: number) => {
    const totalSeconds = minutes * 60;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Animation sequence
  useEffect(() => {
    const timers: number[] = [];

    // Phase 1: Show base time (after 500ms)
    timers.push(window.setTimeout(() => setPhase(1), 500));

    // Phase 2: Start showing penalties (after 1500ms)
    timers.push(window.setTimeout(() => setPhase(2), 1500));

    // Reveal each penalty with stagger
    penalties.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setVisiblePenalties(index + 1);
        }, 2000 + index * 600)
      );
    });

    // Phase 3: Show total (after all penalties + 800ms)
    const totalRevealTime = 2000 + penalties.length * 600 + 800;
    timers.push(window.setTimeout(() => setPhase(3), totalRevealTime));

    // Phase 4: Transition to results (after total + 2s)
    timers.push(window.setTimeout(() => onComplete(), totalRevealTime + 2500));

    return () => timers.forEach(clearTimeout);
  }, [penalties.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50">
      {/* Piper Logo */}
      <div className="absolute top-6">
        <img src={piperLogo} alt="Piper" className="h-12 md:h-16" />
      </div>

      <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 border border-slate-600 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⏱️</div>
          <h2 className="text-2xl font-bold text-slate-100 animate-fade-in">
            LOAD COMPLETE
          </h2>
        </div>

        {/* Base Fill Time */}
        <div
          className={`transition-all duration-500 ${
            phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex justify-between items-center py-3 border-b border-slate-600">
            <span className="text-slate-300">Fill Time</span>
            <span className="text-2xl font-mono font-bold text-sky-400">
              {formatTime(fillDuration)}
            </span>
          </div>
        </div>

        {/* Penalties Section */}
        {phase >= 2 && penalties.length > 0 && (
          <div className="mt-4 space-y-2">
            {penalties.map((penalty, index) => (
              <div
                key={penalty.id}
                className={`flex justify-between items-center py-3 px-4 rounded-lg transition-all duration-300 ${
                  index < visiblePenalties
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                } ${
                  penalty.isWarning
                    ? "bg-amber-900/30 border border-amber-600/50"
                    : "bg-slate-700/50 border border-slate-600/50"
                }`}
                style={{
                  animation:
                    index < visiblePenalties
                      ? "slideInShake 0.5s ease-out"
                      : "none",
                }}
              >
                <span className="flex items-center gap-2">
                  <span>{penalty.icon}</span>
                  <span
                    className={
                      penalty.isWarning ? "text-amber-300" : "text-slate-300"
                    }
                  >
                    {penalty.label}
                  </span>
                </span>
                <span
                  className={`font-mono font-bold ${
                    penalty.isWarning ? "text-amber-400" : "text-slate-400"
                  }`}
                >
                  + {formatMinutes(penalty.minutes)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {phase >= 3 && (
          <div className="my-4 border-t-2 border-slate-500 animate-fade-in" />
        )}

        {/* Grand Total */}
        {phase >= 3 && (
          <div
            className="text-center py-4 animate-scale-in"
            style={{ animationDuration: "0.5s" }}
          >
            <div className="text-slate-400 text-sm mb-2">TOTAL TIME</div>
            <div className="text-4xl font-mono font-bold text-slate-100 animate-pulse">
              {formatMinutes(grandTotalMinutes)}
            </div>

            {totalPenaltyMinutes > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                <span className="text-2xl">💸</span>
                <span className="text-xl font-bold">
                  €{totalCost.toFixed(2)} time cost
                </span>
              </div>
            )}

            {totalPenaltyMinutes === 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
                <span className="text-2xl">✨</span>
                <span className="text-xl font-bold">No penalties!</span>
              </div>
            )}
          </div>
        )}

        {/* Skip hint */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          Results loading...
        </div>
      </div>

      {/* Custom animation keyframes */}
      <style>{`
        @keyframes slideInShake {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          60% {
            transform: translateX(-5%);
            opacity: 1;
          }
          75% {
            transform: translateX(3%);
          }
          90% {
            transform: translateX(-2%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
