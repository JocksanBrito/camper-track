"use client";
 
import { useState, useEffect } from "react";
import { Trophy, Compass, Zap, Star, Settings, Plus, Menu, X } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { isLoggedIn, logout } = useAuth();
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [totalDistance] = useState(2500);
  const [currentDistance] = useState(1250);
  const [points, setPoints] = useState<any[]>([
    { id: 1, lat: -23.5505, lng: -46.6333, label: "São Paulo", timestamp: new Date().toISOString() }
  ]);
  const [perfilViagem, setPerfilViagem] = useState({
    nome_carro: "Camper",
    ano_carro: "2026",
    pais_atual: "Brasil",
    descricao_viagem: "Expedição pelo coração do Brasil.",
  });
  const [tripulacao, setTripulacao] = useState({
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
  });

  const updatedAt = new Date().toISOString();

  useEffect(() => {
    const loadRealData = async () => {
      // 1. Fetch Points
      const { data: pts } = await supabase
        .from("track_points")
        .select("*")
        .order("timestamp", { ascending: true });
      if (pts && pts.length > 0) {
        setPoints(pts);
      }

      // 2. Fetch Perfil
      const { data: pf } = await supabase
        .from("perfil_viagem")
        .select("*")
        .limit(1)
        .single();
      if (pf) {
        setPerfilViagem({
          nome_carro: pf.nome_carro || "Camper",
          ano_carro: pf.ano_carro || "2026",
          pais_atual: pf.pais_atual || "Brasil",
          descricao_viagem: pf.descricao_viagem || "Expedição pelo coração do Brasil.",
        });
      }

      // 3. Fetch Tripulação
      const { data: crew } = await supabase
        .from("tripulacao")
        .select("*")
        .eq("status", "aprovado");
      if (crew && crew.length > 0) {
        const drv = crew.find((c) => c.role === "copiloto") || crew[0];
        const pass = crew.find((c) => c.role === "passageiro") || crew[1];
        setTripulacao({
          driver: {
            name: drv?.nome || "Piloto",
            role: "Motorista",
            avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${
              drv?.nome || "driver"
            }`,
          },
          passenger: {
            name: pass?.nome || "Copiloto",
            role: "Navegador",
            avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${
              pass?.nome || "passenger"
            }`,
          },
        });
      }
    };
    loadRealData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 md:p-8 relative overflow-hidden pb-20 md:pb-8">
      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 text-[var(--mario-yellow)] opacity-10 animate-pulse-slow">
        <Star size={32} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 text-[var(--mario-blue)] opacity-10 animate-pulse-slow [animation-delay:1.5s]">
        <Star size={48} fill="currentColor" />
      </div>

      {/* Mobile & Desktop Burger Menu */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="game-button bg-zinc-800 text-white p-2 flex items-center justify-center border-2 border-black"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-12 right-0 bg-zinc-900 border-4 border-black p-2 rounded-xl flex flex-col gap-2 min-w-[120px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[1000] animate-scaleUp">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="game-button bg-zinc-800 text-white text-xs py-1 text-center font-bold"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="game-button bg-zinc-800 text-white text-xs py-1 text-center font-bold"
                >
                  Recrutar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="game-button bg-[var(--mario-yellow)] text-black text-xs py-1 text-center font-black"
                >
                  Painel
                </Link>
                <Link
                  href="/calendario"
                  onClick={() => setIsMenuOpen(false)}
                  className="game-button bg-zinc-800 text-white text-xs py-1 text-center font-bold"
                >
                  Calendário
                </Link>
                <Link
                  href="/diario"
                  onClick={() => setIsMenuOpen(false)}
                  className="game-button bg-zinc-800 text-white text-xs py-1 text-center font-bold"
                >
                  Diário
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="game-button bg-[var(--mario-red)] text-white text-xs py-1 font-bold"
                >
                  Sair
                </button>
              </>
            )}
          </div>
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

        {/* Mapa */}
        <div className="w-full relative">
          <TrackMap points={points} />
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
          <TravelLog points={points} />
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
