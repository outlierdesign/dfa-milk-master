import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { GameConfig } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";
import driverView from "@/assets/driver_view.svg";

interface AttractModeV2Props {
  onStartGame: () => void;
  config: GameConfig;
}

/* ── 8-bit countryside road scene ────────────────────────────── */
const W = 320;
const H = 240;
const HORIZON = 95;
const CX = W / 2;

// Palette
const SKY        = "#2a9d8f";
const SKY_LIGHT  = "#40b5a6";
const CLOUD_A    = "#e8c170";
const CLOUD_B    = "#f0d090";
const MTN_FAR    = "#3a8a7a";
const MTN_MID    = "#2d7a6a";
const MTN_NEAR   = "#1a5c4a";
const TREE_DARK  = "#1a3a1a";
const TREE_MID   = "#2d5a2a";
const TREE_LIGHT = "#4a7a3a";
const BUSH_A     = "#c89030";
const BUSH_B     = "#a07020";
const GRASS_A    = "#5a8a3a";
const GRASS_B    = "#4a7a2a";
const ASPHALT    = "#3a3a40";
const ASPHALT_B  = "#333338";
const ROAD_EDGE  = "#555560";
const DASH_COL   = "#e0e0d0";
const POST_COL   = "#6a5a4a";

const ROAD_K = 0.85;
const SCANLINE_STEP = 2;
const ROAD_LINES = H - HORIZON;
const STRIPE_H = 5;

function InfiniteRoadSVG() {
  const scanlines: { y: number; roadW: number }[] = [];
  for (let y = HORIZON + 1; y < H; y += SCANLINE_STEP) {
    const dist = y - HORIZON;
    scanlines.push({ y, roadW: Math.floor(ROAD_K * dist) });
  }

  // Tree positions (x offsets from center, height multiplier)
  const treesLeft = [
    { x: -125, h: 80, w: 18 }, { x: -108, h: 95, w: 22 },
    { x: -92, h: 70, w: 16 }, { x: -78, h: 85, w: 20 },
    { x: -65, h: 60, w: 14 }, { x: -55, h: 50, w: 12 },
  ];
  const treesRight = [
    { x: 125, h: 80, w: 18 }, { x: 108, h: 95, w: 22 },
    { x: 92, h: 70, w: 16 }, { x: 78, h: 85, w: 20 },
    { x: 65, h: 60, w: 14 }, { x: 55, h: 50, w: 12 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}>

      {/* Sky */}
      <rect x="0" y="0" width={W} height={HORIZON + 20} fill={SKY} />
      <rect x="0" y="0" width={W} height={40} fill={SKY_LIGHT} />

      {/* Pixel clouds */}
      {[
        { x: 40, y: 12, w: 35, h: 8 },
        { x: 90, y: 18, w: 25, h: 6 },
        { x: 200, y: 8, w: 40, h: 10 },
        { x: 250, y: 20, w: 30, h: 7 },
        { x: 140, y: 25, w: 20, h: 5 },
      ].map((c, i) => (
        <g key={`cloud-${i}`}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={CLOUD_A} />
          <rect x={c.x + 2} y={c.y + 1} width={c.w - 4} height={c.h - 3} fill={CLOUD_B} />
        </g>
      ))}

      {/* Distant mountains */}
      <polygon points={`0,${HORIZON + 15} 60,55 120,${HORIZON + 10} 0,${HORIZON + 15}`} fill={MTN_FAR} />
      <polygon points={`80,${HORIZON + 15} 140,45 200,${HORIZON + 10} 80,${HORIZON + 15}`} fill={MTN_MID} />
      <polygon points={`170,${HORIZON + 15} 230,50 290,${HORIZON + 12} 170,${HORIZON + 15}`} fill={MTN_FAR} />
      <polygon points={`250,${HORIZON + 15} 300,60 ${W},${HORIZON + 10} 250,${HORIZON + 15}`} fill={MTN_MID} />
      {/* Near hills */}
      <polygon points={`0,${HORIZON + 15} 80,${HORIZON - 5} 160,${HORIZON + 15}`} fill={MTN_NEAR} />
      <polygon points={`160,${HORIZON + 15} 240,${HORIZON - 8} ${W},${HORIZON + 15}`} fill={MTN_NEAR} />

      {/* Tall cypress/pine trees — LEFT side */}
      {treesLeft.map((t, i) => {
        const tx = CX + t.x;
        const baseY = HORIZON + 15;
        const colors = [TREE_DARK, TREE_MID, TREE_LIGHT];
        return (
          <g key={`tl-${i}`}>
            {/* Trunk */}
            <rect x={tx - 1} y={baseY - t.h + 10} width={3} height={t.h - 8} fill="#2a1a0a" />
            {/* Canopy — layered triangles */}
            <polygon points={`${tx - t.w / 2},${baseY - 5} ${tx + t.w / 2},${baseY - 5} ${tx},${baseY - t.h}`}
              fill={colors[i % 3]} />
            <polygon points={`${tx - t.w / 2 + 2},${baseY - t.h * 0.4} ${tx + t.w / 2 - 2},${baseY - t.h * 0.4} ${tx},${baseY - t.h + 5}`}
              fill={colors[(i + 1) % 3]} />
          </g>
        );
      })}

      {/* Tall cypress/pine trees — RIGHT side */}
      {treesRight.map((t, i) => {
        const tx = CX + t.x;
        const baseY = HORIZON + 15;
        const colors = [TREE_DARK, TREE_MID, TREE_LIGHT];
        return (
          <g key={`tr-${i}`}>
            <rect x={tx - 1} y={baseY - t.h + 10} width={3} height={t.h - 8} fill="#2a1a0a" />
            <polygon points={`${tx - t.w / 2},${baseY - 5} ${tx + t.w / 2},${baseY - 5} ${tx},${baseY - t.h}`}
              fill={colors[i % 3]} />
            <polygon points={`${tx - t.w / 2 + 2},${baseY - t.h * 0.4} ${tx + t.w / 2 - 2},${baseY - t.h * 0.4} ${tx},${baseY - t.h + 5}`}
              fill={colors[(i + 1) % 3]} />
          </g>
        );
      })}

      {/* Golden bushes / autumn scrub along roadside */}
      {[...Array(10)].map((_, i) => {
        const side = i < 5 ? -1 : 1;
        const idx = i % 5;
        const yOff = HORIZON + 8 + idx * 8;
        const dist = yOff - HORIZON;
        const roadW = Math.floor(ROAD_K * dist);
        const edgeX = CX + side * (roadW + 8 + idx * 6);
        return (
          <g key={`bush-${i}`}>
            <rect x={edgeX - 8} y={yOff - 4} width={16} height={8}
              fill={idx % 2 === 0 ? BUSH_A : BUSH_B} />
            <rect x={edgeX - 6} y={yOff - 6} width={12} height={4}
              fill={idx % 2 === 0 ? BUSH_B : BUSH_A} />
          </g>
        );
      })}

      {/* Animated green field bands + road */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${SCANLINE_STEP * 2}`}
          dur="0.14s" repeatCount="indefinite" />

        {scanlines.map((sl, i) => {
          const shoulderW = Math.floor(sl.roadW * 1.4);
          const stripeGroup = Math.floor(i / STRIPE_H);
          const isEven = stripeGroup % 2 === 0;

          return (
            <g key={`sl-${i}`}>
              {/* Green field background */}
              <rect x="0" y={sl.y} width={W} height={SCANLINE_STEP} fill={isEven ? GRASS_A : GRASS_B} />
              {/* Road shoulder (slightly different green) */}
              <rect x={CX - shoulderW} y={sl.y} width={shoulderW * 2} height={SCANLINE_STEP}
                fill={isEven ? GRASS_B : GRASS_A} />
              {/* Road edge stripe */}
              <rect x={CX - sl.roadW - 2} y={sl.y} width={4} height={SCANLINE_STEP} fill={ROAD_EDGE} />
              <rect x={CX + sl.roadW - 2} y={sl.y} width={4} height={SCANLINE_STEP} fill={ROAD_EDGE} />
              {/* Road surface */}
              <rect x={CX - sl.roadW} y={sl.y} width={sl.roadW * 2} height={SCANLINE_STEP}
                fill={i % 8 < 4 ? ASPHALT : ASPHALT_B} />
            </g>
          );
        })}
      </g>

      {/* Road posts */}
      {[3, 8, 15, 25].map((idx, i) => {
        if (idx >= scanlines.length) return null;
        const sl = scanlines[idx];
        const postH = 4 + idx * 0.3;
        return (
          <g key={`post-${i}`}>
            <rect x={CX - sl.roadW - 6} y={sl.y - postH} width={2} height={postH} fill={POST_COL} />
            <rect x={CX + sl.roadW + 4} y={sl.y - postH} width={2} height={postH} fill={POST_COL} />
          </g>
        );
      })}

      {/* Centre dashes — animated */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${ROAD_LINES / 14}`}
          dur="0.25s" repeatCount="indefinite" />
        {Array.from({ length: 18 }).map((_, i) => {
          const t = (i - 2) / 14;
          const y = HORIZON + t * ROAD_LINES;
          const dashH = (ROAD_LINES / 14) * 0.35;
          const w = Math.max(1, Math.floor(1 + t * 3));
          return (
            <rect key={`dash-${i}`} x={CX - Math.floor(w / 2)} y={y}
              width={w} height={dashH}
              fill={DASH_COL} opacity={Math.min(1, 0.4 + t * 0.6)} />
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
