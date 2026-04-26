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
import { OnlinePresence } from "@/components/OnlinePresence";
import { toast } from "sonner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { isLoggedIn, logout } = useAuth();
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [totalDistance, setTotalDistance] = useState(100);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [estimatedSpeed, setEstimatedSpeed] = useState(0);
  const [points, setPoints] = useState<any[]>([]);
  const [perfilViagem, setPerfilViagem] = useState({
    nome_carro: "Camper",
    ano_carro: "2026",
    pais_atual: "Brasil",
    descricao_viagem: "Expedição pelo coração do Brasil.",
    status_atual: "stopped" as "traveling" | "stopped",
    local_atual: "Posto Graal",
    next_destination: "Brasília",
    foto_capa_url: "",
    updated_at: new Date().toISOString()
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

  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userFuncao, setUserFuncao] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    const loadRealData = async () => {
      // 0. Fetch User Permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("tripulacao").select("role, funcao_missao").eq("user_id", user.id).maybeSingle();
        if (prof) {
          setUserRole(prof.role || "usuario");
          setUserFuncao(prof.funcao_missao || "passageiro");
        }
      }

      // 1. Fetch Points
      const { data: pts } = await supabase
        .from("track_points")
        .select("*")
        .order("timestamp", { ascending: true });
      
      const { data: cal } = await supabase
        .from("calendario_missao")
        .select("*");

      let mergedPoints = pts || [];
      if (cal && cal.length > 0) {
        const calPts = cal.map((c: any, idx: number) => ({
          id: `cal-${idx}`,
          lat: 40.6333, // Heurística Itália
          lng: 15.8000, 
          label: c.destino,
          timestamp: c.data_partida || new Date().toISOString(),
        }));
        mergedPoints = [...mergedPoints, ...calPts];
      }
      setPoints(mergedPoints);

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
            status_atual: pf.status_atual || "stopped",
            local_atual: pf.local_atual || "",
            next_destination: pf.next_destination || "",
            foto_capa_url: pf.foto_capa_url || "",
            updated_at: pf.updated_at || new Date().toISOString()
          });
        }

      // 3. Fetch Tripulação
      const { data: crew } = await supabase
        .from("tripulacao")
        .select("*")
        .eq("status", "aprovado");
      if (crew && crew.length > 0) {
        const drv = crew.find((c) => c.funcao_missao === "motorista") || crew[0];
        const pass = crew.find((c) => c.funcao_missao === "copiloto") || crew[1];
        setTripulacao({
          driver: {
            name: drv?.nome || "Piloto",
            role: "Motorista",
            avatar: drv?.foto_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${
              drv?.nome || "driver"
            }`,
          },
          passenger: {
            name: pass?.nome || "Copiloto",
            role: "Navegador",
            avatar: pass?.foto_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${
              pass?.nome || "passenger"
            }`,
          },
        });
      }

      const { data: activeTrip } = await supabase.from("viagens").select("*").neq("status", "concluida").limit(1).maybeSingle();
      if (activeTrip) {
        const total = activeTrip.distancia_total || parseInt(activeTrip.distancia) || 119;
        const totalMins = activeTrip.tempo_estimado_minutos || 135;
        
        const startTime = new Date(activeTrip.created_at).getTime();
        const now = new Date().getTime();
        const elapsedMinutes = (now - startTime) / (1000 * 60);
        
        const progressPercent = Math.min(100, Math.max(0, (elapsedMinutes / totalMins) * 100));
        const current = Math.round((progressPercent / 100) * total);
        const speed = progressPercent >= 100 ? 0 : 85;

        setTotalDistance(total);
        setCurrentDistance(current);
        setEstimatedSpeed(speed);
      } else {
        setTotalDistance(100);
        setCurrentDistance(0);
        setEstimatedSpeed(0);
      }
    };
    loadRealData();
    const interval = setInterval(loadRealData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isClient) return null;

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
                {(userRole === 'admin' || userFuncao === 'copiloto') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="game-button bg-[var(--mario-yellow)] text-black text-xs py-1 text-center font-black"
                  >
                    Painel
                  </Link>
                )}
                <Link
                  href="/perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="game-button bg-zinc-800 text-white text-xs py-1 text-center font-bold"
                >
                  Perfil
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
        {/* Banner de Capa */}
        {perfilViagem.foto_capa_url && (
          <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={perfilViagem.foto_capa_url} alt="Capa da Missão" className="w-full h-full object-cover" />
          </div>
        )}
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
          
          {/* Radar Unificado de Presença */}
          <OnlinePresence />
        </div>

        {/* Barra de Progresso */}
        <div className="w-full">
          <ProgressBar
            totalDistance={totalDistance}
            currentDistance={currentDistance}
          />
          {estimatedSpeed > 0 && (
            <div className="text-[10px] font-black uppercase text-[var(--mario-yellow)] mt-2 flex justify-center items-center gap-1 animate-pulse">
              🚀 Velocidade Estimada: {estimatedSpeed} km/h
            </div>
          )}
        </div>

        {/* Banner de Status Inteligente */}
        <div className="w-full">
          <StatusBanner
            status={perfilViagem.status_atual}
            currentLocation={perfilViagem.local_atual}
            nextDestination={perfilViagem.next_destination}
            updatedAt={perfilViagem.updated_at}
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
          {isLoggedIn && (userRole === 'admin' || userFuncao === 'copiloto') && (
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
          <TravelLog />
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
