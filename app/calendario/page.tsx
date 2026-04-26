"use client";

import { useState, useEffect } from "react";
import { Calendar, ArrowLeft, MapPin, Info } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export default function CalendarioDeMissao() {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userFuncao, setUserFuncao] = useState<string>("");

  // Estados do Formulário de Agendamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [destino, setDestino] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [dataChegadaPrevista, setDataChegadaPrevista] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  const canEdit = userRole === "admin" || userFuncao === "copiloto";

  useEffect(() => {
    setIsMounted(true);
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("tripulacao")
          .select("role, funcao_missao")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof) {
          setUserRole(prof.role || "usuario");
          setUserFuncao(prof.funcao_missao || "passageiro");
        }
      }
    };
    fetchUser();

    const fetchTrips = async () => {
      const { data } = await supabase.from("calendario_missao").select("*");
      if (data) setTrips(data);
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
    return trips.find((t) => {
      if (t.data_partida) {
        const date = new Date(t.data_partida);
        return date.getDate() === day && date.getMonth() === 3; // Abril
      }
      return false;
    });
  };

  const getDayClass = (trip: any) => {
    if (!trip)
      return "border-zinc-800 bg-zinc-950/40 text-zinc-500 cursor-default";
    return "border-green-500 bg-green-500/20 text-white cursor-pointer hover:scale-105 animate-pulse";
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
          <Calendar
            size={48}
            className="text-[var(--mario-yellow)] animate-pulse"
          />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--mario-yellow)]">
            Calendário de Missão
          </h1>
          <p className="text-xs text-zinc-400 font-bold uppercase">
            Planejamento e Execução
          </p>
        </div>

        <div className="w-full glass-panel p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/40 flex flex-col gap-4">
          <div className="text-center font-black text-sm uppercase tracking-wider text-[var(--mario-blue)] border-b border-zinc-800 pb-2">
            Abril 2026
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-zinc-500">
            <span>DOM</span>
            <span>SEG</span>
            <span>TER</span>
            <span>QUA</span>
            <span>QUI</span>
            <span>SEX</span>
            <span>SAB</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptySlots.map((i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {days.map((day) => {
              const trip = getTripForDay(day);
              return (
                <button
                  key={day}
                  onClick={() => {
                    if (trip) {
                      setSelectedTrip(trip);
                    } else if (canEdit) {
                      setSelectedDay(day);
                      const paddedDay = String(day).padStart(2, "0");
                      setDataPartida(`2026-04-${paddedDay}T10:00`);
                      setDataChegadaPrevista(`2026-04-${paddedDay}T18:00`);
                      setDestino("");
                      setObservacoes("");
                      setIsModalOpen(true);
                    }
                  }}
                  className={`h-10 rounded-lg border-2 font-bold text-xs flex items-center justify-center transition-all ${getDayClass(
                    trip
                  )}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal de Detalhes (Público) */}
        {selectedTrip && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col gap-4 bg-zinc-900 text-left">
              <h2 className="text-xl font-black uppercase text-[var(--mario-yellow)] flex items-center gap-2">
                <Info /> Detalhes do Plano
              </h2>
              <div className="flex flex-col gap-2 bg-black/40 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
                  <MapPin size={16} className="text-[var(--mario-red)]" />
                  <span>
                    Destino: <strong>{selectedTrip.destino}</strong>
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-zinc-400 font-bold mt-2">
                  <span>
                    🚀 Partida:{" "}
                    {new Date(selectedTrip.data_partida).toLocaleString(
                      "pt-BR"
                    )}
                  </span>
                  {selectedTrip.data_chegada_prevista && (
                    <span>
                      🏁 Chegada Prevista:{" "}
                      {new Date(
                        selectedTrip.data_chegada_prevista
                      ).toLocaleString("pt-BR")}
                    </span>
                  )}
                </div>
                {selectedTrip.observacoes && (
                  <div className="mt-2 border-t border-zinc-800 pt-2 text-xs text-zinc-300">
                    <p className="text-[10px] text-zinc-500 uppercase font-black">
                      Briefing:
                    </p>
                    <p className="mt-1 font-bold">
                      {selectedTrip.observacoes}
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="game-button bg-zinc-800 text-white font-bold py-2 text-xs"
              >
                FECHAR
              </button>
            </div>
          </div>
        )}

        {/* Modal de Agendamento (Apenas Comando) */}
        {isModalOpen && canEdit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const { error } = await supabase
                  .from("calendario_missao")
                  .insert({
                    destino,
                    data_partida: dataPartida,
                    data_chegada_prevista: dataChegadaPrevista,
                    observacoes,
                  });
                setLoading(false);
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success("Destino Agendado com Sucesso!");
                  setDestino("");
                  setDataPartida("");
                  setDataChegadaPrevista("");
                  setObservacoes("");
                  setIsModalOpen(false);
                  const { data } = await supabase
                    .from("calendario_missao")
                    .select("*");
                  if (data) setTrips(data);
                }
              }}
              className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col gap-4 bg-zinc-900 text-left"
            >
              <h2 className="text-xl font-black uppercase text-[var(--mario-green)] flex items-center gap-2">
                <Calendar /> Agendar Parada
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">
                  Destino
                </label>
                <input
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  required
                  placeholder="Ex: Roma, Itália"
                  className="bg-zinc-800 p-2 border-2 border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">
                  Data e Hora de Partida
                </label>
                <input
                  type="datetime-local"
                  value={dataPartida}
                  onChange={(e) => setDataPartida(e.target.value)}
                  required
                  className="bg-zinc-800 p-2 border-2 border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">
                  Chegada Prevista
                </label>
                <input
                  type="datetime-local"
                  value={dataChegadaPrevista}
                  onChange={(e) => setDataChegadaPrevista(e.target.value)}
                  required
                  className="bg-zinc-800 p-2 border-2 border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">
                  Observações / Briefing
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  placeholder="Notas sobre combustível, pedágios, etc."
                  className="bg-zinc-800 p-2 border-2 border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 game-button bg-zinc-800 text-white font-bold py-2 text-xs"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 game-button bg-[var(--mario-green)] text-white font-black py-2 text-xs border-2 border-black"
                >
                  {loading ? "SALVANDO..." : "AGENDAR"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
