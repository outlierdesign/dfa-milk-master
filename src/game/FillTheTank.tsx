import { useEffect, useRef, useCallback } from "react";
import { useGameState } from "./hooks/useGameState";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { AttractMode, Difficulty } from "./components/AttractMode";
import { GameScreen } from "./components/GameScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { GAME_CONFIG } from "./constants";

export function FillTheTank() {
  const {
    gameState,
    session,
    fillLevel,
    isFilling,
    showConfirmation,
    difficulty,
    currentLevelConfig,
    averageAccuracy,
    startFilling,
    stopFilling,
    nudgeFill,
    completeLoad,
    confirmSample,
    startGame,
    resetToAttract,
  } = useGameState();

  const { entries, addEntry, isHighScore } = useLeaderboard();
  const idleTimeoutRef = useRef<number | null>(null);

  // Reset idle timer on any interaction
  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    
    if (gameState === "attract") {
      return; // Already in attract mode
    }

    idleTimeoutRef.current = window.setTimeout(() => {
      if (gameState === "results") {
        resetToAttract();
      }
    }, GAME_CONFIG.ATTRACT_IDLE_TIME);
  }, [gameState, resetToAttract]);

  // Set up idle detection
  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [resetIdleTimer]);

  // Handle adding score to leaderboard
  const handleAddToLeaderboard = useCallback(
    (name: string) => {
      addEntry(name, session.totalMoneyKept, averageAccuracy, session.tankersFilled);
    },
    [addEntry, session.totalMoneyKept, averageAccuracy, session.tankersFilled]
  );

  // Handle starting game with difficulty
  const handleStartGame = useCallback(
    (selectedDifficulty: Difficulty) => {
      startGame(selectedDifficulty);
    },
    [startGame]
  );

  // Handle play again (use same difficulty)
  const handlePlayAgain = useCallback(() => {
    startGame(difficulty);
  }, [startGame, difficulty]);

  // Fullscreen toggle (F11 or double-click)
  useEffect(() => {
    const handleFullscreen = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
    };

    document.addEventListener("keydown", handleFullscreen);
    return () => document.removeEventListener("keydown", handleFullscreen);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900">
      {gameState === "attract" && (
        <AttractMode onStartGame={handleStartGame} leaderboardEntries={entries} />
      )}

      {gameState === "playing" && (
        <GameScreen
          session={session}
          levelConfig={currentLevelConfig}
          fillLevel={fillLevel}
          isFilling={isFilling}
          showConfirmation={showConfirmation}
          onStartFilling={startFilling}
          onStopFilling={stopFilling}
          onNudge={nudgeFill}
          onComplete={completeLoad}
          onConfirmSample={confirmSample}
        />
      )}

      {gameState === "results" && (
        <ResultsScreen
          session={session}
          averageAccuracy={averageAccuracy}
          onPlayAgain={handlePlayAgain}
          onAddToLeaderboard={handleAddToLeaderboard}
          isHighScore={isHighScore(session.totalMoneyKept)}
        />
      )}
    </div>
  );
}
