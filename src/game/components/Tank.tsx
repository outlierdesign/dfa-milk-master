import { useEffect, useRef } from "react";
import { GAME_CONFIG } from "../constants";

interface TankProps {
  fillLevel: number;
  targetFill: number;
  isFilling: boolean;
  showTarget?: boolean;
}

export function Tank({ fillLevel, targetFill, isFilling, showTarget = true }: TankProps) {
  const fillPercentage = Math.min((fillLevel / GAME_CONFIG.TANK_CAPACITY) * 100, 100);
  const targetPercentage = (targetFill / GAME_CONFIG.TANK_CAPACITY) * 100;
  const isOverfilled = fillLevel > GAME_CONFIG.TANK_CAPACITY;
  
  // Determine fill color based on proximity to target
  const difference = Math.abs(fillLevel - targetFill);
  const tolerance = GAME_CONFIG.LEVELS[0].tolerance; // Use base tolerance for coloring
  
  let fillColorClass = "from-sky-400 to-sky-500"; // Default blue milk
  if (fillLevel > 0) {
    if (isOverfilled) {
      fillColorClass = "from-red-400 to-red-500";
    } else if (difference <= tolerance * 0.5) {
      fillColorClass = "from-emerald-400 to-emerald-500";
    } else if (difference <= tolerance) {
      fillColorClass = "from-amber-400 to-amber-500";
    }
  }

  return (
    <div className="relative w-64 h-96 mx-auto">
      {/* Tank body - stainless steel look */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 border-4 border-slate-400 shadow-2xl overflow-hidden">
        {/* Inner tank shadow */}
        <div className="absolute inset-2 rounded-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 overflow-hidden">
          {/* Liquid fill */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${fillColorClass} transition-all duration-75 ease-out`}
            style={{ height: `${Math.min(fillPercentage, 100)}%` }}
          >
            {/* Liquid surface animation */}
            {isFilling && (
              <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            )}
            
            {/* Liquid bubbles when filling */}
            {isFilling && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/40 animate-bounce"
                    style={{
                      left: `${20 + i * 15}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "0.5s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Overfill indicator */}
          {isOverfilled && (
            <div className="absolute top-0 left-0 right-0 h-8 bg-red-500/50 animate-pulse flex items-center justify-center">
              <span className="text-xs font-bold text-white">OVERFILL!</span>
            </div>
          )}
          
          {/* Target line */}
          {showTarget && (
            <div
              className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-lg z-10"
              style={{ bottom: `${targetPercentage}%` }}
            >
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-400 rounded-l flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-900">→</span>
              </div>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-400 rounded-r flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-900">←</span>
              </div>
            </div>
          )}
          
          {/* Level markers */}
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute left-0 right-0 h-px bg-slate-600/50"
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Tank top cap */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 border-2 border-slate-400" />
      
      {/* Tank base */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-56 h-4 rounded-b-lg bg-gradient-to-b from-slate-400 to-slate-500 border-2 border-slate-500" />
      
      {/* Fill level display */}
      <div className="absolute -right-24 top-1/2 -translate-y-1/2 bg-slate-800/90 px-3 py-2 rounded-lg border border-slate-600">
        <div className="text-xs text-slate-400 mb-1">LEVEL</div>
        <div className="text-xl font-mono font-bold text-white">
          {Math.round(fillLevel).toLocaleString()}
        </div>
        <div className="text-xs text-slate-400">LITERS</div>
      </div>
      
      {/* Target display */}
      {showTarget && (
        <div className="absolute -left-24 top-1/2 -translate-y-1/2 bg-emerald-900/90 px-3 py-2 rounded-lg border border-emerald-600">
          <div className="text-xs text-emerald-300 mb-1">TARGET</div>
          <div className="text-xl font-mono font-bold text-emerald-400">
            {targetFill.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-300">LITERS</div>
        </div>
      )}
    </div>
  );
}
