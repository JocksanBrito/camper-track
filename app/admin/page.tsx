"use client";

import { useState, useEffect } from "react";
import { Zap, Coffee, Save, User, Home as HomeIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [status, setStatus] = useState<"traveling" | "stopped">("stopped");
  const [local, setLocal] = useState("");
  const [destino, setDestino] = useState("");

  // Configurações do Carro
  const [nomeCarro, setNomeCarro] = useState("Camper");
  const [anoCarro, setAnoCarro] = useState("2026");
  const [paisAtual, setPaisAtual] = useState("Brasil");
  const [descricao, setDescricao] = useState("Expedição pelo coração do Brasil.");

  // Tripulação
  const [driverName, setDriverName] = useState("Piloto");
  const [passengerName, setPassengerName] = useState("Copiloto");

  // Estados de Loading
  const [savingMission, setSavingMission] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);

  // Carregar dados existentes do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("perfil_viagem")
          .select("*")
          .limit(1)
          .single();

        if (data) {
          setNomeCarro(data.nome_carro);
          setAnoCarro(data.ano_carro);
          setPaisAtual(data.pais_atual);
          setDescricao(data.descricao_viagem);
          setStatus(data.status_atual);
          setLocal(data.local_atual);
          setDestino(data.next_destination);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
      }
    };

    loadData();
  }, []);

  const handleStart = async () => {
    setSavingMission(true);
    console.log("Tentando salvar dados de Missão (Partida)...");
    
    const { data, error } = await supabase
      .from("perfil_viagem")
      .update({
        status_atual: "traveling",
        local_atual: local,
        next_destination: destino,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Alvo genérico para atualizar o único registro

    console.log("Resposta do Banco (Missão):", error);

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      setStatus("traveling");
      toast.success("Missão Iniciada! Status: Em Viagem");
    }
    setSavingMission(false);
  };

  const handleStop = async () => {
    setSavingMission(true);
    console.log("Tentando salvar dados de Missão (Chegada)...");

    const { data, error } = await supabase
      .from("perfil_viagem")
      .update({
        status_atual: "stopped",
        local_atual: local,
        next_destination: destino,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Resposta do Banco (Missão):", error);

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      setStatus("stopped");
      toast.success("Check-in realizado! Status: Pit Stop");
    }
    setSavingMission(false);
  };

  const handleSaveConfig = async () => {
    setSavingPerfil(true);
    console.log("Tentando salvar dados do Perfil...");

    const { data, error } = await supabase
      .from("perfil_viagem")
      .update({
        nome_carro: nomeCarro,
        ano_carro: anoCarro,
        pais_atual: paisAtual,
        descricao_viagem: descricao,
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Resposta do Banco (Perfil):", error);

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success("Configurações salvas com sucesso!");
    }
    setSavingPerfil(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 pt-12 pb-24 gap-6">
      {/* Botão Voltar */}
      <div className="w-full max-w-md flex justify-start">
        <Link
          href="/"
          className="game-button bg-zinc-800 text-white text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <HomeIcon size={14} />
          Voltar para o Mapa
        </Link>
      </div>

      {/* Card 1: Controle de Missão */}
      <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 max-w-md w-full">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-center text-[var(--mario-blue)]">
          Controle de Missão
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleStart}
            disabled={savingMission}
            className="game-button bg-green-500 text-white hover:bg-green-600 flex flex-col items-center gap-2 py-4 disabled:opacity-50"
          >
            <Zap size={32} fill="currentColor" />
            <span className="text-lg font-black uppercase">
              {savingMission ? "Salvando..." : "Partida"}
            </span>
          </button>

          <button
            onClick={handleStop}
            disabled={savingMission}
            className="game-button bg-[var(--mario-red)] text-white hover:bg-red-600 flex flex-col items-center gap-2 py-4 disabled:opacity-50"
          >
            <Coffee size={32} />
            <span className="text-lg font-black uppercase">
              {savingMission ? "Salvando..." : "Chegada"}
            </span>
          </button>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(local)}&destination=${encodeURIComponent(destino)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="game-button bg-[var(--mario-blue)] text-white font-black text-center text-xs py-3 w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black mt-2 uppercase flex items-center justify-center gap-2"
        >
          🗺️ Iniciar Navegação no Google Maps
        </a>

        {/* Inputs de Status */}
        <div className="flex flex-col gap-4 bg-zinc-800/50 p-4 rounded-xl border-2 border-black">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-zinc-400">
              Localização Atual
            </label>
            <input
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-sm font-bold"
              placeholder="Ex: Posto Graal"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-zinc-400">
              Próximo Destino
            </label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-sm font-bold"
              placeholder="Ex: Curitiba"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Configurações do Veículo */}
      <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 max-w-md w-full">
        <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--mario-yellow)] flex items-center gap-2">
          <Save size={20} />
          Perfil da Viagem
        </h2>

        <div className="flex flex-col gap-3 bg-zinc-800/50 p-4 rounded-xl border-2 border-black">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">
              Nome do Carro
            </label>
            <input
              type="text"
              value={nomeCarro}
              onChange={(e) => setNomeCarro(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg text-white text-xs font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">
              Ano
            </label>
            <input
              type="text"
              value={anoCarro}
              onChange={(e) => setAnoCarro(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg text-white text-xs font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">
              País Atual
            </label>
            <input
              type="text"
              value={paisAtual}
              onChange={(e) => setPaisAtual(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg text-white text-xs font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg text-white text-xs font-bold h-16 resize-none"
            />
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={savingPerfil}
            className="game-button bg-[var(--mario-yellow)] text-black font-black w-full text-xs mt-2 disabled:opacity-50"
          >
            {savingPerfil ? "Salvando..." : "Salvar Perfil"}
          </button>
        </div>
      </div>

      {/* Card 3: Tripulação */}
      <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 max-w-md w-full">
        <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--mario-green)] flex items-center gap-2">
          <User size={20} />
          Tripulação
        </h2>

        <div className="flex flex-col gap-3 bg-zinc-800/50 p-4 rounded-xl border-2 border-black">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">
              Nome do Piloto
            </label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg text-white text-xs font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-zinc-400">
              Nome do Copiloto
            </label>
            <input
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg text-white text-xs font-bold"
            />
          </div>

          <button
            onClick={handleSaveConfig}
            className="game-button bg-[var(--mario-green)] text-white w-full text-xs mt-2"
          >
            Salvar Tripulação
          </button>
        </div>
      </div>
    </div>
  );
}
