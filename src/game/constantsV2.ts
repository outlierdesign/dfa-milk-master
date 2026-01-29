// Fill the Tank v2 — Configuration Constants
// All values are admin-configurable for trade show tuning

export const GAME_CONFIG_V2 = {
  // Capacity (litres)
  TANKER_CAPACITY_L: 10_000,
  FARM_TANK_CAPACITY_L: 12_000, // Slightly more than tanker
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

  // Flow mechanics
  FLOW_RATE_MIN_LPS: 80, // litres per second minimum
  FLOW_RATE_MAX_LPS: 140, // litres per second maximum
  FLOW_VARIANCE_INTERVAL_MS: 800, // Change flow rate every 0.8 seconds

  // Nudge mechanic
  NUDGE_AMOUNT_L: 25, // litres per nudge
  NUDGE_TIME_PENALTY_SEC: 2, // seconds added per nudge

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
