import { GameConfig } from "../hooks/useGameStateV2";

interface PreLoadQuestionsProps {
  onComplete: (usePiperSampling: boolean, useWeighbridge: boolean) => void;
  config: GameConfig;
}

import { useState } from "react";

export function PreLoadQuestions({ onComplete, config }: PreLoadQuestionsProps) {
  const [usePiperSampling, setUsePiperSampling] = useState<boolean | null>(null);
  const [useWeighbridge, setUseWeighbridge] = useState<boolean | null>(null);

  const canProceed = usePiperSampling !== null && useWeighbridge !== null;

  const handleProceed = () => {
    if (canProceed) {
      onComplete(usePiperSampling!, useWeighbridge!);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
        Before you load...
      </h2>

      {/* Question 1: Piper Sampling */}
      <div className="mb-8 w-full max-w-xl">
        <p className="text-xl text-slate-300 mb-4 text-center">
          Sampling with Piper?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setUsePiperSampling(true)}
            className={`px-10 py-6 rounded-xl font-bold text-2xl transition-all ${
              usePiperSampling === true
                ? "bg-emerald-500 text-white scale-105 shadow-lg shadow-emerald-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            YES
            <span className="block text-sm font-normal opacity-75 mt-1">
              +{config.AGITATION_TIME_SAVED} mins saved
            </span>
          </button>
          <button
            onClick={() => setUsePiperSampling(false)}
            className={`px-10 py-6 rounded-xl font-bold text-2xl transition-all ${
              usePiperSampling === false
                ? "bg-red-500 text-white scale-105 shadow-lg shadow-red-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            NO
            <span className="block text-sm font-normal opacity-75 mt-1">
              −{config.AGITATION_TIME_SAVED} mins (agitation)
            </span>
          </button>
        </div>
      </div>

      {/* Question 2: Weighbridge */}
      <div className="mb-10 w-full max-w-xl">
        <p className="text-xl text-slate-300 mb-4 text-center">
          Need weighbridge?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setUseWeighbridge(true)}
            className={`px-10 py-6 rounded-xl font-bold text-2xl transition-all ${
              useWeighbridge === true
                ? "bg-red-500 text-white scale-105 shadow-lg shadow-red-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            YES
            <span className="block text-sm font-normal opacity-75 mt-1">
              −{config.WEIGHBRIDGE_TIME_COST} mins
            </span>
          </button>
          <button
            onClick={() => setUseWeighbridge(false)}
            className={`px-10 py-6 rounded-xl font-bold text-2xl transition-all ${
              useWeighbridge === false
                ? "bg-emerald-500 text-white scale-105 shadow-lg shadow-emerald-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            NO
            <span className="block text-sm font-normal opacity-75 mt-1">
              Piper handles it
            </span>
          </button>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        onClick={handleProceed}
        disabled={!canProceed}
        className={`px-12 py-6 rounded-2xl font-bold text-2xl transition-all ${
          canProceed
            ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl hover:scale-105"
            : "bg-slate-700 text-slate-500 cursor-not-allowed"
        }`}
      >
        START LOADING
      </button>

      {!canProceed && (
        <p className="text-slate-500 mt-4">Answer both questions to continue</p>
      )}
    </div>
  );
}
