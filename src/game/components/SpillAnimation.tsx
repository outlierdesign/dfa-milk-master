import { useEffect, useState } from "react";
import { GameConfig } from "../hooks/useGameStateV2";

interface SpillAnimationProps {
  spillAmount: number;
  isActive: boolean;
  config: GameConfig;
}

export function SpillAnimation({ spillAmount, isActive, config }: SpillAnimationProps) {
  const [showFlash, setShowFlash] = useState(false);
  const [puddleSize, setPuddleSize] = useState(0);
  const [showCat, setShowCat] = useState(false);

  const spillValue = spillAmount * config.MILK_VALUE_PER_L;

  useEffect(() => {
    if (isActive && spillAmount > 0) {
      // Flash effect
      setShowFlash(true);
      const flashTimer = setTimeout(() => setShowFlash(false), 200);

      // Grow puddle based on spill amount
      const targetSize = Math.min(100, (spillAmount / 500) * 100);
      setPuddleSize(targetSize);

      // Show cat after a short delay
      const catTimer = setTimeout(() => setShowCat(true), 800);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(catTimer);
      };
    } else {
      setShowCat(false);
      setPuddleSize(0);
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
        <div className="bg-red-900/95 px-8 py-6 rounded-2xl border-4 border-red-500 shadow-2xl animate-scale-in">
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

      {/* Milk Puddle with Cat */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        {/* Puddle layers for depth */}
        <div 
          className="relative transition-all duration-700 ease-out"
          style={{
            width: `${Math.max(120, puddleSize * 4)}px`,
            height: `${Math.max(40, puddleSize * 1.2)}px`,
          }}
        >
          {/* Outer puddle glow */}
          <div 
            className="absolute inset-0 bg-sky-200/30 rounded-full blur-xl animate-pulse"
            style={{ transform: "scale(1.3)" }}
          />
          
          {/* Main puddle */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/70 via-sky-200/80 to-sky-300/90 rounded-full shadow-lg" />
          
          {/* Puddle highlight */}
          <div 
            className="absolute top-1 left-1/4 w-1/2 h-1/3 bg-white/40 rounded-full blur-sm"
          />
          
          {/* Ripple effects */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute border-2 border-sky-300/50 rounded-full"
                style={{
                  width: `${40 + i * 30}%`,
                  height: `${60 + i * 20}%`,
                  animation: `ripple 2s ease-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Milk drops still falling */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute -top-16 w-3 h-5 bg-gradient-to-b from-sky-200 to-sky-400 rounded-full opacity-80"
              style={{
                left: `${20 + i * 20}%`,
                animation: `dropFall 0.6s ease-in infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Cat approaching the puddle */}
        {showCat && (
          <div 
            className="absolute -right-16 bottom-0 text-5xl animate-fade-in"
            style={{
              animation: "catWalk 1.5s ease-out forwards",
            }}
          >
            <div className="relative">
              {/* Cat emoji */}
              <span className="inline-block" style={{ transform: "scaleX(-1)" }}>🐈</span>
              
              {/* Cat thought bubble */}
              <div 
                className="absolute -top-10 -left-2 bg-white/90 px-2 py-1 rounded-lg text-sm animate-fade-in"
                style={{ animationDelay: "1s" }}
              >
                <span className="text-lg">😋</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        @keyframes dropFall {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(60px) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes catWalk {
          0% {
            transform: translateX(40px);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
