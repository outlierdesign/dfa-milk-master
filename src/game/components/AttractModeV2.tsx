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

  // Simple 8-bit tree as SVG group at a given x, y (base), size
  const tree = (x: number, y: number, s: number, key: number) => (
    <g key={key}>
      <rect x={x - s * 0.15} y={y - s * 0.5} width={s * 0.3} height={s * 0.5} fill="#5a3a1a" />
      <polygon points={`${x},${y - s * 1.6} ${x - s * 0.6},${y - s * 0.4} ${x + s * 0.6},${y - s * 0.4}`} fill="#1a7a2a" />
      <polygon points={`${x},${y - s * 2} ${x - s * 0.45},${y - s * 1} ${x + s * 0.45},${y - s * 1}`} fill="#22992e" />
    </g>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Piper logo */}
      <div className="mb-3 animate-fade-in">
        <img src={piperLogo} alt="Piper" className="h-12 md:h-16 object-contain" />
      </div>

      {/* Title */}
      <div className="text-center mb-3 animate-fade-in">
        <h1 className="text-3xl md:text-6xl font-bold text-white mb-1"
          style={{ fontFamily: "'Press Start 2P', monospace" }}>
          FILL THE TANK
        </h1>
        <p className="text-sm md:text-lg text-emerald-400 font-medium"
          style={{ fontFamily: "'Press Start 2P', monospace" }}>
          3 rounds. Real consequences.
        </p>
      </div>

      {/* Outrun-style road viewport */}
      <div className="w-full max-w-xl mb-4 rounded-lg overflow-hidden border-2 border-slate-600 shadow-2xl relative"
        style={{ imageRendering: "pixelated" }}>
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="none"
            style={{ imageRendering: "pixelated" }}>
            {/* Sky gradient */}
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a0a3e" />
                <stop offset="60%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#ffaa44" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="800" height="220" fill="url(#sky)" />

            {/* Sun */}
            <circle cx="400" cy="160" r="40" fill="#ff4466" />
            <rect x="0" y="155" width="800" height="3" fill="#1a0a3e" opacity="0.5" />
            <rect x="0" y="162" width="800" height="2" fill="#1a0a3e" opacity="0.4" />
            <rect x="0" y="168" width="800" height="2" fill="#1a0a3e" opacity="0.3" />
            <rect x="0" y="173" width="800" height="3" fill="#1a0a3e" opacity="0.2" />

            {/* Ground / grass — alternating strips for depth */}
            {Array.from({ length: 24 }).map((_, i) => {
              const y = 220 + i * (230 / 24);
              const h = 230 / 24 + 1;
              return (
                <rect key={`grass-${i}`} x="0" y={y} width="800" height={h}
                  fill={i % 2 === 0 ? "#1a7a2a" : "#22992e"} />
              );
            })}

            {/* Road surface — trapezoid from vanishing point */}
            <polygon points="395,220 405,220 680,450 120,450" fill="#333333" />

            {/* Road stripes — alternating dark/light bands */}
            {Array.from({ length: 12 }).map((_, i) => {
              const t = i / 12;
              const nextT = (i + 1) / 12;
              const y1 = 220 + t * 230;
              const y2 = 220 + nextT * 230;
              const lerpL = (a: number, b: number, p: number) => a + (b - a) * p;
              const x1L = lerpL(395, 120, t);
              const x1R = lerpL(405, 680, t);
              const x2L = lerpL(395, 120, nextT);
              const x2R = lerpL(405, 680, nextT);
              if (i % 2 === 0) return null;
              return (
                <polygon key={`road-${i}`}
                  points={`${x1L},${y1} ${x1R},${y1} ${x2R},${y2} ${x2L},${y2}`}
                  fill="#444444" />
              );
            })}

            {/* Road edge lines */}
            <line x1="395" y1="220" x2="120" y2="450" stroke="white" strokeWidth="3" />
            <line x1="405" y1="220" x2="680" y2="450" stroke="white" strokeWidth="3" />

            {/* Centre dashes — animated */}
            <g>
              <animateTransform attributeName="transform" type="translate" from="0 0" to="0 19.2" dur="0.4s" repeatCount="indefinite" />
              {Array.from({ length: 16 }).map((_, i) => {
                const t = i / 16;
                const y = 220 + t * 230;
                const h = (230 / 16) * 0.4;
                const w = 2 + t * 6;
                return (
                  <rect key={`dash-${i}`} x={400 - w / 2} y={y} width={w} height={h}
                    fill="white" opacity={0.4 + t * 0.6} />
                );
              })}
            </g>

            {/* Trees — left side */}
            {tree(60, 280, 18, 100)}
            {tree(30, 320, 24, 101)}
            {tree(80, 360, 30, 102)}
            {tree(15, 400, 38, 103)}
            {tree(90, 430, 42, 104)}

            {/* Trees — right side */}
            {tree(740, 280, 18, 200)}
            {tree(760, 320, 24, 201)}
            {tree(720, 360, 30, 202)}
            {tree(780, 400, 38, 203)}
            {tree(710, 430, 42, 204)}

            {/* Distant trees (horizon) */}
            {tree(150, 235, 8, 300)}
            {tree(200, 232, 7, 301)}
            {tree(280, 230, 6, 302)}
            {tree(520, 230, 6, 303)}
            {tree(600, 232, 7, 304)}
            {tree(660, 235, 8, 305)}
          </svg>

          {/* Driver view SVG overlay */}
          <img src={driverView} alt=""
            className="absolute inset-0 w-full h-full object-cover z-[2] pointer-events-none" />

          {/* Scanline overlay */}
          <div className="absolute inset-0 z-[3] pointer-events-none opacity-[0.07]"
            style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)" }}
          />
        </div>
      </div>

      {/* Farm stats card */}
      <div className="w-full max-w-md mb-4 bg-slate-800/90 border-2 border-emerald-500/60 rounded-lg p-4 md:p-5 shadow-lg"
        style={{ animation: "cardPulse 3s ease-in-out infinite", fontFamily: "'Press Start 2P', monospace" }}>
        <h2 className="text-emerald-400 text-xs md:text-sm mb-3 text-center">This is your farm:</h2>
        <ul className="space-y-2 text-slate-200 text-[10px] md:text-xs">
          <li className="flex items-center gap-2"><span>🚛</span>{config.loadsPerDay} loads a day</li>
          <li className="flex items-center gap-2"><span>⚖️</span>{(config.targetLoadLbs / 1000).toFixed(0)},000 lb loads</li>
          <li className="flex items-center gap-2"><span>🏗️</span>23,000 gallon silo</li>
          <li className="flex items-center gap-2"><span>📏</span>Scaling in and out</li>
          <li className="flex items-center gap-2"><span>🧪</span>Sampling manually</li>
        </ul>
      </div>

      {/* TAP TO PLAY */}
      <div className="text-center mb-2">
        <button onClick={handleStartGame}
          className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm md:text-lg font-bold px-8 py-4 md:px-12 md:py-5 rounded-lg shadow-2xl animate-pulse transition-all hover:scale-105 border-2 border-emerald-300/30"
          style={{ fontFamily: "'Press Start 2P', monospace" }}>
          TAP TO PLAY
        </button>
      </div>

      <SoundToggle isMuted={isMuted} onToggle={toggleMute} className="absolute top-4 right-4" />
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs">Ctrl+Shift+A for settings</div>

      <style>{`
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
