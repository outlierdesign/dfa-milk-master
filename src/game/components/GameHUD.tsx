import { GameSession, LevelConfig } from "../types";
import { GAME_CONFIG } from "../constants";
import { Progress } from "@/components/ui/progress";

interface GameHUDProps {
  session: GameSession;
  levelConfig: LevelConfig;
}

export function GameHUD({ session, levelConfig }: GameHUDProps) {
  const tankerProgress = (session.tankersFilledProgress % GAME_CONFIG.MONEY_PER_TANKER) / GAME_CONFIG.MONEY_PER_TANKER * 100;
  
  // Format elapsed time as MM:SS
  const minutes = Math.floor(session.elapsedTime / 60);
  const seconds = session.elapsedTime % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between gap-8">
        {/* Timer - now counts UP */}
        <div className="bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-600">
          <div className="text-xs text-slate-400 text-center mb-1">TIME</div>
          <div className="text-3xl font-mono font-bold text-white">
            {timeDisplay}
          </div>
        </div>
        
        {/* Level & Compartment */}
        <div className="bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-600 flex-1 text-center">
          <div className="text-xs text-slate-400 mb-1">LEVEL {levelConfig.level}</div>
          <div className="text-lg font-bold text-white">{levelConfig.name}</div>
          {levelConfig.compartments > 1 && (
            <div className="text-sm text-amber-400 mt-1">
              Compartment {session.currentCompartment + 1} of {session.totalCompartmentsInLevel}
            </div>
          )}
          {levelConfig.tutorial && session.loadResults.length === 0 && (
            <div className="text-sm text-emerald-400 mt-2 animate-pulse">
              {levelConfig.tutorial}
            </div>
          )}
        </div>
        
        {/* Tankers Filled */}
        <div className="bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-600">
          <div className="text-xs text-slate-400 text-center mb-1">TANKERS FILLED</div>
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  i < session.tankersFilled
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-700 text-slate-500"
                }`}
              >
                🚛
              </div>
            ))}
          </div>
          <Progress value={tankerProgress} className="h-2 mt-2 bg-slate-700" />
        </div>
      </div>
      
      {/* Money Bar */}
      <div className="mt-4 bg-slate-800/80 px-6 py-4 rounded-xl border border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">MONEY KEPT</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              ${session.totalMoneyKept.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-1">LOSS</div>
            <div className="text-xl font-mono font-bold text-red-400">
              -${session.totalMoneyLost.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
