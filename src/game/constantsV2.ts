// Fill the Tank v2 — Configuration Constants
// All values are admin-configurable for trade show tuning

export const GAME_CONFIG_V2 = {
  // Capacity (litres) - 50,000 lbs ≈ 22,026 litres
  TANKER_CAPACITY_L: 22_026,
  FARM_TANK_CAPACITY_L: 25_000, // Slightly more than tanker
  TARGET_FILL_PERCENT: 0.98, // Adjustable: 0.90, 0.95, 0.98, 1.00

  // Money values (€)
  MILK_VALUE_PER_L: 0.42,
  HAULAGE_COST_PER_LOAD: 180.0,
  TIME_COST_PER_MIN: 4.0,

  // Scaling for annualized impact
  FARM_LOADS_PER_DAY: 5,
  DAYS_PER_YEAR: 365,

  // Time penalties/savings (minutes)
  AGITATION_TIME_SAVED: 20, // Piper sampling saves this
  WEIGHBRIDGE_TIME_COST: 10, // Traditional weighbridge costs this

  // Flow mechanics - Based on 4,000 lbs/min (≈1,762 L/min ≈ 29.4 L/s)
  // With 1 sec real = 1 min simulated, we use higher values for visible action
  FLOW_RATE_BASE_LPS: 1762, // 4,000 lbs/min equivalent in L/min (displayed as L/s in game time)
  FLOW_RATE_MIN_LPS: 1674, // 5% variance below base
  FLOW_RATE_MAX_LPS: 1850, // 5% variance above base
  FLOW_VARIANCE_PERCENT: 5, // ±5% variance (slight)
  FLOW_VARIANCE_INTERVAL_MS: 2000, // Change flow rate every 2 seconds

  // Piper mode specific
  PIPER_SLOWDOWN_THRESHOLD: 0.90, // Start slowing at 90% fill
  PIPER_SLOWDOWN_FACTOR: 0.3, // Reduce to 30% of flow rate at 100%

  // UI timing (milliseconds)
  RESULTS_DISPLAY_TIME: 15_000,
  ATTRACT_IDLE_TIME: 20_000,

  // Game speed (for trade show demo acceleration)
  GAME_SPEED_MULTIPLIER: 1, // 1, 2, 5, or 10

  // Derived values (computed)
  get TARGET_FILL_L() {
    return this.TANKER_CAPACITY_L * this.TARGET_FILL_PERCENT;
  },
} as const;

// Game states for v2 flow
export type GameStateV2 = "attract" | "questions" | "playing" | "penaltyReveal" | "leadCapture" | "results";

// Pre-load decision options
export interface PreLoadDecisions {
  usePiperSampling: boolean;
  useWeighbridge: boolean;
}
