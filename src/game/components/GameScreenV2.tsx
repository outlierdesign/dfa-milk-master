import { useEffect } from "react";
import { FarmTank } from "./FarmTank";
import { TankerV2 } from "./TankerV2";
import { ConnectionPipe } from "./ConnectionPipe";
import { SpillAnimation } from "./SpillAnimation";
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
  onComplete: () => void;
  onAcknowledgeSpill: () => void;
  config: GameConfig;
}

export function GameScreenV2({
  session,
  isFilling,
  onStartFilling,
  onStopFilling,
  onComplete,
  onAcknowledgeSpill,
  config,
}: GameScreenV2Props) {
  const {
    startFillLoop,
    stopFillLoop,
    startAlarmLoop,
    stopAlarmLoop,
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
    if (isFilling && !session.fillLocked) {
      startFillLoop();
    } else {
      stopFillLoop();
    }
  }, [isFilling, session.fillLocked, startFillLoop, stopFillLoop]);

  // Sound effects for overfill alarm
  useEffect(() => {
    if (session.spillTriggered) {
      startAlarmLoop();
    } else {
      stopAlarmLoop();
    }
  }, [session.spillTriggered, startAlarmLoop, stopAlarmLoop]);

  const targetFill = config.TARGET_FILL_L;
  const usePiperSystem = session.usePiperSampling;

  // Handle complete with sound
  const handleComplete = () => {
    playComplete();
    onComplete();
  };

  // Determine button state and text
  const getButtonState = () => {
    if (session.fillLocked) {
      return { disabled: true, text: "STOPPED", style: "bg-slate-700 text-slate-500 cursor-not-allowed" };
    }
    if (session.spillTriggered) {
      return { disabled: true, text: "💥 OVERFILLED!", style: "bg-red-600 text-white cursor-not-allowed" };
    }
    if (isFilling) {
      return { disabled: false, text: "FILLING...", style: "bg-sky-500 text-white scale-95" };
    }
    if (session.hasStartedFilling) {
      return { disabled: true, text: "LOCKED", style: "bg-slate-700 text-slate-500 cursor-not-allowed" };
    }
    return { disabled: false, text: "HOLD TO FILL", style: "bg-sky-600 hover:bg-sky-500 text-white active:scale-95" };
  };

  const buttonState = getButtonState();

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col p-2 md:p-4 select-none relative overflow-hidden">
      {/* Spill Animation Overlay - Full screen splat */}
      <SpillAnimation
        spillAmount={session.spillAmount}
        isActive={session.spillTriggered}
        config={config}
        onContinue={onAcknowledgeSpill}
      />

      {/* Centralized Header */}
      <div className="text-center mb-2 md:mb-3">
        <img src={piperLogo} alt="Piper" className="h-8 md:h-10 object-contain mx-auto" />
        <div className="text-lg md:text-xl font-bold text-white">FILL THE TANK</div>
        <div className="text-[10px] md:text-xs text-slate-400">
          {usePiperSystem ? "Visual Mode — See the fill" : "Blind Mode — Calculate the fill"}
        </div>
        <div className="text-[10px] md:text-xs text-amber-400 mt-1">
          ⚠️ ONE SHOT ONLY — Release to stop permanently
        </div>
      </div>

      {/* Stats Row - Flow Rate + Timer */}
      <div className="flex justify-center gap-2 md:gap-4 mb-2 md:mb-3">
        {/* Flow Rate - Always visible */}
        <div className="bg-slate-800/80 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-amber-600">
          <div className="text-[10px] md:text-xs text-amber-300 font-bold">FLOW RATE</div>
          <div className="text-lg md:text-2xl font-mono font-bold text-amber-400">
            {Math.round(session.currentFlowRate)} L/min
          </div>
        </div>

        {/* Timer - Always visible */}
        <GameTimer
          fillStartTime={session.fillStartTime}
          isFilling={isFilling}
          usePiperSampling={session.usePiperSampling}
          useWeighbridge={session.useWeighbridge}
          nudgeCount={0}
          spillTriggered={session.spillTriggered}
          config={config}
        />
      </div>

      {/* Conditional Stats Bar - Only show details in Piper mode */}
      {usePiperSystem && (
        <div className="flex justify-center gap-2 md:gap-4 mb-2 md:mb-3 flex-wrap">
          {/* Target - Only in Piper mode */}
          <div className="bg-slate-800/90 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-emerald-600">
            <div className="text-[10px] md:text-xs text-emerald-300 mb-0.5 text-center font-bold">
              TARGET
            </div>
            <div className="text-lg md:text-2xl font-mono font-bold text-emerald-400">
              {Math.round(targetFill).toLocaleString()}L
            </div>
          </div>
        </div>
      )}

      {/* Blind mode hint */}
      {!usePiperSystem && !session.fillLocked && (
        <div className="text-center mb-2 md:mb-3">
          <div className="inline-block bg-amber-900/50 px-4 py-2 rounded-lg border border-amber-600">
            <div className="text-amber-300 text-sm md:text-base font-semibold">
              💡 Calculate: Flow Rate × Time = Volume
            </div>
            <div className="text-amber-400/70 text-xs">
              Watch the timer and flow rate carefully!
            </div>
          </div>
        </div>
      )}

      {/* Load Meter - Only in Piper mode */}
      {usePiperSystem && (
        <div className="mb-2 md:mb-3 max-w-2xl mx-auto w-full">
          <LoadMeter
            currentFill={session.currentFill}
            targetFill={targetFill}
            config={config}
            spillTriggered={session.spillTriggered}
            spillWarningActive={session.spillWarningActive}
          />
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex items-center gap-1 md:gap-2 scale-50 md:scale-75 lg:scale-90 origin-center">
          {/* Farm Tank (source) - Always visible */}
          <FarmTank
            currentLevel={session.farmTankLevel}
            initialLevel={config.FARM_TANK_CAPACITY_L}
            config={config}
          />

          {/* Connection Pipe */}
          <ConnectionPipe isFlowing={isFilling && !session.fillLocked} />

          {/* Tanker (destination) */}
          <TankerV2
            currentFill={session.currentFill}
            targetFill={targetFill}
            isFilling={isFilling}
            spillTriggered={session.spillTriggered}
            spillAmount={session.spillAmount}
            config={config}
            isBlindMode={!usePiperSystem}
          />
        </div>
      </div>

      {/* Spill result shown after fill locked */}
      {session.fillLocked && session.spillAmount > 0 && (
        <div className="text-center mb-2">
          <div className="inline-block bg-red-900/80 px-6 py-3 rounded-xl border-2 border-red-500">
            <div className="text-red-300 text-lg font-bold">
              💥 {Math.round(session.spillAmount).toLocaleString()}L SPILLED
            </div>
            <div className="text-red-400 text-sm">
              {config.CURRENCY}{(session.spillAmount * config.MILK_VALUE_PER_L).toFixed(2)} lost
            </div>
          </div>
        </div>
      )}

      {/* Fill result shown after fill locked (no spill) */}
      {session.fillLocked && session.spillAmount === 0 && (
        <div className="text-center mb-2">
          <div className="inline-block bg-slate-800/80 px-6 py-3 rounded-xl border-2 border-slate-600">
            <div className="text-white text-lg font-bold">
              Filled: {Math.round(session.currentFill).toLocaleString()}L
            </div>
            <div className="text-slate-400 text-sm">
              Target: {Math.round(targetFill).toLocaleString()}L
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 md:gap-3 pb-2 md:pb-4">
        {/* Button row */}
        <div className="flex gap-2 md:gap-4">
          {/* Main Fill Button */}
          <button
            onMouseDown={onStartFilling}
            onMouseUp={onStopFilling}
            onMouseLeave={() => { if (isFilling) onStopFilling(); }}
            onTouchStart={(e) => {
              e.preventDefault();
              onStartFilling();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onStopFilling();
            }}
            disabled={buttonState.disabled}
            className={`px-8 md:px-16 py-5 md:py-8 rounded-xl md:rounded-2xl font-bold text-xl md:text-3xl transition-all shadow-2xl ${buttonState.style}`}
          >
            {buttonState.text}
          </button>
        </div>

        {/* Done Button - Only show after fill is locked */}
        {session.fillLocked && (
          <button
            onClick={handleComplete}
            className="px-8 md:px-12 py-4 md:py-5 rounded-xl font-bold text-lg md:text-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl hover:scale-105 animate-pulse"
          >
            SEE YOUR RESULTS →
          </button>
        )}
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
