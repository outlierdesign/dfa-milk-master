import { useEffect, useState } from "react";
import { RoundResult, GameConfig } from "../constantsV2";

interface RoundResultScreenProps {
  round: RoundResult;
  totalRounds: number;
  config: GameConfig;
  onContinue: () => void;
}

export function RoundResultScreen({ round, totalRounds, config, onContinue }: RoundResultScreenProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowDetails(true), 300);
    const t2 = setTimeout(() => onContinue(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onContinue]);

  const fillPercent = (round.fillLbs / config.targetLoadLbs) * 100;
  const isOver = round.isOverfill;
  const diff = Math.abs(round.fillLbs - config.targetLoadLbs);

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50" onClick={onContinue}>
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-slate-400 text-lg">
          Round {round.roundNumber} of {totalRounds}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white">
          {isOver ? "💥 Overfill!" : fillPercent >= 98 ? "🎯 Great Fill!" : "📦 Round Complete"}
        </h2>

        {showDetails && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-3xl font-mono font-bold text-white">
              {Math.round(round.fillLbs).toLocaleString()} lbs
            </div>
            <div className={`text-xl font-semibold ${isOver ? "text-red-400" : "text-emerald-400"}`}>
              {isOver
                ? `+${Math.round(diff).toLocaleString()} lbs over`
                : `-${Math.round(diff).toLocaleString()} lbs under`}
            </div>
            <div className="text-slate-400">
              {fillPercent.toFixed(1)}% of target
            </div>
          </div>
        )}

        <div className="text-slate-500 text-sm animate-pulse mt-8">
          {round.roundNumber < totalRounds ? "Tap or wait for next round..." : "Tap to continue..."}
        </div>
      </div>
    </div>
  );
}
