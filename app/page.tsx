"use client";

import { Trophy, Compass, Zap, Star, Settings, Plus } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { TrackMap } from "@/components/TrackMap";
import { BottomNav } from "@/components/BottomNav";
import { StatusBanner } from "@/components/StatusBanner";
import { CrewSection } from "@/components/CrewSection";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isLoggedIn, logout } = useAuth();

  const totalDistance = 2500;
  const currentDistance = 1250;

  const mockPoints = [
    { id: 1, lat: -23.5505, lng: -46.6333, label: "São Paulo" },
    { id: 2, lat: -22.9068, lng: -43.1729, label: "Rio de Janeiro" },
    { id: 3, lat: -19.9167, lng: -43.9345, label: "Belo Horizonte" },
    { id: 4, lat: -15.7942, lng: -47.8822, label: "Brasília" },
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

      {/* Logout Button (para teste) */}
      {isLoggedIn && (
        <button
          onClick={logout}
          className="absolute top-4 right-4 z-50 bg-zinc-800 text-white text-xs px-2 py-1 rounded-lg border border-black shadow"
        >
          Sair
        </button>
      )}

      <main className="w-full max-w-md md:max-w-4xl flex flex-col items-center text-center gap-4 z-10 pt-4">
        {/* Header Dinâmico */}
        <div className="flex flex-col items-center gap-1 relative">
          <div className="bg-[var(--mario-red)] text-white font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-widest game-border flex items-center gap-1">
            {perfilViagem.nome_carro} {perfilViagem.ano_carro}
            {isLoggedIn && <Settings size={12} className="cursor-pointer" />}
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter bg-gradient-to-r from-[var(--mario-red)] via-[var(--mario-yellow)] to-[var(--mario-green)] bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-2">
            {perfilViagem.nome_carro} {perfilViagem.pais_atual}
            {isLoggedIn && (
              <a href="/admin" title="Editar Perfil">
                <Settings size={24} className="text-[var(--mario-yellow)] cursor-pointer hover:rotate-90 transition-all duration-300" />
              </a>
            )}
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
              onClick={() => alert("Adicionar novo trecho")}
              className="absolute bottom-20 left-4 z-[1000] bg-[var(--mario-green)] text-white p-3 rounded-full border-2 border-black shadow-lg hover:bg-green-600 active:scale-95 transition-all animate-pulse"
              title="Adicionar Checkpoint"
            >
              <Plus size={24} />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-2">
          <Compass size={12} className="animate-spin [animation-duration:5s]" />
          Próximo checkpoint à vista
        </div>
      </main>

      {/* Navegação Inferior */}
      <BottomNav />
    </div>
  );
}
