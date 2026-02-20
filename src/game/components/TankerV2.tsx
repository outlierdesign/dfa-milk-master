import { GameConfig } from "../constantsV2";

interface TankerV2Props {
  currentFill: number;
  targetFill: number;
  maxFill?: number;
  isFilling: boolean;
  spillTriggered: boolean;
  spillAmount: number;
  config: GameConfig;
  isBlindMode?: boolean;
}

// ─── 16-bit pixel-art tanker, facing RIGHT (trailer left → cab right) ────────
export function TankerV2({
  currentFill,
  targetFill,
  maxFill,
  isFilling,
  spillTriggered,
  config,
  isBlindMode = false,
}: TankerV2Props) {
  const capacity = maxFill ?? config.maxAllowedFill;
  const fillPct = Math.min((currentFill / capacity) * 100, 100);
  const targetPct = (targetFill / capacity) * 100;

  return (
    <div className="relative select-none" style={{ imageRendering: "pixelated" }}>
      <div className="relative flex items-end gap-0">

        {/* ══════════════════════════════════════════
            TANK TRAILER  (left side, faces right)
        ══════════════════════════════════════════ */}
        <div className="relative" style={{ width: 340, height: 120 }}>

          {/* Chassis / underframe — dark pixel slab */}
          <div
            className="absolute bg-slate-800 border-2 border-slate-950"
            style={{ left: 0, right: 0, bottom: 20, height: 10 }}
          />

          {/* Main tank body — stainless steel pixel blocks */}
          <div
            className="absolute border-2 border-slate-600 overflow-hidden"
            style={{
              left: 6, right: 0, top: 4, bottom: 30,
              background: "linear-gradient(180deg, #cbd5e1 0%, #cbd5e1 30%, #94a3b8 31%, #94a3b8 50%, #cbd5e1 51%, #cbd5e1 70%, #64748b 71%, #64748b 100%)",
            }}
          >
            {/* Dither stripe rows for 16-bit depth */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="absolute w-full" style={{ top: i * 14, height: 2, background: i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)" }} />
            ))}

            {/* MILK text — pixel style */}
            <div
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              style={{ paddingBottom: 4 }}
            >
              <span
                className="font-black tracking-widest text-slate-900 select-none"
                style={{ fontSize: 22, letterSpacing: "0.25em", textShadow: "2px 2px 0 #e2e8f0, -1px -1px 0 #475569" }}
              >
                MILK
              </span>
            </div>

            {/* Fill window — chunky cutout showing milk level */}
            {!isBlindMode && (
              <div
                className="absolute border-2 border-slate-700 overflow-hidden"
                style={{ left: 12, top: 10, width: 40, bottom: 10, background: "#1e293b" }}
              >
                {/* Fill liquid */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-75"
                  style={{
                    height: `${fillPct}%`,
                    background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)",
                  }}
                >
                  {isFilling && (
                    <div className="absolute top-0 left-0 right-0 h-2 animate-pulse" style={{ background: "rgba(255,255,255,0.6)" }} />
                  )}
                </div>
                {/* Target line */}
                {!spillTriggered && (
                  <div
                    className="absolute left-0 right-0 z-10"
                    style={{ bottom: `${targetPct}%`, height: 2, background: "#34d399" }}
                  />
                )}
                {/* Overfill flash */}
                {spillTriggered && (
                  <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(239,68,68,0.5)" }} />
                )}
              </div>
            )}

            {/* Vertical segment dividers — pixel ribs */}
            {[25, 50, 75].map((pct) => (
              <div key={pct} className="absolute top-0 bottom-0" style={{ left: `${pct}%`, width: 3, background: "#475569" }} />
            ))}

            {/* Top dome caps — pixel squares */}
            <div className="absolute border-2 border-slate-600" style={{ top: -10, left: 60, width: 28, height: 12, background: "#94a3b8" }} />
            <div className="absolute border-2 border-slate-600" style={{ top: -10, left: 150, width: 36, height: 14, background: "#94a3b8" }} />
            <div className="absolute border-2 border-slate-600" style={{ top: -10, right: 40, width: 28, height: 12, background: "#94a3b8" }} />

            {/* Left-side end cap (intake valve side) */}
            <div
              className="absolute border-r-2 border-t-2 border-b-2 border-slate-700"
              style={{ left: 0, top: 0, bottom: 0, width: 14, background: "#64748b" }}
            />
            {/* Blind mode overfill indicator */}
            {isBlindMode && spillTriggered && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-600/40 animate-pulse border-4 border-red-500">
                <span className="text-lg font-black text-white">💥</span>
              </div>
            )}
          </div>

          {/* Rear lights — right side of trailer (front of truck direction) */}
          <div className="absolute" style={{ right: 2, top: 18, width: 6, height: 8, background: "#ef4444" }} />
          <div className="absolute" style={{ right: 2, top: 30, width: 6, height: 6, background: "#f59e0b" }} />

          {/* Pixel wheels — trailer (4 square-ish wheels) */}
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 30 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 70 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 210 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 250 }} />

          {/* Spill drips */}
          {spillTriggered && (
            <div className="absolute" style={{ top: 4, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-bounce"
                  style={{
                    width: 4, height: 20,
                    background: "linear-gradient(180deg, #f8fafc 0%, transparent 100%)",
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: "0.5s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            COUPLING / FIFTH WHEEL
        ══════════════════════════════════════════ */}
        <div
          className="relative flex-shrink-0 border-2 border-slate-700"
          style={{ width: 16, height: 12, background: "#475569", marginBottom: 30, zIndex: 5 }}
        />

        {/* ══════════════════════════════════════════
            CAB  (right side — truck faces right)
        ══════════════════════════════════════════ */}
        <div className="relative flex-shrink-0" style={{ width: 110, height: 120 }}>

          {/* Cab body — pixel block, no border-radius */}
          <div
            className="absolute border-2 border-blue-950"
            style={{
              left: 0, right: 0, top: 8, bottom: 20,
              background: "linear-gradient(180deg, #1e40af 0%, #1e40af 40%, #1e3a8a 41%, #1e3a8a 70%, #172554 71%, #172554 100%)",
            }}
          >
            {/* Windscreen — pixel rectangle */}
            <div
              className="absolute border-2 border-slate-900"
              style={{ left: 10, right: 8, top: 6, height: 34, background: "linear-gradient(135deg, #bae6fd 0%, #7dd3fc 50%, #38bdf8 100%)" }}
            >
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
              {/* Wiper lines */}
              <div className="absolute" style={{ bottom: 4, left: 4, right: 4, height: 1, background: "rgba(0,0,0,0.4)" }} />
            </div>

            {/* Grille — pixel strips on right face */}
            <div className="absolute border-2 border-slate-950" style={{ right: 0, bottom: 6, width: 14, top: 20, background: "#0f172a" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="absolute w-full" style={{ top: 4 + i * 7, height: 3, background: "#374151" }} />
              ))}
            </div>

            {/* Headlight — pixel square, right face */}
            <div className="absolute" style={{ right: 16, bottom: 8, width: 10, height: 10, background: "#fef08a", border: "2px solid #92400e" }} />

            {/* Door line */}
            <div className="absolute" style={{ left: 14, top: 8, bottom: 0, width: 2, background: "#1d4ed8" }} />

            {/* Exhaust stacks */}
            <div className="absolute border border-slate-500" style={{ left: 2, top: -20, width: 6, height: 22, background: "#374151" }} />
            <div className="absolute border border-slate-500" style={{ left: 11, top: -16, width: 6, height: 18, background: "#374151" }} />

            {/* Cab dither highlight */}
            <div className="absolute" style={{ left: 0, top: 0, right: 0, height: 3, background: "rgba(255,255,255,0.2)" }} />
          </div>

          {/* Step / running board */}
          <div className="absolute border border-slate-700" style={{ left: 4, bottom: 20, width: 22, height: 6, background: "#374151" }} />

          {/* Cab wheels — 2 pixel wheels */}
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 10 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 58 }} />
        </div>
      </div>

      <style>{`
        @keyframes pixelBounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

// ─── Pixel-art wheel (octagonal via clip-path for retro look) ────────────────
function PixelWheel({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        ...style,
        width: 28,
        height: 28,
        background: "#0f172a",
        border: "3px solid #334155",
        clipPath: "polygon(25% 0%,75% 0%,100% 25%,100% 75%,75% 100%,25% 100%,0% 75%,0% 25%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Hub */}
      <div
        style={{
          width: 10,
          height: 10,
          background: "#f97316",
          border: "2px solid #7c2d12",
          clipPath: "polygon(25% 0%,75% 0%,100% 25%,100% 75%,75% 100%,25% 100%,0% 75%,0% 25%)",
        }}
      />
    </div>
  );
}
