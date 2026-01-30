import { cn } from "@/lib/utils";
import { GameConfig } from "../hooks/useGameStateV2";

interface LoadMeterProps {
  currentFill: number;
  targetFill: number;
  config: GameConfig;
  spillTriggered: boolean;
  spillWarningActive?: boolean;
}

export function LoadMeter({
  currentFill,
  targetFill,
  config,
  spillTriggered,
  spillWarningActive = false,
}: LoadMeterProps) {
  const percentage = Math.min((currentFill / targetFill) * 100, 120);
  const capacityPercentage = (config.TANKER_CAPACITY_L / targetFill) * 100;
  
  // Determine color based on fill state
  const getBarColor = () => {
    if (spillTriggered || spillWarningActive) {
      return "bg-red-500";
    }
    if (percentage >= 98 && percentage <= 102) {
      return "bg-emerald-500";
    }
    if (percentage >= 90) {
      return "bg-amber-500";
    }
    return "bg-sky-500";
  };

  const getGlowColor = () => {
    if (spillTriggered || spillWarningActive) {
      return "shadow-red-500/50";
    }
    if (percentage >= 98 && percentage <= 102) {
      return "shadow-emerald-500/50";
    }
    if (percentage >= 90) {
      return "shadow-amber-500/50";
    }
    return "shadow-sky-500/50";
  };

  return (
    <div className="w-full px-2 md:px-4">
      <div className="relative">
        {/* Background track */}
        <div className="h-4 md:h-5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
          {/* Target marker line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10"
            style={{ left: `${Math.min(100, 100)}%` }}
          />
          
          {/* Capacity (max) marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-400/50 z-10"
            style={{ left: `${Math.min(capacityPercentage, 100)}%` }}
          />
          
          {/* Fill bar */}
          <div
            className={cn(
              "h-full transition-all duration-75 ease-out shadow-lg",
              getBarColor(),
              getGlowColor(),
              spillWarningActive && "animate-pulse"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Percentage label */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-400">0%</span>
          <span
            className={cn(
              "text-sm font-bold font-mono",
              spillTriggered || spillWarningActive
                ? "text-red-400"
                : percentage >= 98 && percentage <= 102
                  ? "text-emerald-400"
                  : percentage >= 90
                    ? "text-amber-400"
                    : "text-sky-400"
            )}
          >
            {Math.round(percentage)}% of target
          </span>
          <span className="text-xs text-slate-400">100%</span>
        </div>
      </div>
    </div>
  );
}
