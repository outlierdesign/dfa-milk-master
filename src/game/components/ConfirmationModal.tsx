import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  onConfirm: () => void;
}

export function ConfirmationModal({ onConfirm }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-2xl border-2 border-amber-500 text-center max-w-md mx-4 animate-scale-in">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-white mb-2">Sample Check</h2>
        <p className="text-slate-300 mb-6">
          Confirm sample taken before loading next trailer
        </p>
        <Button
          size="lg"
          className="w-full h-16 text-xl bg-amber-500 hover:bg-amber-400 text-amber-950"
          onClick={onConfirm}
        >
          ✓ CONFIRM SAMPLE TAKEN
        </Button>
      </div>
    </div>
  );
}
