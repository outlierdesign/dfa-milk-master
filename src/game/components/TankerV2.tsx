import tankerSvg from "@/assets/milk_tanker.svg";
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

/**
 * TankerV2 — renders the uploaded milk-tanker SVG with a live milk-fill level.
 *
 * The SVG has a transparent "window" in the tank barrel.
 * We layer:
 *   1. Milk fill div (rises from bottom, clipped to the barrel opening)
 *   2. SVG overlay on top (acts as the tank shell / frame)
 *   3. Target line & spill flash rendered as absolutely-positioned overlays
 *
 * SVG natural size: 384 × 150 (viewBox "0 0 384 150")
 * We render it at 512 × 200 (scale ≈ 1.333×).
 *
 * Transparent barrel opening in SVG coords (approximate, measured from the image):
 *   x: 5  →  297   (width ≈ 292)
 *   y: 12 →  118   (height ≈ 106)
 * Scaled to 512 × 200:
 *   left  : 5   / 384 * 512 ≈ 6.67  → 6px
 *   right  : (384 - 297) / 384 * 512 ≈ 116px from right → width = 512-6-116 = 390px
 *   top   : 12  / 150 * 200 ≈ 16px
 *   bottom: (150 - 118) / 150 * 200 ≈ 42px from bottom → height = 200-16-42 = 142px
 */

const SVG_W = 512;
const SVG_H = 200;

// Barrel opening bounds (pixels at SVG_W × SVG_H render size)
// Tweak these if the fill doesn't align perfectly
const BARREL = {
  left: 62,     // was 46 — barrel outline starts further right
  top: 32,      // was 18 — barrel top edge is lower
  right: 140,   // was 124 — barrel ends further from right edge
  bottom: 62,   // was 52 — barrel bottom edge is higher
};

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

  const barrelW = SVG_W - BARREL.left - BARREL.right;
  const barrelH = SVG_H - BARREL.top - BARREL.bottom;

  // Height of the milk column in pixels
  const milkH = (fillPct / 100) * barrelH;
  // Bottom position of target line (px from bottom of barrel)
  const targetFromBottom = (targetPct / 100) * barrelH;

  return (
    <div
      className="relative select-none"
      style={{ width: SVG_W, height: SVG_H, imageRendering: "pixelated" }}
    >
      {/* ── Layer 0: dark barrel interior background ── */}
      <div
        className="absolute"
        style={{
          left: BARREL.left,
          top: BARREL.top,
          width: barrelW,
          height: barrelH,
          background: "#0c1521",
          overflow: "hidden",
        }}
      >
        {/* ── Layer 1: milk fill (rises from bottom) ── */}
        {!isBlindMode && milkH > 0 && (
          <div
            className="absolute left-0 right-0 bottom-0 transition-all duration-75"
            style={{
              height: milkH,
              background:
                "linear-gradient(180deg, #FDFFF5 0%, #F5F7E8 50%, #EDF0DC 100%)",
            }}
          >
            {/* surface shimmer while filling */}
            {isFilling && (
              <div
                className="absolute top-0 left-0 right-0 animate-pulse"
                style={{ height: 3, background: "rgba(255,255,255,0.85)" }}
              />
            )}
            {/* body sheen */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{ height: "28%", background: "rgba(255,255,255,0.12)" }}
            />
          </div>
        )}

        {/* ── Layer 2: compartment rib dividers ── */}
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            className="absolute top-0 bottom-0"
            style={{
              left: `${pct}%`,
              width: 3,
              background: "rgba(30,58,95,0.55)",
              borderLeft: "1px solid rgba(96,165,250,0.18)",
              zIndex: 2,
            }}
          />
        ))}

        {/* ── Layer 3: target line ── */}
        {!isBlindMode && !spillTriggered && targetFromBottom > 0 && (
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: targetFromBottom,
              height: 2,
              background: "#34d399",
              boxShadow: "0 0 5px #34d399",
              zIndex: 3,
            }}
          />
        )}

        {/* ── Layer 4: overfill flash ── */}
        {spillTriggered && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "rgba(239,68,68,0.38)", zIndex: 4 }}
          />
        )}

        {/* ── Layer 5: blind-mode spill indicator ── */}
        {isBlindMode && spillTriggered && (
          <div
            className="absolute inset-0 flex items-center justify-center animate-pulse"
            style={{ background: "rgba(239,68,68,0.5)", zIndex: 5 }}
          >
            <span className="text-2xl">💥</span>
          </div>
        )}
      </div>

      {/* ── Layer 6: SVG tanker shell on top ── */}
      <img
        src={tankerSvg}
        alt="Milk tanker"
        width={SVG_W}
        height={SVG_H}
        className="absolute inset-0 pointer-events-none"
        style={{ imageRendering: "auto" }}
        draggable={false}
      />

      {/* ── Layer 7: spill drips above the cab ── */}
      {spillTriggered && (
        <div
          className="absolute"
          style={{
            top: BARREL.top - 10,
            left: BARREL.left + barrelW * 0.3,
            display: "flex",
            gap: 5,
            zIndex: 10,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-bounce"
              style={{
                width: 4,
                height: 16,
                background: "linear-gradient(180deg, #bae6fd 0%, transparent 100%)",
                animationDelay: `${i * 0.14}s`,
                animationDuration: "0.5s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
