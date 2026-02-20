import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { GameConfig } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";
import milkTanker from "@/assets/milk_tanker_full.svg";

interface AttractModeV2Props {
  onStartGame: () => void;
  config: GameConfig;
}

export function AttractModeV2({ onStartGame, config }: AttractModeV2Props) {
  const { playGameStart, isMuted, toggleMute } = useSoundEffects();
  const handleStartGame = () => { playGameStart(); onStartGame(); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Piper logo */}
      <div className="mb-4 animate-fade-in">
        <img src={piperLogo} alt="Piper" className="h-14 md:h-20 object-contain" />
      </div>

      {/* Title */}
      <div className="text-center mb-4 animate-fade-in">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-1">FILL THE TANK</h1>
        <p className="text-lg md:text-2xl text-emerald-400 font-medium">3 rounds. Real consequences.</p>
      </div>

      {/* Road animation viewport */}
      <div className="w-full max-w-lg mb-5 rounded-xl overflow-hidden border border-slate-700 shadow-lg"
        style={{ perspective: "400px" }}>
        <div className="relative h-36 md:h-44 bg-slate-700 overflow-hidden">
          {/* Green roadside left */}
          <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-green-900/60 z-0" />
          {/* Green roadside right */}
          <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-green-900/60 z-0" />

          {/* Road surface */}
          <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-slate-600 z-[1]" />

          {/* Road edge lines */}
          <div className="absolute left-[20%] top-0 bottom-0 w-[3px] bg-white/40 z-[2]" />
          <div className="absolute right-[20%] top-0 bottom-0 w-[3px] bg-white/40 z-[2]" />

          {/* Centre dashed line - scrolling */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[4px] z-[2]"
            style={{
              height: "200%",
              background: "repeating-linear-gradient(to bottom, white 0px, white 20px, transparent 20px, transparent 40px)",
              animation: "roadScroll 0.8s linear infinite",
            }}
          />

          {/* Tanker SVG */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-[3]"
            style={{ animation: "truckBob 2s ease-in-out infinite" }}>
            <img src={milkTanker} alt="Milk tanker" className="h-16 md:h-20 drop-shadow-lg" />
          </div>
        </div>
      </div>

      {/* Farm stats card */}
      <div className="w-full max-w-md mb-5 bg-slate-800/80 border border-emerald-500/50 rounded-xl p-4 md:p-5 shadow-lg"
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
      <div className="text-center mb-4">
        <button onClick={handleStartGame} className="bg-emerald-500 hover:bg-emerald-400 text-white text-2xl md:text-3xl font-bold px-10 py-5 md:px-12 md:py-6 rounded-2xl shadow-2xl animate-pulse transition-all hover:scale-105">
          TAP TO PLAY
        </button>
      </div>

      <SoundToggle isMuted={isMuted} onToggle={toggleMute} className="absolute top-4 right-4" />
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs">Ctrl+Shift+A for settings</div>

      {/* Keyframes */}
      <style>{`
        @keyframes roadScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes truckBob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
