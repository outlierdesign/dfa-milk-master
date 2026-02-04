import { useEffect, useState, useRef } from "react";
import { TankerV2 } from "./TankerV2";
import { LeaderboardEntry } from "../types";
import { GameConfig } from "../hooks/useGameStateV2";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import piperLogo from "@/assets/piper-logo.png";

interface AttractModeV2Props {
  onStartGame: () => void;
  leaderboardEntries: LeaderboardEntry[];
  config: GameConfig;
}

export function AttractModeV2({ onStartGame, leaderboardEntries, config }: AttractModeV2Props) {
  const [demoFillLevel, setDemoFillLevel] = useState(0);
  const animationRef = useRef<number | null>(null);
  const demoTarget = config.TARGET_FILL_L;
  const { playGameStart, isMuted, toggleMute } = useSoundEffects();

  const handleStartGame = () => {
    playGameStart();
    onStartGame();
  };

  // Demo animation
  useEffect(() => {
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
        const targetProgress = demoTarget / config.TANKER_CAPACITY_L;
        setDemoFillLevel(progress * targetProgress * config.TANKER_CAPACITY_L);
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
  }, [demoTarget, config.TANKER_CAPACITY_L]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      {/* Piper Logo */}
      <div className="mb-6 animate-fade-in">
        <img src={piperLogo} alt="Piper" className="h-16 md:h-20 object-contain" />
      </div>

      {/* Title */}
      <div className="text-center mb-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
          FILL THE TANK
        </h1>
        <p className="text-xl md:text-2xl text-emerald-400 font-medium">
          One shot. Real consequences.
        </p>
      </div>

      {/* Piper Value Points */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-2xl">
        <div className="bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-600 text-center">
          <div className="text-emerald-400 text-sm font-bold">⏱️ SAVE TIME</div>
          <div className="text-slate-400 text-xs">No agitation delays</div>
        </div>
        <div className="bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-600 text-center">
          <div className="text-emerald-400 text-sm font-bold">🚛 OPTIMIZE FILL</div>
          <div className="text-slate-400 text-xs">No empty capacity</div>
        </div>
        <div className="bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-600 text-center">
          <div className="text-emerald-400 text-sm font-bold">💧 AVOID LOSS</div>
          <div className="text-slate-400 text-xs">No spills or leftovers</div>
        </div>
      </div>

      {/* Demo Tanker */}
      <div className="mb-6 scale-65 md:scale-75 origin-center">
        <TankerV2
          currentFill={demoFillLevel}
          targetFill={demoTarget}
          isFilling={demoFillLevel < demoTarget}
          spillTriggered={false}
          spillAmount={0}
          config={config}
        />
      </div>

      {/* Call to Action */}
      <div className="text-center mb-6">
        <button
          onClick={handleStartGame}
          className="bg-emerald-500 hover:bg-emerald-400 text-white text-3xl font-bold px-12 py-6 rounded-2xl shadow-2xl animate-pulse transition-all hover:scale-105"
        >
          TAP TO PLAY
        </button>
        <p className="text-slate-400 mt-4 text-lg">
          Closer for more accurate loads
        </p>
      </div>

      {/* Sound Toggle */}
      <SoundToggle
        isMuted={isMuted}
        onToggle={toggleMute}
        className="absolute top-4 right-4"
      />

      {/* Admin hint - subtle */}
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs">
        Ctrl+Shift+A for settings
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
                  {entry.accuracy.toFixed(1)}% accuracy
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
