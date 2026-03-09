import { useEffect, useState, useRef } from "react";
import milkTankerFullSvg from "@/assets/milk_tanker_full_v2.svg";
interface WeighbridgeDepartureOverlayProps {
  onComplete: () => void;
  fillLbs?: number;
  targetLbs?: number;
  roundNumber?: number;
  totalRounds?: number;
}

type Phase = "arriving" | "weighing" | "displaying" | "result" | "banner";

export function WeighbridgeDepartureOverlay({ onComplete, fillLbs = 0, targetLbs = 50000, roundNumber = 1, totalRounds = 3 }: WeighbridgeDepartureOverlayProps) {
  const [phase, setPhase] = useState<Phase>("arriving");
  const [truckX, setTruckX] = useState(-520);
  const [platformSunk, setPlatformSunk] = useState(false);
  const [meterVisible, setMeterVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  const isOver = fillLbs > targetLbs;
  const diff = Math.abs(fillLbs - targetLbs);
  const fillPercent = (fillLbs / targetLbs) * 100;

  useEffect(() => {
    const t1 = setTimeout(() => setTruckX(0), 50);
    const t2 = setTimeout(() => { setPlatformSunk(true); setPhase("weighing"); }, 1250);
    const t3 = setTimeout(() => { setMeterVisible(true); setPhase("displaying"); }, 1850);
    // Show round result after meter settles
    const t4 = setTimeout(() => { setResultVisible(true); setPhase("result"); }, 4200);
    // Show banner
    const t5 = setTimeout(() => { setBannerVisible(true); setPhase("banner"); }, 5500);
    // Auto-advance
    const t6 = setTimeout(() => onComplete(), 7500);

    return () => { [t1, t2, t3, t4, t5, t6].forEach(clearTimeout); };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)" }}
    >
      {/* Sky / background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: 2, height: 2,
            background: "#e2e8f0",
            top: `${Math.sin(i * 137.5) * 40 + 20}%`,
            left: `${((i * 61) % 100)}%`,
            opacity: 0.4 + (i % 3) * 0.2,
          }} />
        ))}
      </div>

      {/* Road strip */}
      <div className="absolute" style={{ bottom: 0, left: 0, right: 0, height: 80, background: "#1e293b", borderTop: "3px solid #334155" }}>
        {/* Road markings */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute" style={{ left: `${i * 14 + 2}%`, top: 36, width: 80, height: 6, background: "#f59e0b", opacity: 0.7 }} />
        ))}
      </div>

      {/* Weighbridge platform */}
      <WeighStation sunk={platformSunk} />

      {/* The pixel-art truck sliding in */}
      <div
        className="absolute"
        style={{
          bottom: 68,
          left: "50%",
          transform: `translateX(calc(-50% + ${truckX}px))`,
          transition: truckX === 0
            ? "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            : "none",
          zIndex: 10,
        }}
      >
        <MiniPixelTruck />
      </div>

      {/* Veeder-Root meter — slides to vertical center */}
      <div
        className="absolute w-[90vw] max-w-[400px] md:max-w-[400px]"
        style={{
          top: meterVisible ? "40%" : -220,
          left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 20,
        }}
      >
        <VeederRootMeter weightLbs={fillLbs} active={phase === "displaying" || phase === "banner"} />
      </div>

      {/* Round result summary */}
      <div
        className="absolute text-center"
        style={{
          top: resultVisible ? "62%" : "120%",
          left: "50%",
          transform: "translateX(-50%)",
          transition: "top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 25,
          whiteSpace: "nowrap",
        }}
      >
        <div className="text-slate-400 text-xs md:text-sm mb-1">
          Round {roundNumber} of {totalRounds}
        </div>
        <h2 className="font-black text-white text-xl md:text-2xl mb-2">
          {isOver ? "💥 Overfill!" : fillPercent >= 98 ? "🎯 Great Fill!" : "📦 Round Complete"}
        </h2>
        <div className="text-2xl md:text-3xl font-mono font-bold text-white">
          {Math.round(fillLbs).toLocaleString()} lbs
        </div>
        <div className={`text-base md:text-lg font-semibold mt-1 ${isOver ? "text-red-400" : "text-emerald-400"}`}>
          {isOver
            ? `+${Math.round(diff).toLocaleString()} lbs over`
            : `-${Math.round(diff).toLocaleString()} lbs under`}
        </div>
        <div className="text-slate-500 text-xs mt-1">
          {fillPercent.toFixed(1)}% of target
        </div>
      </div>

      {/* "Gone to Weighbridge" banner */}
      <div
        className="absolute text-center bottom-[280px] md:bottom-[300px]"
        style={{
          left: "50%",
          transform: "translateX(-50%)",
          opacity: bannerVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          zIndex: 25,
          whiteSpace: "nowrap",
        }}
      >
        <h2 className="font-black text-sky-300 text-lg md:text-xl" style={{ letterSpacing: 3, textShadow: "0 0 24px rgba(125,211,252,0.6)" }}>
          ⚖️ {roundNumber < totalRounds ? "Next round loading…" : "See your results…"}
        </h2>
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-full animate-bounce" style={{ width: 10, height: 10, background: "#7dd3fc", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Weighbridge platform with corner bolts ───────────────────────────────────
function WeighStation({ sunk }: { sunk: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        bottom: sunk ? 64 : 66,
        left: "50%",
        transform: "translateX(-50%)",
        transition: "bottom 0.3s ease",
        width: 480,
        zIndex: 5,
      }}
    >
      {/* Platform top surface */}
      <div
        className="relative border-2"
        style={{
          height: 18,
          background: "linear-gradient(180deg, #475569 0%, #334155 60%, #1e293b 100%)",
          borderColor: "#64748b",
          borderRadius: 2,
        }}
      >
        {/* WEIGHBRIDGE stencil text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{
            fontSize: 11, fontWeight: 900, letterSpacing: "0.3em",
            color: "#fbbf24", opacity: 0.85,
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}>
            WEIGHBRIDGE
          </span>
        </div>

        {/* Corner bolts */}
        {[6, "calc(100% - 14px)"].map((x, xi) =>
          [3, 9].map((y, yi) => (
            <div key={`${xi}-${yi}`} className="absolute rounded-full"
              style={{ left: x, top: y, width: 6, height: 6, background: "#94a3b8", border: "1px solid #475569" }}
            />
          ))
        )}

        {/* Sensor strips on edges */}
        <div className="absolute" style={{ left: 20, right: 20, top: -3, height: 3, background: "#fbbf24", opacity: 0.5, borderRadius: 1 }} />
        <div className="absolute" style={{ left: 20, right: 20, bottom: -3, height: 3, background: "#fbbf24", opacity: 0.5, borderRadius: 1 }} />
      </div>

      {/* Platform side — 3D pixel depth */}
      <div style={{ height: 10, background: "#0f172a", border: "1px solid #1e293b", borderTop: "none" }} />
    </div>
  );
}

// ─── Veeder-Root mechanical digit counter ────────────────────────────────────
function VeederRootMeter({ weightLbs, active }: { weightLbs: number; active: boolean }) {
  const rounded = Math.round(weightLbs);
  const digits = String(rounded).padStart(5, "0").split("").map(Number);

  return (
    <div
      style={{
        background: "#0f172a",
        border: "4px solid #374151",
        borderRadius: 6,
        padding: "12px 16px 10px",
        boxShadow: "0 0 40px rgba(251,191,36,0.15), inset 0 2px 8px rgba(0,0,0,0.8)",
      }}
    >
      {/* Header plate */}
      <div className="flex items-center justify-center gap-6 mb-2">
        <span style={{ fontSize: 10, letterSpacing: "0.35em", color: "#6b7280", fontWeight: 700 }}>VEEDER-ROOT</span>
        <span style={{ fontSize: 10, letterSpacing: "0.35em", color: "#6b7280", fontWeight: 700 }}>SERIES 7000</span>
      </div>

      {/* Main drum housing */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "#1c1917",
          border: "3px solid #292524",
          borderRadius: 4,
          padding: "8px 14px",
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.9)",
          position: "relative",
        }}
      >
        {/* Amber backlight strip */}
        <div className="absolute" style={{ height: 2, background: "rgba(251,191,36,0.3)", left: 20, right: 20, top: "50%" }} />

        {/* Digit drums */}
        {digits.map((d, i) => (
          <DigitDrum key={i} targetDigit={d} delayMs={i * 320 + 400} active={active} />
        ))}

        {/* Separator dot */}
        <div style={{ color: "#fbbf24", fontSize: 24, fontWeight: 900, lineHeight: 1, margin: "0 2px" }}>·</div>

        {/* LBS unit label */}
        <div
          style={{
            background: "#1c1917",
            border: "2px solid #374151",
            padding: "4px 8px",
            marginLeft: 4,
          }}
        >
          <span style={{ color: "#fbbf24", fontSize: 14, fontWeight: 900, letterSpacing: "0.1em" }}>LBS</span>
        </div>
      </div>

      {/* Status line below drums */}
      <div className="flex justify-center gap-8 mt-3 px-1">
        <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em" }}>TARE: 28,460 LBS</span>
        <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, letterSpacing: "0.05em" }}>
          GROSS: {(rounded + 28460).toLocaleString()} LBS
        </span>
      </div>
    </div>
  );
}

// ─── Individual digit drum with slot-machine roll animation ───────────────────
function DigitDrum({ targetDigit, delayMs, active }: { targetDigit: number; delayMs: number; active: boolean }) {
  const [settled, setSettled] = useState(false);
  const [displayDigit, setDisplayDigit] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!active) return;
    // Fast-roll through digits, then settle on target
    let current = 0;
    const rollInterval = 60; // ms per digit tick
    const rollCount = 15 + targetDigit; // overshoot and settle

    timerRef.current = setTimeout(() => {
      let ticks = 0;
      const tick = setInterval(() => {
        current = (current + 1) % 10;
        setDisplayDigit(current);
        ticks++;
        if (ticks >= rollCount) {
          clearInterval(tick);
          setDisplayDigit(targetDigit);
          setSettled(true);
        }
      }, rollInterval);
    }, delayMs);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [active, targetDigit, delayMs]);

  return (
    <div
      style={{
        width: 44,
        height: 56,
        background: "#0c0a09",
        border: "2px solid #292524",
        overflow: "hidden",
        position: "relative",
        borderRadius: 3,
        boxShadow: "inset 0 3px 8px rgba(0,0,0,0.9), inset 0 -3px 8px rgba(0,0,0,0.6)",
      }}
    >
      {/* Amber glow backlight */}
      <div className="absolute inset-0" style={{ background: "rgba(251,191,36,0.04)", zIndex: 0 }} />

      {/* Top shadow band */}
      <div className="absolute top-0 left-0 right-0 z-10" style={{ height: 14, background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />
      {/* Bottom shadow band */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ height: 14, background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)" }} />

      {/* Centre highlight line */}
      <div className="absolute left-0 right-0 z-10" style={{ top: "50%", transform: "translateY(-50%)", height: 1, background: "rgba(251,191,36,0.3)" }} />

      {/* The digit */}
      <div
        className="absolute inset-0 flex items-center justify-center z-5"
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 32,
          fontWeight: 900,
          color: settled ? "#fbbf24" : "#f59e0b",
          textShadow: settled ? "0 0 12px rgba(251,191,36,0.8)" : "none",
          transition: settled ? "color 0.3s, text-shadow 0.3s" : "none",
          lineHeight: 1,
          transform: active && !settled ? "translateY(2px)" : "translateY(0)",
        }}
      >
        {displayDigit}
      </div>
    </div>
  );
}

// ─── Mini pixel-art truck for the weighbridge scene ──────────────────────────
function MiniPixelTruck() {
  return (
    <img
      src={milkTankerFullSvg}
      alt="Milk tanker"
      style={{ width: 420, height: "auto", imageRendering: "auto" }}
      draggable={false}
    />
  );
}
