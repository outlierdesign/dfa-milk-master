import { Button } from "@/components/ui/button";

interface GameControlsProps {
  isFilling: boolean;
  fillLevel: number;
  onStartFilling: () => void;
  onStopFilling: () => void;
  onNudge: () => void;
  onComplete: () => void;
  disabled?: boolean;
}

export function GameControls({
  isFilling,
  fillLevel,
  onStartFilling,
  onStopFilling,
  onNudge,
  onComplete,
  disabled = false,
}: GameControlsProps) {
  const hasStartedFilling = fillLevel > 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Main Fill Button */}
      <button
        className={`w-full h-24 rounded-2xl text-2xl font-bold transition-all duration-150 select-none touch-none ${
          isFilling
            ? "bg-amber-500 text-amber-950 scale-95 shadow-inner"
            : "bg-emerald-500 text-white shadow-xl hover:bg-emerald-400 active:scale-95"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onMouseDown={onStartFilling}
        onMouseUp={onStopFilling}
        onMouseLeave={onStopFilling}
        onTouchStart={(e) => {
          e.preventDefault();
          onStartFilling();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onStopFilling();
        }}
        disabled={disabled}
      >
        {isFilling ? "🔵 FILLING..." : "⬆️ HOLD TO FILL"}
      </button>
      
      {/* Secondary Controls */}
      <div className="flex gap-4 w-full">
        {/* Nudge Button */}
        <Button
          variant="secondary"
          size="lg"
          className="flex-1 h-14 text-lg"
          onClick={onNudge}
          disabled={disabled || isFilling || !hasStartedFilling}
        >
          +50L NUDGE
        </Button>
        
        {/* Complete/Submit Button */}
        <Button
          variant="default"
          size="lg"
          className="flex-1 h-14 text-lg bg-amber-500 hover:bg-amber-400 text-amber-950"
          onClick={onComplete}
          disabled={disabled || !hasStartedFilling}
        >
          ✓ DONE
        </Button>
      </div>
      
      {/* Instructions */}
      <div className="text-center text-sm text-slate-400 mt-2">
        <p>Hold to fill • Release to stop • Tap DONE when ready</p>
        <p className="text-xs mt-1">Closer to target = More money kept</p>
      </div>
    </div>
  );
}
