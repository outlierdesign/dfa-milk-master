import { GAME_CONFIG } from "../constants";

interface CompartmentProps {
  fillLevel: number;
  targetFill: number;
  isFilling: boolean;
  isActive: boolean;
  isCompleted: boolean;
  compartmentIndex: number;
}

function Compartment({
  fillLevel,
  targetFill,
  isFilling,
  isActive,
  isCompleted,
  compartmentIndex,
}: CompartmentProps) {
  const fillPercentage = Math.min((fillLevel / GAME_CONFIG.TANK_CAPACITY) * 100, 100);
  const targetPercentage = (targetFill / GAME_CONFIG.TANK_CAPACITY) * 100;
  const isOverfilled = fillLevel > GAME_CONFIG.TANK_CAPACITY;

  // Determine fill color based on proximity to target
  const difference = Math.abs(fillLevel - targetFill);
  const tolerance = GAME_CONFIG.LEVELS[0].tolerance;

  let fillColorClass = "from-sky-400 to-sky-500"; // Default blue milk
  if (fillLevel > 0) {
    if (isOverfilled) {
      fillColorClass = "from-red-400 to-red-500";
    } else if (difference <= tolerance * 0.5) {
      fillColorClass = "from-emerald-400 to-emerald-500";
    } else if (difference <= tolerance) {
      fillColorClass = "from-amber-400 to-amber-500";
    }
  }

  // Completed compartments show green
  if (isCompleted) {
    fillColorClass = "from-emerald-400 to-emerald-500";
  }

  return (
    <div className="relative flex-1 h-full">
      {/* Compartment divider lines */}
      <div className="absolute inset-0 border-l-2 border-r-2 border-slate-500/50 first:border-l-0 last:border-r-0">
        {/* Inner tank area */}
        <div className="absolute inset-1 rounded-sm bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 overflow-hidden">
          {/* Liquid fill */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${fillColorClass} transition-all duration-75 ease-out`}
            style={{ height: `${isCompleted ? 100 : Math.min(fillPercentage, 100)}%` }}
          >
            {/* Liquid surface animation */}
            {isFilling && isActive && (
              <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            )}

            {/* Liquid bubbles when filling */}
            {isFilling && isActive && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                    style={{
                      left: `${20 + i * 30}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "0.4s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Overfill indicator */}
          {isOverfilled && isActive && (
            <div className="absolute top-0 left-0 right-0 h-6 bg-red-500/50 animate-pulse flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">OVERFILL!</span>
            </div>
          )}

          {/* Target line - only show on active compartment */}
          {isActive && !isCompleted && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50 z-10"
              style={{ bottom: `${targetPercentage}%` }}
            >
              <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                <div className="w-2 h-4 bg-emerald-400 rounded-l" />
              </div>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                <div className="w-2 h-4 bg-emerald-400 rounded-r" />
              </div>
            </div>
          )}

          {/* Active indicator glow */}
          {isActive && !isCompleted && (
            <div className="absolute inset-0 border-2 border-emerald-400/50 rounded-sm animate-pulse" />
          )}
        </div>
      </div>

      {/* Compartment number */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">
        {compartmentIndex + 1}
      </div>
    </div>
  );
}

interface MilkTankerProps {
  compartments: number;
  currentCompartment: number;
  compartmentFillLevels: number[];
  targetFill: number;
  isFilling: boolean;
}

export function MilkTanker({
  compartments,
  currentCompartment,
  compartmentFillLevels,
  targetFill,
  isFilling,
}: MilkTankerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tanker assembly */}
      <div className="relative flex items-end gap-4">
        {/* Cab/Truck front */}
        <div className="relative w-32 h-32 flex-shrink-0">
          {/* Cab body */}
          <div className="absolute bottom-0 w-full h-28 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 rounded-t-xl rounded-b-lg border-2 border-slate-400">
            {/* Window */}
            <div className="absolute top-2 left-2 right-2 h-12 bg-gradient-to-b from-sky-200 to-sky-300 rounded-t-lg border border-slate-400">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-t-lg" />
            </div>
            {/* Grill */}
            <div className="absolute bottom-4 left-3 right-3 h-8 bg-slate-600 rounded">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-1 bg-slate-400 mt-1.5" />
              ))}
            </div>
          </div>
          {/* Front wheel */}
          <div className="absolute -bottom-2 left-3 w-10 h-10 bg-slate-800 rounded-full border-4 border-slate-600">
            <div className="absolute inset-2 bg-slate-400 rounded-full" />
          </div>
          {/* Rear wheel */}
          <div className="absolute -bottom-2 right-1 w-10 h-10 bg-slate-800 rounded-full border-4 border-slate-600">
            <div className="absolute inset-2 bg-slate-400 rounded-full" />
          </div>
        </div>

        {/* Tank body */}
        <div className="relative flex-1">
          {/* Main tank container - horizontal elliptical shape */}
          <div className="relative h-40 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-300 rounded-full border-4 border-slate-400 shadow-2xl overflow-hidden">
            {/* Top dome highlight */}
            <div className="absolute top-0 left-4 right-4 h-8 bg-gradient-to-b from-white/60 to-transparent rounded-full" />
            
            {/* Inner tank area with compartments */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 overflow-hidden flex">
              {[...Array(compartments)].map((_, i) => (
                <Compartment
                  key={i}
                  fillLevel={compartmentFillLevels[i] || 0}
                  targetFill={targetFill}
                  isFilling={isFilling}
                  isActive={i === currentCompartment}
                  isCompleted={i < currentCompartment}
                  compartmentIndex={i}
                />
              ))}
            </div>

            {/* Compartment divider lines on outer shell */}
            {compartments > 1 && (
              <div className="absolute inset-0 flex pointer-events-none">
                {[...Array(compartments - 1)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r-4 border-slate-400/60"
                    style={{ marginLeft: i === 0 ? 0 : undefined }}
                  />
                ))}
                <div className="flex-1" />
              </div>
            )}

            {/* Top hatches */}
            <div className="absolute -top-1 left-0 right-0 flex justify-around px-8">
              {[...Array(compartments)].map((_, i) => (
                <div key={i} className="w-8 h-4 bg-slate-500 rounded-t-lg border-2 border-slate-400" />
              ))}
            </div>
          </div>

          {/* Undercarriage */}
          <div className="absolute -bottom-4 left-8 right-8 h-6 bg-slate-700 rounded" />
          
          {/* Wheels */}
          <div className="absolute -bottom-6 left-12 flex gap-2">
            <div className="w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
            <div className="w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
          </div>
          <div className="absolute -bottom-6 right-12 flex gap-2">
            <div className="w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
            <div className="w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-600">
              <div className="absolute inset-2 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Fill level display for active compartment */}
      <div className="mt-12 flex justify-center gap-8">
        <div className="bg-slate-800/90 px-4 py-3 rounded-lg border border-emerald-600">
          <div className="text-xs text-emerald-300 mb-1 text-center">TARGET</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {targetFill.toLocaleString()}L
          </div>
        </div>
        <div className="bg-slate-800/90 px-4 py-3 rounded-lg border border-slate-600">
          <div className="text-xs text-slate-400 mb-1 text-center">CURRENT</div>
          <div className="text-2xl font-mono font-bold text-white">
            {Math.round(compartmentFillLevels[currentCompartment] || 0).toLocaleString()}L
          </div>
        </div>
        <div className="bg-slate-800/90 px-4 py-3 rounded-lg border border-amber-600">
          <div className="text-xs text-amber-300 mb-1 text-center">COMPARTMENT</div>
          <div className="text-2xl font-mono font-bold text-amber-400">
            {currentCompartment + 1} / {compartments}
          </div>
        </div>
      </div>
    </div>
  );
}
