import { useEffect, useState, useRef } from "react";
import { Tank } from "./Tank";
import { LeaderboardEntry } from "../types";
import { GAME_CONFIG } from "../constants";

interface AttractModeProps {
  onStartGame: () => void;
  leaderboardEntries: LeaderboardEntry[];
}

export function AttractMode({ onStartGame, leaderboardEntries }: AttractModeProps) {
  const [demoFillLevel, setDemoFillLevel] = useState(0);
  const [showingDemo, setShowingDemo] = useState(true);
  const animationRef = useRef<number | null>(null);
  const demoTarget = 8000;

  // Demo animation
  useEffect(() => {
    if (!showingDemo) return;

    let startTime: number | null = null;
    const fillDuration = 3000; // 3 seconds to fill
    const pauseDuration = 2000; // 2 seconds pause at target
    const cycleDuration = fillDuration + pauseDuration;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % cycleDuration;

      if (elapsed < fillDuration) {
        // Filling phase
        const progress = elapsed / fillDuration;
        const targetProgress = demoTarget / GAME_CONFIG.TANK_CAPACITY;
        setDemoFillLevel(progress * targetProgress * GAME_CONFIG.TANK_CAPACITY);
      } else {
        // Pause at target
        setDemoFillLevel(demoTarget);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showingDemo]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8 cursor-pointer"
      onClick={onStartGame}
      onTouchStart={onStartGame}
    >
      {/* Title */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
          FILL THE TANK
        </h1>
        <p className="text-xl md:text-2xl text-emerald-400">
          Load it right. Every time.
        </p>
      </div>

      {/* Demo Tank */}
      <div className="mb-8">
        <Tank
          fillLevel={demoFillLevel}
          targetFill={demoTarget}
          isFilling={demoFillLevel < demoTarget}
          showTarget={true}
        />
      </div>

      {/* Call to Action */}
      <div className="text-center mb-8">
        <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-3xl font-bold px-12 py-6 rounded-2xl shadow-2xl animate-pulse transition-all hover:scale-105">
          TAP TO PLAY
        </button>
        <p className="text-slate-400 mt-4 text-lg">
          Fill to the target • Closer = More money
        </p>
      </div>

      {/* Leaderboard Preview */}
      {leaderboardEntries.length > 0 && (
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-md w-full">
          <h3 className="text-lg font-bold text-amber-400 mb-4 text-center">
            🏆 TOP SCORES TODAY
          </h3>
          <div className="space-y-2">
            {leaderboardEntries.slice(0, 5).map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {index + 1}
                  </span>
                  <span className="text-white">{entry.playerName}</span>
                </div>
                <span className="text-emerald-400 font-mono">
                  ${entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
