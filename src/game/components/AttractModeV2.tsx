import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { GameConfig } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";
import driverView from "@/assets/driver_view.svg";

interface AttractModeV2Props {
  onStartGame: () => void;
  config: GameConfig;
}

export function AttractModeV2({ onStartGame, config }: AttractModeV2Props) {
  const { playGameStart, isMuted, toggleMute } = useSoundEffects();
  const handleStartGame = () => { playGameStart(); onStartGame(); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Piper logo */}
      <div className="mb-3 animate-fade-in">
        <img src={piperLogo} alt="Piper" className="h-12 md:h-16 object-contain" />
      </div>

      {/* Title */}
      <div className="text-center mb-3 animate-fade-in">
        <h1 className="text-3xl md:text-6xl font-bold text-white mb-1">FILL THE TANK</h1>
        <p className="text-base md:text-xl text-emerald-400 font-medium">3 rounds. Real consequences.</p>
      </div>

      {/* First-person windshield road view */}
      <div className="w-full max-w-xl mb-4 rounded-xl overflow-hidden border border-slate-600 shadow-2xl relative">
        {/* Driver view SVG as the cab/windshield frame */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {/* Sky / background */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-700 via-sky-600 to-emerald-800 z-0" />

          {/* Road with perspective vanishing point */}
          <div className="absolute inset-0 z-[1] overflow-hidden">
            <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="none">
              {/* Green fields */}
              <polygon points="0,200 400,170 0,450" fill="#2d5a27" />
              <polygon points="800,200 400,170 800,450" fill="#2d5a27" />

              {/* Road surface - trapezoid converging to vanishing point */}
              <polygon points="390,170 410,170 650,450 150,450" fill="#4a4a4a" />

              {/* Road edge lines */}
              <line x1="390" y1="170" x2="150" y2="450" stroke="white" strokeWidth="2" opacity="0.5" />
              <line x1="410" y1="170" x2="650" y2="450" stroke="white" strokeWidth="2" opacity="0.5" />

              {/* Centre dashed line - animated */}
              <g style={{ animation: "dashScroll 1s linear infinite" }}>
                {Array.from({ length: 20 }).map((_, i) => {
                  const t = i / 20;
                  const y = 170 + t * 280;
                  const nextT = (i + 0.4) / 20;
                  const nextY = 170 + nextT * 280;
                  // Width grows with perspective
                  const w = 1 + t * 3;
                  return (
                    <line
                      key={i}
                      x1="400" y1={y}
                      x2="400" y2={nextY}
                      stroke="white" strokeWidth={w}
                      opacity={0.4 + t * 0.6}
                    />
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Driver view overlay (windshield/cab frame) */}
          <img
            src={driverView}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-[2] pointer-events-none"
          />
        </div>
      </div>

      {/* Farm stats card */}
      <div className="w-full max-w-md mb-4 bg-slate-800/80 border border-emerald-500/50 rounded-xl p-4 md:p-5 shadow-lg"
        style={{ animation: "cardPulse 3s ease-in-out infinite" }}>
        <h2 className="text-emerald-400 font-bold text-lg md:text-xl mb-3 text-center">This is your farm:</h2>
        <ul className="space-y-2 text-slate-200 text-sm md:text-base">
          <li className="flex items-center gap-2"><span className="text-lg">🚛</span>{config.loadsPerDay} loads a day</li>
          <li className="flex items-center gap-2"><span className="text-lg">⚖️</span>{(config.targetLoadLbs / 1000).toFixed(0)},000 lb loads</li>
          <li className="flex items-center gap-2"><span className="text-lg">🏗️</span>23,000 gallon silo</li>
          <li className="flex items-center gap-2"><span className="text-lg">📏</span>Scaling in and out</li>
          <li className="flex items-center gap-2"><span className="text-lg">🧪</span>Sampling manually</li>
        </ul>
      </div>

      {/* TAP TO PLAY */}
      <div className="text-center mb-2">
        <button onClick={handleStartGame} className="bg-emerald-500 hover:bg-emerald-400 text-white text-2xl md:text-3xl font-bold px-10 py-5 md:px-12 md:py-6 rounded-2xl shadow-2xl animate-pulse transition-all hover:scale-105">
          TAP TO PLAY
        </button>
      </div>

      <SoundToggle isMuted={isMuted} onToggle={toggleMute} className="absolute top-4 right-4" />
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs">Ctrl+Shift+A for settings</div>

      <style>{`
        @keyframes dashScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(14px); }
        }
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
