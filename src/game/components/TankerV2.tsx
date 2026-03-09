import tankerShell from "@/assets/tanker_shell_cutaway.png";
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
 * TankerV2 — renders the cutaway tanker shell with animated milk fill.
 *
 * Layers (bottom to top):
 *   0. Dark barrel interior background (clipped to barrel shape)
 *   1. Milk fill (rises from bottom with fluid surface animation)
 *   2. Target line
 *   3. Tanker shell PNG overlay (transparent barrel, opaque frame)
 *   4. Spill / overfill effects
 *
 * The barrel interior zone is measured from the generated asset.
 * Asset is 1024×512. We render at 512×256 (or scale to fit).
 */

const RENDER_W = 540;
const RENDER_H = 270;

// Barrel interior bounds (px at RENDER_W × RENDER_H)
// These define the rectangular region where milk fill is visible
// Tuned to match the transparent barrel area in the cutaway asset
const BARREL = {
  left: 52,
  top: 24,
  right: 38,
  bottom: 100,
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

  const barrelW = RENDER_W - BARREL.left - BARREL.right;
  const barrelH = RENDER_H - BARREL.top - BARREL.bottom;

  // Height of the milk column in pixels
  const milkH = (fillPct / 100) * barrelH;
  // Bottom position of target line (px from bottom of barrel)
  const targetFromBottom = (targetPct / 100) * barrelH;

  return (
    <div
      className="relative select-none mx-auto"
      style={{ width: RENDER_W, height: RENDER_H }}
    >
      {/* ── Layer 0: dark barrel interior background ── */}
      <div
        className="absolute"
        style={{
          left: BARREL.left,
          top: BARREL.top,
          width: barrelW,
          height: barrelH,
          background: "linear-gradient(180deg, #0a1628 0%, #0c1a2e 100%)",
          borderRadius: "50% / 12%",
          overflow: "hidden",
        }}
      >
        {/* ── Layer 1: milk fill (rises from bottom) ── */}
        {!isBlindMode && milkH > 0 && (
          <div
            className="absolute left-0 right-0 bottom-0 transition-all duration-100"
            style={{ height: milkH }}
          >
            {/* Main milk body */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #FEFFF8 0%, #F8FAE8 30%, #F0F3DC 60%, #E8ECCC 100%)",
              }}
            />

            {/* Foam/froth layer at top */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: Math.min(8, milkH),
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,240,0.6) 100%)",
              }}
            />

            {/* Fluid surface wave animation while filling */}
            {isFilling && (
              <div
                className="absolute top-0 left-0 right-0"
                style={{ height: 6, overflow: "hidden" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "300%",
                    height: "100%",
                    background:
                      "repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.5) 8px, transparent 16px)",
                    animation: "milkWave 0.8s linear infinite",
                  }}
                />
              </div>
            )}

            {/* Subtle body sheen / reflection */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: "10%",
                height: "25%",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
              }}
            />

            {/* Subtle ripple circles while filling */}
            {isFilling && (
              <div className="absolute top-0 left-0 right-0" style={{ height: 12 }}>
                {[20, 45, 70].map((leftPct, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${leftPct}%`,
                      top: 0,
                      width: 10,
                      height: 4,
                      border: "1px solid rgba(255,255,255,0.4)",
                      animation: `milkRipple 1.2s ease-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Layer 2: target line ── */}
        {!isBlindMode && !spillTriggered && targetFromBottom > 0 && (
          <div
            className="absolute left-0 right-0"
            style={{
              bottom: targetFromBottom,
              height: 2,
              background: "#34d399",
              boxShadow: "0 0 6px #34d399, 0 0 12px rgba(52,211,153,0.3)",
              zIndex: 3,
            }}
          >
            {/* Target line label */}
            <div
              className="absolute font-mono text-[9px] font-bold"
              style={{
                right: 4,
                top: -12,
                color: "#34d399",
                textShadow: "0 0 4px rgba(0,0,0,0.8)",
              }}
            >
              TARGET
            </div>
          </div>
        )}

        {/* ── Overfill flash ── */}
        {spillTriggered && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "rgba(239,68,68,0.35)", zIndex: 4 }}
          />
        )}

        {/* ── Blind-mode spill indicator ── */}
        {isBlindMode && spillTriggered && (
          <div
            className="absolute inset-0 flex items-center justify-center animate-pulse"
            style={{ background: "rgba(239,68,68,0.5)", zIndex: 5 }}
          >
            <span className="text-2xl">💥</span>
          </div>
        )}
      </div>

      {/* ── Layer 3: Tanker shell overlay ── */}
      <img
        src={tankerShell}
        alt="Milk tanker cutaway"
        className="absolute inset-0 pointer-events-none"
        style={{
          width: RENDER_W,
          height: RENDER_H,
          objectFit: "fill",
        }}
        draggable={false}
      />

      {/* ── Layer 4: spill drips from top ── */}
      {spillTriggered && (
        <div
          className="absolute flex"
          style={{
            top: BARREL.top - 8,
            left: BARREL.left + barrelW * 0.2,
            gap: 8,
            zIndex: 10,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-bounce"
              style={{
                width: 3,
                height: 14,
                background:
                  "linear-gradient(180deg, #FEFFF8 0%, rgba(254,255,248,0) 100%)",
                animationDelay: `${i * 0.12}s`,
                animationDuration: "0.5s",
              }}
            />
          ))}
        </div>
      )}

      {/* CSS keyframes for fluid animations */}
      <style>{`
        @keyframes milkWave {
          0% { transform: translateX(0); }
          100% { transform: translateX(16px); }
        }
        @keyframes milkRipple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3, 1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
