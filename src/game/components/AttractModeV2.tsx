import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { GameConfig } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";
import driverView from "@/assets/driver_view.svg";

interface AttractModeV2Props {
  onStartGame: () => void;
  config: GameConfig;
}

/* ── Authentic NES-style 8-bit road scene ───────────────────── */
const W = 320;             // arcade resolution width
const H = 240;             // arcade resolution height
const HORIZON = 100;       // horizon Y (~42% down)
const CX = W / 2;          // center X

// Strict 8-color palette
const SKY_DEEP   = "#1a1c4a";
const SKY_MID    = "#3a2f7a";
const SKY_PINK   = "#c24ca3";
const SUN_ORANGE = "#ff8a3c";
const GREEN_A    = "#3cff3c";
const GREEN_B    = "#0f8f0f";
const ASPHALT    = "#2a2a2a";
const ASPHALT_B  = "#222222";
const HORIZON_C  = "#0a0a12";
const DASH_COLOR = "#ffaa22";

// Road half-width scaling constant
const ROAD_K = 0.95;
// Shoulder extends beyond road
const SHOULDER_EXTRA = 0.35;

// Scanline counts
const ROAD_LINES = H - HORIZON;        // ~140 scanlines
const STRIPE_BASE_H = 6;               // stripe height at horizon (pixels)
const SCANLINE_STEP = 2;               // update width every 2px for stair-stepping

function InfiniteRoadSVG() {
  // Build sky bands (hard color bands, no gradients)
  const skyBands = [
    { y: 0,  h: 50, color: SKY_DEEP },
    { y: 50, h: 30, color: SKY_MID },
    { y: 80, h: 20, color: SKY_PINK },
  ];

  // Build road scanlines with perspective
  // Each scanline: road rect + shoulder rects + stripe color
  const scanlines: { y: number; roadW: number; stripeIdx: number }[] = [];
  let accY = 0;
  for (let y = HORIZON + 1; y < H; y += SCANLINE_STEP) {
    const dist = y - HORIZON;
    const roadHW = Math.floor(ROAD_K * dist);
    scanlines.push({ y, roadW: roadHW, stripeIdx: accY });
    accY++;
  }

  // Stripe height scales with perspective — use base stripe grouping
  const stripeCount = Math.ceil(scanlines.length / STRIPE_BASE_H);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}>

      {/* Sky — hard color bands */}
      {skyBands.map((b, i) => (
        <rect key={`sky-${i}`} x="0" y={b.y} width={W} height={b.h} fill={b.color} />
      ))}

      {/* Pixel sun — 16×16 circle, centered on horizon */}
      <rect x={CX - 8} y={HORIZON - 14} width={16} height={12} fill={SUN_ORANGE} rx="0" />
      <rect x={CX - 6} y={HORIZON - 16} width={12} height={2} fill="#ffc06e" />

      {/* Horizon line — 1px dark divider */}
      <rect x="0" y={HORIZON} width={W} height={1} fill={HORIZON_C} />

      {/* Animated shoulder stripes + road — wrapped in scrolling group */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${SCANLINE_STEP * 2}`}
          dur="0.12s" repeatCount="indefinite" />

        {/* Extra rows above for seamless scroll */}
        {scanlines.map((sl, i) => {
          const shoulderW = Math.floor(sl.roadW * (1 + SHOULDER_EXTRA));
          const stripeGroup = Math.floor((i) / STRIPE_BASE_H);
          const isEven = stripeGroup % 2 === 0;
          const greenColor = isEven ? GREEN_A : GREEN_B;

          return (
            <g key={`sl-${i}`}>
              {/* Full-width green background for this scanline */}
              <rect x="0" y={sl.y} width={W} height={SCANLINE_STEP} fill={greenColor} />
              {/* Shoulder (slightly wider than road) */}
              <rect x={CX - shoulderW} y={sl.y} width={shoulderW * 2} height={SCANLINE_STEP}
                fill={isEven ? GREEN_B : GREEN_A} />
              {/* Road surface */}
              <rect x={CX - sl.roadW} y={sl.y} width={sl.roadW * 2} height={SCANLINE_STEP}
                fill={i % 8 < 4 ? ASPHALT : ASPHALT_B} />
            </g>
          );
        })}
      </g>

      {/* Road edge lines (white) — static trapezoid lines */}
      <line x1={CX} y1={HORIZON} x2={CX - Math.floor(ROAD_K * ROAD_LINES)} y2={H}
        stroke="#ffffff" strokeWidth="1" />
      <line x1={CX} y1={HORIZON} x2={CX + Math.floor(ROAD_K * ROAD_LINES)} y2={H}
        stroke="#ffffff" strokeWidth="1" />

      {/* Centre dashes — animated */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${ROAD_LINES / 14}`}
          dur="0.25s" repeatCount="indefinite" />
        {Array.from({ length: 18 }).map((_, i) => {
          const t = (i - 2) / 14;
          const y = HORIZON + t * ROAD_LINES;
          const dashH = (ROAD_LINES / 14) * 0.35;
          const w = Math.max(1, Math.floor(1 + t * 4));
          return (
            <rect key={`dash-${i}`} x={CX - Math.floor(w / 2)} y={y}
              width={w} height={dashH}
              fill={DASH_COLOR} opacity={Math.min(1, 0.4 + t * 0.6)} />
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
