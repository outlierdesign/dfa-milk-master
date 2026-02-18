import { cn } from "@/lib/utils";

interface LoadMeterProps {
  currentFill: number;
  targetFill: number;
  maxFill?: number;
  spillTriggered: boolean;
  spillWarningActive?: boolean;
}

export function LoadMeter({ currentFill, targetFill, maxFill, spillTriggered, spillWarningActive = false }: LoadMeterProps) {
  const displayMax = maxFill ?? targetFill * 1.2;
  const percentage = Math.min((currentFill / displayMax) * 100, 100);
  const targetPercentage = (targetFill / displayMax) * 100;
  const fillOfTarget = (currentFill / targetFill) * 100;

  const getBarColor = () => {
    if (spillTriggered || spillWarningActive) return "bg-red-500";
    if (fillOfTarget >= 98 && fillOfTarget <= 102) return "bg-emerald-500";
    if (fillOfTarget >= 90) return "bg-amber-500";
    return "bg-sky-500";
  };

  const getGlowColor = () => {
    if (spillTriggered || spillWarningActive) return "shadow-red-500/50";
    if (fillOfTarget >= 98 && fillOfTarget <= 102) return "shadow-emerald-500/50";
    if (fillOfTarget >= 90) return "shadow-amber-500/50";
    return "shadow-sky-500/50";
  };

  return (
    <div className="w-full px-2 md:px-4">
      <div className="relative">
        <div className="h-4 md:h-5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
          {/* Target marker */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10" style={{ left: `${targetPercentage}%` }} />
          {/* Fill bar */}
          <div
            className={cn("h-full transition-all duration-75 ease-out shadow-lg", getBarColor(), getGlowColor(), spillWarningActive && "animate-pulse")}
            style={{ width: `${percentage}%` }}
          >
            
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-400">0</span>
          <span className={cn("text-sm font-bold font-mono", spillTriggered || spillWarningActive ? "text-red-400" : fillOfTarget >= 98 && fillOfTarget <= 102 ? "text-emerald-400" : fillOfTarget >= 90 ? "text-amber-400" : "text-sky-400")}>
            {Math.round(fillOfTarget)}% of target
          </span>
          <span className="text-xs text-slate-400">{Math.round(displayMax / 1000)}k</span>
        </div>
      </div>
    </div>
  );
}
