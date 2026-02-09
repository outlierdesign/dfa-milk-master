import piperLogo from "@/assets/piper-logo.png";

interface FiredScreenProps {
  onTryAgain: () => void;
}

export function FiredScreen({ onTryAgain }: FiredScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-red-950 via-slate-900 to-slate-900 flex flex-col items-center justify-center z-50 p-8">
      <img src={piperLogo} alt="Piper" className="h-12 md:h-16 mb-8 opacity-50" />

      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-8xl md:text-9xl">🔥</div>
        <h1 className="text-5xl md:text-7xl font-black text-red-500">
          YOU'RE FIRED!
        </h1>
        <p className="text-xl text-red-300 max-w-md">
          You overfilled all 3 loads. That's {3} overfills in a row — no driver keeps their job after that.
        </p>

        <div className="pt-8">
          <button
            onClick={onTryAgain}
            className="bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold px-12 py-6 rounded-2xl shadow-2xl transition-all hover:scale-105"
          >
            TRY AGAIN
          </button>
          <p className="text-red-400/60 text-sm mt-4">No leaderboard submission for this one...</p>
        </div>
      </div>
    </div>
  );
}
