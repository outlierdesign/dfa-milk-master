export type GameState = "attract" | "playing" | "results";

export interface LevelConfig {
  level: number;
  name: string;
  trailers: number;
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
  currentTrailer: number;
  totalTrailersInLevel: number;
  loadResults: LoadResult[];
  totalMoneyKept: number;
  totalMoneyLost: number;
  tankersFilledProgress: number;
  tankersFilled: number;
  timeRemaining: number;
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
