"use client";

import { X } from "lucide-react";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function GameModal({
  isOpen,
  onClose,
  title,
  children,
}: GameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/95 max-w-sm w-full relative z-10 animate-scaleUp">
        <div className="flex items-center justify-between mb-4 border-b-2 border-zinc-800 pb-2">
          <h3 className="text-lg font-black uppercase tracking-tighter text-[var(--mario-yellow)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border-2 border-black bg-zinc-800 text-zinc-400 hover:text-white active:scale-95 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
