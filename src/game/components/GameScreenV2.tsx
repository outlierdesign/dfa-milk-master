import { useEffect } from "react";
import { FarmTank } from "./FarmTank";
import { TankerV2 } from "./TankerV2";
import { ConnectionPipe } from "./ConnectionPipe";
import { SpillAnimation } from "./SpillAnimation";
import { GameSessionV2, GameConfig } from "../hooks/useGameStateV2";

interface GameScreenV2Props {
  session: GameSessionV2;
  isFilling: boolean;
  onStartFilling: () => void;
  onStopFilling: () => void;
  onNudge: () => void;
  onComplete: () => void;
  config: GameConfig;
}

export function GameScreenV2({
  session,
  isFilling,
  onStartFilling,
  onStopFilling,
  onNudge,
  onComplete,
  config,
}: GameScreenV2Props) {
  // Prevent context menu on long press (mobile)
  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const targetFill = config.TARGET_FILL_L;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col p-4 select-none relative overflow-hidden">
      {/* Spill Animation Overlay */}
      <SpillAnimation
        spillAmount={session.spillAmount}
        isActive={session.spillTriggered}
        config={config}
      />

      {/* Header with flow rate indicator */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-600">
          <div className="text-xs text-slate-400">FLOW RATE</div>
          <div className="text-lg font-mono font-bold text-amber-400">
            {Math.round(session.currentFlowRate)} L/s
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-white">FILL THE TANK</div>
          <div className="text-sm text-slate-400">One shot. Real consequences.</div>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-600">
          <div className="text-xs text-slate-400">TIME {session.timeDelta >= 0 ? "SAVED" : "LOST"}</div>
          <div className={`text-lg font-mono font-bold ${session.timeDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {session.timeDelta >= 0 ? "+" : ""}{session.timeDelta} min
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 scale-75 md:scale-90 lg:scale-100 origin-center">
          {/* Farm Tank (source) */}
          <FarmTank
            currentLevel={session.farmTankLevel}
            initialLevel={config.FARM_TANK_CAPACITY_L}
            config={config}
          />

          {/* Connection Pipe */}
          <ConnectionPipe isFlowing={isFilling && !session.spillTriggered} />

          {/* Tanker (destination) */}
          <TankerV2
            currentFill={session.currentFill}
            targetFill={targetFill}
            isFilling={isFilling}
            spillTriggered={session.spillTriggered}
            spillAmount={session.spillAmount}
            config={config}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 pb-4">
        {/* Nudge count warning */}
        {session.nudgeCount > 0 && (
          <div className="text-amber-400 text-sm animate-pulse">
            ⏱️ {session.nudgeCount} nudge{session.nudgeCount > 1 ? "s" : ""} = +{session.nudgeCount * config.NUDGE_TIME_PENALTY_SEC}s delay
          </div>
        )}

        <div className="flex gap-4">
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
            disabled={session.spillTriggered}
            className={`px-12 py-8 rounded-2xl font-bold text-2xl transition-all shadow-2xl ${
              session.spillTriggered
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : isFilling
                  ? "bg-sky-500 text-white scale-95"
                  : "bg-sky-600 hover:bg-sky-500 text-white active:scale-95"
            }`}
          >
            {session.spillTriggered ? "STOPPED" : isFilling ? "FILLING..." : "HOLD TO FILL"}
          </button>

          {/* Nudge Button */}
          <button
            onClick={onNudge}
            disabled={session.spillTriggered}
            className={`px-6 py-8 rounded-2xl font-bold text-lg transition-all shadow-xl ${
              session.spillTriggered
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-500 text-white active:scale-95"
            }`}
          >
            +{config.NUDGE_AMOUNT_L}L
            <span className="block text-xs opacity-75">NUDGE</span>
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={onComplete}
          className="px-10 py-4 rounded-xl font-bold text-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl hover:scale-105"
        >
          DONE — COMPLETE LOAD
        </button>
      </div>
    </div>
  );
}
