import { useEffect } from "react";
import { MilkTanker } from "./MilkTanker";
import { GameHUD } from "./GameHUD";
import { GameControls } from "./GameControls";
import { ConfirmationModal } from "./ConfirmationModal";
import { GameSession, LevelConfig } from "../types";

interface GameScreenProps {
  session: GameSession;
  levelConfig: LevelConfig;
  fillLevel: number;
  isFilling: boolean;
  showConfirmation: boolean;
  onStartFilling: () => void;
  onStopFilling: () => void;
  onNudge: () => void;
  onComplete: () => void;
  onConfirmSample: () => void;
}

export function GameScreen({
  session,
  levelConfig,
  fillLevel,
  isFilling,
  showConfirmation,
  onStartFilling,
  onStopFilling,
  onNudge,
  onComplete,
  onConfirmSample,
}: GameScreenProps) {
  // Prevent context menu on long press (mobile)
  useEffect(() => {
    const handleContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col p-4 select-none">
      {/* HUD */}
      <div className="mb-4">
        <GameHUD session={session} levelConfig={levelConfig} />
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Milk Tanker */}
        <MilkTanker
          compartments={levelConfig.compartments}
          currentCompartment={session.currentCompartment}
          compartmentFillLevels={session.compartmentFillLevels}
          targetFill={levelConfig.targetFill}
          isFilling={isFilling}
        />

        {/* Controls */}
        <GameControls
          isFilling={isFilling}
          fillLevel={fillLevel}
          onStartFilling={onStartFilling}
          onStopFilling={onStopFilling}
          onNudge={onNudge}
          onComplete={onComplete}
          disabled={showConfirmation}
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && <ConfirmationModal onConfirm={onConfirmSample} />}
    </div>
  );
}
