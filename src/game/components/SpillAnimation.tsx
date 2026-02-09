import { useEffect, useState } from "react";
import { GameConfig } from "../constantsV2";

interface SpillAnimationProps {
  spillAmount: number;
  isActive: boolean;
  config: GameConfig;
  onContinue?: () => void;
}

export function SpillAnimation({ spillAmount, isActive, config, onContinue }: SpillAnimationProps) {
  const [showSplat, setShowSplat] = useState(false);
  const [drips, setDrips] = useState<number[]>([]);

  const spillValue = spillAmount * config.milkCostPerLb;

  useEffect(() => {
    if (isActive && spillAmount > 0) {
      setShowSplat(true);
      setDrips(Array.from({ length: 15 }, () => Math.random() * 100));
      if (onContinue) {
        const timer = setTimeout(() => onContinue(), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowSplat(false);
      setDrips([]);
    }
  }, [isActive, spillAmount, onContinue]);

  if (!isActive || spillAmount <= 0) return null;

  return (
    <>
      {/* Red flash overlay */}
      <div className="fixed inset-0 z-[60] pointer-events-none" style={{ animation: 'redFlash 0.3s ease-in-out infinite alternate' }} />

      {/* Pulsing red border */}
      <div className="fixed inset-0 z-[55] pointer-events-none border-[6px] md:border-[10px] border-red-600 rounded-lg" style={{ animation: 'borderPulse 0.5s ease-in-out infinite alternate' }} />

      {/* Milk splat effects */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {showSplat && (
          <>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(253,255,245,0.95) 0%, rgba(253,255,245,0.7) 40%, transparent 70%)', animation: 'splatBurst 0.3s ease-out forwards' }} />
            {drips.map((leftPos, i) => (
              <div key={i} className="absolute top-0 w-4 md:w-6 bg-gradient-to-b from-[#FDFFF5] via-[#F5F7E8] to-transparent rounded-b-full" style={{ left: `${leftPos}%`, height: `${30 + Math.random() * 40}%`, animation: 'dripDown 1.5s ease-in forwards', animationDelay: `${i * 0.05}s`, opacity: 0 }} />
            ))}
            {[...Array(20)].map((_, i) => (
              <div key={`spot-${i}`} className="absolute rounded-full bg-[#FDFFF5]" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${20 + Math.random() * 60}px`, height: `${20 + Math.random() * 60}px`, animation: 'splatSpot 0.5s ease-out forwards', animationDelay: `${Math.random() * 0.3}s`, opacity: 0 }} />
            ))}
          </>
        )}
      </div>

      {/* Central message */}
      <div className="fixed inset-0 flex items-center justify-center z-[65] pointer-events-none">
        <div className="bg-red-900/95 px-8 md:px-12 py-6 md:py-8 rounded-2xl border-4 border-red-500 shadow-2xl" style={{ animation: 'bounceIn 0.5s ease-out forwards', animationDelay: '0.3s', opacity: 0 }}>
          <div className="text-4xl md:text-6xl font-black text-white text-center mb-3">💥 MILK EVERYWHERE!</div>
          <div className="text-2xl md:text-3xl text-red-200 text-center mb-4">You overfilled the tanker!</div>
          <div className="text-center space-y-2">
            <div className="text-xl md:text-2xl text-red-300">{Math.round(spillAmount).toLocaleString()} lbs spilled</div>
            <div className="text-2xl md:text-3xl font-bold text-red-400">{config.currency}{spillValue.toFixed(2)} lost!</div>
          </div>
          <div className="mt-4 text-center text-red-300/70 text-sm animate-pulse">Continuing automatically...</div>
        </div>
      </div>

      <style>{`
        @keyframes redFlash {
          0% { background: rgba(220, 38, 38, 0.0); }
          100% { background: rgba(220, 38, 38, 0.35); }
        }
        @keyframes borderPulse {
          0% { border-color: rgba(220, 38, 38, 0.4); box-shadow: inset 0 0 30px rgba(220, 38, 38, 0.2); }
          100% { border-color: rgba(239, 68, 68, 1); box-shadow: inset 0 0 60px rgba(220, 38, 38, 0.5); }
        }
        @keyframes splatBurst { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        @keyframes dripDown { 0% { transform: translateY(-100%); opacity: 0.9; } 100% { transform: translateY(0); opacity: 0.9; } }
        @keyframes splatSpot { 0% { transform: scale(0); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: scale(1); opacity: 0.6; } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}
