import { useState } from "react";
import { GameConfig } from "../hooks/useGameStateV2";
import { useSoundEffects } from "../hooks/useSoundEffects";

interface PreLoadQuestionsProps {
  onComplete: (usePiperSampling: boolean, useWeighbridge: boolean) => void;
  config: GameConfig;
}

export function PreLoadQuestions({ onComplete, config }: PreLoadQuestionsProps) {
  const { playButtonClick } = useSoundEffects();
  const [usePiperSystem, setUsePiperSystem] = useState<boolean | null>(null);

  const canProceed = usePiperSystem !== null;

  const handleProceed = () => {
    if (canProceed) {
      // Pass usePiperSystem as both values - weighbridge is implicit (NO if Piper, YES if no Piper)
      onComplete(usePiperSystem!, !usePiperSystem!);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
        Before you load...
      </h2>
      
      <p className="text-lg text-slate-400 mb-10 text-center max-w-lg">
        Choose your collection method. This determines how you'll fill the tanker.
      </p>

      {/* Main Question: Piper System */}
      <div className="mb-10 w-full max-w-2xl">
        <p className="text-2xl text-white mb-6 text-center font-semibold">
          Are you collecting with a Piper System?
        </p>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => {
              playButtonClick();
              setUsePiperSystem(true);
            }}
            className={`px-12 py-8 rounded-2xl font-bold text-3xl transition-all ${
              usePiperSystem === true
                ? "bg-emerald-500 text-white scale-105 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-300"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-102"
            }`}
          >
            YES
            <span className="block text-sm font-normal opacity-75 mt-2">
              Visual mode - see the fill
            </span>
            <span className="block text-xs font-normal opacity-60 mt-1">
              +{config.AGITATION_TIME_SAVED} mins saved
            </span>
          </button>
          <button
            onClick={() => {
              playButtonClick();
              setUsePiperSystem(false);
            }}
            className={`px-12 py-8 rounded-2xl font-bold text-3xl transition-all ${
              usePiperSystem === false
                ? "bg-amber-500 text-white scale-105 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-300"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-102"
            }`}
          >
            NO
            <span className="block text-sm font-normal opacity-75 mt-2">
              Blind mode - guess the fill
            </span>
            <span className="block text-xs font-normal opacity-60 mt-1">
              −{config.AGITATION_TIME_SAVED} mins (agitation)
            </span>
          </button>
        </div>
      </div>

      {/* Mode Description */}
      {usePiperSystem !== null && (
        <div className="mb-8 p-6 bg-slate-800/80 rounded-xl border border-slate-600 max-w-xl animate-fade-in">
          {usePiperSystem ? (
            <div className="text-center">
              <div className="text-2xl mb-2">🎯 Visual Mode</div>
              <div className="text-slate-300 text-sm">
                You can see the tank filling and the progress bar. 
                Flow slows near the target to help you hit it precisely.
                <div className="mt-2 text-amber-400 font-semibold">
                  ⚠️ One chance only - release to stop!
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-2">🙈 Blind Mode</div>
              <div className="text-slate-300 text-sm">
                You can only see the flow rate and timer. 
                Calculate when to stop based on flow × time.
                <div className="mt-2 text-amber-400 font-semibold">
                  ⚠️ One chance only - release to stop!
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proceed Button */}
      <button
        onClick={handleProceed}
        disabled={!canProceed}
        className={`px-16 py-8 rounded-2xl font-bold text-3xl transition-all ${
          canProceed
            ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl hover:scale-105"
            : "bg-slate-700 text-slate-500 cursor-not-allowed"
        }`}
      >
        START LOADING
      </button>

      {!canProceed && (
        <p className="text-slate-500 mt-4">Choose your collection method to continue</p>
      )}
    </div>
  );
}
