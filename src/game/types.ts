export type GameState = "attract" | "playing" | "results";

export interface LevelConfig {
  level: number;
  name: string;
  compartments: number; // Number of compartments in the tanker
  flowRate: number;
  tolerance: number;
  targetFill: number;
  tutorial: string | null;
  requiresConfirmation?: boolean;
}

export interface LoadResult {
  targetFill: number;
  actualFill: number;
  accuracy: number;
  moneyKept: number;
  moneyLost: number;
}

export interface GameSession {
  currentLevel: number;
  currentCompartment: number; // Which compartment we're filling
  totalCompartmentsInLevel: number;
  compartmentFillLevels: number[]; // Fill level for each compartment
  loadResults: LoadResult[];
  totalMoneyKept: number;
  totalMoneyLost: number;
  tankersFilledProgress: number;
  tankersFilled: number;
  elapsedTime: number; // Seconds elapsed (counts UP)
  isComplete: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  accuracy: number;
  tankersFilled: number;
  date: string;
}
