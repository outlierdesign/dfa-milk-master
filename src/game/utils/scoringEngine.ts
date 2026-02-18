import { RoundResult, GameConfig } from "../constantsV2";

export interface ScoreResult {
  avgCredited: number;
  underfillCost: number;
  spillCost: number;
  agitationCost: number;
  weighbridgeCost: number;
  totalScore: number; // underfillCost + spillCost (leaderboard score)
  totalVariableCost: number; // includes time costs
  weights: Map<number, number>;
  extraLoads: number;
}

export function calculateScore(
  rounds: RoundResult[],
  config: GameConfig,
  usePiper: boolean,
  useWeighbridge: boolean
): ScoreResult {
  const N = config.annualLoads;
  const k = rounds.filter((r) => r.isOverfill).length;

  // Assign annual weights based on overfill count
  const weights = new Map<number, number>();

  if (k === 0) {
    rounds.forEach((r) => weights.set(r.roundNumber, N / 3));
  } else if (k === 1) {
    const underfillWeight = (N - config.overfillEventsPerYear) / 2;
    rounds.forEach((r) => {
      weights.set(
        r.roundNumber,
        r.isOverfill ? config.overfillEventsPerYear : underfillWeight
      );
    });
  } else if (k === 2) {
    const overfillWeight = config.overfillEventsPerYear;
    const underfillWeight = N - (2 * config.overfillEventsPerYear);
    rounds.forEach((r) => {
      weights.set(
        r.roundNumber,
        r.isOverfill ? overfillWeight : underfillWeight
      );
    });
  }
  // k === 3 = fired, no scoring

  // Average credited capacity
  let weightedCredited = 0;
  rounds.forEach((r) => {
    weightedCredited += (weights.get(r.roundNumber) ?? 0) * r.creditedLbs;
  });
  const avgCredited = weightedCredited / N;

  // Cost calculation
  const annualMilkBaseline = config.targetLoadLbs * N;
  const actualLoads = avgCredited > 0 ? annualMilkBaseline / avgCredited : N;
  const extraLoads = Math.max(0, actualLoads - N);
  const underfillCost = extraLoads * config.underfillCostPerLoad;

  // Spill cost (annualised)
  let totalSpillCost = 0;
  rounds.forEach((r) => {
    totalSpillCost +=
      r.spillLbs * (weights.get(r.roundNumber) ?? 0) * config.milkCostPerLb;
  });

  // Time cost (driver rate)
  const agitationCost = !usePiper
    ? (config.agitationMinutes / 60) * config.driverRatePerHour * N
    : 0;
  const weighbridgeCost = useWeighbridge
    ? (config.weighScaleMinutes / 60) * config.driverRatePerHour * N
    : 0;

  const totalScore = underfillCost + totalSpillCost;
  const totalVariableCost = totalScore + agitationCost + weighbridgeCost;

  return {
    avgCredited,
    underfillCost,
    spillCost: totalSpillCost,
    agitationCost,
    weighbridgeCost,
    totalScore,
    totalVariableCost,
    weights,
    extraLoads,
  };
}
