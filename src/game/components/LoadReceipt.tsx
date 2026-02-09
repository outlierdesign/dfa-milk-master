import { GameConfig, RoundResult } from "../constantsV2";

interface LoadReceiptProps {
  rounds: RoundResult[];
  config: GameConfig;
  usedPiperSampling: boolean;
  usedWeighbridge: boolean;
}

export function LoadReceipt({ rounds, config, usedPiperSampling, usedWeighbridge }: LoadReceiptProps) {
  const currency = config.currency;
  const totalFillLbs = rounds.reduce((s, r) => s + r.fillLbs, 0);
  const totalSpillLbs = rounds.reduce((s, r) => s + r.spillLbs, 0);
  const avgFillTime = rounds.reduce((s, r) => s + r.fillDuration, 0) / rounds.length;
  const avgFlowRate = rounds.reduce((s, r) => s + r.averageFlowRate, 0) / rounds.length;

  return (
    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-lg w-full">
      <h3 className="text-lg font-bold text-slate-300 mb-4 text-center border-b border-slate-600 pb-2">📋 LOAD RECEIPT</h3>
      <div className="space-y-2 mb-4 font-mono text-sm">
        <div className="flex justify-between text-slate-300"><span>Rounds:</span><span className="text-white font-bold">{rounds.length}</span></div>
        <div className="flex justify-between text-slate-300"><span>Avg Fill Time:</span><span className="text-white font-bold">{avgFillTime.toFixed(1)} min</span></div>
        <div className="flex justify-between text-slate-300"><span>Avg Flow Rate:</span><span className="text-white font-bold">{Math.round(avgFlowRate).toLocaleString()} lbs/min</span></div>
        <div className="flex justify-between text-slate-300"><span>Total Loaded:</span><span className="text-white font-bold">{Math.round(totalFillLbs).toLocaleString()} lbs</span></div>
        <div className="flex justify-between text-slate-300"><span>Target per Load:</span><span className="text-emerald-400 font-bold">{config.targetLoadLbs.toLocaleString()} lbs</span></div>
        {totalSpillLbs > 0 && (
          <div className="flex justify-between text-red-400"><span>Total Spill:</span><span className="font-bold">{Math.round(totalSpillLbs).toLocaleString()} lbs ({currency}{(totalSpillLbs * config.milkCostPerLb).toFixed(2)})</span></div>
        )}
      </div>
      <div className="border-t border-dashed border-slate-600 my-4" />
      <div className="text-sm text-slate-400 space-y-1">
        <div className="flex justify-between"><span>Piper System</span><span className={usedPiperSampling ? "text-emerald-400" : "text-red-400"}>{usedPiperSampling ? "✓ YES" : "✗ NO"}</span></div>
        <div className="flex justify-between"><span>Weighbridge</span><span className={!usedWeighbridge ? "text-emerald-400" : "text-red-400"}>{usedWeighbridge ? "✗ YES" : "✓ NO (Piper)"}</span></div>
      </div>
    </div>
  );
}
