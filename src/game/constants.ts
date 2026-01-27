// ============================================
// TUNABLE GAME CONSTANTS
// Adjust these values to change game difficulty
// ============================================

export const GAME_CONFIG = {
  // Timer settings
  RESULTS_DISPLAY_TIME: 8000, // ms before auto-restart
  ATTRACT_IDLE_TIME: 12000, // ms before attract mode activates
  
  // Money settings
  BASE_MONEY_PER_LOAD: 10000, // $10,000 per compartment
  
  // Tank settings (per compartment)
  TANK_CAPACITY: 10000, // Liters per compartment
  
  // Level configurations - compartments increase each level
  LEVELS: [
    {
      level: 1,
      name: "Single Tank",
      compartments: 1, // Changed from trailers to compartments
      flowRate: 500, // Even faster - fills in ~20 seconds
      tolerance: 500,
      targetFill: 8000,
      tutorial: "Fill to the line!",
    },
    {
      level: 2,
      name: "Double Tank",
      compartments: 2,
      flowRate: 650, // Faster
      tolerance: 400,
      targetFill: 7500,
      tutorial: null,
    },
    {
      level: 3,
      name: "Triple Tank",
      compartments: 3,
      flowRate: 800, // Even faster
      tolerance: 300,
      targetFill: 8500,
      tutorial: null,
      requiresConfirmation: true,
    },
    {
      level: 4,
      name: "Quad Tank",
      compartments: 4,
      flowRate: 1000, // Very fast
      tolerance: 200,
      targetFill: 9000,
      tutorial: null,
      requiresConfirmation: true,
    },
    {
      level: 5,
      name: "Full Tanker",
      compartments: 5,
      flowRate: 1200, // Maximum speed
      tolerance: 150,
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
