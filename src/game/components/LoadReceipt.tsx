import { GameConfig } from "../hooks/useGameStateV2";

interface LoadReceiptProps {
  // Fill data
  currentFill: number;
  targetFill: number;
  spillAmount: number;
  emptyCapacity: number;
  
  // Timing data
  totalFillDuration: number;
  averageFlowRate: number;
  
  // Cost data
  spillCost: number;
  haulageWasteCost: number;
  timeCost: number;
  timeSaved: number;
  timeDelta: number;
  totalLoadCost: number;
  
  // Decisions
  usedPiperSampling: boolean;
  usedWeighbridge: boolean;
  
  // Config
  config: GameConfig;
}

export function LoadReceipt({
  currentFill,
  targetFill,
  spillAmount,
  emptyCapacity,
  totalFillDuration,
  averageFlowRate,
  spillCost,
  haulageWasteCost,
  timeCost,
  timeSaved,
  timeDelta,
  totalLoadCost,
  usedPiperSampling,
  usedWeighbridge,
  config,
}: LoadReceiptProps) {
  const hasSpill = spillAmount > 0;
  const hasEmptyCapacity = emptyCapacity > 100;
  const emptyCapacityPercent = emptyCapacity / config.TANKER_CAPACITY_L;
  const currency = config.CURRENCY;
  
  // Calculate overfill percentage and determine if major
  const overfillPercent = (currentFill / config.TANKER_CAPACITY_L) * 100;
  const isMajorOverspill = spillAmount > ((config as any).OVERFILL_TOLERANCE_L ?? 440);

  return (
    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-lg w-full">
      <h3 className="text-lg font-bold text-slate-300 mb-4 text-center border-b border-slate-600 pb-2">
        📋 LOAD RECEIPT
      </h3>

      {/* Load Statistics */}
      <div className="space-y-2 mb-4 font-mono text-sm">
        <div className="flex justify-between items-center text-slate-300">
          <span>Load Time:</span>
          <span className="font-bold text-white">{totalFillDuration.toFixed(1)}s</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Avg Flow Rate:</span>
          <span className="font-bold text-white">{Math.round(averageFlowRate)} L/min</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Volume Loaded:</span>
          <span className="font-bold text-white">{Math.round(currentFill).toLocaleString()} L</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Target Volume:</span>
          <span className="font-bold text-emerald-400">{Math.round(targetFill).toLocaleString()} L</span>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-600 my-4" />

      {/* Cost Breakdown */}
      <div className="space-y-3">
        {/* Spill */}
        {hasSpill && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-red-400">
              <span>🥛 Milk spilled: {Math.round(spillAmount)}L</span>
              <span className="font-bold">−{currency}{spillCost.toFixed(2)}</span>
            </div>
            {isMajorOverspill && (
              <div className="text-red-500 text-xs font-bold text-center bg-red-900/30 py-1 rounded">
                ⚠️ MAJOR OVERSPILL
              </div>
            )}
            <div className="text-red-300 text-xs text-center">
              Fill: {overfillPercent.toFixed(1)}% of capacity
            </div>
          </div>
        )}

        {/* Empty Capacity */}
        {hasEmptyCapacity && (
          <div className="flex justify-between items-center text-amber-400">
            <span>🚛 Empty capacity: {(emptyCapacityPercent * 100).toFixed(1)}%</span>
            <span className="font-bold">−{currency}{haulageWasteCost.toFixed(2)}</span>
          </div>
        )}

        {/* Time */}
        {timeDelta !== 0 && (
          <div className={`flex justify-between items-center ${timeDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
            <span>
              ⏱️ Time {timeDelta > 0 ? "saved" : "lost"}: {Math.abs(timeDelta)} mins
            </span>
            <span className="font-bold">
              {timeDelta > 0 ? `+${currency}${timeSaved.toFixed(2)}` : `−${currency}${timeCost.toFixed(2)}`}
            </span>
          </div>
        )}

        {/* Decision summary */}
        <div className="pt-3 border-t border-slate-600 text-sm text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Piper System</span>
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
              {totalLoadCost > 0 ? `−${currency}${totalLoadCost.toFixed(2)}` : `${currency}0.00`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
