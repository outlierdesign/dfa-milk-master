// Fill the Tank v2 — Configuration Constants (lbs-based)

export const GAME_DEFAULTS = {
  // Load & Production (lbs)
  targetLoadLbs: 50_000,
  maxOverfillLbs: 12_000,
  loadsPerDay: 5,
  daysPerYear: 365,
  annualLoadsOverride: undefined as number | undefined,

  // Overfill Rules
  overfillEventsPerYear: 12,
  fireOnThreeOverfills: true,

  // Cost Assumptions
  underfillCostPerLoad: 500,
  milkCostPerLb: 0.19,
  driverRatePerHour: 120,

  // Time Penalties (minutes)
  agitationMinutes: 20,
  weighScaleMinutes: 15,

  // Flow Mechanics (lbs/min)
  flowRateLbsPerMin: 2_000,
  flowJitterPercent: 3,
  stopAutomaticallyAtMaxOverfill: true,

  // Game speed
  gameSpeedMultiplier: 1,

  // Piper Mode
  piperSlowdownThreshold: 90, // percent
  piperSlowdownFactor: 30, // percent of base speed at 100%

  // Currency
  currency: "$" as "$" | "€",

  // UI timing
  resultsDisplayTime: 15_000,
  attractIdleTime: 20_000,

  // Flow variance interval
  flowVarianceIntervalMs: 2_000,
} as const;

export interface GameSettings {
  targetLoadLbs: number;
  maxOverfillLbs: number;
  loadsPerDay: number;
  daysPerYear: number;
  annualLoadsOverride?: number;
  overfillEventsPerYear: number;
  fireOnThreeOverfills: boolean;
  underfillCostPerLoad: number;
  milkCostPerLb: number;
  driverRatePerHour: number;
  agitationMinutes: number;
  weighScaleMinutes: number;
  flowRateLbsPerMin: number;
  flowJitterPercent: number;
  stopAutomaticallyAtMaxOverfill: boolean;
  gameSpeedMultiplier: number;
  piperSlowdownThreshold: number;
  piperSlowdownFactor: number;
  currency: "$" | "€";
  resultsDisplayTime: number;
  attractIdleTime: number;
  flowVarianceIntervalMs: number;
}

// Computed config derived from settings — used throughout the game
export interface GameConfig {
  // Core lbs values
  targetLoadLbs: number;
  maxOverfillLbs: number;
  maxAllowedFill: number; // targetLoadLbs + maxOverfillLbs

  // Production
  loadsPerDay: number;
  daysPerYear: number;
  annualLoads: number; // override or loadsPerDay * daysPerYear
  annualLoadsOverride?: number;

  // Overfill rules
  overfillEventsPerYear: number;
  fireOnThreeOverfills: boolean;

  // Cost
  underfillCostPerLoad: number;
  milkCostPerLb: number;
  driverRatePerHour: number;

  // Time
  agitationMinutes: number;
  weighScaleMinutes: number;

  // Flow (lbs/min)
  flowRateLbsPerMin: number;
  flowJitterPercent: number;
  stopAutomaticallyAtMaxOverfill: boolean;

  // Game speed
  gameSpeedMultiplier: number;

  // Piper (stored as decimals 0-1)
  piperSlowdownThreshold: number;
  piperSlowdownFactor: number;

  // Currency
  currency: "$" | "€";

  // UI timing
  resultsDisplayTime: number;
  attractIdleTime: number;
  flowVarianceIntervalMs: number;
}

export function settingsToConfig(s: GameSettings): GameConfig {
  const annualLoads = s.annualLoadsOverride ?? (s.loadsPerDay * s.daysPerYear);
  return {
    targetLoadLbs: s.targetLoadLbs,
    maxOverfillLbs: s.maxOverfillLbs,
    maxAllowedFill: s.targetLoadLbs + s.maxOverfillLbs,
    loadsPerDay: s.loadsPerDay,
    daysPerYear: s.daysPerYear,
    annualLoads,
    annualLoadsOverride: s.annualLoadsOverride,
    overfillEventsPerYear: s.overfillEventsPerYear,
    fireOnThreeOverfills: s.fireOnThreeOverfills,
    underfillCostPerLoad: s.underfillCostPerLoad,
    milkCostPerLb: s.milkCostPerLb,
    driverRatePerHour: s.driverRatePerHour,
    agitationMinutes: s.agitationMinutes,
    weighScaleMinutes: s.weighScaleMinutes,
    flowRateLbsPerMin: s.flowRateLbsPerMin,
    flowJitterPercent: s.flowJitterPercent,
    stopAutomaticallyAtMaxOverfill: s.stopAutomaticallyAtMaxOverfill,
    gameSpeedMultiplier: s.gameSpeedMultiplier,
    piperSlowdownThreshold: s.piperSlowdownThreshold / 100,
    piperSlowdownFactor: s.piperSlowdownFactor / 100,
    currency: s.currency,
    resultsDisplayTime: s.resultsDisplayTime,
    attractIdleTime: s.attractIdleTime,
    flowVarianceIntervalMs: s.flowVarianceIntervalMs,
  };
}

// Game states for v2 flow (now includes roundResult and fired)
export type GameStateV2 = "attract" | "questions" | "playing" | "roundResult" | "penaltyReveal" | "leadCapture" | "results" | "fired";

// Round result data
export interface RoundResult {
  roundNumber: number;
  fillLbs: number;
  creditedLbs: number; // min(fillLbs, targetLoad)
  spillLbs: number; // max(0, fillLbs - targetLoad)
  isOverfill: boolean;
  fillDuration: number;
  averageFlowRate: number;
}

// Pre-load decision options
export interface PreLoadDecisions {
  usePiperSampling: boolean;
  useWeighbridge: boolean;
}
