import { useState, useCallback, useEffect, useRef } from "react";
import { useSoundEffects } from '../hooks/useSoundEffects';

export interface SavingsCosts {
  underfillCost: number;
  spillCost: number;
  agitationCost: number;
  weighbridgeCost: number;
  currency: string;
}

interface SavingsRevealPopupProps {
  costs: SavingsCosts;
  onComplete: () => void;
}

const STACKS_META = [
  { key: "agitationCost" as const, label: "Agitation Time", desc: "Lost time mixing milk each load." },
  { key: "weighbridgeCost" as const, label: "Weighbridge Trips", desc: "Transport & admin inefficiency." },
  { key: "underfillCost" as const, label: "Underfill Penalty", desc: "Extra loads to meet quota." },
  { key: "spillCost" as const, label: "Overfill / Spill", desc: "Wasted milk from overfilling." },
];

export function SavingsRevealPopup({ costs, onComplete }: SavingsRevealPopupProps) {
  const stacks = STACKS_META.map((s) => ({
    ...s,
    amount: costs[s.key],
  })).filter((s) => s.amount > 0);

  // If no costs, skip
  useEffect(() => {
    if (stacks.length === 0) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [stacks.length, onComplete]);

  const total = stacks.reduce((s, st) => s + st.amount, 0);
  const [activated, setActivated] = useState<boolean[]>(() => stacks.map(() => false));
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const { playMoo, playChaChing } = useSoundEffects();
  const [flyingBills, setFlyingBills] = useState<{ id: number; stackIdx: number }[]>([]);
  const billIdRef = useRef(0);
  const completedRef = useRef(false);

  const activatedCount = activated.filter(Boolean).length;
  const savedAmount = stacks.reduce((s, st, i) => s + (activated[i] ? st.amount : 0), 0);
  const remaining = total - savedAmount;
  const allDone = activatedCount === stacks.length && stacks.length > 0;

  const fmt = (n: number) => Math.round(n).toLocaleString();

  const handleSwitch = useCallback((idx: number) => {
    if (activated[idx]) return;
    setActivated((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    playMoo();
    const newBills = Array.from({ length: 6 }, () => ({
      id: billIdRef.current++,
      stackIdx: idx,
    }));
    playChaChing();
    setFlyingBills((prev) => [...prev, ...newBills]);
    setTimeout(() => {
      setFlyingBills((prev) => prev.filter((b) => !newBills.find((nb) => nb.id === b.id)));
    }, 1200);
  }, [activated]);

  useEffect(() => {
    if (allDone && !completedRef.current) {
      completedRef.current = true;
      setShowFinalMessage(true);
      const timer = setTimeout(onComplete, 6000);
      return () => clearTimeout(timer);
    }
  }, [allDone, onComplete]);

  if (stacks.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-amber-700/50 p-6 md:p-8 shadow-2xl overflow-hidden select-none">
        {/* Title */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl md:text-4xl font-bold tracking-wider mb-2"
            style={{ fontFamily: "'Courier New', monospace", color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.5)" }}
          >
            SWITCH ON TO PIPER
          </h2>
          <p className="text-slate-300 text-sm md:text-base">Want to make savings? Invest in Piper and recover wasted transportation costs</p>
        </div>

        {/* Stacks + Switches */}
        <div className="flex items-end justify-center gap-4 md:gap-6 mb-6">
          {stacks.map((stack, idx) => (
            <div key={stack.key} className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
              {/* Cash stack */}
              <div className={`relative transition-all duration-500 ${activated[idx] ? "opacity-0 scale-75 -translate-y-4" : "opacity-100"}`}>
                <CashStack amount={stack.amount} currency={costs.currency} />
              </div>

              {/* Label */}
              <div className="text-center min-h-[48px]">
                <p className="text-sm md:text-base font-black text-amber-400 uppercase tracking-wide" style={{ fontFamily: "'Courier New', monospace" }}>
                  {stack.label}
                </p>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">{stack.desc}</p>
              </div>

              {/* Switch */}
              <IndustrialSwitch isOn={activated[idx]} onToggle={() => handleSwitch(idx)} />

              {/* Caption */}
              {activated[idx] && (
                <p className="text-[10px] text-emerald-400 text-center animate-fade-in" style={{ fontFamily: "'Courier New', monospace" }}>
                  {costs.currency}{fmt(stack.amount)} recovered with Piper!
                </p>
              )}
            </div>
          ))}

          {/* Tanker */}
          <div className="flex flex-col items-center ml-2 md:ml-6">
            <TankerIcon fillLevel={stacks.length > 0 ? activatedCount / stacks.length : 0} />
          </div>
        </div>

        {/* Flying bills */}
        {flyingBills.map((bill) => (
          <FlyingBill key={bill.id} stackIdx={bill.stackIdx} totalStacks={stacks.length} />
        ))}

        {/* Counter */}
        <div className="text-center">
          <div
            className="text-3xl md:text-4xl font-bold tabular-nums"
            style={{
              fontFamily: "'Courier New', monospace",
              color: remaining > 0 ? "#ef4444" : "#22c55e",
              textShadow: `0 0 30px ${remaining > 0 ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.5)"}`,
              transition: "color 0.5s",
            }}
          >
            {costs.currency}{fmt(remaining)}
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1 font-bold" style={{ fontFamily: "'Courier New', monospace" }}>
            ANNUAL HIDDEN COSTS
          </p>
        </div>

        {/* Final message overlay */}
        {showFinalMessage && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/80 rounded-2xl">
            <div
              className="border-2 border-emerald-400 rounded-lg px-8 py-6 text-center animate-scale-in"
              style={{ boxShadow: "0 0 60px rgba(34,197,94,0.4)" }}
            >
              <p className="text-xl md:text-3xl font-bold text-emerald-400 mb-2" style={{ fontFamily: "'Courier New', monospace" }}>
                🎉 RECOVER {costs.currency}{fmt(total)}/YEAR
              </p>
              <p className="text-slate-300 text-sm md:text-base">Invest in Piper — precision metering that pays for itself</p>
            </div>
          </div>
        )}

        <style>{`
          @keyframes flyToBill {
            0% { opacity: 1; transform: translate(0, 0) scale(1); }
            50% { opacity: 0.8; transform: translate(var(--tx), -60px) scale(0.8); }
            100% { opacity: 0; transform: translate(var(--tx2), var(--ty)) scale(0.3); }
          }
          @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
          .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function CashStack({ amount, currency }: { amount: number; currency: string }) {
  const billCount = Math.min(Math.max(3, Math.ceil(amount / 5000)), 6);
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {Array.from({ length: billCount }, (_, i) => (
          <div
            key={i}
            className="w-14 h-3.5 md:w-18 md:h-4 rounded-sm border border-green-800"
            style={{
              background: `linear-gradient(135deg, #22c55e ${i * 5}%, #16a34a)`,
              marginTop: i === 0 ? 0 : -2,
              transform: `translateX(${(i % 2 === 0 ? 1 : -1) * 2}px)`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.3)",
              width: "3.5rem",
              height: "0.875rem",
            }}
          >
            <span className="text-[7px] md:text-[9px] text-green-900 font-bold flex items-center justify-center h-full" style={{ fontFamily: "'Courier New', monospace" }}>
              {currency}{currency}{currency}
            </span>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-bold text-green-400 mt-1.5" style={{ fontFamily: "'Courier New', monospace" }}>
        {currency}{Math.round(amount).toLocaleString()}
      </span>
    </div>
  );
}

function IndustrialSwitch({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex flex-col items-center gap-1 group"
      style={{ width: 72, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
    >
      {/* Metal mounting plate */}
      <div style={{
        width: 64, height: 88,
        background: 'linear-gradient(180deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
        borderRadius: 6,
        border: '2px solid #1f2937',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
        justifyContent: 'center', position: 'relative' as const, padding: '4px 0',
      }}>
        {/* Corner rivets */}
        {[[6,6],[52,6],[6,76],[52,76]].map(([x,y], i) => (
          <div key={i} style={{
            position: 'absolute' as const, left: x, top: y, width: 6, height: 6,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #9ca3af, #4b5563)',
            boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)',
          }} />
        ))}
        {/* Status LED */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', marginBottom: 4,
          background: isOn ? '#22c55e' : '#991b1b',
          boxShadow: isOn ? '0 0 6px #22c55e, 0 0 12px rgba(34,197,94,0.4)' : 'none',
          border: '1px solid rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
        }} />
        {/* Switch track */}
        <div style={{
          width: 28, height: 48, borderRadius: 4,
          background: '#111827',
          border: '2px solid #000',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
          position: 'relative' as const,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Switch lever */}
          <div style={{
            width: 22, height: 20, borderRadius: 3,
            position: 'absolute' as const,
            top: isOn ? 4 : 24,
            transition: 'top 0.15s ease-in-out',
            background: isOn
              ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)'
              : 'linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)',
            boxShadow: isOn
              ? '0 2px 0 #047857, inset 0 1px 0 rgba(255,255,255,0.3)'
              : '0 2px 0 #4b5563, inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1px solid rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Grip lines */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 12, height: 1,
                  background: 'rgba(0,0,0,0.25)',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                }} />
              ))}
            </div>
          </div>
        </div>
        {/* ON/OFF label */}
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 8, fontWeight: 700, letterSpacing: 1,
          color: isOn ? '#34d399' : '#6b7280',
          marginTop: 2, transition: 'color 0.2s',
          textShadow: isOn ? '0 0 4px rgba(52,211,153,0.5)' : 'none',
        }}>
          {isOn ? 'ON' : 'OFF'}
        </div>
      </div>
    </button>
  );
}

function TankerIcon({ fillLevel }: { fillLevel: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-28 md:w-28 md:h-36">
        <div
          className="absolute bottom-4 w-full h-3/4 rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #475569, #334155)",
            border: "2px solid #64748b",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="absolute bottom-0 w-full transition-all duration-700 ease-out"
            style={{
              height: `${fillLevel * 100}%`,
              background: "linear-gradient(180deg, #fbbf24, #f59e0b, #d97706)",
              boxShadow: fillLevel > 0 ? "0 0 20px rgba(251,191,36,0.4)" : "none",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] md:text-xs font-bold text-white/70 tracking-wider" style={{ fontFamily: "'Courier New', monospace" }}>
              PIPER
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-1.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gray-800 border-2 border-gray-600" />
        <div className="absolute bottom-0 right-1.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gray-800 border-2 border-gray-600" />
      </div>
      <span className="text-[10px] md:text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'Courier New', monospace" }}>
        SAVINGS
      </span>
    </div>
  );
}

function FlyingBill({ stackIdx, totalStacks }: { stackIdx: number; totalStacks: number }) {
  const xSpread = totalStacks > 0 ? (12 + stackIdx * (60 / totalStacks)) : 30;
  const style: React.CSSProperties = {
    position: "absolute",
    width: 16,
    height: 10,
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    border: "1px solid #15803d",
    borderRadius: 2,
    left: `${xSpread}%`,
    top: "40%",
    zIndex: 15,
    ["--tx" as string]: `${(totalStacks - stackIdx) * 30 + Math.random() * 40}px`,
    ["--tx2" as string]: `${(totalStacks - stackIdx) * 50 + Math.random() * 50}px`,
    ["--ty" as string]: `${60 + Math.random() * 40}px`,
    animation: `flyToBill ${0.8 + Math.random() * 0.4}s ease-in forwards`,
    animationDelay: `${Math.random() * 0.3}s`,
  };
  return <div style={style} />;
}
