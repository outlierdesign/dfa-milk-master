import { LeaderboardEntry } from "../types";
import { LeaderboardDisplay } from "../hooks/useLeaderboard";

interface ArcadeLeaderboardProps {
  display: LeaderboardDisplay;
  currentEntryId: string | null;
  currency: string;
  compact?: boolean; // for attract screen
}

const MEDAL = ["🥇", "🥈", "🥉"];

export function ArcadeLeaderboard({ display, currentEntryId, currency, compact }: ArcadeLeaderboardProps) {
  const visibleEntries = compact ? display.top.slice(0, 5) : display.top;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Arcade banner */}
      <div className="relative bg-red-500 py-3 px-4 text-center border-2 border-red-400"
        style={{ fontFamily: "'Press Start 2P', monospace", imageRendering: "pixelated" }}>
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-slate-900" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-900" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-slate-900" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-900" />
        <span className="text-amber-300 text-xs mr-2">★</span>
        <span className="text-white text-xs md:text-sm tracking-widest">LEADERBOARD</span>
        <span className="text-amber-300 text-xs ml-2">★</span>
      </div>

      {/* Board body */}
      <div className="bg-slate-900 border-2 border-slate-600 border-t-0 p-3"
        style={{ fontFamily: "'Press Start 2P', monospace" }}>
        
        {/* Header row */}
        <div className="flex items-center text-[8px] md:text-[10px] text-slate-500 mb-2 px-1">
          <span className="w-8">#</span>
          <span className="flex-1">NAME</span>
          <span className="text-right w-28">SCORE</span>
        </div>

        <div className="space-y-1">
          {visibleEntries.map((entry, i) => {
            const isCurrentPlayer = entry.id === currentEntryId;
            const medal = i < 3 ? MEDAL[i] : null;
            return (
              <div
                key={entry.id}
                className={`flex items-center px-2 py-1.5 rounded text-[8px] md:text-[10px] transition-all ${
                  isCurrentPlayer
                    ? "bg-emerald-900/50 border border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse"
                    : i % 2 === 0
                    ? "bg-slate-800/60"
                    : "bg-slate-800/30"
                }`}
              >
                <span className="w-8 text-slate-400 shrink-0">
                  {medal || (i + 1)}
                </span>
                <span className={`flex-1 truncate ${isCurrentPlayer ? "text-emerald-400" : "text-white"}`}>
                  {entry.playerName}
                  {isCurrentPlayer && <span className="text-emerald-300 ml-1">◄</span>}
                </span>
                <span className="text-right w-28 text-red-400 shrink-0">
                  {currency}{entry.score.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })}

          {/* Separator + player rank outside top N */}
          {!compact && display.playerEntry && (
            <>
              <div className="flex items-center justify-center py-1 text-[8px] text-slate-600 tracking-[0.3em]">
                · · · · ·
              </div>
              <div className="flex items-center px-2 py-1.5 rounded text-[8px] md:text-[10px] bg-emerald-900/50 border border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse">
                <span className="w-8 text-slate-400 shrink-0">{display.playerEntry.rank}</span>
                <span className="flex-1 truncate text-emerald-400">
                  {display.playerEntry.entry.playerName}
                  <span className="text-emerald-300 ml-1">◄</span>
                </span>
                <span className="text-right w-28 text-red-400 shrink-0">
                  {currency}{display.playerEntry.entry.score.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </>
          )}

          {visibleEntries.length === 0 && (
            <div className="text-center text-slate-500 text-[8px] py-4">
              NO SCORES YET
            </div>
          )}
        </div>

        {/* Scanline overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          }}
        />
      </div>
    </div>
  );
}
