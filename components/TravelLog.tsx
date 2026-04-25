"use client";

import { MapPin } from "lucide-react";

interface TrackPoint {
  id: number | string;
  lat: number;
  lng: number;
  label: string;
  timestamp?: string;
}

interface TravelLogProps {
  points: TrackPoint[];
}

export function TravelLog({ points }: TravelLogProps) {
  return (
    <div className="w-full glass-panel p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/50">
      <h3 className="text-xs font-black uppercase tracking-widest text-center mb-4 text-zinc-400">
        Caminho Percorrido (Log de Viagem)
      </h3>

      {points.length === 0 ? (
        <p className="text-center text-xs text-zinc-500 py-4 font-bold">
          Nenhum trecho confirmado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {points.map((point, index) => (
            <div
              key={point.id}
              className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-xl border-2 border-black"
            >
              <div className="bg-[var(--mario-green)] text-white p-2 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                <MapPin size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white">
                  {point.label || `Checkpoint ${index + 1}`}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {point.timestamp
                    ? new Date(point.timestamp).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Data não registrada"}
                </span>
              </div>
              <span className="ml-auto text-[10px] bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-300 font-bold border border-black">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--mario-blue);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
