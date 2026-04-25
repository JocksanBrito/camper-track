"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, ArrowLeft, CheckCircle, Circle, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function CalendarioDeMissao() {
  const { isLoggedIn } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const { data } = await supabase
        .from("calendario_missao")
        .select("*")
        .order("data_partida", { ascending: true });
      if (data) {
        setEvents(
          data.map((d: any, idx: number) => ({
            id: d.id || idx,
            origem: d.origem,
            destino: d.destino,
            data: d.data_partida,
            hora_partida: d.hora_partida_estimada,
            status: d.status || "programado",
            descricao:
              d.descricao_atividades ||
              `Trecho de ${d.origem} para ${d.destino}`,
          }))
        );
      }
    };
    fetchCalendar();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origem || !destino || !data || !hora) {
      toast.error("Preencha todos os campos!");
      return;
    }
    const dbEvent = {
      origem,
      destino,
      data_partida: data,
      hora_partida_estimada: hora,
      status: "programado",
      descricao_atividades: `Trecho programado de ${origem} para ${destino}`,
    };

    supabase
      .from("calendario_missao")
      .insert([dbEvent])
      .then(({ error }) => {
        if (error) {
          toast.error(`Erro ao salvar: ${error.message}`);
        } else {
          toast.success("Agendamento salvo no Supabase! 🚐💨");
          setEvents([
            ...events,
            {
              id: events.length + 1,
              origem,
              destino,
              data,
              hora_partida: hora,
              status: "programado",
              descricao: `Trecho de ${origem} para ${destino}`,
            },
          ]);
        }
      });

    setIsModalOpen(false);
    setOrigem("");
    setDestino("");
    setData("");
    setHora("");
    toast.success("Trecho agendado com sucesso! 🚐💨");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-4 pt-12 pb-24 gap-6">
      <div className="w-full max-w-md md:max-w-4xl flex justify-start">
        <Link
          href="/"
          className="game-button bg-zinc-800 text-white text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Voltar para o Mapa
        </Link>
      </div>

      <main className="w-full max-w-md md:max-w-xl flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Calendar
            size={48}
            className="text-[var(--mario-blue)] animate-pulse"
          />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--mario-yellow)]">
            Calendário de Missão
          </h1>
          <p className="text-xs text-zinc-400">Próximos passos da jornada</p>
        </div>

        {/* Adicionar evento (Admin) */}
        {isLoggedIn && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="game-button bg-[var(--mario-green)] text-white w-full text-xs font-bold flex items-center justify-center gap-1.5 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus size={16} /> Adicionar Nova Programação
          </button>
        )}

        {/* Timeline */}
        <div className="relative border-l-4 border-black/50 ml-4 flex flex-col gap-8 w-full mt-4 pl-6">
          {events.map((event) => {
            const isDone = event.status === "concluido";
            return (
              <div
                key={event.id}
                className="relative flex flex-col bg-zinc-900/50 border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Indicador na linha */}
                <div
                  className={`absolute -left-[34px] top-4 p-1 rounded-full border-2 border-black bg-zinc-900 ${
                    isDone ? "text-green-500" : "text-[var(--mario-yellow)]"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle
                      size={16}
                      fill="currentColor"
                      className="text-zinc-900"
                    />
                  ) : (
                    <Circle size={16} fill="currentColor" />
                  )}
                </div>

                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black ${
                      isDone
                        ? "bg-green-500 text-white"
                        : "bg-[var(--mario-yellow)] text-black"
                    }`}
                  >
                    {isDone ? "Concluído" : "Programado"}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-bold">
                    <Clock size={12} />
                    {event.data} ({event.hora_partida}h)
                  </div>
                </div>

                <h3 className="text-lg font-black uppercase text-zinc-100 flex items-center gap-1.5">
                  <MapPin size={16} className="text-[var(--mario-red)]" />
                  {event.origem} ➔ {event.destino}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 font-bold leading-relaxed">
                  {event.descricao}
                </p>
              </div>
            );
          })}
        </div>
      </main>
      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col gap-4">
            <h2 className="text-xl font-black uppercase text-[var(--mario-yellow)]">
              Novo Trecho
            </h2>
            <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ex: Potenza"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white text-xs font-bold"
              />
              <input
                type="text"
                placeholder="Ex: Fardella"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white text-xs font-bold"
              />
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white text-xs font-bold"
              />
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white text-xs font-bold"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="game-button bg-green-500 text-white font-bold py-2 text-xs flex-1"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="game-button bg-red-500 text-white font-bold py-2 text-xs flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
