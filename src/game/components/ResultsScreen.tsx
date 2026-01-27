import { useEffect, useState } from "react";
import { GameSession } from "../types";
import { GAME_CONFIG } from "../constants";
import { Button } from "@/components/ui/button";

interface ResultsScreenProps {
  session: GameSession;
  averageAccuracy: number;
  onPlayAgain: () => void;
  onAddToLeaderboard: (name: string) => void;
  isHighScore: boolean;
}

export function ResultsScreen({
  session,
  averageAccuracy,
  onPlayAgain,
  onAddToLeaderboard,
  isHighScore,
}: ResultsScreenProps) {
  const [countdown, setCountdown] = useState(GAME_CONFIG.RESULTS_DISPLAY_TIME / 1000);
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Auto-restart countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onPlayAgain();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onPlayAgain]);

  const handleSubmitScore = () => {
    if (playerName.trim()) {
      onAddToLeaderboard(playerName.trim());
      setSubmitted(true);
    }
  };

  // Determine performance rating
  const getPerformanceRating = () => {
    if (averageAccuracy >= GAME_CONFIG.ACCURACY_THRESHOLDS.PERFECT) {
      return { emoji: "🎉", text: "PERFECT!", color: "text-emerald-400" };
    }
    if (averageAccuracy >= GAME_CONFIG.ACCURACY_THRESHOLDS.EXCELLENT) {
      return { emoji: "⭐", text: "EXCELLENT!", color: "text-amber-400" };
    }
    if (averageAccuracy >= GAME_CONFIG.ACCURACY_THRESHOLDS.GOOD) {
      return { emoji: "👍", text: "GOOD JOB!", color: "text-blue-400" };
    }
    return { emoji: "💪", text: "KEEP PRACTICING!", color: "text-slate-400" };
  };

  const rating = getPerformanceRating();
  const showConfetti = averageAccuracy >= GAME_CONFIG.ACCURACY_THRESHOLDS.PERFECT;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
      {/* Confetti effect for perfect scores */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Performance Rating */}
      <div className="text-center mb-8 animate-scale-in">
        <div className="text-8xl mb-4">{rating.emoji}</div>
        <h1 className={`text-4xl font-bold ${rating.color}`}>{rating.text}</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8 max-w-2xl w-full">
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 text-center">
          <div className="text-sm text-slate-400 mb-2">ACCURACY</div>
          <div className="text-4xl font-bold text-white">
            {averageAccuracy.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-800/80 p-6 rounded-xl border border-emerald-600 text-center">
          <div className="text-sm text-emerald-400 mb-2">MONEY KEPT</div>
          <div className="text-4xl font-bold text-emerald-400">
            ${session.totalMoneyKept.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 text-center">
          <div className="text-sm text-slate-400 mb-2">TANKERS FILLED</div>
          <div className="text-4xl font-bold text-white">
            {session.tankersFilled}
          </div>
        </div>
      </div>

      {/* Load Results */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 mb-8 max-w-md w-full">
        <h3 className="text-sm text-slate-400 mb-3 text-center">LOAD RESULTS</h3>
        <div className="space-y-2">
          {session.loadResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm bg-slate-700/50 px-3 py-2 rounded"
            >
              <span className="text-slate-300">Load {index + 1}</span>
              <span className="text-slate-400">
                {result.actualFill.toLocaleString()} / {result.targetFill.toLocaleString()}L
              </span>
              <span
                className={`font-mono ${
                  result.accuracy >= 95 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {result.accuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High Score Entry */}
      {isHighScore && !submitted && (
        <div className="bg-amber-900/50 p-6 rounded-xl border border-amber-500 mb-8 max-w-md w-full">
          <h3 className="text-lg font-bold text-amber-400 mb-4 text-center">
            🏆 NEW HIGH SCORE!
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              autoFocus
            />
            <Button
              onClick={handleSubmitScore}
              disabled={!playerName.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950"
            >
              SAVE
            </Button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="text-emerald-400 mb-8 text-lg">
          ✓ Score saved to leaderboard!
        </div>
      )}

      {/* Play Again */}
      <div className="text-center">
        <Button
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-400 text-white text-xl px-12 py-6 h-auto"
          onClick={onPlayAgain}
        >
          PLAY AGAIN
        </Button>
        <p className="text-slate-500 mt-4">
          Auto-restart in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}
