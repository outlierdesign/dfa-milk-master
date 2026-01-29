import { GAME_CONFIG_V2 } from "../constantsV2";

interface TankerV2Props {
  currentFill: number;
  targetFill: number;
  isFilling: boolean;
  spillTriggered: boolean;
  spillAmount: number;
}

export function TankerV2({
  currentFill,
  targetFill,
  isFilling,
  spillTriggered,
  spillAmount,
}: TankerV2Props) {
  const fillPercentage = Math.min(
    (currentFill / GAME_CONFIG_V2.TANKER_CAPACITY_L) * 100,
    100
  );
  const targetPercentage =
    (targetFill / GAME_CONFIG_V2.TANKER_CAPACITY_L) * 100;

  // Determine fill color based on proximity to target
  const difference = Math.abs(currentFill - targetFill);
  const tolerance = 200; // 200L tolerance for color feedback

  let fillColorClass = "from-sky-400 to-sky-500"; // Default blue milk
  if (currentFill > 0) {
    if (spillTriggered) {
      fillColorClass = "from-red-400 to-red-500";
    } else if (difference <= tolerance * 0.5) {
      fillColorClass = "from-emerald-400 to-emerald-500";
    } else if (difference <= tolerance) {
      fillColorClass = "from-amber-400 to-amber-500";
    }
  }

  return (
    <div className="relative">
      {/* Tanker assembly */}
      <div className="relative flex items-end gap-4">
        {/* Cab/Truck front */}
        <div className="relative w-24 h-24 flex-shrink-0">
          {/* Cab body */}
          <div className="absolute bottom-0 w-full h-20 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 rounded-t-xl rounded-b-lg border-2 border-slate-400">
            {/* Window */}
            <div className="absolute top-2 left-2 right-2 h-9 bg-gradient-to-b from-sky-200 to-sky-300 rounded-t-lg border border-slate-400">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-t-lg" />
            </div>
            {/* Grill */}
            <div className="absolute bottom-3 left-2 right-2 h-6 bg-slate-600 rounded">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-1 bg-slate-400 mt-1" />
              ))}
            </div>
          </div>
          {/* Front wheel */}
          <div className="absolute -bottom-2 left-2 w-8 h-8 bg-slate-800 rounded-full border-3 border-slate-600">
            <div className="absolute inset-1.5 bg-slate-400 rounded-full" />
          </div>
          {/* Rear wheel */}
          <div className="absolute -bottom-2 right-0 w-8 h-8 bg-slate-800 rounded-full border-3 border-slate-600">
            <div className="absolute inset-1.5 bg-slate-400 rounded-full" />
          </div>
        </div>

        {/* Tank body - single compartment */}
        <div className="relative flex-1 min-w-[280px]">
          {/* Main tank container - horizontal elliptical shape */}
          <div className="relative h-32 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 rounded-full border-4 border-slate-400 shadow-2xl overflow-hidden">
            {/* Top dome highlight */}
            <div className="absolute top-0 left-4 right-4 h-6 bg-gradient-to-b from-white/60 to-transparent rounded-full" />

            {/* Inner tank area */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden">
              {/* Liquid fill */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${fillColorClass} transition-all duration-75 ease-out`}
                style={{ height: `${fillPercentage}%` }}
              >
                {/* Liquid surface animation */}
                {isFilling && (
                  <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                )}

                {/* Liquid bubbles when filling */}
                {isFilling && (
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                        style={{
                          left: `${10 + i * 20}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.4s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Target line */}
              {!spillTriggered && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50 z-10"
                  style={{ bottom: `${targetPercentage}%` }}
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-3 bg-emerald-400 rounded-l" />
                  </div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-3 bg-emerald-400 rounded-r" />
                  </div>
                </div>
              )}

              {/* Overfill warning */}
              {spillTriggered && (
                <div className="absolute top-0 left-0 right-0 h-8 bg-red-500/50 animate-pulse flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    OVERFILL!
                  </span>
                </div>
              )}
            </div>

            {/* Top hatch - single */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-4 bg-slate-500 rounded-t-lg border-2 border-slate-400" />
          </div>

          {/* Undercarriage */}
          <div className="absolute -bottom-3 left-6 right-6 h-4 bg-slate-700 rounded" />

          {/* Wheels */}
          <div className="absolute -bottom-5 left-10 flex gap-1">
            <div className="w-10 h-10 bg-slate-800 rounded-full border-3 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full border-3 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
          </div>
          <div className="absolute -bottom-5 right-10 flex gap-1">
            <div className="w-10 h-10 bg-slate-800 rounded-full border-3 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-full border-3 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
          </div>

          {/* Milk dripping when spill */}
          {spillTriggered && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-6 bg-gradient-to-b from-sky-300 to-transparent rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.5s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fill level display */}
      <div className="mt-10 flex justify-center gap-6">
        <div className="bg-slate-800/90 px-4 py-3 rounded-lg border border-emerald-600">
          <div className="text-xs text-emerald-300 mb-1 text-center">
            TARGET
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400">
            {Math.round(targetFill).toLocaleString()}L
          </div>
        </div>
        <div
          className={`bg-slate-800/90 px-4 py-3 rounded-lg border ${spillTriggered ? "border-red-600" : "border-slate-600"}`}
        >
          <div
            className={`text-xs mb-1 text-center ${spillTriggered ? "text-red-300" : "text-slate-400"}`}
          >
            CURRENT
          </div>
          <div
            className={`text-xl font-mono font-bold ${spillTriggered ? "text-red-400" : "text-white"}`}
          >
            {Math.round(currentFill).toLocaleString()}L
          </div>
        </div>
        {spillTriggered && spillAmount > 0 && (
          <div className="bg-red-900/90 px-4 py-3 rounded-lg border border-red-600 animate-pulse">
            <div className="text-xs text-red-300 mb-1 text-center">SPILLED</div>
            <div className="text-xl font-mono font-bold text-red-400">
              {Math.round(spillAmount).toLocaleString()}L
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
