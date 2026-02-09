export type GameState = "attract" | "playing" | "results";

export interface LevelConfig {
  level: number;
  name: string;
  compartments: number;
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
  currentCompartment: number;
  totalCompartmentsInLevel: number;
  compartmentFillLevels: number[];
  loadResults: LoadResult[];
  totalMoneyKept: number;
  totalMoneyLost: number;
  tankersFilledProgress: number;
  tankersFilled: number;
  elapsedTime: number;
  isComplete: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number; // total variable cost (lower = better)
  accuracy: number;
  tankersFilled: number;
  date: string;
  settingsHash?: string;
}
