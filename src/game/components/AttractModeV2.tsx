import { useEffect, useState, useRef } from "react";
import { TankerV2 } from "./TankerV2";
import { LeaderboardEntry } from "../types";
import { GameConfig } from "../constantsV2";
import { LeaderboardDisplay } from "../hooks/useLeaderboard";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { ArcadeLeaderboard } from "./ArcadeLeaderboard";
import piperLogo from "@/assets/piper-logo.png";

interface AttractModeV2Props {
  onStartGame: () => void;
  leaderboardEntries: LeaderboardEntry[];
  config: GameConfig;
  getDisplayEntries: (currentEntryId: string | null) => LeaderboardDisplay;
}

export function AttractModeV2({ onStartGame, leaderboardEntries, config, getDisplayEntries }: AttractModeV2Props) {
  const [demoFillLevel, setDemoFillLevel] = useState(0);
  const animationRef = useRef<number | null>(null);
  const demoTarget = config.targetLoadLbs;
  const maxFill = config.maxAllowedFill;
  const { playGameStart, isMuted, toggleMute } = useSoundEffects();

  const handleStartGame = () => { playGameStart(); onStartGame(); };

  useEffect(() => {
    let startTime: number | null = null;
    const fillDuration = 3000;
    const pauseDuration = 2000;
    const cycleDuration = fillDuration + pauseDuration;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % cycleDuration;
      if (elapsed < fillDuration) {
        const progress = elapsed / fillDuration;
        setDemoFillLevel(progress * demoTarget);
      } else {
        setDemoFillLevel(demoTarget);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [demoTarget]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="mb-6 animate-fade-in">
        <img src={piperLogo} alt="Piper" className="h-16 md:h-20 object-contain" />
      </div>

      <div className="text-center mb-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">FILL THE TANK</h1>
        <p className="text-xl md:text-2xl text-emerald-400 font-medium">3 rounds. Real consequences.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6 max-w-2xl">
        <div className="bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-600 text-center">
          <div className="text-emerald-400 text-sm font-bold">⏱️ SAVE TIME</div>
          <div className="text-slate-400 text-xs">No agitation delays</div>
        </div>
        <div className="bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-600 text-center">
          <div className="text-emerald-400 text-sm font-bold">🚛 OPTIMIZE FILL</div>
          <div className="text-slate-400 text-xs">Hit {(config.targetLoadLbs / 1000).toFixed(0)}k lbs target</div>
        </div>
        <div className="bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-600 text-center">
          <div className="text-emerald-400 text-sm font-bold">💧 AVOID LOSS</div>
          <div className="text-slate-400 text-xs">No spills or waste</div>
        </div>
      </div>

      <div className="mb-6 scale-65 md:scale-75 origin-center">
        <TankerV2 currentFill={demoFillLevel} targetFill={demoTarget} maxFill={maxFill} isFilling={demoFillLevel < demoTarget} spillTriggered={false} spillAmount={0} config={config} />
      </div>

      <div className="text-center mb-6">
        <button onClick={handleStartGame} className="bg-emerald-500 hover:bg-emerald-400 text-white text-3xl font-bold px-12 py-6 rounded-2xl shadow-2xl animate-pulse transition-all hover:scale-105">
          TAP TO PLAY
        </button>
      </div>

      <SoundToggle isMuted={isMuted} onToggle={toggleMute} className="absolute top-4 right-4" />
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs">Ctrl+Shift+A for settings</div>

      {leaderboardEntries.length > 0 && (
        <div className="w-full max-w-md">
          <ArcadeLeaderboard
            display={getDisplayEntries(null)}
            currentEntryId={null}
            currency={config.currency}
            compact
          />
        </div>
      )}
    </div>
  );
}
