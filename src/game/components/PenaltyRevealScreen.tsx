import { useState, useEffect, useMemo } from "react";
import { GameConfig, RoundResult } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";

interface PenaltyRevealScreenProps {
  rounds: RoundResult[];
  usePiperSampling: boolean;
  useWeighbridge: boolean;
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

export function PenaltyRevealScreen({ rounds, usePiperSampling, useWeighbridge, config, onComplete }: PenaltyRevealScreenProps) {
  const [phase, setPhase] = useState(0);
  const [visiblePenalties, setVisiblePenalties] = useState(0);

  const totalFillDuration = rounds.reduce((s, r) => s + r.fillDuration, 0);

  const penalties = useMemo(() => {
    const list: Penalty[] = [];
    if (!usePiperSampling) list.push({ id: "agitation", label: "Uh oh! Agitation Required", minutes: config.agitationMinutes, icon: "⏳", isWarning: true });
    if (useWeighbridge) list.push({ id: "weighbridge", label: `Uh oh! Heading to Weigh Station — add ${config.weighScaleMinutes} mins per load`, minutes: config.weighScaleMinutes, icon: "⚖️", isWarning: true });
    return list;
  }, [usePiperSampling, useWeighbridge, config]);

  const totalPenaltyMinutes = penalties.reduce((s, p) => s + p.minutes, 0);
  const fillTimeMinutes = totalFillDuration / 60;
  const grandTotalMinutes = fillTimeMinutes + totalPenaltyMinutes;
  const totalCost = totalPenaltyMinutes * (config.driverRatePerHour / 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}`;
  };

  const formatMinutes = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase(1), 800));
    timers.push(window.setTimeout(() => setPhase(2), 2500));
    penalties.forEach((_, i) => timers.push(window.setTimeout(() => setVisiblePenalties(i + 1), 3200 + i * 1000)));
    const totalTime = 3200 + penalties.length * 1000 + 1500;
    timers.push(window.setTimeout(() => setPhase(3), totalTime));
    timers.push(window.setTimeout(() => onComplete(), totalTime + 4000));
    return () => timers.forEach(clearTimeout);
  }, [penalties.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50">
      <div className="absolute top-6"><img src={piperLogo} alt="Piper" className="h-12 md:h-16" /></div>
      <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 border border-slate-600 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⏱️</div>
          <h2 className="text-2xl font-bold text-slate-100">ALL {rounds.length} ROUNDS COMPLETE</h2>
        </div>

        <div className={`transition-all duration-500 ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex justify-between items-center py-3 border-b border-slate-600">
            <span className="text-slate-300">Total Fill Time ({rounds.length} rounds)</span>
            <span className="text-2xl font-mono font-bold text-sky-400">{formatTime(totalFillDuration)}</span>
          </div>
        </div>

        {phase >= 2 && penalties.length > 0 && (
          <div className="mt-4 space-y-2">
            {penalties.map((penalty, index) => (
              <div key={penalty.id} className={`flex justify-between items-center py-3 px-4 rounded-lg transition-all duration-300 ${index < visiblePenalties ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"} ${penalty.isWarning ? "bg-amber-900/30 border border-amber-600/50" : "bg-slate-700/50 border border-slate-600/50"}`}
                style={{ animation: index < visiblePenalties ? "slideInShake 0.5s ease-out" : "none" }}>
                <span className="flex items-center gap-2">
                  <span>{penalty.icon}</span>
                  <span className={penalty.isWarning ? "text-amber-300" : "text-slate-300"}>{penalty.label}</span>
                </span>
                <span className={`font-mono font-bold ${penalty.isWarning ? "text-amber-400" : "text-slate-400"}`}>+ {formatMinutes(penalty.minutes)}</span>
              </div>
            ))}
          </div>
        )}

        {phase >= 3 && <div className="my-4 border-t-2 border-slate-500 animate-fade-in" />}
        {phase >= 3 && (
          <div className="text-center py-4 animate-scale-in" style={{ animationDuration: "0.5s" }}>
            <div className="text-slate-400 text-sm mb-2">TOTAL TIME</div>
            <div className="text-4xl font-mono font-bold text-slate-100 animate-pulse">{formatMinutes(grandTotalMinutes)}</div>
            {totalPenaltyMinutes > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                <span className="text-2xl">💸</span>
                <span className="text-xl font-bold">{config.currency}{totalCost.toFixed(2)} time cost</span>
              </div>
            )}
            {totalPenaltyMinutes === 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
                <span className="text-2xl">✨</span><span className="text-xl font-bold">No penalties!</span>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-6 text-slate-500 text-sm">Results loading...</div>
      </div>
      <style>{`@keyframes slideInShake { 0% { transform: translateX(100%); opacity: 0; } 60% { transform: translateX(-5%); opacity: 1; } 75% { transform: translateX(3%); } 90% { transform: translateX(-2%); } 100% { transform: translateX(0); } }`}</style>
    </div>
  );
}
