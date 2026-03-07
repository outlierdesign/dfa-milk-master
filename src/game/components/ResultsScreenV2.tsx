import { useEffect, useState, useRef } from "react";
import { GameConfig, RoundResult } from "../constantsV2";
import { calculateScore } from "../utils/scoringEngine";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { LeaderboardEntry } from "../types";
import { LeaderboardDisplay } from "../hooks/useLeaderboard";
import { ArcadeLeaderboard } from "./ArcadeLeaderboard";
import { SavingsRevealPopup } from "./SavingsRevealScreen";
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

// ── Worked Example sub-component ─────────────────────────────────────────────
function WorkedExample({
  score,
  config,
  currency,
}: {
  score: ReturnType<typeof calculateScore>;
  config: GameConfig;
  currency: string;
}) {
  const N = config.annualLoads;
  const annualMilkBaseline = config.targetLoadLbs * N;
  const actualLoads = score.avgCredited > 0 ? annualMilkBaseline / score.avgCredited : N;

  const fmt = (n: number) => Math.round(n).toLocaleString();

  return (
    <div className="bg-slate-800/80 p-5 rounded-xl border border-amber-700/50 max-w-lg w-full animate-fade-in">
      <h3 className="text-sm font-bold text-amber-400 mb-4 text-center tracking-widest uppercase">
        📐 How Your Underfill Cost Was Calculated
      </h3>

      <div className="space-y-3 font-mono text-xs">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <span className="shrink-0 bg-amber-700/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
            Step 1
          </span>
          <div className="flex-1">
            <div className="text-slate-400 mb-0.5">Avg credited per load (weighted across rounds)</div>
            <div className="flex justify-between">
              <span className="text-slate-500">You filled:</span>
              <span className="text-white font-bold">{fmt(score.avgCredited)} lbs</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700" />

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <span className="shrink-0 bg-amber-700/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
            Step 2
          </span>
          <div className="flex-1">
            <div className="text-slate-400 mb-0.5">Annual milk target</div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {fmt(config.targetLoadLbs)} lbs × {fmt(N)} loads
              </span>
              <span className="text-white font-bold">{fmt(annualMilkBaseline)} lbs/yr</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700" />

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <span className="shrink-0 bg-amber-700/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
            Step 3
          </span>
          <div className="flex-1">
            <div className="text-slate-400 mb-0.5">Extra loads needed to hit target</div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {fmt(annualMilkBaseline)} ÷ {fmt(score.avgCredited)} lbs
              </span>
              <span className="text-white font-bold">{actualLoads.toFixed(1)} loads</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-slate-500">
                {actualLoads.toFixed(1)} − {fmt(N)}
              </span>
              <span className="text-amber-400 font-bold">+{score.extraLoads.toFixed(2)} extra trips</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700" />

        {/* Step 4 */}
        <div className="flex items-start gap-3">
          <span className="shrink-0 bg-red-700/40 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded">
            Step 4
          </span>
          <div className="flex-1">
            <div className="text-slate-400 mb-0.5">Underfill cost</div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {score.extraLoads.toFixed(2)} trips × {currency}{fmt(config.underfillCostPerLoad)}/trip
              </span>
              <span className="text-red-400 font-bold">
                {currency}{fmt(score.underfillCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Spill line */}
        {score.spillCost > 0 && (
          <>
            <div className="border-t border-slate-700" />
            <div className="flex items-start gap-3">
              <span className="shrink-0 bg-red-700/40 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Spill
              </span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Annualised spill × {currency}{config.milkCostPerLb}/lb
                  </span>
                  <span className="text-red-400 font-bold">
                    {currency}{fmt(score.spillCost)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
  const timePenalties = score.agitationCost + score.weighbridgeCost;
  const coreCost = score.underfillCost + score.spillCost;

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-12">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src={piperLogo} alt="Piper" className="h-12 md:h-14" />
        </div>

        {/* ── RED COST HERO (full width) ─────────────────────────────────────── */}
        <div className="bg-slate-800/90 border border-red-900/60 rounded-2xl p-6 mb-6 text-center shadow-lg shadow-red-950/30">
          <div className="text-slate-400 text-xs tracking-widest uppercase mb-1">
            Annual Variable Cost
          </div>
          <div className="text-6xl md:text-7xl font-black text-red-400 mb-4">
            {currency}{score.totalVariableCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="border-t border-slate-700 pt-3 flex flex-col sm:flex-row justify-center gap-4 sm:gap-10">
            <div>
              <div className="text-slate-500 text-xs mb-0.5">Underfill + Spill</div>
              <div className="text-red-400 font-bold text-lg">
                {currency}{coreCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            {timePenalties > 0 && (
              <div>
                <div className="text-slate-500 text-xs mb-0.5">Time Penalties</div>
                <div className="text-amber-400 font-bold text-lg">
                  {currency}{timePenalties.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            )}
          </div>
          <div className="text-slate-500 text-xs mt-3">lower is better</div>
        </div>

        {/* ── PIPER CTA ─────────────────────────────────────────────────────── */}
        <div className="bg-emerald-900/50 p-5 rounded-xl border border-emerald-600 mb-6 text-center">
          <div className="text-xl md:text-2xl font-bold text-emerald-400 mb-1">
            Piper removes this cost.
          </div>
          <p className="text-emerald-200 text-sm">
            Precision metering • No agitation delays • No weighbridge
          </p>
        </div>

        {/* ── TWO-COLUMN GRID ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">

            {/* Round Breakdown */}
            <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-600">
              <h3 className="text-sm font-bold text-slate-300 mb-4 text-center border-b border-slate-600 pb-2 tracking-wider uppercase">
                📋 Round Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs">
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

            {/* Worked Example — shown after 1.5s, only for underfill scenarios */}
            {showAnnualized && score.extraLoads > 0 && (
              <WorkedExample score={score} config={config} currency={currency} />
            )}

            {/* Annualised Cost Breakdown */}
            {showAnnualized && (
              <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-600 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-300 mb-4 text-center tracking-wider uppercase">
                  Annualised Cost Breakdown
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
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600">
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

            {/* Mobile leaderboard (below panels on small screens) */}
            <div className="sm:hidden">
              <ArcadeLeaderboard
                display={getDisplayEntries(currentEntryId)}
                currentEntryId={currentEntryId}
                currency={currency}
              />
            </div>
          </div>

          {/* RIGHT COLUMN — Leaderboard (desktop only, sticky) */}
          <div className="hidden sm:block">
            <div className="sm:sticky sm:top-6">
              <ArcadeLeaderboard
                display={getDisplayEntries(currentEntryId)}
                currentEntryId={currentEntryId}
                currency={currency}
              />
            </div>
          </div>
        </div>

        {/* Play Again — full width below grid */}
        <div className="mt-6">
          <button
            onClick={onPlayAgain}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-bold px-8 py-5 rounded-xl shadow-xl transition-all hover:scale-105"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
