import { useState, useEffect, useCallback } from "react";
import { LeaderboardEntry } from "../types";
import { LEADERBOARD_CONFIG } from "../constants";
import { GameSettings } from "../constantsV2";

function hashSettings(settings: GameSettings): string {
  const key = `${settings.targetLoadLbs}-${settings.maxOverfillLbs}-${settings.milkCostPerLb}-${settings.underfillCostPerLoad}-${settings.loadsPerDay}-${settings.daysPerYear}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

export interface LeaderboardDisplay {
  top: LeaderboardEntry[];
  playerEntry: { entry: LeaderboardEntry; rank: number } | null;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEADERBOARD_CONFIG.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LeaderboardEntry[];
        setEntries(parsed.sort((a, b) => a.score - b.score));
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }, []);

  const saveEntries = useCallback((newEntries: LeaderboardEntry[]) => {
    try {
      localStorage.setItem(LEADERBOARD_CONFIG.STORAGE_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.error("Failed to save leaderboard:", error);
    }
  }, []);

  const addEntry = useCallback(
    (playerName: string, score: number, accuracy: number, tankersFilled: number, settings?: GameSettings) => {
      const newEntry: LeaderboardEntry = {
        id: crypto.randomUUID(),
        playerName: playerName || "Anonymous",
        score,
        accuracy,
        tankersFilled,
        date: new Date().toISOString(),
        settingsHash: settings ? hashSettings(settings) : undefined,
      };

      setEntries((prev) => {
        const updated = [...prev, newEntry]
          .sort((a, b) => a.score - b.score)
          .slice(0, LEADERBOARD_CONFIG.MAX_ENTRIES);
        saveEntries(updated);
        return updated;
      });

      return newEntry;
    },
    [saveEntries]
  );

  const resetLeaderboard = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(LEADERBOARD_CONFIG.STORAGE_KEY);
  }, []);

  const isHighScore = useCallback(
    (score: number) => {
      if (entries.length < LEADERBOARD_CONFIG.DISPLAY_TOP) return true;
      const worstTopScore = entries[LEADERBOARD_CONFIG.DISPLAY_TOP - 1]?.score || Infinity;
      return score < worstTopScore;
    },
    [entries]
  );

  const getDisplayEntries = useCallback(
    (currentEntryId: string | null): LeaderboardDisplay => {
      const top = entries.slice(0, LEADERBOARD_CONFIG.DISPLAY_TOP);
      
      if (!currentEntryId) return { top, playerEntry: null };

      const playerIndex = entries.findIndex((e) => e.id === currentEntryId);
      if (playerIndex === -1) return { top, playerEntry: null };

      // Player is in top N — no separate entry needed
      if (playerIndex < LEADERBOARD_CONFIG.DISPLAY_TOP) {
        return { top, playerEntry: null };
      }

      // Player is outside top N — return their rank separately
      return {
        top,
        playerEntry: { entry: entries[playerIndex], rank: playerIndex + 1 },
      };
    },
    [entries]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        if (window.confirm("Reset the leaderboard? This cannot be undone.")) resetLeaderboard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetLeaderboard]);

  return { entries, addEntry, resetLeaderboard, isHighScore, getDisplayEntries };
}
