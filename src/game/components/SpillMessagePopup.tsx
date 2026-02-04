import { useEffect } from "react";
import { GameConfig } from "../hooks/useGameStateV2";
import { useSoundEffects } from "../hooks/useSoundEffects";

interface SpillMessagePopupProps {
  spillAmount: number;
  config: GameConfig;
  onContinue: () => void;
}

export function SpillMessagePopup({
  spillAmount,
  config,
  onContinue,
}: SpillMessagePopupProps) {
  const { playSpill } = useSoundEffects();
  const spillCost = spillAmount * config.MILK_VALUE_PER_L;

  // Play spill sound on mount
  useEffect(() => {
    playSpill();
  }, [playSpill]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-sm w-full mx-4 animate-scale-in">
        {/* Phone message container */}
        <div className="bg-slate-800 rounded-3xl border-4 border-slate-600 p-3 shadow-2xl">
          {/* Phone header */}
          <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Text Message</span>
          </div>

          {/* Message bubble */}
          <div className="mt-4 mb-2">
            {/* Sender */}
            <div className="text-xs text-slate-400 mb-2 pl-2">
              From: <span className="text-sky-400 font-semibold">Driver</span>
            </div>

            {/* Message bubble */}
            <div className="bg-sky-600 rounded-2xl rounded-tl-sm p-4 text-white">
              <p className="text-lg leading-relaxed">
                Boss, we've had an overfill. I'll need to clean this up...
              </p>
              <p className="text-lg mt-2">
                does this farm have a cat we could borrow? 🐈
              </p>
            </div>

            {/* Spill cost - separate message */}
            <div className="flex justify-end mt-3">
              <div className="bg-red-600 rounded-2xl rounded-tr-sm px-4 py-3">
                <div className="text-xs text-red-200 mb-1">Spill Cost:</div>
                <div className="text-2xl font-bold text-white">
                  €{spillCost.toFixed(2)}
                </div>
                <div className="text-xs text-red-200 mt-1">
                  ({Math.round(spillAmount)}L wasted)
                </div>
              </div>
            </div>
          </div>

          {/* Time stamp */}
          <div className="text-xs text-slate-500 text-right pr-2 mb-4">
            Just now
          </div>

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
