// ============================================
// TUNABLE GAME CONSTANTS
// Adjust these values to change game difficulty
// ============================================

export const GAME_CONFIG = {
  // Timer settings (in seconds)
  ROUND_DURATION: 60,
  RESULTS_DISPLAY_TIME: 8000, // ms before auto-restart
  ATTRACT_IDLE_TIME: 12000, // ms before attract mode activates
  
  // Money settings
  BASE_MONEY_PER_LOAD: 10000, // $10,000 per load
  
  // Tank settings
  TANK_CAPACITY: 10000, // Liters
  
  // Level configurations
  LEVELS: [
    {
      level: 1,
      name: "Training",
      trailers: 1,
      flowRate: 320, // Liters per second (when holding) - 4x speed
      tolerance: 500, // Liters - how close is "perfect"
      targetFill: 8000, // Target fill in liters
      tutorial: "Fill to the line",
    },
    {
      level: 2,
      name: "Two Trailers",
      trailers: 2,
      flowRate: 480, // 4x speed
      tolerance: 300,
      targetFill: 7500,
      tutorial: null,
    },
    {
      level: 3,
      name: "Speed Run",
      trailers: 2,
      flowRate: 720, // 4x speed
      tolerance: 200,
      targetFill: 8500,
      tutorial: null,
      requiresConfirmation: true,
    },
    {
      level: 4,
      name: "Precision",
      trailers: 3,
      flowRate: 800, // 4x speed
      tolerance: 150,
      targetFill: 9000,
      tutorial: null,
      requiresConfirmation: true,
    },
    {
      level: 5,
      name: "Expert",
      trailers: 3,
      flowRate: 1000, // 4x speed
      tolerance: 100,
      targetFill: 9500,
      tutorial: null,
      requiresConfirmation: true,
    },
  ],
  
  // Scoring thresholds
  ACCURACY_THRESHOLDS: {
    PERFECT: 98, // % accuracy for confetti
    EXCELLENT: 95,
    GOOD: 85,
    POOR: 70,
  },
  
  // Tankers filled progression
  MONEY_PER_TANKER: 25000, // Money needed to "fill" one tanker
  
  // Nudge settings
  NUDGE_AMOUNT: 50, // Liters per nudge
  NUDGE_COOLDOWN: 200, // ms between nudges
} as const;

// Leaderboard settings
export const LEADERBOARD_CONFIG = {
  MAX_ENTRIES: 10,
  STORAGE_KEY: "fillTheTank_leaderboard",
  ADMIN_RESET_COMBO: "Ctrl+Shift+R",
} as const;
