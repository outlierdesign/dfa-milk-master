import { useState, useEffect, useCallback } from "react";
import { LeaderboardEntry } from "../types";
import { LEADERBOARD_CONFIG } from "../constants";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEADERBOARD_CONFIG.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LeaderboardEntry[];
        // Filter to today's entries only
        const today = new Date().toDateString();
        const todayEntries = parsed.filter(
          (entry) => new Date(entry.date).toDateString() === today
        );
        setEntries(todayEntries);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }, []);

  // Save to localStorage
  const saveEntries = useCallback((newEntries: LeaderboardEntry[]) => {
    try {
      localStorage.setItem(
        LEADERBOARD_CONFIG.STORAGE_KEY,
        JSON.stringify(newEntries)
      );
    } catch (error) {
      console.error("Failed to save leaderboard:", error);
    }
  }, []);

  // Add new entry
  const addEntry = useCallback(
    (playerName: string, score: number, accuracy: number, tankersFilled: number) => {
      const newEntry: LeaderboardEntry = {
        id: crypto.randomUUID(),
        playerName: playerName || "Anonymous",
        score,
        accuracy,
        tankersFilled,
        date: new Date().toISOString(),
      };

      setEntries((prev) => {
        const updated = [...prev, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, LEADERBOARD_CONFIG.MAX_ENTRIES);
        saveEntries(updated);
        return updated;
      });

      return newEntry;
    },
    [saveEntries]
  );

  // Reset leaderboard (admin function)
  const resetLeaderboard = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(LEADERBOARD_CONFIG.STORAGE_KEY);
  }, []);

  // Check if score qualifies for leaderboard
  const isHighScore = useCallback(
    (score: number) => {
      if (entries.length < LEADERBOARD_CONFIG.MAX_ENTRIES) return true;
      const lowestScore = entries[entries.length - 1]?.score || 0;
      return score > lowestScore;
    },
    [entries]
  );

  // Admin reset keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        if (window.confirm("Reset the leaderboard? This cannot be undone.")) {
          resetLeaderboard();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetLeaderboard]);

  return {
    entries,
    addEntry,
    resetLeaderboard,
    isHighScore,
  };
}
