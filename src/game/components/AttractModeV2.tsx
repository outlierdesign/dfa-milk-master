import { useEffect, useRef, useState } from "react";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { SoundToggle } from "./SoundToggle";
import { GameConfig } from "../constantsV2";
import piperLogo from "@/assets/piper-logo.png";
import driverView from "@/assets/driver_view.svg";

interface AttractModeV2Props {
  onStartGame: () => void;
  config: GameConfig;
}

/* ── Top Gear / Outrun style road ────────────────────────────── */
const W = 420;
const H = 240;
const HORIZON = 88;
const CX = W / 2;

// Palette — clean arcade style
const SKY         = "#68c8f0";
const SKY_TOP     = "#88d8ff";
const CLOUD       = "#ffffff";
const GRASS_A     = "#58a830";   // bright green
const GRASS_B     = "#489020";   // dark green
const SHOULDER_A  = "#a0a0a0";   // light grey shoulder
const SHOULDER_B  = "#888888";   // dark grey shoulder
const ROAD_A      = "#505058";   // road colour A
const ROAD_B      = "#484850";   // road colour B (subtle stripe)
const EDGE_WHITE  = "#e0e0e0";   // white road edge marks
const DASH_COL    = "#e8a020";   // yellow/orange center dashes

const ROAD_K = 1.05;            // road half-width scaling
const SHOULDER_K = 1.25;        // shoulder extends beyond road
const SCANLINE_STEP = 2;
const ROAD_LINES = H - HORIZON;
const STRIPE_H = 4;             // scanlines per stripe band
const CURVE_AMP = 0.0008;
const CURVE_PERIOD = 5000;

function curveOffset(y: number, curveFactor: number) {
  const dist = y - HORIZON;
  return Math.floor(curveFactor * dist * dist);
}

function InfiniteRoadSVG() {
  const [curvePhase, setCurvePhase] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      setCurvePhase(((ts - start) % CURVE_PERIOD) / CURVE_PERIOD);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const curveFactor = Math.sin(curvePhase * Math.PI * 2) * CURVE_AMP;

  const scanlines: { y: number; roadW: number; xOff: number }[] = [];
  for (let y = HORIZON + 1; y < H; y += SCANLINE_STEP) {
    const dist = y - HORIZON;
    scanlines.push({ y, roadW: Math.floor(ROAD_K * dist), xOff: curveOffset(y, curveFactor) });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}>

      {/* Sky — flat bands */}
      <rect x="0" y="0" width={W} height={HORIZON} fill={SKY} />
      <rect x="0" y="0" width={W} height={35} fill={SKY_TOP} />

      {/* Pixel clouds */}
      {[
        { x: 20, y: 8, w: 50, h: 14 },
        { x: 85, y: 14, w: 35, h: 10 },
        { x: 280, y: 6, w: 55, h: 16 },
        { x: 350, y: 16, w: 40, h: 11 },
      ].map((c, i) => (
        <g key={`cloud-${i}`}>
          <rect x={c.x} y={c.y + 3} width={c.w} height={c.h - 4} fill={CLOUD} />
          <rect x={c.x + 4} y={c.y} width={c.w - 8} height={c.h} fill={CLOUD} />
        </g>
      ))}

      {/* Horizon divider */}
      <rect x="0" y={HORIZON - 1} width={W} height={2} fill="#407020" />

      {/* Animated scanline road */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${SCANLINE_STEP * 2}`}
          dur="0.10s" repeatCount="indefinite" />

        {scanlines.map((sl, i) => {
          const shoulderW = Math.floor(sl.roadW * SHOULDER_K);
          const stripeGroup = Math.floor(i / STRIPE_H);
          const isEven = stripeGroup % 2 === 0;
          const cx = CX + sl.xOff;

          return (
            <g key={`sl-${i}`}>
              {/* Green field */}
              <rect x="0" y={sl.y} width={W} height={SCANLINE_STEP}
                fill={isEven ? GRASS_A : GRASS_B} />
              {/* Grey shoulder */}
              <rect x={cx - shoulderW} y={sl.y} width={shoulderW * 2} height={SCANLINE_STEP}
                fill={isEven ? SHOULDER_A : SHOULDER_B} />
              {/* Road surface */}
              <rect x={cx - sl.roadW} y={sl.y} width={sl.roadW * 2} height={SCANLINE_STEP}
                fill={isEven ? ROAD_A : ROAD_B} />
              {/* White edge marks (alternating) */}
              {isEven && (
                <>
                  <rect x={cx - sl.roadW - 1} y={sl.y} width={3} height={SCANLINE_STEP} fill={EDGE_WHITE} />
                  <rect x={cx + sl.roadW - 2} y={sl.y} width={3} height={SCANLINE_STEP} fill={EDGE_WHITE} />
                </>
              )}
            </g>
          );
        })}
      </g>

      {/* Centre dashes — animated orange/yellow */}
      <g>
        <animateTransform attributeName="transform" type="translate"
          from="0 0" to={`0 ${ROAD_LINES / 12}`}
          dur="0.18s" repeatCount="indefinite" />
        {Array.from({ length: 16 }).map((_, i) => {
          const t = (i - 2) / 12;
          const y = HORIZON + t * ROAD_LINES;
          const dashH = (ROAD_LINES / 12) * 0.4;
          const w = Math.max(1, Math.floor(2 + t * 5));
          const dxOff = curveOffset(y, curveFactor);
          return (
            <rect key={`dash-${i}`} x={CX + dxOff - Math.floor(w / 2)} y={y}
              width={w} height={dashH}
              fill={DASH_COL} opacity={Math.min(1, 0.3 + t * 0.7)} />
          );
        })}
      </g>

      {/* Lane divider dashes — left and right of center */}
      {[-0.35, 0.35].map((laneOffset, li) => (
        <g key={`lane-${li}`}>
          <animateTransform attributeName="transform" type="translate"
            from="0 0" to={`0 ${ROAD_LINES / 12}`}
            dur="0.18s" repeatCount="indefinite" />
          {Array.from({ length: 16 }).map((_, i) => {
            const t = (i - 2) / 12;
            const y = HORIZON + t * ROAD_LINES;
            const dashH = (ROAD_LINES / 12) * 0.3;
            const dist = y - HORIZON;
            const roadW = Math.floor(ROAD_K * dist);
            const laneX = CX + curveOffset(y, curveFactor) + Math.floor(roadW * laneOffset);
            const w = Math.max(1, Math.floor(1 + t * 3));
            return (
              <rect key={`ld-${li}-${i}`} x={laneX - Math.floor(w / 2)} y={y}
                width={w} height={dashH}
                fill={DASH_COL} opacity={Math.min(1, 0.2 + t * 0.6)} />
            );
          })}
        </g>
      ))}
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
