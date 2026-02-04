import { useEffect } from "react";
import { FarmTank } from "./FarmTank";
import { TankerV2 } from "./TankerV2";
import { ConnectionPipe } from "./ConnectionPipe";
import { SpillAnimation } from "./SpillAnimation";
import { SpillMessagePopup } from "./SpillMessagePopup";
import { GameTimer } from "./GameTimer";
import { LoadMeter } from "./LoadMeter";
import { SoundToggle } from "./SoundToggle";
import { GameSessionV2, GameConfig } from "../hooks/useGameStateV2";
import { useSoundEffects } from "../hooks/useSoundEffects";
import piperLogo from "@/assets/piper-logo.png";

interface GameScreenV2Props {
  session: GameSessionV2;
  isFilling: boolean;
  onStartFilling: () => void;
  onStopFilling: () => void;
  onNudge: () => void;
  onComplete: () => void;
  onAcknowledgeSpill: () => void;
  config: GameConfig;
}

export function GameScreenV2({
  session,
  isFilling,
  onStartFilling,
  onStopFilling,
  onNudge,
  onComplete,
  onAcknowledgeSpill,
  config,
}: GameScreenV2Props) {
  const {
    startFillLoop,
    stopFillLoop,
    startAlarmLoop,
    stopAlarmLoop,
    playNudge,
    playComplete,
    isMuted,
    toggleMute,
  } = useSoundEffects();

  // Prevent context menu on long press (mobile)
  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Sound effects for filling
  useEffect(() => {
    if (isFilling && !session.spillAcknowledged) {
      startFillLoop();
    } else {
      stopFillLoop();
    }
  }, [isFilling, session.spillAcknowledged, startFillLoop, stopFillLoop]);

  // Sound effects for overfill alarm
  useEffect(() => {
    if (session.spillWarningActive && isFilling) {
      startAlarmLoop();
    } else {
      stopAlarmLoop();
    }
  }, [session.spillWarningActive, isFilling, startAlarmLoop, stopAlarmLoop]);

  const targetFill = config.TARGET_FILL_L;

  // Handle nudge with sound
  const handleNudge = () => {
    playNudge();
    onNudge();
  };

  // Handle complete with sound
  const handleComplete = () => {
    playComplete();
    onComplete();
  };

  // Determine button state and text
  const getButtonState = () => {
    if (session.spillAcknowledged) {
      return { disabled: true, text: "STOPPED", style: "bg-slate-700 text-slate-500 cursor-not-allowed" };
    }
    if (session.spillWarningActive && isFilling) {
      return { disabled: false, text: "⚠️ OVERFILLING!", style: "bg-red-600 text-white animate-pulse scale-95" };
    }
    if (isFilling) {
      return { disabled: false, text: "FILLING...", style: "bg-sky-500 text-white scale-95" };
    }
    return { disabled: false, text: "HOLD TO FILL", style: "bg-sky-600 hover:bg-sky-500 text-white active:scale-95" };
  };

  const buttonState = getButtonState();

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col p-2 md:p-4 select-none relative overflow-hidden">
      {/* Spill Animation Overlay */}
      <SpillAnimation
        spillAmount={session.spillAmount}
        isActive={session.spillTriggered}
        config={config}
      />

      {/* Spill Message Popup */}
      {session.showSpillPopup && (
        <SpillMessagePopup
          spillAmount={session.spillAmount}
          config={config}
          onContinue={onAcknowledgeSpill}
        />
      )}

      {/* Overfill Warning Overlay (while still filling) */}
      {session.spillWarningActive && isFilling && !session.spillTriggered && (
        <div className="fixed inset-0 bg-red-500/20 z-30 pointer-events-none animate-pulse">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-900/90 px-6 py-3 rounded-xl border-2 border-red-500">
            <div className="text-xl md:text-2xl font-black text-red-300 text-center animate-pulse">
              ⚠️ OVERFILLING ⚠️
            </div>
            <div className="text-sm text-red-200 text-center mt-1">
              Release to stop! ({Math.round(session.spillAmount)}L spilled)
            </div>
          </div>
        </div>
      )}

      {/* Centralized Header */}
      <div className="text-center mb-2 md:mb-3">
        <img src={piperLogo} alt="Piper" className="h-8 md:h-10 object-contain mx-auto" />
        <div className="text-lg md:text-xl font-bold text-white">FILL THE TANK</div>
        <div className="text-[10px] md:text-xs text-slate-400">One shot. Real consequences.</div>
      </div>

      {/* Stats Row - Flow Rate + Timer */}
      <div className="flex justify-center gap-2 md:gap-4 mb-2 md:mb-3">
        {/* Flow Rate */}
        <div className="bg-slate-800/80 px-2 md:px-4 py-1 md:py-2 rounded-lg border border-slate-600">
          <div className="text-[10px] md:text-xs text-slate-400">FLOW RATE</div>
          <div className="text-sm md:text-lg font-mono font-bold text-amber-400">
            {Math.round(session.currentFlowRate)} L/s
          </div>
        </div>

        {/* Timer - Compact on mobile */}
        <GameTimer
          fillStartTime={session.fillStartTime}
          isFilling={isFilling}
          usePiperSampling={session.usePiperSampling}
          useWeighbridge={session.useWeighbridge}
          nudgeCount={session.nudgeCount}
          spillTriggered={session.spillTriggered}
          config={config}
        />
      </div>

      {/* Prominent Stats Bar */}
      <div className="flex justify-center gap-2 md:gap-4 mb-2 md:mb-3 flex-wrap">
        {/* Remaining (Farm Tank) */}
        <div className="bg-slate-800/90 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-sky-600">
          <div className="text-[10px] md:text-xs text-sky-300 mb-0.5 text-center font-bold">
            REMAINING
          </div>
          <div className="text-lg md:text-2xl font-mono font-bold text-sky-400">
            {Math.round(session.farmTankLevel).toLocaleString()}L
          </div>
        </div>

        {/* Target */}
        <div className="bg-slate-800/90 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-emerald-600">
          <div className="text-[10px] md:text-xs text-emerald-300 mb-0.5 text-center font-bold">
            TARGET
          </div>
          <div className="text-lg md:text-2xl font-mono font-bold text-emerald-400">
            {Math.round(targetFill).toLocaleString()}L
          </div>
        </div>

        {/* Current Fill */}
        <div className={`bg-slate-800/90 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 ${
          session.spillTriggered || session.spillWarningActive ? "border-red-600" : "border-slate-600"
        }`}>
          <div className={`text-[10px] md:text-xs mb-0.5 text-center font-bold ${
            session.spillTriggered || session.spillWarningActive ? "text-red-300" : "text-slate-400"
          }`}>
            CURRENT
          </div>
          <div className={`text-lg md:text-2xl font-mono font-bold ${
            session.spillTriggered || session.spillWarningActive ? "text-red-400" : "text-white"
          }`}>
            {Math.round(session.currentFill).toLocaleString()}L
          </div>
        </div>

        {/* Spilled (only shown when triggered) */}
        {(session.spillTriggered || session.spillWarningActive) && session.spillAmount > 0 && (
          <div className="bg-red-900/90 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-red-600 animate-pulse">
            <div className="text-[10px] md:text-xs text-red-300 mb-0.5 text-center font-bold">SPILLED</div>
            <div className="text-lg md:text-2xl font-mono font-bold text-red-400">
              {Math.round(session.spillAmount).toLocaleString()}L
            </div>
          </div>
        )}
      </div>

      {/* Load Meter */}
      <div className="mb-2 md:mb-3 max-w-2xl mx-auto w-full">
        <LoadMeter
          currentFill={session.currentFill}
          targetFill={targetFill}
          config={config}
          spillTriggered={session.spillTriggered}
          spillWarningActive={session.spillWarningActive}
        />
      </div>

      {/* Main Game Area - Responsive scaling */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex items-center gap-1 md:gap-2 scale-50 md:scale-75 lg:scale-90 origin-center">
          {/* Farm Tank (source) */}
          <FarmTank
            currentLevel={session.farmTankLevel}
            initialLevel={config.FARM_TANK_CAPACITY_L}
            config={config}
          />

          {/* Connection Pipe */}
          <ConnectionPipe isFlowing={isFilling && !session.spillAcknowledged} />

          {/* Tanker (destination) */}
          <TankerV2
            currentFill={session.currentFill}
            targetFill={targetFill}
            isFilling={isFilling}
            spillTriggered={session.spillTriggered || session.spillWarningActive}
            spillAmount={session.spillAmount}
            config={config}
          />
        </div>
      </div>

      {/* Controls - Compact for mobile */}
      <div className="flex flex-col items-center gap-2 md:gap-3 pb-2 md:pb-4">
        {/* Nudge count warning */}
        {session.nudgeCount > 0 && (
          <div className="text-amber-400 text-xs md:text-sm animate-pulse">
            ⏱️ {session.nudgeCount} nudge{session.nudgeCount > 1 ? "s" : ""} = +{session.nudgeCount * config.NUDGE_TIME_PENALTY_SEC}s delay
          </div>
        )}

        {/* Button row */}
        <div className="flex gap-2 md:gap-4">
          {/* Main Fill Button */}
          <button
            onMouseDown={onStartFilling}
            onMouseUp={onStopFilling}
            onMouseLeave={onStopFilling}
            onTouchStart={(e) => {
              e.preventDefault();
              onStartFilling();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onStopFilling();
            }}
            disabled={buttonState.disabled}
            className={`px-6 md:px-12 py-4 md:py-6 rounded-xl md:rounded-2xl font-bold text-lg md:text-2xl transition-all shadow-2xl ${buttonState.style}`}
          >
            {buttonState.text}
          </button>

          {/* Nudge Button */}
          <button
            onClick={handleNudge}
            disabled={session.spillAcknowledged}
            className={`px-4 md:px-6 py-4 md:py-6 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all shadow-xl ${
              session.spillAcknowledged
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-500 text-white active:scale-95"
            }`}
          >
            +{config.NUDGE_AMOUNT_L}L
            <span className="block text-[10px] md:text-xs opacity-75">NUDGE</span>
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={handleComplete}
          className="px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl hover:scale-105"
        >
          DONE — COMPLETE LOAD
        </button>
      </div>

      {/* Sound Toggle */}
      <SoundToggle
        isMuted={isMuted}
        onToggle={toggleMute}
        className="absolute top-2 right-2 md:top-4 md:right-4 z-10"
      />
    </div>
  );
}
