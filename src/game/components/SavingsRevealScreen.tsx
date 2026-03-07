import { useState, useCallback, useEffect, useRef } from "react";

interface SavingsRevealScreenProps {
  onComplete: () => void;
}

const STACKS = [
  { label: "Milk Agitation Time", desc: "Lost time and energy spent mixing slurry." },
  { label: "Trips to the Weighbridge", desc: "Transport time and administrative inefficiency." },
  { label: "Fuel & Machine Wear", desc: "Extra tractor and pump usage." },
  { label: "Labour Hours", desc: "Manual handling and time lost." },
];

const AMOUNT_PER_STACK = 10_000;
const TOTAL = STACKS.length * AMOUNT_PER_STACK;

export function SavingsRevealScreen({ onComplete }: SavingsRevealScreenProps) {
  const [activated, setActivated] = useState<boolean[]>([false, false, false, false]);
  const [flyingBills, setFlyingBills] = useState<{ id: number; stackIdx: number }[]>([]);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const billIdRef = useRef(0);
  const completedRef = useRef(false);

  const activatedCount = activated.filter(Boolean).length;
  const remaining = TOTAL - activatedCount * AMOUNT_PER_STACK;
  const allDone = activatedCount === STACKS.length;

  const handleSwitch = useCallback((idx: number) => {
    if (activated[idx]) return;
    setActivated((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    // Spawn flying bills
    const newBills = Array.from({ length: 6 }, (_, i) => ({
      id: billIdRef.current++,
      stackIdx: idx,
    }));
    setFlyingBills((prev) => [...prev, ...newBills]);

    // Clean up bills after animation
    setTimeout(() => {
      setFlyingBills((prev) => prev.filter((b) => !newBills.find((nb) => nb.id === b.id)));
    }, 1200);
  }, [activated]);

  // Auto-transition after all switches activated
  useEffect(() => {
    if (allDone && !completedRef.current) {
      completedRef.current = true;
      setShowFinalMessage(true);
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [allDone, onComplete]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden select-none">
      {/* Title */}
      <div className="text-center mb-6 z-10">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-wider mb-1"
          style={{ fontFamily: "'Courier New', monospace", color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.5)" }}
        >
          SWITCH ON TO PIPER
        </h1>
        <p className="text-slate-400 text-sm md:text-base">Flip the switches to recover your hidden costs</p>
      </div>

      {/* Main content area */}
      <div className="flex items-end justify-center gap-4 md:gap-8 w-full max-w-5xl px-4 z-10">
        {/* Four stacks */}
        {STACKS.map((stack, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3 flex-1 max-w-[180px]">
            {/* Cash stack */}
            <div className={`relative transition-all duration-500 ${activated[idx] ? "opacity-0 scale-75 -translate-y-4" : "opacity-100"}`}>
              <CashStack amount={AMOUNT_PER_STACK} />
            </div>

            {/* Label */}
            <div className="text-center min-h-[60px]">
              <p className="text-xs md:text-sm font-bold text-amber-400" style={{ fontFamily: "'Courier New', monospace" }}>
                {stack.label}
              </p>
              <p className="text-[10px] md:text-xs text-slate-500 mt-1">{stack.desc}</p>
            </div>

            {/* Switch */}
            <IndustrialSwitch isOn={activated[idx]} onToggle={() => handleSwitch(idx)} />

            {/* Caption */}
            {activated[idx] && (
              <p
                className="text-[10px] md:text-xs text-emerald-400 text-center animate-fade-in"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                Money back in your pocket!
              </p>
            )}
          </div>
        ))}

        {/* Tanker */}
        <div className="flex flex-col items-center ml-4 md:ml-8">
          <div className={`relative transition-all duration-700 ${allDone ? "scale-105" : ""}`}>
            <TankerIcon fillLevel={activatedCount / STACKS.length} />
          </div>
        </div>
      </div>

      {/* Flying bills */}
      {flyingBills.map((bill) => (
        <FlyingBill key={bill.id} stackIdx={bill.stackIdx} />
      ))}

      {/* Counter */}
      <div className="mt-8 z-10">
        <div
          className="text-4xl md:text-5xl font-bold tabular-nums"
          style={{
            fontFamily: "'Courier New', monospace",
            color: remaining > 0 ? "#ef4444" : "#22c55e",
            textShadow: `0 0 30px ${remaining > 0 ? "rgba(239,68,68,0.5)" : "rgba(34,197,94,0.6)"}`,
            transition: "color 0.5s, text-shadow 0.5s",
          }}
        >
          ${remaining.toLocaleString()}
        </div>
        <p className="text-slate-500 text-xs text-center mt-1" style={{ fontFamily: "'Courier New', monospace" }}>
          ANNUAL HIDDEN COSTS
        </p>
      </div>

      {/* Final message */}
      {showFinalMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="bg-slate-900/90 border-2 border-emerald-400 rounded-lg px-8 py-6 text-center animate-scale-in"
            style={{ boxShadow: "0 0 60px rgba(34,197,94,0.4)" }}
          >
            <p className="text-2xl md:text-3xl font-bold text-emerald-400 mb-2" style={{ fontFamily: "'Courier New', monospace" }}>
              🎉 YOU SAVED $40,000/YEAR
            </p>
            <p className="text-slate-400 text-sm">with Piper Slurry Management</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flyToBill {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.8; transform: translate(var(--tx), -60px) scale(0.8); }
          100% { opacity: 0; transform: translate(var(--tx2), var(--ty)) scale(0.3); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

/* ---- Sub-components ---- */

function CashStack({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center">
      {/* Stack of pixel bills */}
      <div className="relative">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-16 h-4 md:w-20 md:h-5 rounded-sm border border-green-800"
            style={{
              background: `linear-gradient(135deg, #22c55e ${i * 5}%, #16a34a)`,
              marginTop: i === 0 ? 0 : -2,
              transform: `translateX(${(i % 2 === 0 ? 1 : -1) * 2}px)`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <span className="text-[8px] md:text-[10px] text-green-900 font-bold flex items-center justify-center h-full" style={{ fontFamily: "'Courier New', monospace" }}>
              $$$
            </span>
          </div>
        ))}
      </div>
      <span className="text-xs font-bold text-green-400 mt-2" style={{ fontFamily: "'Courier New', monospace" }}>
        ${amount.toLocaleString()}
      </span>
    </div>
  );
}

function IndustrialSwitch({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={isOn}
      className="relative w-14 h-24 md:w-16 md:h-28 rounded-md focus:outline-none transition-transform active:scale-95"
      style={{
        background: "linear-gradient(180deg, #6b7280, #374151, #1f2937)",
        border: "2px solid #4b5563",
        boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.4)",
        cursor: isOn ? "default" : "pointer",
      }}
    >
      {/* Switch track */}
      <div className="absolute inset-x-2 inset-y-3 rounded-sm" style={{ background: "#111827", border: "1px solid #374151" }}>
        {/* Indicator light */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-all duration-300"
          style={{
            background: isOn ? "#22c55e" : "#374151",
            boxShadow: isOn ? "0 0 12px #22c55e" : "none",
          }}
        />

        {/* Switch handle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 rounded-md transition-all duration-300"
          style={{
            top: isOn ? "8px" : "calc(100% - 40px)",
            background: isOn
              ? "linear-gradient(180deg, #d1d5db, #9ca3af)"
              : "linear-gradient(180deg, #9ca3af, #6b7280)",
            border: "2px solid #9ca3af",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <div className="w-full h-1 bg-gray-500 rounded-full mt-3 mx-auto" style={{ width: "60%" }} />
        </div>
      </div>

      {/* Label */}
      <span
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold whitespace-nowrap"
        style={{ fontFamily: "'Courier New', monospace", color: isOn ? "#22c55e" : "#9ca3af" }}
      >
        {isOn ? "ON" : "OFF"}
      </span>
    </button>
  );
}

function TankerIcon({ fillLevel }: { fillLevel: number }) {
  return (
    <div className="flex flex-col items-center">
      {/* Simple pixel tanker */}
      <div className="relative w-24 h-32 md:w-32 md:h-40">
        {/* Tanker body */}
        <div
          className="absolute bottom-4 w-full h-3/4 rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #475569, #334155)",
            border: "2px solid #64748b",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {/* Fill level */}
          <div
            className="absolute bottom-0 w-full transition-all duration-700 ease-out"
            style={{
              height: `${fillLevel * 100}%`,
              background: "linear-gradient(180deg, #fbbf24, #f59e0b, #d97706)",
              boxShadow: fillLevel > 0 ? "0 0 20px rgba(251,191,36,0.4)" : "none",
            }}
          />

          {/* Piper label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[10px] md:text-xs font-bold text-white/70 tracking-wider"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              PIPER
            </span>
          </div>
        </div>

        {/* Wheels */}
        <div className="absolute bottom-0 left-2 w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-800 border-2 border-gray-600" />
        <div className="absolute bottom-0 right-2 w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-800 border-2 border-gray-600" />
      </div>

      <span className="text-xs text-slate-500 mt-1" style={{ fontFamily: "'Courier New', monospace" }}>
        SAVINGS TANKER
      </span>
    </div>
  );
}

function FlyingBill({ stackIdx }: { stackIdx: number }) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: 20,
    height: 12,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    border: "1px solid #15803d",
    borderRadius: 2,
    left: `${15 + stackIdx * 18}%`,
    top: "40%",
    zIndex: 15,
    ["--tx" as string]: `${(4 - stackIdx) * 40 + Math.random() * 40}px`,
    ["--tx2" as string]: `${(4 - stackIdx) * 60 + Math.random() * 60}px`,
    ["--ty" as string]: `${80 + Math.random() * 40}px`,
    animation: `flyToBill ${0.8 + Math.random() * 0.4}s ease-in forwards`,
    animationDelay: `${Math.random() * 0.3}s`,
  };

  return <div style={style} />;
}
