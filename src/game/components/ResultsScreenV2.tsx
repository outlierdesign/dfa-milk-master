import { useEffect, useState } from "react";
import { GAME_CONFIG_V2 } from "../constantsV2";

interface ResultsScreenV2Props {
  // Fill results
  currentFill: number;
  spillAmount: number;
  emptyCapacity: number;
  milkLeftBehind: number;
  
  // Time results
  timeDelta: number; // +/- minutes from decisions
  nudgeCount: number;
  
  // Pre-load decisions
  usedPiperSampling: boolean;
  usedWeighbridge: boolean;
  
  // Callbacks
  onPlayAgain: () => void;
}

export function ResultsScreenV2({
  currentFill,
  spillAmount,
  emptyCapacity,
  milkLeftBehind,
  timeDelta,
  nudgeCount,
  usedPiperSampling,
  usedWeighbridge,
  onPlayAgain,
}: ResultsScreenV2Props) {
  const [showAnnualized, setShowAnnualized] = useState(false);

  // Calculate costs
  const spillCost = spillAmount * GAME_CONFIG_V2.MILK_VALUE_PER_L;
  
  const emptyCapacityPercent = emptyCapacity / GAME_CONFIG_V2.TANKER_CAPACITY_L;
  const haulageWasteCost = emptyCapacityPercent * GAME_CONFIG_V2.HAULAGE_COST_PER_LOAD;
  
  const nudgeTimePenalty = nudgeCount * (GAME_CONFIG_V2.NUDGE_TIME_PENALTY_SEC / 60);
  const totalTimeMin = Math.abs(timeDelta) + nudgeTimePenalty;
  const timeCost = timeDelta < 0 ? totalTimeMin * GAME_CONFIG_V2.TIME_COST_PER_MIN : 0;
  const timeSaved = timeDelta > 0 ? timeDelta * GAME_CONFIG_V2.TIME_COST_PER_MIN : 0;

  const totalLoadCost = spillCost + haulageWasteCost + timeCost;
  
  // Annualized
  const dailyCost = totalLoadCost * GAME_CONFIG_V2.FARM_LOADS_PER_DAY;
  const annualCost = dailyCost * GAME_CONFIG_V2.DAYS_PER_YEAR;

  // Calculate accuracy
  const targetFill = GAME_CONFIG_V2.TARGET_FILL_L;
  const accuracy = Math.max(0, 100 - (Math.abs(currentFill - targetFill) / targetFill) * 100);

  // Show annualized after delay for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowAnnualized(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const hasSpill = spillAmount > 0;
  const hasEmptyCapacity = emptyCapacity > 100; // More than 100L empty
  const isPerfect = !hasSpill && !hasEmptyCapacity && accuracy >= 98;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {isPerfect ? "🎉 Perfect Load!" : hasSpill ? "💔 Milk Lost" : "Load Complete"}
        </h2>
        <div className="text-xl text-slate-400">
          Accuracy: <span className={`font-bold ${accuracy >= 95 ? "text-emerald-400" : accuracy >= 80 ? "text-amber-400" : "text-red-400"}`}>
            {accuracy.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Per-Load Breakdown */}
      <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-lg w-full mb-6">
        <h3 className="text-lg font-bold text-slate-300 mb-4 text-center">
          THIS LOAD
        </h3>

        <div className="space-y-3">
          {/* Spill */}
          {hasSpill && (
            <div className="flex justify-between items-center text-red-400">
              <span>🥛 Milk spilled: {Math.round(spillAmount)}L</span>
              <span className="font-bold">−€{spillCost.toFixed(2)}</span>
            </div>
          )}

          {/* Empty Capacity */}
          {hasEmptyCapacity && (
            <div className="flex justify-between items-center text-amber-400">
              <span>🚛 Empty capacity: {(emptyCapacityPercent * 100).toFixed(1)}%</span>
              <span className="font-bold">−€{haulageWasteCost.toFixed(2)}</span>
            </div>
          )}

          {/* Time */}
          {timeDelta !== 0 && (
            <div className={`flex justify-between items-center ${timeDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
              <span>
                ⏱️ Time {timeDelta > 0 ? "saved" : "lost"}: {Math.abs(timeDelta)} mins
              </span>
              <span className="font-bold">
                {timeDelta > 0 ? `+€${timeSaved.toFixed(2)}` : `−€${timeCost.toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Nudge penalty */}
          {nudgeCount > 0 && (
            <div className="flex justify-between items-center text-slate-400 text-sm">
              <span>👆 Nudges used: {nudgeCount}</span>
              <span>+{(nudgeTimePenalty * 60).toFixed(0)}s delay</span>
            </div>
          )}

          {/* Decision summary */}
          <div className="pt-3 border-t border-slate-600 text-sm text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Piper Sampling</span>
              <span className={usedPiperSampling ? "text-emerald-400" : "text-red-400"}>
                {usedPiperSampling ? "✓ YES" : "✗ NO"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Weighbridge</span>
              <span className={!usedWeighbridge ? "text-emerald-400" : "text-red-400"}>
                {usedWeighbridge ? "✗ YES" : "✓ NO (Piper)"}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 mt-3 border-t-2 border-slate-500">
            <div className="flex justify-between items-center text-xl">
              <span className="text-white font-bold">LOAD COST</span>
              <span className={`font-bold ${totalLoadCost > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {totalLoadCost > 0 ? `−€${totalLoadCost.toFixed(2)}` : "€0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Annualized Impact */}
      {showAnnualized && totalLoadCost > 0 && (
        <div className="bg-red-900/50 p-6 rounded-xl border border-red-600 max-w-lg w-full mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-red-300 mb-3 text-center">
            ANNUALIZED IMPACT
          </h3>
          
          <p className="text-center text-slate-300 mb-3">
            This farm loads <span className="font-bold text-white">{GAME_CONFIG_V2.FARM_LOADS_PER_DAY} tankers</span> a day
          </p>

          <div className="space-y-2 text-center">
            <div className="text-slate-400">
              Daily: €{totalLoadCost.toFixed(2)} × {GAME_CONFIG_V2.FARM_LOADS_PER_DAY} = 
              <span className="text-red-400 font-bold ml-2">€{dailyCost.toFixed(2)}</span>
            </div>
            <div className="text-slate-400">
              Annual: €{dailyCost.toFixed(2)} × {GAME_CONFIG_V2.DAYS_PER_YEAR} = 
            </div>
            <div className="text-4xl font-black text-red-400 mt-2">
              €{annualCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-red-300">per year</div>
          </div>
        </div>
      )}

      {/* Piper Message */}
      <div className="bg-emerald-900/50 p-6 rounded-xl border border-emerald-600 max-w-lg w-full mb-6">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2">
            Piper removes this cost.
          </div>
          <p className="text-emerald-200 text-sm">
            Precision metering • No agitation delays • No weighbridge
          </p>
        </div>
      </div>

      {/* Play Again */}
      <button
        onClick={onPlayAgain}
        className="bg-emerald-500 hover:bg-emerald-400 text-white text-2xl font-bold px-10 py-5 rounded-2xl shadow-2xl transition-all hover:scale-105"
      >
        PLAY AGAIN
      </button>
    </div>
  );
}
