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

const ROAD_K = 1.35;            // road half-width scaling (wider)
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
  const [scrollOffset, setScrollOffset] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const SCROLL_SPEED = 60; // pixels per second
    const tick = (ts: number) => {
      if (start === null) { start = ts; lastTsRef.current = ts; }
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setCurvePhase(((ts - start) % CURVE_PERIOD) / CURVE_PERIOD);
      setScrollOffset(prev => prev + SCROLL_SPEED * dt);
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

      {/* Distant hills */}
      <polygon points={`0,${HORIZON} 30,${HORIZON - 18} 70,${HORIZON - 8} 110,${HORIZON - 22} 160,${HORIZON - 10} 190,${HORIZON}`} fill="#3a7828" />
      <polygon points={`150,${HORIZON} 200,${HORIZON - 15} 250,${HORIZON - 25} 300,${HORIZON - 12} 340,${HORIZON - 20} 380,${HORIZON - 8} ${W},${HORIZON}`} fill="#448830" />

      {/* Farm buildings & silos */}
      {/* Red barn — left side */}
      <rect x={65} y={HORIZON - 20} width={18} height={16} fill="#8b2020" />
      <rect x={65} y={HORIZON - 4} width={18} height={4} fill="#6a1818" />
      <polygon points={`63,${HORIZON - 20} 83,${HORIZON - 20} 74,${HORIZON - 28}`} fill="#5a1010" />
      <rect x={71} y={HORIZON - 10} width={6} height={10} fill="#4a0e0e" />

      {/* Tall silo — left of center */}
      <rect x={145} y={HORIZON - 30} width={8} height={26} fill="#c0c0c0" />
      <rect x={144} y={HORIZON - 32} width={10} height={4} fill="#a0a0a0" />
      <rect x={146} y={HORIZON - 34} width={6} height={3} fill="#888888" />

      {/* Small shed — right side */}
      <rect x={310} y={HORIZON - 14} width={14} height={10} fill="#8b6030" />
      <polygon points={`308,${HORIZON - 14} 326,${HORIZON - 14} 317,${HORIZON - 22}`} fill="#6a4820" />

      {/* Second silo — far right */}
      <rect x={355} y={HORIZON - 26} width={7} height={22} fill="#b8b8b8" />
      <rect x={354} y={HORIZON - 28} width={9} height={4} fill="#989898" />
      <rect x={355} y={HORIZON - 30} width={5} height={3} fill="#808080" />

      {/* Horizon tree line */}
      {[15, 40, 58, 80, 100, 130, 155, 175, 200, 225, 248, 270, 295, 320, 345, 370, 395].map((tx, i) => {
        const h = 10 + (i * 7) % 14;
        const w = 6 + (i * 3) % 5;
        const treeColor = i % 3 === 0 ? "#1a4a18" : i % 3 === 1 ? "#2a5a22" : "#1e5520";
        return (
          <g key={`htree-${i}`}>
            {/* Trunk */}
            <rect x={tx} y={HORIZON - h + 4} width={2} height={h - 3} fill="#2a1a0a" />
            {/* Canopy — pointed triangle */}
            <polygon points={`${tx - w / 2},${HORIZON - 1} ${tx + w / 2 + 1},${HORIZON - 1} ${tx + 1},${HORIZON - h}`}
              fill={treeColor} />
          </g>
        );
      })}

      {/* Horizon divider */}
      <rect x="0" y={HORIZON - 1} width={W} height={2} fill="#407020" />

      {/* Scanline road — scroll driven by RAF */}
      <g>
        {scanlines.map((sl, i) => {
          const shoulderW = Math.floor(sl.roadW * SHOULDER_K);
          const t = (sl.y - HORIZON) / ROAD_LINES; // 0 at horizon, 1 at bottom
          // Perspective-scaled stripe height: thin at horizon, wide at bottom
          const stripeScale = 2 + t * t * 16;
          // Scroll offset scaled by perspective — closer = moves faster
          const perspScroll = scrollOffset * (0.1 + t * t * 2);
          const stripePhase = Math.floor((sl.y + perspScroll) / stripeScale);
          const isEven = stripePhase % 2 === 0;
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
          <li className="flex items-center gap-2"><span>🚚</span>{config.loadsPerDay} loads a day</li>
          <li className="flex items-center gap-2"><span>⚖️</span>{(config.targetLoadLbs / 1000).toFixed(0)},000 lb loads</li>
          <li className="flex items-center gap-2"><span>🏭</span>23,000 gallon silo</li>
          <li className="flex items-center gap-2"><span>⚖️</span>Scaling in and out</li>
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
