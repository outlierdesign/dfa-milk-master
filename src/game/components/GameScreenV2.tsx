import { useEffect } from "react";
import { FarmTank } from "./FarmTank";
import { TankerV2 } from "./TankerV2";
import { ConnectionPipe } from "./ConnectionPipe";
import { SpillAnimation } from "./SpillAnimation";
import { GameTimer } from "./GameTimer";
import { SoundToggle } from "./SoundToggle";
import { GameSessionV2 } from "../hooks/useGameStateV2";
import { GameConfig } from "../constantsV2";
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
  const { startFillLoop, stopFillLoop, startAlarmLoop, stopAlarmLoop, playComplete, playOverfillWarning, isMuted, toggleMute } = useSoundEffects();

  useEffect(() => {
    const h = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", h);
    return () => document.removeEventListener("contextmenu", h);
  }, []);

  useEffect(() => {
    if (isFilling && !session.fillLocked) startFillLoop();
    else stopFillLoop();
  }, [isFilling, session.fillLocked, startFillLoop, stopFillLoop]);

  useEffect(() => {
    if (session.spillTriggered) startAlarmLoop();
    else stopAlarmLoop();
  }, [session.spillTriggered, startAlarmLoop, stopAlarmLoop]);

  // Play warning beep the instant overfill starts
  useEffect(() => {
    if (session.spillWarningActive && !session.spillTriggered) {
      playOverfillWarning();
    }
  // Only fire once when spillWarningActive first becomes true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.spillWarningActive]);

  const targetLbs = config.targetLoadLbs;

  const handleComplete = () => { playComplete(); onComplete(); };

  const getButtonState = () => {
    if (session.fillLocked) return { disabled: true, text: "STOPPED", style: "bg-slate-700 text-slate-500 cursor-not-allowed" };
    if (session.spillTriggered) return { disabled: true, text: "💥 OVERFILLED!", style: "bg-red-600 text-white cursor-not-allowed" };
    if (isFilling) return { disabled: false, text: "FILLING...", style: "bg-sky-500 text-white scale-95" };
    if (session.hasStartedFilling) return { disabled: true, text: "LOCKED", style: "bg-slate-700 text-slate-500 cursor-not-allowed" };
    return { disabled: false, text: "HOLD TO FILL", style: "bg-sky-600 hover:bg-sky-500 text-white active:scale-95" };
  };

  const buttonState = getButtonState();

  // Farm tank level — approximate using flow
  const farmTankCapacity = 260_000;
  const previousRoundsFill = session.rounds?.reduce((sum, r) => sum + r.fillLbs, 0) ?? 0;
  const farmTankLevel = Math.max(0, farmTankCapacity - previousRoundsFill - session.currentFill);

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col p-2 md:p-4 select-none relative overflow-hidden">
      <SpillAnimation
        spillAmount={session.spillAmount}
        isActive={session.spillTriggered}
        config={config}
        onContinue={onAcknowledgeSpill}
      />

      {/* Header */}
      <div className="text-center mb-2 md:mb-3">
        <img src={piperLogo} alt="Piper" className="h-8 md:h-10 object-contain mx-auto" />
        <div className="text-lg md:text-xl font-bold text-white">
          FILL THE TANK — Round {session.currentRound}/{session.totalRounds}
        </div>
        <div className="text-[10px] md:text-xs text-slate-400">
          Fill the tanker to the target weight
        </div>
        <div className="text-[10px] md:text-xs text-amber-400 mt-1">
          ⚠️ ONE SHOT ONLY — Release to stop permanently
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-center gap-2 md:gap-4 mb-2 md:mb-3">
        <div className="bg-slate-800/80 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-amber-600">
          <div className="text-[10px] md:text-xs text-amber-300 font-bold">FLOW RATE</div>
          <div className="text-lg md:text-2xl font-mono font-bold text-amber-400">
            {Math.round(session.currentFlowRate).toLocaleString()} lbs/min
          </div>
        </div>
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

      {/* Target */}
      <div className="flex justify-center gap-2 md:gap-4 mb-2 md:mb-3">
        <div className="bg-slate-800/90 px-3 md:px-5 py-2 md:py-3 rounded-xl border-2 border-emerald-600">
          <div className="text-[10px] md:text-xs text-emerald-300 mb-0.5 text-center font-bold">TARGET</div>
          <div className="text-lg md:text-2xl font-mono font-bold text-emerald-400">
            {targetLbs.toLocaleString()} lbs
          </div>
        </div>
      </div>

      {/* Overfill Warning Popup — shown the instant fill exceeds target */}
      {session.spillWarningActive && !session.spillTriggered && isFilling && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 pointer-events-none" style={{ animation: 'warningPop 0.25s ease-out forwards' }}>
          <div className="bg-red-600 text-white px-5 py-3 rounded-xl border-2 border-red-300 shadow-2xl text-center" style={{ animation: 'warningPulse 0.4s ease-in-out infinite alternate' }}>
            <div className="text-2xl font-black">⚠️ OVERFILLING!</div>
            <div className="text-sm font-bold mt-0.5">
              +{Math.round(session.spillAmount).toLocaleString()} lbs over target
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="flex items-center gap-1 md:gap-2 scale-50 md:scale-75 lg:scale-90 origin-center">
          <FarmTank currentLevel={farmTankLevel} initialLevel={farmTankCapacity} config={config} />
          <ConnectionPipe isFlowing={isFilling && !session.fillLocked} />
          <TankerV2
            currentFill={session.currentFill}
            targetFill={targetLbs}
            maxFill={config.maxAllowedFill}
            isFilling={isFilling}
            spillTriggered={session.spillTriggered}
            spillAmount={session.spillAmount}
            config={config}
            isBlindMode={false}
          />
        </div>
      </div>

      {/* Fill result after locked */}
      {session.fillLocked && session.spillAmount > 0 && (
        <div className="text-center mb-2">
          <div className="inline-block bg-red-900/80 px-6 py-3 rounded-xl border-2 border-red-500">
            <div className="text-red-300 text-lg font-bold">
              💥 {Math.round(session.spillAmount).toLocaleString()} lbs OVER
            </div>
            <div className="text-red-400 text-sm">
              {config.currency}{(session.spillAmount * config.milkCostPerLb).toFixed(2)} wasted
            </div>
          </div>
        </div>
      )}
      {session.fillLocked && session.spillAmount === 0 && (
        <div className="text-center mb-2">
          <div className="inline-block bg-slate-800/80 px-6 py-3 rounded-xl border-2 border-slate-600">
            <div className="text-white text-lg font-bold">
              Filled: {Math.round(session.currentFill).toLocaleString()} lbs
            </div>
            <div className="text-slate-400 text-sm">
              Target: {targetLbs.toLocaleString()} lbs
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 md:gap-3 pb-2 md:pb-4">
        <button
          onMouseDown={onStartFilling}
          onMouseUp={onStopFilling}
          onMouseLeave={() => { if (isFilling) onStopFilling(); }}
          onTouchStart={(e) => { e.preventDefault(); onStartFilling(); }}
          onTouchEnd={(e) => { e.preventDefault(); onStopFilling(); }}
          disabled={buttonState.disabled}
          className={`px-8 md:px-16 py-5 md:py-8 rounded-xl md:rounded-2xl font-bold text-xl md:text-3xl transition-all shadow-2xl ${buttonState.style}`}
        >
          {buttonState.text}
        </button>

        {session.fillLocked && (
          <button
            onClick={handleComplete}
            className="px-8 md:px-12 py-4 md:py-5 rounded-xl font-bold text-lg md:text-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl hover:scale-105 animate-pulse"
          >
            {session.currentRound < session.totalRounds ? "NEXT ROUND →" : "SEE YOUR RESULTS →"}
          </button>
        )}
      </div>

      <SoundToggle isMuted={isMuted} onToggle={toggleMute} className="absolute top-2 right-2 md:top-4 md:right-4 z-10" />

      <style>{`
        @keyframes warningPop {
          0% { transform: translate(-50%, -20px) scale(0.8); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        @keyframes warningPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          100% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
