"use client";

import { useState, useEffect } from "react";
import { Calendar, ArrowLeft, MapPin, Info } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BottomNav } from "@/components/BottomNav";

export default function CalendarioDeMissao() {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchTrips = async () => {
      const { data } = await supabase
        .from("viagens")
        .select("*");
      if (data) setTrips(data.filter((v: any) => ['concluida', 'planejada', 'planejado'].includes(v.status)));
    };
    fetchTrips();
  }, []);

  if (!isMounted) return null;

  // Calendário para Abril 2026 (30 dias, começa na Quarta-feira = 3)
  const daysInMonth = 30;
  const startDayOfWeek = 3; 
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getTripForDay = (day: number) => {
    return trips.find(t => {
      if (t.created_at) {
        const date = new Date(t.created_at);
        return date.getDate() === day && date.getMonth() === 3; // Abril
      }
      return false;
    });
  };

  const getDayClass = (trip: any) => {
    if (!trip) return "border-zinc-800 bg-zinc-950/40 text-zinc-500 cursor-default";
    if (trip.status === 'traveling') return "border-green-500 bg-green-500/20 text-white animate-pulse cursor-pointer hover:scale-105";
    if (trip.status === 'concluida') return "border-yellow-600 bg-yellow-600/10 text-yellow-500 cursor-pointer hover:scale-105";
    return "border-blue-500 bg-blue-500/20 text-blue-400 cursor-pointer hover:scale-105"; // Planejado
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-4 pt-12 pb-24 gap-6">
      <div className="w-full max-w-4xl flex justify-start">
        <Link
          href="/"
          className="game-button bg-zinc-800 text-white text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Voltar ao Mapa
        </Link>
      </div>

      <main className="w-full max-w-xl flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Calendar size={48} className="text-[var(--mario-yellow)] animate-pulse" />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--mario-yellow)]">
            Calendário de Missão
          </h1>
          <p className="text-xs text-zinc-400 font-bold uppercase">Planejamento e Execução</p>
        </div>

        <div className="w-full glass-panel p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/40 flex flex-col gap-4">
          <div className="text-center font-black text-sm uppercase tracking-wider text-[var(--mario-blue)] border-b border-zinc-800 pb-2">
            Abril 2026
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-zinc-500">
            <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SAB</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptySlots.map(i => <div key={`empty-${i}`} className="h-10" />)}
            {days.map(day => {
              const trip = getTripForDay(day);
              return (
                <button
                  key={day}
                  onClick={() => trip && setSelectedTrip(trip)}
                  className={`h-10 rounded-lg border-2 font-bold text-xs flex items-center justify-center transition-all ${getDayClass(trip)}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {selectedTrip && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col gap-4 bg-zinc-900">
              <h2 className="text-xl font-black uppercase text-[var(--mario-yellow)] flex items-center gap-2">
                <Info /> Próximos Passos
              </h2>
              <div className="flex flex-col gap-2 bg-black/40 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
                  <MapPin size={16} className="text-[var(--mario-red)]" />
                  <span>{selectedTrip.origem} ➔ {selectedTrip.destino}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-400 font-bold mt-2">
                  <span>Status: <strong className="uppercase">{selectedTrip.status}</strong></span>
                  <span>Distância: {selectedTrip.distancia && selectedTrip.distancia.startsWith('[') ? 'Calculada' : selectedTrip.distancia}</span>
                </div>
                {(() => {
                  try {
                    if (selectedTrip.distancia && selectedTrip.distancia.startsWith('[')) {
                      const timeline = JSON.parse(selectedTrip.distancia);
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
              <button 
                onClick={() => setSelectedTrip(null)} 
                className="game-button bg-zinc-800 text-white font-bold py-2 text-xs"
              >
                FECHAR
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
