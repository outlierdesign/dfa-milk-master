import { useEffect, useState } from "react";
import { GameConfig } from "../constantsV2";
import { Progress } from "@/components/ui/progress";

interface AgitationOverlayProps {
  config: GameConfig;
  startTime: number | null; // performance.now() when agitation began
}

export function AgitationOverlay({ config, startTime }: AgitationOverlayProps) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [elapsedSimMins, setElapsedSimMins] = useState(0);

  const totalSimMins = config.agitationMinutes;
  // Use the fixed real-world duration from config
  const totalRealMs = config.agitationRealDurationMs || 5000;

  useEffect(() => {
    if (!startTime) return;

    const update = () => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, (elapsed / totalRealMs) * 100);
      const simMins = Math.min(totalSimMins, (elapsed / totalRealMs) * totalSimMins);
      setProgressPercent(pct);
      setElapsedSimMins(simMins);
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [startTime, totalRealMs, totalSimMins]);

  const remainingSimMins = Math.max(0, totalSimMins - elapsedSimMins);
  const remainingMins = Math.floor(remainingSimMins);
  const remainingSecs = Math.round((remainingSimMins % 1) * 60);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-6 md:p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
        {/* Spinning gear */}
        <div className="flex justify-center mb-4">
          <svg
            className="w-20 h-20 md:w-24 md:h-24 animate-spin text-amber-400"
            style={{ animationDuration: "1.2s" }}
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            {/* 4-blade fan */}
            {[0, 90, 180, 270].map((angle) => (
              <path
                key={angle}
                transform={`rotate(${angle} 50 50)`}
                d="M50 50 C50 30, 35 10, 50 10 C65 10, 50 30, 50 50Z"
                opacity="0.9"
              />
            ))}
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-amber-300 mb-1">
          ⚙️ Agitation in Progress
        </h2>
        <p className="text-slate-400 text-sm mb-5">
          The milk is being agitated before loading.<br />
          Please wait&hellip;
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <Progress
            value={progressPercent}
            className="h-3 bg-slate-700"
          />
        </div>

        {/* Time remaining */}
        <div className="flex justify-between text-xs text-slate-400 mb-4">
          <span>{elapsedSimMins.toFixed(1)} min elapsed</span>
          <span>{totalSimMins} min total</span>
        </div>

        <div className="bg-amber-900/40 border border-amber-600/50 rounded-xl px-4 py-3">
          <div className="text-[10px] text-amber-400 uppercase tracking-widest mb-0.5">Time Remaining</div>
          <div className="text-3xl font-mono font-black text-amber-300">
            {remainingMins.toString().padStart(2, "0")}:{remainingSecs.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-amber-500 mt-0.5">simulated minutes</div>
        </div>
      </div>
    </div>
  );
}
