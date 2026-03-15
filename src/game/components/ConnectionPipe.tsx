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
          {/* Milk flow animation — creamy white moving left to right */}
          {isFlowing && (
            <div className="absolute inset-0 overflow-hidden">
              {/* Continuous milk stream filling the pipe */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(180deg, #FDFFF5 0%, #F5F7E8 50%, #EDF0DC 100%)',
                  animation: 'milkFillPipe 0.4s ease-out forwards',
                }}
              />
              {/* Moving milk blobs for flow feel */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0"
                  style={{
                    width: 14,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,250,0.7), rgba(253,255,245,0.9), rgba(255,255,250,0.7), transparent)',
                    animation: 'milkBlobFlow 0.6s linear infinite',
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
              {/* Surface sheen moving with the flow */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: '40%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 70%, transparent 100%)',
                  animation: 'milkSheen 0.8s linear infinite',
                }}
              />
            </div>
          )}

          {/* Static residual milk when not flowing (pipe was used) */}
          {!isFlowing && (
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '30%',
                background: 'linear-gradient(180deg, rgba(245,247,232,0.3), rgba(237,240,220,0.15))',
              }}
            />
          )}
        </div>

        {/* Left flange */}
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

        {/* Right flange */}
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
        @keyframes milkFillPipe {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes milkBlobFlow {
          0% { left: -20%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes milkSheen {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
