import { useEffect, useState } from "react";
import { GameConfig } from "../hooks/useGameStateV2";
import { LoadReceipt } from "./LoadReceipt";
import { LeadCaptureForm, LeadData } from "./LeadCaptureForm";

interface ResultsScreenV2Props {
  // Fill results
  currentFill: number;
  spillAmount: number;
  emptyCapacity: number;
  milkLeftBehind: number;
  
  // Time results
  timeDelta: number; // +/- minutes from decisions
  nudgeCount: number;
  
  // Timing metrics
  totalFillDuration: number;
  averageFlowRate: number;
  
  // Pre-load decisions
  usedPiperSampling: boolean;
  usedWeighbridge: boolean;
  
  // Callbacks
  onPlayAgain: () => void;
  
  // Config
  config: GameConfig;
}

export function ResultsScreenV2({
  currentFill,
  spillAmount,
  emptyCapacity,
  milkLeftBehind,
  timeDelta,
  nudgeCount,
  totalFillDuration,
  averageFlowRate,
  usedPiperSampling,
  usedWeighbridge,
  onPlayAgain,
  config,
}: ResultsScreenV2Props) {
  const [showAnnualized, setShowAnnualized] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Calculate costs using config
  const spillCost = spillAmount * config.MILK_VALUE_PER_L;
  
  const emptyCapacityPercent = emptyCapacity / config.TANKER_CAPACITY_L;
  const haulageWasteCost = emptyCapacityPercent * config.HAULAGE_COST_PER_LOAD;
  
  const nudgeTimePenalty = nudgeCount * (config.NUDGE_TIME_PENALTY_SEC / 60);
  const totalTimeMin = Math.abs(timeDelta) + nudgeTimePenalty;
  const timeCost = timeDelta < 0 ? totalTimeMin * config.TIME_COST_PER_MIN : 0;
  const timeSaved = timeDelta > 0 ? timeDelta * config.TIME_COST_PER_MIN : 0;

  const totalLoadCost = spillCost + haulageWasteCost + timeCost;
  
  // Annualized
  const dailyCost = totalLoadCost * config.FARM_LOADS_PER_DAY;
  const annualCost = dailyCost * config.DAYS_PER_YEAR;

  // Calculate accuracy
  const targetFill = config.TARGET_FILL_L;
  const accuracy = Math.max(0, 100 - (Math.abs(currentFill - targetFill) / targetFill) * 100);

  // Show annualized after delay for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowAnnualized(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const hasSpill = spillAmount > 0;
  const hasEmptyCapacity = emptyCapacity > 100; // More than 100L empty
  const isPerfect = !hasSpill && !hasEmptyCapacity && accuracy >= 98;

  const handleLeadSubmit = (data: LeadData) => {
    setLeadSubmitted(true);
    // Delay play again to show confirmation
    setTimeout(() => {
      onPlayAgain();
    }, 500);
  };

  const gameResults = {
    accuracy,
    loadTime: totalFillDuration,
    volumeLoaded: currentFill,
    totalCost: totalLoadCost,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-start p-6 overflow-y-auto">
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

      {/* Load Receipt */}
      <LoadReceipt
        currentFill={currentFill}
        targetFill={targetFill}
        spillAmount={spillAmount}
        emptyCapacity={emptyCapacity}
        totalFillDuration={totalFillDuration}
        averageFlowRate={averageFlowRate}
        spillCost={spillCost}
        haulageWasteCost={haulageWasteCost}
        timeCost={timeCost}
        timeSaved={timeSaved}
        timeDelta={timeDelta}
        nudgeCount={nudgeCount}
        totalLoadCost={totalLoadCost}
        usedPiperSampling={usedPiperSampling}
        usedWeighbridge={usedWeighbridge}
        config={config}
      />

      {/* Annualized Impact */}
      {showAnnualized && totalLoadCost > 0 && (
        <div className="bg-red-900/50 p-6 rounded-xl border border-red-600 max-w-lg w-full mt-6 animate-fade-in">
          <h3 className="text-lg font-bold text-red-300 mb-3 text-center">
            ANNUALIZED IMPACT
          </h3>
          
          <p className="text-center text-slate-300 mb-3">
            This farm loads <span className="font-bold text-white">{config.FARM_LOADS_PER_DAY} tankers</span> a day
          </p>

          <div className="space-y-2 text-center">
            <div className="text-slate-400">
              Daily: €{totalLoadCost.toFixed(2)} × {config.FARM_LOADS_PER_DAY} = 
              <span className="text-red-400 font-bold ml-2">€{dailyCost.toFixed(2)}</span>
            </div>
            <div className="text-slate-400">
              Annual: €{dailyCost.toFixed(2)} × {config.DAYS_PER_YEAR} = 
            </div>
            <div className="text-4xl font-black text-red-400 mt-2">
              €{annualCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-red-300">per year</div>
          </div>
        </div>
      )}

      {/* Piper Message */}
      <div className="bg-emerald-900/50 p-6 rounded-xl border border-emerald-600 max-w-lg w-full mt-6">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2">
            Piper removes this cost.
          </div>
          <p className="text-emerald-200 text-sm">
            Precision metering • No agitation delays • No weighbridge
          </p>
        </div>
      </div>

      {/* Lead Capture Form */}
      <div className="mt-6 w-full max-w-lg">
        {leadSubmitted ? (
          <div className="text-center text-emerald-400 text-xl font-bold animate-fade-in">
            ✓ Thanks! Starting new game...
          </div>
        ) : (
          <LeadCaptureForm
            onSubmit={handleLeadSubmit}
            onSkip={onPlayAgain}
            gameResults={gameResults}
          />
        )}
      </div>
    </div>
  );
}
