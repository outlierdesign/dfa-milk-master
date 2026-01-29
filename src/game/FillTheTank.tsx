import { useEffect, useRef, useCallback } from "react";
import { useGameStateV2 } from "./hooks/useGameStateV2";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useAdminSettings, AdminPanel } from "./components/AdminPanel";
import { AttractModeV2 } from "./components/AttractModeV2";
import { PreLoadQuestions } from "./components/PreLoadQuestions";
import { GameScreenV2 } from "./components/GameScreenV2";
import { PenaltyRevealScreen } from "./components/PenaltyRevealScreen";
import { LeadCaptureScreen } from "./components/LeadCaptureScreen";
import { ResultsScreenV2 } from "./components/ResultsScreenV2";

export function FillTheTank() {
  const {
    settings,
    config,
    isOpen: isAdminOpen,
    setIsOpen: setAdminOpen,
    updateSetting,
    resetToDefaults,
  } = useAdminSettings();

  const {
    gameState,
    session,
    isFilling,
    startGame,
    completeQuestions,
    startFilling,
    stopFilling,
    nudgeFill,
    completeLoad,
    showLeadCapture,
    showResults,
    resetToAttract,
  } = useGameStateV2(config);

  const { entries, addEntry } = useLeaderboard();
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
    }, config.ATTRACT_IDLE_TIME);
  }, [gameState, resetToAttract, config.ATTRACT_IDLE_TIME]);

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
      const targetFill = config.TARGET_FILL_L;
      const accuracy = Math.max(
        0,
        100 - (Math.abs(session.currentFill - targetFill) / targetFill) * 100
      );
      addEntry(name, 0, accuracy, 1);
    },
    [addEntry, session.currentFill, config.TARGET_FILL_L]
  );

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    startGame();
  }, [startGame]);

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

  // Hidden reset shortcut (Ctrl+Shift+R)
  useEffect(() => {
    const handleReset = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        resetToAttract();
      }
    };

    document.addEventListener("keydown", handleReset);
    return () => document.removeEventListener("keydown", handleReset);
  }, [resetToAttract]);

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900">
      {/* Admin Panel */}
      <AdminPanel
        settings={settings}
        isOpen={isAdminOpen}
        onClose={() => setAdminOpen(false)}
        onUpdate={updateSetting}
        onReset={resetToDefaults}
      />

      {gameState === "attract" && (
        <AttractModeV2
          onStartGame={startGame}
          leaderboardEntries={entries}
          config={config}
        />
      )}

      {gameState === "questions" && (
        <PreLoadQuestions onComplete={completeQuestions} config={config} />
      )}

      {gameState === "playing" && (
        <GameScreenV2
          session={session}
          isFilling={isFilling}
          onStartFilling={startFilling}
          onStopFilling={stopFilling}
          onNudge={nudgeFill}
          onComplete={completeLoad}
          config={config}
        />
      )}

      {gameState === "penaltyReveal" && (
        <PenaltyRevealScreen
          fillDuration={session.totalFillDuration}
          usePiperSampling={session.usePiperSampling}
          useWeighbridge={session.useWeighbridge}
          nudgeCount={session.nudgeCount}
          config={config}
          onComplete={showLeadCapture}
        />
      )}

      {gameState === "leadCapture" && (
        <LeadCaptureScreen
          gameResults={{
            accuracy: Math.max(
              0,
              100 - (Math.abs(session.currentFill - config.TARGET_FILL_L) / config.TARGET_FILL_L) * 100
            ),
            loadTime: session.totalFillDuration,
            volumeLoaded: session.currentFill,
            totalCost:
              session.spillAmount * config.MILK_VALUE_PER_L +
              (session.emptyCapacity / config.TANKER_CAPACITY_L) * config.HAULAGE_COST_PER_LOAD,
          }}
          onSubmit={showResults}
          onSkip={showResults}
        />
      )}

      {gameState === "results" && (
        <ResultsScreenV2
          currentFill={session.currentFill}
          spillAmount={session.spillAmount}
          emptyCapacity={session.emptyCapacity}
          milkLeftBehind={session.milkLeftBehind}
          timeDelta={session.timeDelta}
          nudgeCount={session.nudgeCount}
          totalFillDuration={session.totalFillDuration}
          averageFlowRate={session.averageFlowRate}
          usedPiperSampling={session.usePiperSampling}
          usedWeighbridge={session.useWeighbridge}
          onPlayAgain={handlePlayAgain}
          config={config}
        />
      )}
    </div>
  );
}
