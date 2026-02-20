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

          {/* Chassis / underframe */}
          <div
            className="absolute"
            style={{ left: 0, right: 0, bottom: 20, height: 10, background: "#1e293b", border: "2px solid #0f172a" }}
          />

          {/* ── TANK BODY — transparent cutaway view ── */}
          <div
            className="absolute"
            style={{ left: 6, right: 0, top: 4, bottom: 30, overflow: "hidden", position: "relative" }}
          >
            {/* Layer 0: Dark steel interior (the "inside" of the tank) */}
            <div
              className="absolute inset-0"
              style={{ background: "#0c1a2e", border: "3px solid #334155" }}
            />

            {/* Layer 1: Milk fill — rises from bottom, full width */}
            {!isBlindMode && (
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-75"
                style={{
                  height: `${fillPct}%`,
                  background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 20%, #bae6fd 60%, #7dd3fc 100%)",
                  zIndex: 1,
                }}
              >
                {/* Milk surface shimmer */}
                {isFilling && (
                  <div
                    className="absolute top-0 left-0 right-0 animate-pulse"
                    style={{ height: 4, background: "rgba(255,255,255,0.8)" }}
                  />
                )}
                {/* Milk body sheen */}
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{ height: "30%", background: "rgba(255,255,255,0.15)" }}
                />
              </div>
            )}

            {/* Layer 2: Vertical segment rib dividers (on top of milk) */}
            {[25, 50, 75].map((pct) => (
              <div
                key={pct}
                className="absolute top-0 bottom-0"
                style={{ left: `${pct}%`, width: 4, background: "#1e3a5f", border: "0 solid transparent", borderLeft: "1px solid #60a5fa22", borderRight: "1px solid #00000040", zIndex: 2 }}
              />
            ))}

            {/* Layer 3: Chrome rim highlight along top */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{ height: 3, background: "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)", zIndex: 3 }}
            />
            {/* Bottom rim */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: 3, background: "#334155", zIndex: 3 }}
            />

            {/* Layer 4: Dither rows for 16-bit depth on the interior walls */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: 0, right: 0,
                  top: 4 + i * 22,
                  height: 1,
                  background: "rgba(255,255,255,0.04)",
                  zIndex: 4,
                }}
              />
            ))}

            {/* Layer 5: Target line */}
            {!isBlindMode && !spillTriggered && (
              <div
                className="absolute left-0 right-0"
                style={{ bottom: `${targetPct}%`, height: 2, background: "#34d399", zIndex: 5, boxShadow: "0 0 4px #34d399" }}
              />
            )}

            {/* Layer 5: Overfill flash */}
            {spillTriggered && (
              <div
                className="absolute inset-0 animate-pulse"
                style={{ background: "rgba(239,68,68,0.35)", zIndex: 5 }}
              />
            )}

            {/* Layer 6: MILK text label */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 6, paddingBottom: 4 }}
            >
              <span
                className="font-black tracking-widest select-none"
                style={{
                  fontSize: 20,
                  letterSpacing: "0.3em",
                  color: fillPct > 55 ? "rgba(15,23,42,0.9)" : "rgba(148,163,184,0.7)",
                  textShadow: fillPct > 55
                    ? "1px 1px 0 rgba(255,255,255,0.3)"
                    : "1px 1px 0 rgba(0,0,0,0.6)",
                  transition: "color 0.3s",
                }}
              >
                MILK
              </span>
            </div>

            {/* Blind mode overfill indicator */}
            {isBlindMode && spillTriggered && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-600/40 animate-pulse border-4 border-red-500" style={{ zIndex: 7 }}>
                <span className="text-lg font-black text-white">💥</span>
              </div>
            )}

            {/* Left-side end cap (intake valve side) */}
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: 0, width: 14,
                background: "linear-gradient(90deg, #475569 0%, #64748b 60%, #334155 100%)",
                borderRight: "2px solid #1e293b",
                zIndex: 7,
              }}
            />

            {/* Right-side end cap */}
            <div
              className="absolute top-0 bottom-0"
              style={{
                right: 0, width: 10,
                background: "linear-gradient(270deg, #475569 0%, #64748b 60%, #334155 100%)",
                borderLeft: "2px solid #1e293b",
                zIndex: 7,
              }}
            />
          </div>

          {/* Top dome caps / hatches */}
          <div className="absolute" style={{ top: -8, left: 65, width: 30, height: 12, background: "#64748b", border: "2px solid #475569", borderBottom: "2px solid #334155" }} />
          <div className="absolute" style={{ top: -10, left: 150, width: 38, height: 14, background: "#64748b", border: "2px solid #475569", borderBottom: "2px solid #334155" }} />
          <div className="absolute" style={{ top: -8, right: 40, width: 30, height: 12, background: "#64748b", border: "2px solid #475569", borderBottom: "2px solid #334155" }} />
          {/* Hatch detail — dark circle centres */}
          <div className="absolute" style={{ top: -5, left: 72, width: 16, height: 6, background: "#1e293b", border: "1px solid #334155" }} />
          <div className="absolute" style={{ top: -6, left: 162, width: 14, height: 6, background: "#1e293b", border: "1px solid #334155" }} />

          {/* Rear marker lights */}
          <div className="absolute" style={{ left: 2, top: 18, width: 5, height: 8, background: "#ef4444", border: "1px solid #7f1d1d" }} />
          <div className="absolute" style={{ left: 2, top: 30, width: 5, height: 6, background: "#f59e0b", border: "1px solid #78350f" }} />

          {/* Pixel wheels — trailer (4 wheels) */}
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 30 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 68 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 210 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 248 }} />

          {/* Spill drips from top */}
          {spillTriggered && (
            <div className="absolute" style={{ top: 4, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-bounce"
                  style={{
                    width: 4, height: 20,
                    background: "linear-gradient(180deg, #bae6fd 0%, transparent 100%)",
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: "0.5s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            FIFTH WHEEL / COUPLING
        ══════════════════════════════════════════ */}
        <div
          style={{ width: 16, height: 12, background: "#475569", border: "2px solid #334155", marginBottom: 30, zIndex: 5, flexShrink: 0 }}
        />

        {/* ══════════════════════════════════════════
            CAB  (right side — truck faces right)
        ══════════════════════════════════════════ */}
        <div className="relative flex-shrink-0" style={{ width: 110, height: 120 }}>

          {/* Cab body — cobalt blue, pixel-art banded shading */}
          <div
            className="absolute"
            style={{
              left: 0, right: 0, top: 8, bottom: 20,
              background: "#1d4ed8",
              border: "2px solid #1e3a8a",
            }}
          >
            {/* Pixel shading bands */}
            <div className="absolute" style={{ left: 0, right: 0, top: 0, height: 3, background: "#3b82f6" }} />
            <div className="absolute" style={{ left: 0, right: 0, top: 3, height: 20, background: "#2563eb" }} />
            <div className="absolute" style={{ left: 0, right: 0, top: 23, bottom: 18, background: "#1d4ed8" }} />
            <div className="absolute" style={{ left: 0, right: 0, bottom: 0, height: 18, background: "#1e3a8a" }} />

            {/* Windscreen — large pixel pane */}
            <div
              className="absolute"
              style={{
                left: 8, right: 18, top: 5, height: 36,
                background: "#38bdf8",
                border: "2px solid #0369a1",
              }}
            >
              {/* Glass reflection highlight */}
              <div className="absolute" style={{ left: 3, top: 3, width: 10, height: 6, background: "rgba(255,255,255,0.6)" }} />
              <div className="absolute" style={{ left: 3, top: 3, right: 3, height: 1, background: "rgba(255,255,255,0.4)" }} />
              {/* Wiper */}
              <div className="absolute" style={{ bottom: 4, left: 4, right: 4, height: 1, background: "rgba(0,0,0,0.5)" }} />
            </div>

            {/* Door line pixel */}
            <div className="absolute" style={{ left: 18, top: 6, bottom: 0, width: 2, background: "#1e40af" }} />

            {/* Door handle */}
            <div className="absolute" style={{ left: 20, top: 30, width: 8, height: 3, background: "#93c5fd", border: "1px solid #1d4ed8" }} />

            {/* Side mirror — pixel block */}
            <div className="absolute" style={{ right: -8, top: 10, width: 8, height: 10, background: "#374151", border: "1px solid #4b5563" }} />
            <div className="absolute" style={{ right: -6, top: 12, width: 5, height: 6, background: "#60a5fa" }} />

            {/* Grille — right face of cab */}
            <div
              className="absolute"
              style={{ right: 0, bottom: 4, width: 16, top: 18, background: "#0f172a", border: "1px solid #1e293b", borderLeft: "2px solid #1e3a8a" }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="absolute w-full" style={{ top: 4 + i * 7, height: 3, background: "#374151" }} />
              ))}
            </div>

            {/* Headlight — amber pixel square */}
            <div className="absolute" style={{ right: 18, bottom: 7, width: 12, height: 12, background: "#fef08a", border: "2px solid #92400e" }} />
            {/* Headlight flare */}
            <div className="absolute" style={{ right: 16, bottom: 9, width: 4, height: 4, background: "#fff7ed", opacity: 0.8 }} />

            {/* Fuel tank — pixel rectangle below door */}
            <div className="absolute" style={{ left: 6, bottom: 2, width: 20, height: 10, background: "#374151", border: "1px solid #4b5563" }} />
            <div className="absolute" style={{ left: 8, bottom: 4, width: 4, height: 3, background: "#6b7280" }} />

            {/* Exhaust stacks */}
            <div className="absolute" style={{ left: 2, top: -22, width: 6, height: 24, background: "#374151", border: "1px solid #4b5563" }} />
            <div className="absolute" style={{ left: 11, top: -17, width: 5, height: 19, background: "#374151", border: "1px solid #4b5563" }} />
            {/* Stack tops */}
            <div className="absolute" style={{ left: 0, top: -24, width: 10, height: 4, background: "#1f2937" }} />
            <div className="absolute" style={{ left: 9, top: -19, width: 9, height: 3, background: "#1f2937" }} />
          </div>

          {/* Step / running board */}
          <div className="absolute" style={{ left: 4, bottom: 20, width: 26, height: 6, background: "#374151", border: "1px solid #4b5563" }} />
          {/* Step grip lines */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute" style={{ left: 6 + i * 6, bottom: 22, width: 2, height: 4, background: "#4b5563" }} />
          ))}

          {/* Cab wheels */}
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 8 }} />
          <PixelWheel style={{ position: "absolute", bottom: 0, left: 58 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Pixel-art wheel with lug nuts ───────────────────────────────────────────
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
        position: style?.position,
        bottom: style?.bottom as number,
        left: style?.left as number,
      }}
    >
      {/* Hub */}
      <div
        style={{
          width: 12,
          height: 12,
          background: "#94a3b8",
          border: "2px solid #475569",
          clipPath: "polygon(25% 0%,75% 0%,100% 25%,100% 75%,75% 100%,25% 100%,0% 75%,0% 25%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 4, height: 4, background: "#1e293b", borderRadius: 0 }} />
      </div>
    </div>
  );
}
