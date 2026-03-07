import { useEffect, useRef, useCallback, useState } from "react";
import { useGameStateV2 } from "./hooks/useGameStateV2";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useAdminSettings, AdminPanel } from "./components/AdminPanel";
import { AttractModeV2 } from "./components/AttractModeV2";

import { GameScreenV2 } from "./components/GameScreenV2";
import { RoundResultScreen } from "./components/RoundResultScreen";
import { PenaltyRevealScreen } from "./components/PenaltyRevealScreen";
import { LeadCaptureScreen } from "./components/LeadCaptureScreen";
import { ResultsScreenV2 } from "./components/ResultsScreenV2";
import { SavingsRevealScreen } from "./components/SavingsRevealScreen";
import { FiredScreen } from "./components/FiredScreen";
import { calculateScore } from "./utils/scoringEngine";

export function FillTheTank() {
  const { settings, config, isOpen: isAdminOpen, setIsOpen: setAdminOpen, updateSetting, resetToDefaults } = useAdminSettings();

  const {
    gameState, session, isFilling,
    startGame, completeQuestions, startFilling, stopFilling,
    completeLoad, advanceFromWeighbridge, nextRound, showLeadCapture, showResults, resetToAttract, acknowledgeSpill,
  } = useGameStateV2(config);

  const { entries, addEntry, getDisplayEntries } = useLeaderboard();
  const [playerName, setPlayerName] = useState<string>("Player");
  const idleTimeoutRef = useRef<number | null>(null);

  // Idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (gameState === "attract") return;
    idleTimeoutRef.current = window.setTimeout(() => {
      if (gameState === "results") resetToAttract();
    }, config.attractIdleTime);
  }, [gameState, resetToAttract, config.attractIdleTime]);

  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown"];
    events.forEach((e) => document.addEventListener(e, resetIdleTimer));
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetIdleTimer));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [resetIdleTimer]);

  // Fullscreen (F11)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // Hidden reset (Ctrl+Shift+R)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") { e.preventDefault(); resetToAttract(); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [resetToAttract]);

  // Handle lead capture results
  const handleLeadCaptureResults = useCallback(() => {
    const score = calculateScore(session.rounds, config, session.usePiperSampling, session.useWeighbridge);
    return {
      accuracy: score.avgCredited / config.targetLoadLbs * 100,
      loadTime: session.rounds.reduce((s, r) => s + r.fillDuration, 0),
      volumeLoaded: session.rounds.reduce((s, r) => s + r.fillLbs, 0),
      totalCost: score.totalScore,
    };
  }, [session.rounds, config, session.usePiperSampling, session.useWeighbridge]);

  return (
    <div className={`w-full h-screen bg-slate-900 ${gameState === "results" ? "overflow-auto" : "overflow-hidden"}`}>
      <AdminPanel settings={settings} isOpen={isAdminOpen} onClose={() => setAdminOpen(false)} onUpdate={updateSetting} onReset={resetToDefaults} />

      {gameState === "attract" && (
        <AttractModeV2 onStartGame={startGame} config={config} />
      )}

      {gameState === "playing" && (
        <GameScreenV2
          session={session} isFilling={isFilling}
          onStartFilling={startFilling} onStopFilling={stopFilling}
          onComplete={completeLoad} onAcknowledgeSpill={acknowledgeSpill}
          onAdvanceFromWeighbridge={advanceFromWeighbridge}
          config={config}
        />
      )}

      {gameState === "roundResult" && session.rounds.length > 0 && (
        <RoundResultScreen
          round={session.rounds[session.rounds.length - 1]}
          totalRounds={session.totalRounds}
          config={config}
          onContinue={nextRound}
        />
      )}

      {gameState === "fired" && (
        <FiredScreen onTryAgain={startGame} />
      )}

      {gameState === "penaltyReveal" && (
        <PenaltyRevealScreen
          rounds={session.rounds}
          usePiperSampling={session.usePiperSampling}
          useWeighbridge={session.useWeighbridge}
          config={config}
          onComplete={showLeadCapture}
        />
      )}

      {gameState === "leadCapture" && (
        <LeadCaptureScreen
          gameResults={handleLeadCaptureResults()}
          onSubmit={(name) => { if (name) setPlayerName(name); showResults(); }}
          onSkip={showResults}
        />
      )}

      {gameState === "results" && (
        <ResultsScreenV2
          rounds={session.rounds}
          usedPiperSampling={session.usePiperSampling}
          usedWeighbridge={session.useWeighbridge}
          onPlayAgain={startGame}
          config={config}
          leaderboardEntries={entries}
          onAddEntry={addEntry}
          getDisplayEntries={getDisplayEntries}
          playerName={playerName}
        />
      )}
    </div>
  );
}
