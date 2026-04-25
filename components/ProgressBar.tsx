"use client";

import { Trophy, Flag } from "lucide-react";
import { CamperIcon } from "./CamperIcon";

interface ProgressBarProps {
  totalDistance: number;
  currentDistance: number;
}

export function ProgressBar({
  totalDistance,
  currentDistance,
}: ProgressBarProps) {
  const progress = Math.min(
    100,
    Math.max(0, (currentDistance / totalDistance) * 100)
  );

  return (
    <div className="w-full glass-panel p-3 md:p-6 rounded-xl md:rounded-2xl game-border-red relative bg-zinc-900/50">
      <div className="flex items-center justify-between mb-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-400">
        <span>Partida</span>
        <span>{progress.toFixed(0)}%</span>
        <span>Destino</span>
      </div>

      <div className="relative h-3 bg-zinc-800 rounded-full border border-black overflow-visible">
        {/* Pista de Corrida */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--mario-red)] to-[var(--mario-yellow)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />

        {/* Linha tracejada */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] border-t border-dashed border-white/30 -translate-y-1/2" />

        {/* Ícone de Largada */}
        <div className="absolute -top-2 -left-1.5 text-white bg-zinc-700 p-0.5 rounded-full border border-white shadow-md">
          <Flag size={10} fill="currentColor" />
        </div>

        {/* Ícone de Chegada */}
        <div className="absolute -top-2 -right-1.5 text-[var(--mario-yellow)] bg-zinc-700 p-0.5 rounded-full border border-white shadow-md">
          <Trophy size={10} fill="currentColor" />
        </div>

        {/* O Carrinho */}
        <div
          className="absolute -top-3 transform -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${progress}%` }}
        >
          <CamperIcon size={24} />
        </div>
      </div>

      <div className="flex justify-between mt-3 text-xs font-bold">
        <span className="text-[var(--mario-red)]">
          {currentDistance} KM
        </span>
        <span className="text-[var(--mario-yellow)]">
          {totalDistance} KM
        </span>
      </div>
    </div>
  );
}
