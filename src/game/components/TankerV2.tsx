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

export function TankerV2({
  currentFill,
  targetFill,
  maxFill,
  isFilling,
  spillTriggered,
  spillAmount,
  config,
  isBlindMode = false,
}: TankerV2Props) {
  const capacity = maxFill ?? config.maxAllowedFill;
  const fillPercentage = Math.min((currentFill / capacity) * 100, 100);
  const targetPercentage = (targetFill / capacity) * 100;

  const difference = Math.abs(currentFill - targetFill);
  const tolerance = targetFill * 0.004; // ~0.4%

  let fillColor = "from-[#FDFFF5] to-[#F5F7E8]";
  if (currentFill > 0 && !isBlindMode) {
    if (spillTriggered) fillColor = "from-red-400 to-red-500";
    else if (difference <= tolerance * 0.5) fillColor = "from-emerald-400 to-emerald-500";
    else if (difference <= tolerance) fillColor = "from-amber-400 to-amber-500";
  }

  return (
    <div className="relative">
      <div className="relative flex items-end">
        {/* Semi-Truck Cab */}
        <div className="relative w-32 h-32 flex-shrink-0 z-10">
          <div className="absolute bottom-4 left-0 w-28 h-24 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 rounded-t-lg rounded-b-sm border-2 border-blue-700">
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-b from-blue-800 to-blue-900 rounded-b-sm">
              <div className="absolute bottom-1 left-2 right-2 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded border border-slate-500">
                {[...Array(4)].map((_, i) => <div key={i} className="w-full h-0.5 bg-slate-600 mt-1" />)}
              </div>
            </div>
            <div className="absolute top-2 left-2 right-3 h-11 bg-gradient-to-br from-sky-300 via-sky-400 to-sky-500 rounded-t-lg border-2 border-slate-600 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
            </div>
            <div className="absolute top-4 -left-2 w-3 h-4 bg-slate-700 rounded-sm border border-slate-600" />
            <div className="absolute -top-4 right-1 w-2 h-5 bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-full border border-slate-500" />
            <div className="absolute -top-3 right-4 w-2 h-4 bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-full border border-slate-500" />
            <div className="absolute bottom-2 left-1 w-1.5 h-2 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50" />
          </div>
          <div className="absolute -bottom-1 left-1 w-9 h-9 bg-slate-900 rounded-full border-3 border-slate-700">
            <div className="absolute inset-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border-2 border-slate-800"><div className="absolute inset-1 bg-slate-400 rounded-full" /></div>
          </div>
          <div className="absolute -bottom-1 right-1 w-9 h-9 bg-slate-900 rounded-full border-3 border-slate-700">
            <div className="absolute inset-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border-2 border-slate-800"><div className="absolute inset-1 bg-slate-400 rounded-full" /></div>
          </div>
        </div>

        <div className="absolute left-28 bottom-12 w-8 h-3 bg-slate-700 rounded z-5" />

        {/* Tank Trailer */}
        <div className="relative flex-1 min-w-[320px] -ml-4">
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded border-2 border-slate-700" />
          <div className="relative h-28 mb-6 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 rounded-full border-4 border-slate-400 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/70 via-white/30 to-transparent rounded-t-full" />
            <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-slate-400/50" />
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-slate-400/50" />
            <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-400/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <span className="text-3xl font-black text-blue-900 tracking-wider drop-shadow-lg" style={{ textShadow: '2px 2px 0 rgba(255,255,255,0.5)' }}>MILK</span>
            </div>

            {!isBlindMode && (
              <div className="absolute inset-4 rounded-full bg-gradient-to-b from-slate-700/80 to-slate-800/80 overflow-hidden border-2 border-slate-600/50">
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${fillColor} transition-all duration-75 ease-out`} style={{ height: `${fillPercentage}%` }}>
                  {isFilling && <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" /></div>}
                  {isFilling && <div className="absolute inset-0 overflow-hidden">{[...Array(5)].map((_, i) => <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ left: `${10 + i * 20}%`, animationDelay: `${i * 0.1}s`, animationDuration: "0.4s" }} />)}</div>}
                </div>
                {!spillTriggered && <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50 z-10" style={{ bottom: `${targetPercentage}%` }} />}
                {spillTriggered && <div className="absolute top-0 left-0 right-0 h-8 bg-red-500/50 animate-pulse flex items-center justify-center"><span className="text-xs font-bold text-white">OVERFILL!</span></div>}
              </div>
            )}

            {isBlindMode && spillTriggered && (
              <div className="absolute inset-4 rounded-full bg-red-500/40 animate-pulse flex items-center justify-center border-4 border-red-500">
                <span className="text-xl font-black text-white drop-shadow-lg">💥 OVERFILL!</span>
              </div>
            )}

            <div className="absolute -top-1 left-[20%] w-8 h-3 bg-slate-500 rounded-t-lg border-2 border-slate-400" />
            <div className="absolute -top-1 left-[50%] -translate-x-1/2 w-10 h-4 bg-slate-500 rounded-t-lg border-2 border-slate-400" />
            <div className="absolute -top-1 right-[20%] w-8 h-3 bg-slate-500 rounded-t-lg border-2 border-slate-400" />
          </div>

          <div className="absolute left-0 top-6 bottom-12 w-4 bg-gradient-to-r from-slate-400 to-slate-300 rounded-l-full border-2 border-slate-400" />
          <div className="absolute right-0 top-6 bottom-12 w-4 bg-gradient-to-l from-slate-400 to-slate-300 rounded-r-full border-2 border-slate-400" />

          <div className="absolute -bottom-1 left-16 flex gap-1">
            {[0, 1].map((i) => <div key={i} className="w-10 h-10 bg-slate-900 rounded-full border-3 border-slate-700"><div className="absolute inset-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border-2 border-slate-800"><div className="absolute inset-1.5 bg-slate-400 rounded-full" /></div></div>)}
          </div>
          <div className="absolute -bottom-1 right-10 flex gap-1">
            {[0, 1].map((i) => <div key={i} className="w-10 h-10 bg-slate-900 rounded-full border-3 border-slate-700"><div className="absolute inset-1.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border-2 border-slate-800"><div className="absolute inset-1.5 bg-slate-400 rounded-full" /></div></div>)}
          </div>

          <div className="absolute right-1 top-[45%] w-2 h-3 bg-red-500 rounded-r shadow-lg shadow-red-500/50" />
          <div className="absolute right-1 top-[55%] w-2 h-2 bg-amber-400 rounded-r" />

          {spillTriggered && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-8 bg-gradient-to-b from-[#FDFFF5] to-transparent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s`, animationDuration: "0.5s" }} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
