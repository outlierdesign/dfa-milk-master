import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { GameConfig } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";
import driverView from "@/assets/driver_view.svg";

interface AttractModeV2Props {
  onStartGame: () => void;
  config: GameConfig;
}

/* ── Procedural 8-bit road scene ─────────────────────────────── */
const VP_X = 512;          // vanishing-point X (centre)
const VP_Y = 230;          // vanishing-point Y (~40 % down)
const W = 1024;
const H = 576;
const BAND_COUNT = 24;     // number of field strips
const GREENS = ["#3A7D2C", "#4CA83A"];
const ROAD_W_TOP = 6;      // road half-width at VP
const ROAD_W_BOT = 420;    // road half-width at bottom

function InfiniteRoadSVG() {
  const bandH = (H - VP_Y) / BAND_COUNT;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#FFD4A0" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={W} height={VP_Y} fill="url(#sky)" />

      {/* Horizon trees */}
      {[-320, -200, -120, 80, 160, 280, 350].map((dx, i) => (
        <polygon key={`tree-${i}`}
          points={`${VP_X + dx - 12},${VP_Y} ${VP_X + dx + 12},${VP_Y} ${VP_X + dx},${VP_Y - 28 - (i % 3) * 10}`}
          fill="#2D6B22" />
      ))}

      {/* Animated field bands – two copies for seamless loop */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${bandH * 2}`} dur="0.6s" repeatCount="indefinite" />

        {Array.from({ length: BAND_COUNT + 4 }).map((_, i) => {
          const y = VP_Y + (i - 2) * bandH;
          return (
            <rect key={`band-${i}`} x="0" y={y} width={W} height={bandH + 0.5}
              fill={GREENS[i % 2]} />
          );
        })}
      </g>

      {/* Road surface */}
      <polygon
        points={`${VP_X - ROAD_W_TOP},${VP_Y} ${VP_X + ROAD_W_TOP},${VP_Y} ${VP_X + ROAD_W_BOT},${H} ${VP_X - ROAD_W_BOT},${H}`}
        fill="#555555" />

      {/* Road edge lines */}
      <line x1={VP_X - ROAD_W_TOP} y1={VP_Y} x2={VP_X - ROAD_W_BOT} y2={H} stroke="#ffffff" strokeWidth="4" />
      <line x1={VP_X + ROAD_W_TOP} y1={VP_Y} x2={VP_X + ROAD_W_BOT} y2={H} stroke="#ffffff" strokeWidth="4" />

      {/* Centre dashes */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${(H - VP_Y) / 18}`} dur="0.35s" repeatCount="indefinite" />
        {Array.from({ length: 22 }).map((_, i) => {
          const t = (i - 2) / 18;
          const y = VP_Y + t * (H - VP_Y);
          const dashH = ((H - VP_Y) / 18) * 0.4;
          const w = 2 + t * 8;
          return (
            <rect key={`dash-${i}`} x={VP_X - w / 2} y={y} width={w} height={dashH}
              fill="#ffaa22" opacity={Math.min(1, 0.3 + t * 0.7)} />
          );
        })}
      </g>
    </svg>
  );
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
        <h1 className="text-3xl md:text-6xl font-bold text-white mb-1"
          style={{ fontFamily: "'Press Start 2P', monospace" }}>
          FILL THE TANK
        </h1>
        <p className="text-sm md:text-lg text-emerald-400 font-medium"
          style={{ fontFamily: "'Press Start 2P', monospace" }}>
          3 rounds. Real consequences.
        </p>
      </div>

      {/* Road scene viewport */}
      <div className="w-full max-w-xl mb-4 rounded-lg overflow-hidden border-2 border-slate-600 shadow-2xl relative"
        style={{ imageRendering: "pixelated" }}>
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {/* Procedural 8-bit road */}
          <InfiniteRoadSVG />

          {/* Driver view SVG overlay */}
          <img src={driverView} alt=""
            className="absolute inset-0 w-full h-full object-cover z-[2] pointer-events-none" />

          {/* Scanline overlay */}
          <div className="absolute inset-0 z-[3] pointer-events-none opacity-[0.06]"
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
