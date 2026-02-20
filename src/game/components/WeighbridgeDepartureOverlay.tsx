import { useEffect, useState } from "react";

interface WeighbridgeDepartureOverlayProps {
  onComplete: () => void;
}

export function WeighbridgeDepartureOverlay({ onComplete }: WeighbridgeDepartureOverlayProps) {
  // Drive-off animation: truck starts centred, slides to the right and off-screen
  const [phase, setPhase] = useState<"driving" | "banner">("driving");

  useEffect(() => {
    // After 1.5s the truck has exited — show the banner
    const t1 = setTimeout(() => setPhase("banner"), 1500);
    // After 2.5s total — call onComplete to show round result
    const t2 = setTimeout(() => onComplete(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-sm overflow-hidden">
      {/* Truck drive-off */}
      <div
        className="transition-transform"
        style={{
          transform: phase === "driving" ? "translateX(150vw)" : "translateX(150vw)",
          transition: "transform 1.5s cubic-bezier(0.4, 0, 1, 1)",
          transitionDelay: "0ms",
          // Start position: centred (applied via initial inline style before animation kicks in)
        }}
      >
        {/* We use a simple emoji truck representation since the TankerV2 is scaled */}
        <TruckGraphic />
      </div>

      {/* Banner — fades in once truck exits */}
      <div
        className="text-center transition-all duration-500"
        style={{
          opacity: phase === "banner" ? 1 : 0,
          transform: phase === "banner" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <div className="text-6xl mb-4">⚖️</div>
        <h2 className="text-3xl md:text-4xl font-black text-sky-300 mb-2">
          Gone to Weighbridge
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Tanker is being weighed&hellip; calculating result
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Inline animated truck graphic ----
function TruckGraphic() {
  return (
    <div
      className="flex items-end gap-0"
      style={{
        // Kick off the slide from centre toward the right
        animation: "truckDriveOff 1.5s cubic-bezier(0.4, 0, 1, 1) forwards",
      }}
    >
      {/* Cab */}
      <div className="relative">
        <div className="w-24 h-16 bg-slate-600 rounded-tl-lg rounded-tr-sm border-2 border-slate-500 flex items-center justify-center">
          <div className="w-14 h-8 bg-sky-800 rounded border border-sky-600 flex items-center justify-center">
            <span className="text-lg">🚛</span>
          </div>
        </div>
        {/* Cab wheels */}
        <div className="flex gap-6 mt-1 px-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>

      {/* Tanker body */}
      <div className="relative">
        <div className="w-48 h-14 bg-slate-500 rounded-r-full rounded-l-sm border-2 border-slate-400 flex items-center justify-center">
          <div className="w-36 h-8 bg-slate-600 rounded-full border border-slate-400 flex items-center justify-center">
            <span className="text-xs text-slate-300 font-bold tracking-widest">MILK</span>
          </div>
        </div>
        {/* Tanker wheels */}
        <div className="flex gap-3 mt-1 px-4 justify-end">
          <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes truckDriveOff {
          0% { transform: translateX(0); }
          100% { transform: translateX(120vw); }
        }
      `}</style>
    </div>
  );
}
