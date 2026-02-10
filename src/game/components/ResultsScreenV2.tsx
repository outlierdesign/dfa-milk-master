import { useEffect, useState, useRef } from "react";
import { GameConfig, RoundResult } from "../constantsV2";
import { calculateScore } from "../utils/scoringEngine";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { LeaderboardEntry } from "../types";
import { LeaderboardDisplay } from "../hooks/useLeaderboard";
import { ArcadeLeaderboard } from "./ArcadeLeaderboard";
import piperLogo from "@/assets/piper-logo.png";

interface ResultsScreenV2Props {
  rounds: RoundResult[];
  usedPiperSampling: boolean;
  usedWeighbridge: boolean;
  onPlayAgain: () => void;
  config: GameConfig;
  leaderboardEntries: LeaderboardEntry[];
  onAddEntry: (playerName: string, score: number, accuracy: number, tankersFilled: number) => LeaderboardEntry;
  getDisplayEntries: (currentEntryId: string | null) => LeaderboardDisplay;
  playerName: string;
}

export function ResultsScreenV2({
  rounds,
  usedPiperSampling,
  usedWeighbridge,
  onPlayAgain,
  config,
  leaderboardEntries,
  onAddEntry,
  getDisplayEntries,
  playerName,
}: ResultsScreenV2Props) {
  const [showAnnualized, setShowAnnualized] = useState(false);
  const { playSuccess, playFailure } = useSoundEffects();
  const entryAddedRef = useRef(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const score = calculateScore(rounds, config, usedPiperSampling, usedWeighbridge);
  const currency = config.currency;

  // Save score to leaderboard on mount
  useEffect(() => {
    if (!entryAddedRef.current) {
      entryAddedRef.current = true;
      const accuracy = score.avgCredited / config.targetLoadLbs * 100;
      const entry = onAddEntry(playerName, score.totalVariableCost, accuracy, rounds.length);
      setCurrentEntryId(entry.id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (score.totalScore < 1000) playSuccess();
    else playFailure();
    const t = setTimeout(() => setShowAnnualized(true), 1500);
    return () => clearTimeout(t);
  }, [score.totalScore, playSuccess, playFailure]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-start p-6 pb-12 overflow-y-auto">
      <div className="mb-4">
        <img src={piperLogo} alt="Piper" className="h-12 md:h-16" />
      </div>

      {/* Score Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Score</h2>
        <div className="text-5xl md:text-6xl font-black text-red-400">
          {currency}{score.totalScore.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div className="text-slate-400 text-sm mt-1">Annual variable cost (lower is better)</div>
      </div>

      {/* Per-Round Breakdown */}
      <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-lg w-full mb-6">
        <h3 className="text-lg font-bold text-slate-300 mb-4 text-center border-b border-slate-600 pb-2">
          📋 ROUND BREAKDOWN
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left py-2">Round</th>
                <th className="text-right py-2">Filled</th>
                <th className="text-right py-2">Credited</th>
                <th className="text-right py-2">Spill</th>
                <th className="text-right py-2">Weight</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => {
                const w = score.weights.get(r.roundNumber) ?? 0;
                return (
                  <tr key={r.roundNumber} className="border-t border-slate-700">
                    <td className="py-2 text-white font-bold">
                      {r.roundNumber} {r.isOverfill ? "⚠️" : "✓"}
                    </td>
                    <td className="text-right text-white font-mono">
                      {Math.round(r.fillLbs).toLocaleString()}
                    </td>
                    <td className="text-right text-emerald-400 font-mono">
                      {Math.round(r.creditedLbs).toLocaleString()}
                    </td>
                    <td className={`text-right font-mono ${r.spillLbs > 0 ? "text-red-400" : "text-slate-500"}`}>
                      {r.spillLbs > 0 ? Math.round(r.spillLbs).toLocaleString() : "—"}
                    </td>
                    <td className="text-right text-slate-400 font-mono text-xs">
                      ×{Math.round(w).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Annualised Cost Breakdown */}
      {showAnnualized && (
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-lg w-full mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-300 mb-4 text-center">
            ANNUALISED COST BREAKDOWN
          </h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Avg Credited per Load</span>
              <span className="text-white">{Math.round(score.avgCredited).toLocaleString()} lbs</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Extra Loads Needed</span>
              <span className="text-amber-400">{score.extraLoads.toFixed(1)}</span>
            </div>
            <div className="border-t border-slate-600 pt-2" />
            <div className="flex justify-between text-slate-300">
              <span>Underfill Cost</span>
              <span className="text-red-400">{currency}{score.underfillCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Spill Cost</span>
              <span className="text-red-400">{currency}{score.spillCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            {score.agitationCost > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Agitation Time Cost</span>
                <span className="text-amber-400">{currency}{score.agitationCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            )}
            {score.weighbridgeCost > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Weighbridge Cost</span>
                <span className="text-amber-400">{currency}{score.weighbridgeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            )}
            <div className="border-t-2 border-slate-500 pt-2">
              <div className="flex justify-between text-xl">
                <span className="text-white font-bold">TOTAL</span>
                <span className="text-red-400 font-bold">
                  {currency}{score.totalVariableCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decisions */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 max-w-lg w-full mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Piper System</span>
          <span className={usedPiperSampling ? "text-emerald-400" : "text-red-400"}>
            {usedPiperSampling ? "✓ YES" : "✗ NO"}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-slate-400">Weighbridge</span>
          <span className={!usedWeighbridge ? "text-emerald-400" : "text-red-400"}>
            {usedWeighbridge ? "✗ YES" : "✓ NO (Piper)"}
          </span>
        </div>
      </div>

      {/* Piper CTA */}
      <div className="bg-emerald-900/50 p-6 rounded-xl border border-emerald-600 max-w-lg w-full mb-6">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2">Piper removes this cost.</div>
          <p className="text-emerald-200 text-sm">Precision metering • No agitation delays • No weighbridge</p>
        </div>
      </div>

      {/* Arcade Leaderboard */}
      <div className="max-w-lg w-full mb-6">
        <ArcadeLeaderboard
          display={getDisplayEntries(currentEntryId)}
          currentEntryId={currentEntryId}
          currency={currency}
        />
      </div>

      {/* Play Again */}
      <div className="mt-4 mb-8 w-full max-w-lg">
        <button
          onClick={onPlayAgain}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-bold px-8 py-5 rounded-xl shadow-xl transition-all hover:scale-105"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
