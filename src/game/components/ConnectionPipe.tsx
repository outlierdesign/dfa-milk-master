interface ConnectionPipeProps {
  isFlowing: boolean;
}

export function ConnectionPipe({ isFlowing }: ConnectionPipeProps) {
  return (
    <div className="flex items-center" style={{ margin: '0 -6px', zIndex: 5 }}>
      <div className="relative w-20 h-5">
        {/* Pipe body */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #94a3b8 0%, #64748b 40%, #475569 100%)',
            borderTop: '2px solid #94a3b8',
            borderBottom: '2px solid #334155',
          }}
        >
          {/* Flow animation inside pipe */}
          {isFlowing && (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(186,230,253,0.5) 40%, rgba(125,211,252,0.6) 50%, rgba(186,230,253,0.5) 60%, transparent 100%)',
                  animation: 'flowRight 0.6s linear infinite',
                }}
              />
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'rgba(125,211,252,0.8)',
                    animation: 'flowDot 0.7s linear infinite',
                    animationDelay: `${i * 0.175}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left flange (flush against farm tank) */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: -3,
            width: 6,
            height: 10,
            background: 'linear-gradient(180deg, #94a3b8, #475569)',
            borderRadius: '2px 0 0 2px',
            borderLeft: '2px solid #64748b',
          }}
        />

        {/* Right flange (flush against tanker) */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            right: -3,
            width: 6,
            height: 10,
            background: 'linear-gradient(180deg, #94a3b8, #475569)',
            borderRadius: '0 2px 2px 0',
            borderRight: '2px solid #64748b',
          }}
        />
      </div>

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
