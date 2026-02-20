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

  const speedMultiplier = config.gameSpeedMultiplier || 1;
  const totalSimMins = config.agitationMinutes;
  // Total real milliseconds the agitation lasts
  const totalRealMs = (totalSimMins / speedMultiplier) * 60 * 1000;

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
            style={{ animationDuration: "2s" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
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
