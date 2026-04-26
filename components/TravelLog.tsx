"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export function TravelLog() {
  const [viagens, setViagens] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    setStartY(e.pageY - e.currentTarget.offsetTop);
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    e.preventDefault();
    const y = e.pageY - e.currentTarget.offsetTop;
    const walk = (y - startY) * 2;
    e.currentTarget.scrollTop = scrollTop - walk;
  };

  const [planejadas, setPlanejadas] = useState<any[]>([]);

  useEffect(() => {
    const fetchViagens = async () => {
      const { data } = await supabase
        .from("viagens")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        const sorted = [...data].sort((a, b) => {
          if (a.status === 'traveling') return -1;
          if (b.status === 'traveling') return 1;
          return 0;
        });
        setViagens(sorted.slice(0, 5));
      }

      const { data: cal } = await supabase
        .from("calendario_missao")
        .select("*")
        .order("data_partida", { ascending: true });
      if (cal) {
        setPlanejadas(cal);
      }
    };
    fetchViagens();
  }, []);

  return (
    <div className="w-full glass-panel p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/50">
      <h3 className="text-xs font-black uppercase tracking-widest text-center mb-4 text-zinc-400">
        Log de viagem em tempo real
      </h3>

      {viagens.length === 0 && planejadas.length === 0 ? (
        <p className="text-center text-xs text-zinc-500 py-4 font-bold">
          Nenhuma viagem em andamento ou planejada.
        </p>
      ) : (
        <div 
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar select-none cursor-grab active:cursor-grabbing"
        >
          {viagens.map((viagem, index) => (
            <div
              key={viagem.id}
              className={`flex items-center gap-3 bg-zinc-800/50 p-2 rounded-xl border-2 border-black ${viagem.status === 'concluida' ? 'opacity-50 grayscale-[30%]' : ''}`}
            >
              <div className={`text-white p-2 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${viagem.status === 'concluida' ? 'bg-zinc-700' : 'bg-[var(--mario-green)]'}`}>
                <MapPin size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  {viagem.origem} ➔ {viagem.destino}
                  {viagem.status === 'concluida' && (
                    <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded font-black text-zinc-400 border border-zinc-700 uppercase">ENCERRADA</span>
                  )}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  Status: <strong className={`uppercase ${viagem.status === 'traveling' ? 'text-green-500' : viagem.status === 'concluida' ? 'text-zinc-500' : 'text-blue-400'}`}>{viagem.status}</strong>
                </span>
                {(() => {
                  try {
                    if (viagem.distancia && viagem.distancia.startsWith('[')) {
                      const timeline = JSON.parse(viagem.distancia);
                      return (
                        <div className="flex flex-col gap-1 mt-2 border-t border-zinc-800 pt-2 text-[9px] text-zinc-500 font-bold">
                          {timeline.map((evt: any, eIdx: number) => (
                            <div key={eIdx} className="flex justify-between gap-4 border-l-2 border-zinc-700 pl-2">
                              <span className="uppercase text-[var(--mario-yellow)]">{evt.status}</span>
                              <span className="text-zinc-400">{evt.local} • {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } catch (e) {
                    return null;
                  }
                  return null;
                })()}
              </div>
              <span className="ml-auto text-[10px] bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-300 font-bold border border-black">
                #{index + 1}
              </span>
            </div>
          ))}
          {planejadas.map((plano, index) => (
            <div
              key={`plano-${plano.id}`}
              className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-xl border-2 border-black"
            >
              <div className="text-black p-2 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-[#FACC15]">
                <MapPin size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  {plano.origem ? `${plano.origem} ➔ ` : ""}{plano.destino}
                  <span className="text-[8px] bg-[#FACC15]/20 px-1.5 py-0.5 rounded font-black text-[#FACC15] border border-[#FACC15]/50 uppercase">PLANEJADA</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium font-mono">
                  Partida: {new Date(plano.data_partida).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                {plano.observacoes && (
                  <p className="text-[9px] text-zinc-400 mt-1 italic border-t border-zinc-800 pt-1">
                    "{plano.observacoes}"
                  </p>
                )}
              </div>
              <span className="ml-auto text-[10px] bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-300 font-bold border border-black">
                P-{index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
      {planejadas.length > 0 && (
        <div className="mt-3 text-center border-t border-zinc-800 pt-2">
          <Link
            href="/calendario"
            className="text-center text-xs font-black uppercase text-[var(--mario-blue)] hover:underline flex justify-center items-center gap-1"
          >
            Ver cronograma completo no Calendário ➔
          </Link>
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
