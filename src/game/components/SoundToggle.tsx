import { Volume2, VolumeX } from "lucide-react";

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  className?: string;
}

export function SoundToggle({ isMuted, onToggle, className = "" }: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full transition-all hover:bg-muted/50 ${className}`}
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
      )}
    </button>
  );
}
