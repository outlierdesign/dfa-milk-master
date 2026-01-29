import { useEffect, useState } from "react";
import { GAME_CONFIG_V2 } from "../constantsV2";

interface SpillAnimationProps {
  spillAmount: number;
  isActive: boolean;
}

export function SpillAnimation({ spillAmount, isActive }: SpillAnimationProps) {
  const [showFlash, setShowFlash] = useState(false);
  const [puddleSize, setPuddleSize] = useState(0);

  const spillValue = spillAmount * GAME_CONFIG_V2.MILK_VALUE_PER_L;

  useEffect(() => {
    if (isActive && spillAmount > 0) {
      // Flash effect
      setShowFlash(true);
      const flashTimer = setTimeout(() => setShowFlash(false), 200);

      // Grow puddle based on spill amount
      const targetSize = Math.min(100, (spillAmount / 500) * 100);
      setPuddleSize(targetSize);

      return () => clearTimeout(flashTimer);
    }
  }, [isActive, spillAmount]);

  if (!isActive || spillAmount <= 0) return null;

  return (
    <>
      {/* Screen Flash */}
      {showFlash && (
        <div className="fixed inset-0 bg-red-500/40 z-50 pointer-events-none animate-pulse" />
      )}

      {/* Spill Message Overlay */}
      <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
        <div className="bg-red-900/95 px-8 py-6 rounded-2xl border-4 border-red-500 shadow-2xl animate-bounce">
          <div className="text-4xl md:text-5xl font-black text-white text-center mb-2">
            MILK ON THE GROUND
          </div>
          <div className="text-2xl md:text-3xl text-red-200 text-center">
            🐈 Call farm cat
          </div>
          <div className="mt-4 text-center">
            <span className="text-xl text-red-300">
              {Math.round(spillAmount)}L lost = 
            </span>
            <span className="text-2xl font-bold text-red-400 ml-2">
              €{spillValue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Milk Puddle (positioned below tanker) */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
        style={{
          width: `${puddleSize * 3}px`,
          height: `${puddleSize * 0.4}px`,
        }}
      >
        {/* Puddle shape */}
        <div className="w-full h-full bg-gradient-to-t from-sky-300/80 to-sky-100/60 rounded-full blur-sm" />
        
        {/* Drip animations */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-2 h-8 bg-gradient-to-b from-sky-300 to-transparent rounded-full animate-bounce"
            style={{
              left: `${15 + i * 18}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.5s",
            }}
          />
        ))}
      </div>
    </>
  );
}
