import { GAME_CONFIG_V2 } from "../constantsV2";

interface FarmTankProps {
  currentLevel: number;
  initialLevel: number;
  showLeftBehind?: boolean;
}

export function FarmTank({ currentLevel, initialLevel, showLeftBehind = false }: FarmTankProps) {
  const fillPercentage = (currentLevel / GAME_CONFIG_V2.FARM_TANK_CAPACITY_L) * 100;
  const milkLeftBehind = currentLevel;
  const leftBehindValue = milkLeftBehind * GAME_CONFIG_V2.MILK_VALUE_PER_L;

  return (
    <div className="flex flex-col items-center">
      {/* Tank Label */}
      <div className="text-sm font-bold text-slate-400 mb-2">FARM TANK</div>

      {/* Tank Structure */}
      <div className="relative w-32 h-48">
        {/* Tank body - vertical cylinder */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-400 via-slate-300 to-slate-400 rounded-lg border-4 border-slate-500 shadow-xl overflow-hidden">
          {/* Inner tank */}
          <div className="absolute inset-2 rounded bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden">
            {/* Milk level */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-400 to-sky-300 transition-all duration-100 ease-out"
              style={{ height: `${fillPercentage}%` }}
            >
              {/* Liquid surface shimmer */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>

          {/* Tank legs */}
          <div className="absolute -bottom-4 left-2 w-3 h-6 bg-slate-600 rounded-b" />
          <div className="absolute -bottom-4 right-2 w-3 h-6 bg-slate-600 rounded-b" />
        </div>

        {/* Top dome */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-full border-2 border-slate-500 border-b-0" />

        {/* Outlet pipe (bottom right) */}
        <div className="absolute bottom-8 -right-6 w-8 h-3 bg-slate-500 rounded-r" />
      </div>

      {/* Level Display */}
      <div className="mt-6 bg-slate-800/90 px-3 py-2 rounded-lg border border-slate-600 text-center">
        <div className="text-xs text-slate-400">REMAINING</div>
        <div className="text-lg font-mono font-bold text-sky-400">
          {Math.round(currentLevel).toLocaleString()}L
        </div>
      </div>

      {/* Milk Left Behind Warning */}
      {showLeftBehind && milkLeftBehind > 0 && (
        <div className="mt-3 bg-amber-900/50 px-3 py-2 rounded-lg border border-amber-600 text-center animate-pulse">
          <div className="text-xs text-amber-300 font-bold">MILK LEFT BEHIND</div>
          <div className="text-sm font-mono text-amber-400">
            €{leftBehindValue.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
