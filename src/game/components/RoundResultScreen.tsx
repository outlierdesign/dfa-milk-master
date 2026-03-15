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
  const underUtilisation = isOver ? 0 : ((config.targetLoadLbs - round.fillLbs) / config.targetLoadLbs) * 100;

  // Fill quality tiers: Bad (<80%), OK (80-90%), Good (90%+)
  const getFillQuality = () => {
    if (isOver) return { emoji: "💥", label: "Overfill!", color: "text-red-400", message: "" };
    if (fillPercent >= 90) return { emoji: "🎯", label: "Good Fill!", color: "text-emerald-400", message: `But you're still at ${underUtilisation.toFixed(1)}% under utilisation` };
    if (fillPercent >= 80) return { emoji: "📦", label: "OK Fill!", color: "text-amber-400", message: "But we think you can get closer" };
    return { emoji: "⚠️", label: "Bad Fill!", color: "text-red-400", message: "Try harder next time" };
  };
  const quality = getFillQuality();

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50" onClick={onContinue}>
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-slate-400 text-lg">
          Round {round.roundNumber} of {totalRounds}
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white">
          {quality.emoji} {quality.label}
        </h2>
        {quality.message && (
          <p className={`text-lg ${quality.color}`}>{quality.message}</p>
        )}

        {showDetails && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-3xl font-mono font-bold text-white">
              {Math.round(round.fillLbs).toLocaleString()} lbs
            </div>
            <div className={`text-xl font-semibold ${isOver ? "text-red-400" : "text-emerald-400"}`}>
              {isOver
                ? `+${Math.round(diff).toLocaleString()} lbs over`
                : `${Math.round(diff).toLocaleString()} lbs under filled`}
            </div>
            <div className={`text-sm ${isOver ? "text-red-300" : "text-slate-400"}`}>
              {isOver ? `${(fillPercent - 100).toFixed(1)}% over target` : `${underUtilisation.toFixed(1)}% under utilisation`}
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
