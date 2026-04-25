"use client";

import { useState } from "react";
import { Clock, Calendar, ArrowLeft, CheckCircle, Circle, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function CalendarioDeMissao() {
  const { isLoggedIn } = useAuth();
  const [events] = useState<any[]>([
    {
      id: 1,
      origem: "São Paulo",
      destino: "Paraty",
      data: "26/04/2026",
      hora_partida: "08:00",
      hora_chegada: "12:30",
      descricao: "Início da expedição pelas serras.",
      status: "concluido",
    },
    {
      id: 2,
      origem: "Paraty",
      destino: "Rio de Janeiro",
      data: "27/04/2026",
      hora_partida: "09:00",
      hora_chegada: "14:00",
      descricao: "Passeio pela orla e descanso.",
      status: "programado",
    },
  ]);

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
            onClick={() =>
              toast.info("Funcionalidade em desenvolvimento no painel Admin.")
            }
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
    </div>
  );
}
