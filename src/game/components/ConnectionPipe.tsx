interface ConnectionPipeProps {
  isFlowing: boolean;
}

export function ConnectionPipe({ isFlowing }: ConnectionPipeProps) {
  return (
    <div className="flex items-center justify-center px-4">
      {/* Pipe structure */}
      <div className="relative w-24 h-4">
        {/* Pipe body */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full border-2 border-slate-600 overflow-hidden">
          {/* Flow animation inside pipe */}
          {isFlowing && (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-300/60 to-transparent animate-pulse"
                style={{
                  animation: "flowRight 0.5s linear infinite",
                }}
              />
              {/* Moving dots to show flow direction */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400/80"
                  style={{
                    animation: "flowDot 0.8s linear infinite",
                    animationDelay: `${i * 0.25}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left connector (from farm tank) */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-slate-500 rounded-l border-2 border-slate-600 border-r-0" />

        {/* Right connector (to tanker) */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-slate-500 rounded-r border-2 border-slate-600 border-l-0" />

        {/* Flow direction arrow when flowing */}
        {isFlowing && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sky-400 text-lg animate-pulse">
            →
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes flowRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flowDot {
          0% { left: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
