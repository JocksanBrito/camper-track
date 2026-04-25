"use client";
 
import { useState, useEffect } from "react";
import { Trophy, Compass, Zap, Star, Settings, Plus } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { TrackMap } from "@/components/TrackMap";
import { BottomNav } from "@/components/BottomNav";
import { StatusBanner } from "@/components/StatusBanner";
import { CrewSection } from "@/components/CrewSection";
import { useAuth } from "@/contexts/AuthContext";
import { TravelLog } from "@/components/TravelLog";
import { GameModal } from "@/components/GameModal";
import { toast } from "sonner";
import Link from "next/link";

export default function Home() {
  const { isLoggedIn, logout } = useAuth();
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState("");

  const totalDistance = 2500;
  const currentDistance = 1250;

  const mockPoints = [
    {
      id: 1,
      lat: -23.5505,
      lng: -46.6333,
      label: "São Paulo",
      timestamp: "2026-04-24T10:00:00Z",
    },
    {
      id: 2,
      lat: -22.9068,
      lng: -43.1729,
      label: "Rio de Janeiro",
      timestamp: "2026-04-24T18:00:00Z",
    },
    {
      id: 3,
      lat: -19.9167,
      lng: -43.9345,
      label: "Belo Horizonte",
      timestamp: "2026-04-25T08:00:00Z",
    },
    {
      id: 4,
      lat: -15.7942,
      lng: -47.8822,
      label: "Brasília",
      timestamp: "2026-04-25T14:00:00Z",
    },
  ];

  const updatedAt = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString();

  const perfilViagem = {
    nome_carro: "Camper",
    ano_carro: "2026",
    pais_atual: "Brasil",
    descricao_viagem: "Expedição pelo coração do Brasil.",
  };

  const tripulacao = {
    driver: {
      name: "Piloto",
      role: "Motorista",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=driver",
    },
    passenger: {
      name: "Copiloto",
      role: "Navegador",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=passenger",
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 md:p-8 relative overflow-hidden pb-20 md:pb-8">
      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 text-[var(--mario-yellow)] opacity-10 animate-pulse-slow">
        <Star size={32} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 text-[var(--mario-blue)] opacity-10 animate-pulse-slow [animation-delay:1.5s]">
        <Star size={48} fill="currentColor" />
      </div>

      {/* Top Navbar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {!isLoggedIn ? (
          <>
            <a
              href="/login"
              className="game-button bg-zinc-800 text-white text-[10px] px-2 py-1"
            >
              Login
            </a>
            <a
              href="/signup"
              className="game-button bg-zinc-800 text-white text-[10px] px-2 py-1"
            >
              Recrutar
            </a>
          </>
        ) : (
          <>
            <a
              href="/admin"
              className="game-button bg-[var(--mario-yellow)] text-black text-[10px] px-2 py-1 font-bold"
            >
              Painel
            </a>
            <button
              onClick={logout}
              className="game-button bg-zinc-800 text-white text-[10px] px-2 py-1"
            >
              Sair
            </button>
          </>
        )}
      </div>

      <main className="w-full max-w-md md:max-w-4xl flex flex-col items-center text-center gap-4 z-10 pt-12">
        {/* Header Dinâmico */}
        <div className="flex flex-col items-center gap-1 relative">
          <div className="bg-[var(--mario-red)] text-white font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-widest game-border flex items-center gap-1">
            {perfilViagem.nome_carro} {perfilViagem.ano_carro}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter bg-gradient-to-r from-[var(--mario-red)] via-[var(--mario-yellow)] to-[var(--mario-green)] bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-2">
            {perfilViagem.nome_carro} {perfilViagem.pais_atual}
          </h1>
          <p className="text-xs text-zinc-400 px-4">
            {perfilViagem.descricao_viagem}
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full">
          <ProgressBar
            totalDistance={totalDistance}
            currentDistance={currentDistance}
          />
        </div>

        {/* Banner de Status Inteligente */}
        <div className="w-full">
          <StatusBanner
            status="stopped"
            currentLocation="Posto Graal"
            nextDestination="Brasília"
            updatedAt={updatedAt}
          />
        </div>

        {/* Seção Tripulação */}
        <div className="w-full">
          <CrewSection
            driver={tripulacao.driver}
            passenger={tripulacao.passenger}
          />
        </div>

        {/* Botões Lado a Lado */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <a
            href={isLoggedIn ? "/admin" : "/login"}
            className="game-button bg-[var(--mario-red)] text-white hover:bg-red-600 text-xs py-2 px-1"
          >
            <span className="flex items-center justify-center gap-1">
              <Zap size={14} fill="currentColor" />
              {isLoggedIn ? "Painel de Controle" : "Corrida (Login)"}
            </span>
          </a>
          <button className="game-button bg-[var(--mario-blue)] text-white hover:bg-blue-600 text-xs py-2 px-1">
            <span className="flex items-center justify-center gap-1">
              <Trophy size={14} />
              Placar
            </span>
          </button>
        </div>

        {/* Mapa */}
        <div className="w-full relative">
          <TrackMap points={mockPoints} />
          {/* Botão flutuante (+) para o Viajante */}
          {isLoggedIn && (
            <button
              onClick={() => setIsCheckpointModalOpen(true)}
              className="absolute bottom-20 left-4 z-[1000] bg-[var(--mario-green)] text-white p-3 rounded-full border-2 border-black shadow-lg hover:bg-green-600 active:scale-95 transition-all animate-pulse"
              title="Adicionar Checkpoint"
            >
              <Plus size={24} />
            </button>
          )}
        </div>

        {/* Log de Viagem Público */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/diario"
            className="game-button bg-[var(--mario-yellow)] text-black text-center font-black py-3 text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black uppercase tracking-tighter"
          >
            📸 Veja por onde passamos (Diário)
          </Link>
          <TravelLog points={mockPoints} />
        </div>

        {/* Footer */}
        <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-2">
          <Compass size={12} className="animate-spin [animation-duration:5s]" />
          Próximo checkpoint à vista
        </div>
        <GameModal 
          isOpen={isCheckpointModalOpen} 
          onClose={() => setIsCheckpointModalOpen(false)} 
          title="Novo Checkpoint"
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 font-bold">
              Deseja registrar sua localização atual como um novo ponto na rota?
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Nome do Lugar</label>
              <input 
                type="text" 
                placeholder="Ex: Posto Graal"
                value={newCheckpointName}
                onChange={(e) => setNewCheckpointName(e.target.value)}
                className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white font-bold text-sm"
              />
            </div>
            <button 
              onClick={() => {
                toast.success(`Checkpoint "${newCheckpointName || 'Sem nome'}" salvo!`);
                setIsCheckpointModalOpen(false);
                setNewCheckpointName("");
              }}
              className="game-button bg-[var(--mario-green)] text-white w-full mt-2 text-xs"
            >
              Confirmar Checkpoint
            </button>
          </div>
        </GameModal>

      </main>

      {/* Navegação Inferior */}
      <BottomNav />
    </div>
  );
}
