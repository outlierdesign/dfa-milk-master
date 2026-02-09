import { GameConfig } from "../constantsV2";

interface FarmTankProps {
  currentLevel: number;
  initialLevel: number;
  showLeftBehind?: boolean;
  config: GameConfig;
}

export function FarmTank({ currentLevel, initialLevel, showLeftBehind = false, config }: FarmTankProps) {
  const fillPercentage = initialLevel > 0 ? (currentLevel / initialLevel) * 100 : 0;
  const milkLeftBehind = currentLevel;
  const leftBehindValue = milkLeftBehind * config.milkCostPerLb;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold text-slate-400 mb-2">FARM TANK</div>
      <div className="relative w-32 h-48">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-400 via-slate-300 to-slate-400 rounded-lg border-4 border-slate-500 shadow-xl overflow-hidden">
          <div className="absolute inset-2 rounded bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#FDFFF5] to-[#F5F7E8] transition-all duration-100 ease-out" style={{ height: `${fillPercentage}%` }}>
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
          <div className="absolute -bottom-4 left-2 w-3 h-6 bg-slate-600 rounded-b" />
          <div className="absolute -bottom-4 right-2 w-3 h-6 bg-slate-600 rounded-b" />
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-full border-2 border-slate-500 border-b-0" />
        <div className="absolute bottom-8 -right-6 w-8 h-3 bg-slate-500 rounded-r" />
      </div>

      {showLeftBehind && milkLeftBehind > 0 && (
        <div className="mt-3 bg-amber-900/50 px-3 py-2 rounded-lg border border-amber-600 text-center animate-pulse">
          <div className="text-xs text-amber-300 font-bold">MILK LEFT BEHIND</div>
          <div className="text-sm font-mono text-amber-400">
            {config.currency}{leftBehindValue.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
