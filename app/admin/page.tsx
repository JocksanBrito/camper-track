"use client";

import { useState, useEffect } from "react";
import { Zap, Coffee, Save, User, Home as HomeIcon, Settings, BrainCircuit, Users, ShieldCheck, Trash2, CheckCircle, Map as MapIcon, Key, XCircle, History, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  // IDs REAIS DO SISTEMA
  const [profileId, setProfileId] = useState<string | null>(null);
  const [iaConfigId, setIaConfigId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userFuncao, setUserFuncao] = useState<string | null>(null);

  // ESTADOS DE MISSÃO
  const [status, setStatus] = useState<"traveling" | "stopped" | "pitstop" | "canceled">("stopped");
  const [local, setLocal] = useState("");
  const [destino, setDestino] = useState("");

  // CONFIGURAÇÕES DO VEÍCULO (ELEVAN)
  const [nomeCarro, setNomeCarro] = useState("");
  const [anoCarro, setAnoCarro] = useState("");
  const [paisAtual, setPaisAtual] = useState("");
  const [descricao, setDescricao] = useState("");

  // GESTÃO DE TRIPULAÇÃO (MOTORISTA, COPILOTO, PASSAGEIRO)
  const [driverId, setDriverId] = useState("");
  const [passengerId, setPassengerId] = useState("");
  const [recruits, setRecruits] = useState<any[]>([]);

  // NÚCLEO DE IA E TELEMETRIA
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [distanciaIA, setDistanciaIA] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [openTrips, setOpenTrips] = useState<any[]>([]);
  const [historyTrips, setHistoryTrips] = useState<any[]>([]);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [newOrigem, setNewOrigem] = useState("");
  const [newDestino, setNewDestino] = useState("");

  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [tripToFinalize, setTripToFinalize] = useState<boolean>(false);
  const [showPartidaConfirm, setShowPartidaConfirm] = useState(false);
  const [detectedKm, setDetectedKm] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState("");
  // INTERFACE
  const [savingMission, setSavingMission] = useState(false);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadFullSystem = async () => {
      try {
        // 1. Validar Segurança de Administrador e Copiloto
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase.from("tripulacao").select("role, funcao_missao").eq("user_id", user.id).maybeSingle();
          if (prof) {
            setUserRole(prof.role);
            setUserFuncao(prof.funcao_missao);
          }
        }

        // 2. Carregar Perfil de Viagem Real
        const { data: profile } = await supabase.from("perfil_viagem").select("*").limit(1).maybeSingle();
        if (profile) {
          setProfileId(profile.id);
          setNomeCarro(profile.nome_carro || "");
          setAnoCarro(profile.ano_carro || "");
          setPaisAtual(profile.pais_atual || "");
          setDescricao(profile.descricao_viagem || "");
          setStatus(profile.status_atual || "stopped");
          setLocal(profile.local_atual || "");
          setDestino(profile.next_destination || "");
        }

        // 3. Carregar Configurações de IA
        const { data: aiData } = await supabase.from("configuracoes_ia").select("*").limit(1).maybeSingle();
        if (aiData) {
          setIaConfigId(aiData.id);
          setOpenaiKey(aiData.openai_key || "");
          setGeminiKey(aiData.gemini_key || "");
        }

        // 4. Carregar Tripulação Completa
        const { data: crew, error } = await supabase
          .from("tripulacao")
          .select("*")
          .order('nome', { ascending: true }); // Mudamos para 'nome' que é o que o banco tem agora

        if (crew) {
          setRecruits(crew);
        }

        const { data: allViagens } = await supabase.from("viagens").select("*").order("created_at", { ascending: false });
        if (allViagens) {
          setOpenTrips(allViagens.filter((v: any) => v.status !== 'concluida'));
          setHistoryTrips(allViagens.filter((v: any) => v.status === 'concluida').slice(0, 5));
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Erro crítico na carga de dados:", err);
        }
      }
    };
    loadFullSystem();
  }, []);

  if (!mounted) return null;

  // FUNÇÕES DE PERSISTÊNCIA
  const handleSaveAll = async () => {
    if (!profileId) return toast.error("ID do Perfil não localizado.");
    setSavingPerfil(true);

    // Salvar Perfil e Missão
    const { error: errPerfil } = await supabase.from("perfil_viagem").update({
      nome_carro: nomeCarro,
      ano_carro: anoCarro,
      pais_atual: paisAtual,
      descricao_viagem: descricao,
      local_atual: local,
      next_destination: destino,
      status_atual: status,
      updated_at: new Date().toISOString()
    }).eq("id", profileId);

    // Atualizar Roles (Motorista e Copiloto)
    if (driverId) await supabase.from("tripulacao").update({ funcao_missao: 'motorista' }).eq('user_id', driverId);
    if (passengerId) await supabase.from("tripulacao").update({ funcao_missao: 'copiloto' }).eq('user_id', passengerId);

    if (errPerfil) toast.error(errPerfil.message);
    else {
      toast.success("SISTEMA SINCRONIZADO!");
      router.refresh();
    }
    setSavingPerfil(false);
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    const { error } = await supabase
      .from("viagens")
      .update({ origem: newOrigem, destino: newDestino })
      .eq("id", editingTrip.id);
    
    if (error) toast.error("Falha ao atualizar: " + error.message);
    else {
      toast.success("Viagem Atualizada!");
      setEditingTrip(null);
      const { data } = await supabase.from("viagens").select("*").neq("status", "concluida");
      if (data) setOpenTrips(data);
    }
  };

  const handleTripAction = async (id: string, action: 'pitstop' | 'cancelado' | 'delete' | 'concluida') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase.from("viagens").delete().eq("id", id);
        if (error) throw error;
        toast.success("Viagem Excluída!");
      } else {
        const { error } = await supabase.from("viagens").update({ status: action }).eq("id", id);
        if (error) throw error;
        
        if (action === 'concluida') {
          await supabase.from("perfil_viagem").update({ status_atual: 'stopped' }).eq("id", profileId);
        }
        
        toast.success(`Status alterado para ${action}!`);
      }
      const { data } = await supabase.from("viagens").select("*").neq("status", "concluida");
      if (data) setOpenTrips(data);
    } catch (err: any) {
      toast.error(err.message || "Erro na ação.");
    }
  };

  const canControlMission = userRole === 'admin' || userFuncao === 'copiloto';

  const handleFieldUpdate = async (field: string, value: string) => {
    if (!profileId || !canControlMission) return;
    const { error } = await supabase.from("perfil_viagem").update({ [field]: value }).eq("id", profileId);
    if (error) toast.error("Falha ao atualizar campo: " + error.message);
  };

  const handleResetEmergency = async () => {
    try {
      const { data } = await supabase.from("perfil_viagem").select("id").order("updated_at", { ascending: false });
      if (data && data.length > 1) {
        const idsToDelete = data.slice(1).map((d: any) => d.id);
        await supabase.from("perfil_viagem").delete().in("id", idsToDelete);
      }
      if (data && data.length > 0) {
        await supabase.from("perfil_viagem").update({ status_atual: 'stopped' }).eq("id", data[0].id);
      }
      toast.success("RESET DE EMERGÊNCIA CONCLUÍDO!");
      router.refresh();
    } catch (err: any) {
      toast.error("Erro no reset: " + err.message);
    }
  };

  const handleStatusChange = async (newStatus: "traveling" | "stopped" | "pitstop" | "canceled") => {
    if (!profileId) return toast.error("ID do Perfil não localizado.");
    
    if (newStatus === 'traveling') {
      const { data } = await supabase.from("perfil_viagem").select("status_atual").eq("id", profileId).maybeSingle();
      if (data && data.status_atual === 'traveling') {
        toast.error("Finalize a viagem atual antes de iniciar uma nova.");
        return;
      }
    }

    setStatus(newStatus);

    try {
      const { error: errPerfil } = await supabase
        .from("perfil_viagem")
        .update({
          status_atual: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId);

      if (errPerfil) throw errPerfil;

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || profileId;

      const { data: activeTrip } = await supabase.from("viagens").select("*").eq("status", "traveling").limit(1).maybeSingle();

      if (newStatus === 'stopped') {
        if (activeTrip) {
          const timeline = activeTrip.distancia && activeTrip.distancia.startsWith('[') ? JSON.parse(activeTrip.distancia) : [];
          timeline.push({ status: 'concluida', timestamp: new Date().toISOString(), local });
          await supabase.from("viagens").update({ status: 'concluida', distancia: JSON.stringify(timeline) }).eq("id", activeTrip.id);
          toast.success("Viagem Finalizada!");
        } else {
          await supabase.from("viagens").insert({
            origem: local,
            destino: destino,
            distancia: JSON.stringify([{ status: 'stopped', timestamp: new Date().toISOString(), local }]),
            status: 'concluida',
            user_id: userId,
            criado_por: profileId,
            data_fim: new Date().toISOString()
          });
          toast.success("Viagem Finalizada!");
        }
      } else if (newStatus === 'traveling') {
        if (activeTrip) {
          const timeline = activeTrip.distancia && activeTrip.distancia.startsWith('[') ? JSON.parse(activeTrip.distancia) : [];
          timeline.push({ status: 'retorno', timestamp: new Date().toISOString(), local });
          await supabase.from("viagens").update({ distancia: JSON.stringify(timeline) }).eq("id", activeTrip.id);
          toast.success("Retorno à viagem registrado!");
        } else {
          await supabase.from("viagens").insert({
            origem: local,
            destino: destino,
            distancia: JSON.stringify([{ status: 'traveling', timestamp: new Date().toISOString(), local }]),
            status: 'traveling',
            user_id: userId,
            criado_por: profileId,
            data_inicio: new Date().toISOString()
          });
          toast.success("Partida iniciada!");
        }
      } else if (newStatus === 'canceled') {
        if (activeTrip) {
          const timeline = activeTrip.distancia && activeTrip.distancia.startsWith('[') ? JSON.parse(activeTrip.distancia) : [];
          timeline.push({ status: 'canceled', timestamp: new Date().toISOString(), local });
          await supabase.from("viagens").update({ status: 'cancelada', distancia: JSON.stringify(timeline) }).eq("id", activeTrip.id);
        } else {
          await supabase.from("viagens").insert({
            origem: local,
            destino: destino,
            distancia: "N/A",
            status: 'cancelada',
            user_id: userId,
            criado_por: profileId
          });
        }
        toast.success("Viagem Cancelada!");
      } else if (newStatus === 'pitstop') {
        toast.success("Pit Stop registrado!");
      }

      router.refresh();
    } catch (error: any) {
      console.error("Erro detalhado:", JSON.stringify(error, null, 2));
      toast.error(error.message || "Erro ao atualizar status.");
    }
  };
  const handlePitstopToggle = async () => {
    try {
      const { data: activeTrip } = await supabase.from("viagens").select("*").in("status", ["traveling", "stopped"]).limit(1).maybeSingle();
      
      if (!activeTrip) {
        toast.error("Nenhuma viagem em andamento para alternar Pitstop.");
        return;
      }

      const nextStatus = activeTrip.status === "traveling" ? "stopped" : "traveling";
      const timeline = activeTrip.distancia && activeTrip.distancia.startsWith("[") ? JSON.parse(activeTrip.distancia) : [];
      timeline.push({ status: nextStatus === "stopped" ? "pitstop" : "retorno", timestamp: new Date().toISOString(), local });

      const { error } = await supabase.from("viagens")
        .update({ status: nextStatus, distancia: JSON.stringify(timeline) })
        .eq("id", activeTrip.id);

      if (error) throw error;

      await supabase.from("perfil_viagem").update({ status_atual: nextStatus }).eq("id", profileId);
      setStatus(nextStatus);

      toast.success(nextStatus === "stopped" ? "☕ PIT STOP Registrado!" : "🚀 Viagem Retomada!");

      const { data: allViagens } = await supabase.from("viagens").select("*").order("created_at", { ascending: false });
      if (allViagens) {
        setOpenTrips(allViagens.filter((v: any) => v.status !== 'concluida'));
        setHistoryTrips(allViagens.filter((v: any) => v.status === 'concluida').slice(0, 5));
      }
    } catch (err: any) {
      toast.error("Erro no Pitstop: " + err.message);
    }
  };
  const handleFinalizeTrip = async () => {
    try {
      const { data: activeTrip } = await supabase.from("viagens").select("*").neq("status", "concluida").limit(1).maybeSingle();
      if (activeTrip) {
        const timeline = activeTrip.distancia && activeTrip.distancia.startsWith('[') ? JSON.parse(activeTrip.distancia) : [];
        timeline.push({ status: 'concluida', timestamp: new Date().toISOString(), local });
        await supabase.from("viagens").update({ status: 'concluida', data_fim: new Date().toISOString(), distancia: JSON.stringify(timeline) }).eq("id", activeTrip.id);
        
        await supabase.from("perfil_viagem").update({ status_atual: 'stopped' }).eq("id", profileId);
        setStatus('stopped');
        toast.success("Viagem Finalizada!");
        
        const { data: allViagens } = await supabase.from("viagens").select("*").order("created_at", { ascending: false });
        if (allViagens) {
          setOpenTrips(allViagens.filter((v: any) => v.status !== 'concluida'));
          setHistoryTrips(allViagens.filter((v: any) => v.status === 'concluida').slice(0, 5));
        }
        router.refresh();
      }
      setTripToFinalize(false);
    } catch (e: any) {
      toast.error("Erro ao finalizar: " + e.message);
    }
  };
  const promptPartidaConfirm = async () => {
    try {
      const { data: plannedTrip } = await supabase.from("viagens").select("*").eq("status", "planejada").limit(1).maybeSingle();
      if (plannedTrip && plannedTrip.distancia && plannedTrip.distancia.includes(':::')) {
        const parts = plannedTrip.distancia.split(':::');
        const km = parseInt(parts[0]) || 0;
        const mins = parseInt(parts[1]) || 0;
        
        const arrivalDate = new Date(Date.now() + mins * 60000);
        const arrivalStr = arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setDetectedKm(km);
        setEstimatedArrival(arrivalStr);
        setShowPartidaConfirm(true);
      } else {
        handleStatusChange('traveling');
      }
    } catch(e) {
      handleStatusChange('traveling');
    }
  };
  const handleAIPlan = async () => {
    if (!local || !destino) {
      toast.error("Por favor, preencha origem e destino.");
      return;
    }
    setLoadingAI(true);

    let calcDist = "119km";
    let minutosEstimados = 90;

    try {
      if (openaiKey) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: "You are a GPS. Determine the exact road distance between the requested cities. Return JSON: {'distancia_km': number}."
              },
              {
                role: "user",
                content: `Route from ${local} to ${destino}.`
              }
            ]
          })
        });

        const json = await response.json();
        if (json.choices && json.choices[0]) {
          const result = JSON.parse(json.choices[0].message.content);
          calcDist = `${result.distancia_km}km`;
        }
      } else if (geminiKey) {
        calcDist = "86.7km";
      } else {
        toast.warning("Nenhuma chave de IA cadastrada. Usando cálculo estático.");
      }

      const kmNumber = parseFloat(calcDist.replace(/[^\d.]/g, '')) || 86.7;
      minutosEstimados = Math.round((kmNumber / 80) * 60);

      const minsStr = minutosEstimados >= 60 
        ? `${Math.floor(minutosEstimados / 60)}h ${minutosEstimados % 60}m` 
        : `${minutosEstimados}m`;

      setDetectedKm(kmNumber);
      setEstimatedArrival(minsStr);
      setShowPartidaConfirm(true);
    } catch (e: any) {
      toast.error("Erro na IA: " + e.message);
    } finally {
      setLoadingAI(false);
    }
  };

  const confirmStartMission = async () => {
    try {
      const { error } = await supabase.from("viagens").insert({
        origem: local,
        destino: destino,
        distancia: `${detectedKm}km`,
        status: 'traveling',
        criado_por: profileId,
        distancia_total: detectedKm,
        tempo_estimado_minutos: Math.round((detectedKm / 80) * 60)
      });
      if (error) throw error;

      await supabase.from("perfil_viagem").update({ status_atual: 'traveling', next_destination: destino, local_atual: local }).eq("id", profileId);
      setStatus('traveling');
      setShowPartidaConfirm(false);
      toast.success("Missão iniciada com sucesso!");

      const { data: allViagens } = await supabase.from("viagens").select("*").order("created_at", { ascending: false });
      if (allViagens) {
        setOpenTrips(allViagens.filter((v: any) => v.status !== 'concluida'));
      }
    } catch(e: any) {
      toast.error("Falha ao iniciar missão: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pt-12 pb-32 flex flex-col items-center gap-8 font-sans">

      {/* CABEÇALHO */}
      <header className="w-full max-w-4xl flex justify-between items-center border-b-2 border-zinc-800 pb-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black italic tracking-tighter text-[var(--mario-red)]">PAINEL DO COMANDANTE</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Sistema de Gerenciamento Elevan v2.0</p>
        </div>
        <Link href="/" className="game-button bg-zinc-800 px-6 py-2 text-xs font-bold flex items-center gap-2">
          <HomeIcon size={16} /> VOLTAR AO MAPA
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">

        {/* CARD: CONTROLE DE MISSÃO (START/STOP) */}
        <section className="glass-panel p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
          <h2 className="text-xl font-black flex items-center gap-2 text-[var(--mario-blue)] uppercase italic">
            <ShieldCheck /> Controle de Missão {!canControlMission && "(Informativo)"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleAIPlan}
              disabled={!canControlMission || loadingAI}
              className={`py-4 rounded-2xl border-4 border-black font-black flex flex-col items-center gap-1 transition-all ${!canControlMission || loadingAI ? 'opacity-50 cursor-not-allowed' : ''} bg-zinc-800 hover:bg-zinc-700`}
            >
              <Search size={24} /> {loadingAI ? "ESTUDANDO..." : "🔍 CALCULAR ROTA"}
            </button>
            <button
              onClick={() => setTripToFinalize(true)}
              disabled={!canControlMission}
              className={`py-4 rounded-2xl border-4 border-black font-black flex flex-col items-center gap-1 transition-all ${!canControlMission ? 'opacity-50 cursor-not-allowed' : ''} ${status === 'stopped' ? 'bg-green-600 scale-95 shadow-inner' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              <Coffee size={24} /> CHEGADA
            </button>
            <button
              onClick={handlePitstopToggle}
              disabled={!canControlMission}
              className={`py-4 rounded-2xl border-4 border-black font-black flex flex-col items-center gap-1 transition-all ${!canControlMission ? 'opacity-50 cursor-not-allowed' : ''} ${status === 'traveling' ? 'bg-[var(--mario-yellow)] text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`}
            >
              {status === 'traveling' ? (
                <>
                  <Coffee size={24} /> ☕ PIT STOP
                </>
              ) : (
                <>
                  <Zap size={24} /> 🚀 RETORNAR VIAGEM
                </>
              )}
            </button>
            <button
              onClick={() => handleStatusChange('canceled')}
              disabled={!canControlMission}
              className={`py-4 rounded-2xl border-4 border-black font-black flex flex-col items-center gap-1 transition-all ${!canControlMission ? 'opacity-50 cursor-not-allowed' : ''} ${status === 'canceled' ? 'bg-red-500 scale-95 shadow-inner' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              <XCircle size={24} /> CANCELAR
            </button>
          </div>
          <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-xl">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Localização Atual</label>
              <input 
                value={local} 
                onChange={e => setLocal(e.target.value)} 
                onBlur={() => handleFieldUpdate('local_atual', local)}
                disabled={!canControlMission}
                className="bg-zinc-900 border-2 border-zinc-800 p-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
                placeholder="Ex: Roma, Itália" 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Próximo Destino</label>
              <input 
                value={destino} 
                onChange={e => setDestino(e.target.value)} 
                onBlur={() => handleFieldUpdate('next_destination', destino)}
                disabled={!canControlMission}
                className="bg-zinc-900 border-2 border-zinc-800 p-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
                placeholder="Ex: Paris, França" 
              />
            </div>
          </div>
          {canControlMission && (
            <button 
              onClick={handleResetEmergency} 
              className="game-button bg-red-600 text-white font-black text-[10px] py-2 mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700"
            >
              🚨 RESET DE EMERGÊNCIA
            </button>
          )}
        </section>

        {/* CARD: TRIPULAÇÃO (PT-BR) */}
        <section className="glass-panel p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
          <h2 className="text-xl font-black flex items-center gap-2 text-[var(--mario-green)] uppercase italic">
            <Users /> Gestão de Tripulação
          </h2>
          <div className="flex flex-col gap-4 bg-black/20 p-4 rounded-xl">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Definir Motorista</label>
              <select value={driverId} onChange={e => setDriverId(e.target.value)} className="bg-zinc-900 p-2 rounded-lg border-2 border-zinc-800 font-bold">
                <option value="">Selecione...</option>
                {recruits.filter(r => r.status === 'aprovado').map((r, index) => <option key={r.user_id || index} value={r.user_id}>{r.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Definir Copiloto</label>
              <select
                value={passengerId}
                onChange={e => setPassengerId(e.target.value)}
                className="bg-zinc-900 p-2 rounded-lg border-2 border-zinc-800"
              >
                <option value="">Selecione o Copiloto...</option>
                {recruits
                  .filter(r => r.status === 'aprovado')
                  .map((r, index) => (
                    <option key={r.user_id || index} value={r.user_id}> {r.nome} </option>
                  ))
                }
              </select>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 italic">* Somente membros aprovados aparecem nesta lista.</p>
        </section>

        {/* CARD: PERFIL DO VEÍCULO */}
        <section className="glass-panel p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <h2 className="text-xl font-black flex items-center gap-2 text-[var(--mario-yellow)] uppercase italic">
            <Settings /> Perfil do Veículo
          </h2>
          <input value={nomeCarro} onChange={e => setNomeCarro(e.target.value)} placeholder="Nome do Carro" className="bg-zinc-900 p-2 rounded border border-zinc-800" />
          <input value={anoCarro} onChange={e => setAnoCarro(e.target.value)} placeholder="Ano/Modelo" className="bg-zinc-900 p-2 rounded border border-zinc-800" />
          <input value={paisAtual} onChange={e => setPaisAtual(e.target.value)} placeholder="País da Expedição" className="bg-zinc-900 p-2 rounded border border-zinc-800" />
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição da Missão" className="bg-zinc-900 p-2 rounded border border-zinc-800 h-24 resize-none" />
        </section>

        {/* CARD: NÚCLEO DE IA (CHAVES E TELEMETRIA) */}
        <section className="glass-panel p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 bg-zinc-900/60">
          <h2 className="text-xl font-black flex items-center gap-2 text-zinc-500 uppercase italic">
            <BrainCircuit /> Núcleo Neural de IA
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black p-2 rounded border border-zinc-800">
              <Key size={14} className="text-zinc-600" />
              <input type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="OpenAI Key" className="bg-transparent text-[10px] flex-1 outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-black p-2 rounded border border-zinc-800">
              <Key size={14} className="text-zinc-600" />
              <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} placeholder="Gemini Key" className="bg-transparent text-[10px] flex-1 outline-none" />
            </div>
          </div>
          <button
            onClick={handleAIPlan}
            disabled={loadingAI}
            className="game-button bg-[var(--mario-yellow)] text-black font-black py-3 text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            {loadingAI ? "PROCESSANDO TELEMETRIA..." : "CALCULAR ROTA VIA IA"}
          </button>
          {distanciaIA && (
            <div className="bg-green-500/10 border border-green-500/50 p-2 rounded text-center">
              <p className="text-green-500 text-xs font-black uppercase">Último ETA: {distanciaIA}</p>
            </div>
          )}
        </section>

        {/* CARD: SOLICITAÇÕES DE NOVOS MEMBROS */}
        <section className="md:col-span-2 glass-panel p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black mb-6 uppercase italic text-zinc-400">Solicitações de Embarque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruits.filter(r => r.status === 'pendente').length === 0 ? (
              <p className="text-zinc-600 font-bold uppercase text-xs py-4 col-span-full text-center">Nenhum recruta aguardando aprovação.</p>
            ) : (
              recruits.filter(r => r.status === 'pendente').map((rec, index) => (
                <div key={rec.user_id || index} className="bg-zinc-900 p-4 rounded-2xl border-2 border-zinc-800 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm uppercase">{rec.nome}</p>
                      <p className="text-[10px] text-zinc-500">{rec.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      const { error } = await supabase.from("tripulacao").update({ status: 'aprovado', role: 'usuario', funcao_missao: 'passageiro' }).eq('user_id', rec.user_id);
                      if (error) {
                        console.error("Erro detalhado:", JSON.stringify(error, null, 2));
                        toast.error(error.message);
                      } else {
                        toast.success("Aprovado!");
                        router.refresh();
                      }
                    }} className="flex-1 bg-green-600 p-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1"><CheckCircle size={14} /> Aprovar</button>
                    <button onClick={async () => {
                      const { error } = await supabase.from("tripulacao").delete().eq('user_id', rec.user_id);
                      if (error) {
                        console.error("Erro detalhado:", JSON.stringify(error, null, 2));
                        toast.error(error.message);
                      } else {
                        toast.error("Recusado.");
                        router.refresh();
                      }
                    }} className="bg-red-600 p-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1"><Trash2 size={14} /> Rejeitar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CARD: GESTÃO DE VIAGENS DUAL */}
        <section className="md:col-span-2 glass-panel p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LADO ESQUERDO: VIAGEM ATIVA */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black uppercase italic text-[var(--mario-green)] flex items-center gap-2">
                <Zap size={20} /> Viagem Ativa
              </h2>
              {openTrips.filter(t => t.status === 'traveling').length === 0 ? (
                <div className="bg-zinc-900/50 border-2 border-zinc-800 p-8 rounded-2xl flex items-center justify-center h-full min-h-[150px]">
                  <p className="text-zinc-500 font-bold uppercase text-xs">Nenhuma viagem em curso.</p>
                </div>
              ) : (
                openTrips.filter(t => t.status === 'traveling').map((trip) => (
                  <div key={trip.id} className="bg-zinc-900 p-4 rounded-2xl border-2 border-[var(--mario-green)] flex flex-col gap-4">
                    <div className="flex flex-col">
                      <p className="font-black text-sm uppercase">{trip.origem} ➔ {trip.destino}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Status: <strong className="text-green-500 uppercase">{trip.status}</strong></p>
                    </div>
                    {canControlMission && (
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <button 
                          onClick={() => setTripToFinalize(true)} 
                          className="col-span-2 bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg text-[10px] font-black uppercase"
                        >
                          Finalizar Viagem
                        </button>
                        <button 
                          onClick={() => {
                            setEditingTrip(trip);
                            setNewOrigem(trip.origem);
                            setNewDestino(trip.destino);
                          }} 
                          className="col-span-2 bg-zinc-700 p-2 rounded-lg text-[10px] font-black uppercase"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* LADO DIREITO: HISTÓRICO RECENTE */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black uppercase italic text-zinc-400 flex items-center gap-2">
                <History size={20} /> Histórico Recente (Top 5)
              </h2>
              {historyTrips.length === 0 ? (
                <div className="bg-zinc-900/50 border-2 border-zinc-800 p-8 rounded-2xl flex items-center justify-center h-full min-h-[150px]">
                  <p className="text-zinc-500 font-bold uppercase text-xs">Nenhum registro concluído.</p>
                </div>
              ) : (
                historyTrips.map((trip) => (
                  <div key={trip.id} className="bg-zinc-900 p-4 rounded-2xl border-2 border-zinc-800 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <p className="font-bold text-xs uppercase">{trip.origem} ➔ {trip.destino}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">Chegada: {trip.data_fim ? new Date(trip.data_fim).toLocaleTimeString() : 'N/A'}</p>
                      </div>
                      <span className="text-[9px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400 font-black uppercase">
                        Concluída
                      </span>
                    </div>
                    {canControlMission && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => {
                            setEditingTrip(trip);
                            setNewOrigem(trip.origem);
                            setNewDestino(trip.destino);
                          }} 
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white p-1 rounded font-bold text-[9px] uppercase flex items-center justify-center gap-1"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => setTripToDelete(trip.id)} 
                          className="flex-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 p-1 rounded font-bold text-[9px] uppercase flex items-center justify-center gap-1"
                        >
                          🗑️ Apagar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

        {/* Modal de Edição de Viagem */}
        {editingTrip && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col gap-4 bg-zinc-900">
              <h2 className="text-xl font-black uppercase text-[var(--mario-yellow)]">Editar Rota</h2>
              <form onSubmit={handleUpdateTrip} className="flex flex-col gap-3">
                <input value={newOrigem} onChange={e => setNewOrigem(e.target.value)} required className="bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white text-xs font-bold" />
                <input value={newDestino} onChange={e => setNewDestino(e.target.value)} required className="bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white text-xs font-bold" />
                <div className="flex gap-2">
                  <button type="submit" className="game-button bg-green-500 text-white font-bold py-2 text-xs flex-1">Salvar</button>
                  <button type="button" onClick={() => setEditingTrip(null)} className="game-button bg-red-500 text-white font-bold py-2 text-xs flex-1">Fechar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal de Confirmação de Exclusão */}
        {tripToDelete && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl border-4 border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full flex flex-col gap-6 bg-zinc-950 text-white">
              <div className="flex flex-col gap-2 text-center">
                <XCircle size={40} className="text-red-500 mx-auto animate-pulse" />
                <h2 className="text-xl font-black uppercase text-red-500">Confirmar Exclusão</h2>
                <p className="text-xs text-zinc-400 font-bold">Deseja realmente apagar esta viagem concluída permanentemente?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={async () => {
                    const { error } = await supabase.from("viagens").delete().eq("id", tripToDelete);
                    if (error) toast.error("Erro ao apagar!");
                    else {
                      toast.success("Registro apagado.");
                      const { data } = await supabase.from("viagens").select("*").eq("status", "concluida").order("created_at", { ascending: false }).limit(5);
                      if (data) setHistoryTrips(data);
                    }
                    setTripToDelete(null);
                  }} 
                  className="game-button bg-red-600 text-white font-bold py-2 text-xs flex-1 uppercase"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setTripToDelete(null)} 
                  className="game-button bg-zinc-800 text-white font-bold py-2 text-xs flex-1 uppercase"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Confirmação de Finalização */}
        {tripToFinalize && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl border-4 border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full flex flex-col gap-6 bg-zinc-950 text-white">
              <div className="flex flex-col gap-2 text-center">
                <CheckCircle size={40} className="text-green-500 mx-auto animate-pulse" />
                <h2 className="text-xl font-black uppercase text-green-500">Encerrar Missão?</h2>
                <p className="text-xs text-zinc-400 font-bold">Deseja realmente marcar a viagem atual como concluída?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleFinalizeTrip} 
                  className="game-button bg-green-600 text-white font-bold py-2 text-xs flex-1 uppercase"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setTripToFinalize(false)} 
                  className="game-button bg-zinc-800 text-white font-bold py-2 text-xs flex-1 uppercase"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Confirmação de Partida/Resumo */}
        {showPartidaConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl border-4 border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full flex flex-col gap-6 bg-zinc-950 text-white">
              <div className="flex flex-col gap-2 text-center">
                <Zap size={40} className="text-[var(--mario-yellow)] mx-auto animate-pulse" />
                <h2 className="text-xl font-black uppercase text-[var(--mario-yellow)]">📍 Rota Detectada</h2>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-left text-xs font-bold text-zinc-300 mt-2 flex flex-col gap-2">
                  <p>📍 Rota: <span className="text-white">{local} → {destino}</span></p>
                  <p>📏 Distância: <span className="text-white font-black">{detectedKm} KM</span></p>
                  <p>⏱️ Estimativa (80km/h): <span className="text-green-400 font-black">{estimatedArrival}</span></p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={confirmStartMission} 
                  className="game-button bg-green-600 text-white font-bold py-2 text-xs flex-1 uppercase"
                >
                  🚀 INICIAR MISSÃO
                </button>
                <button 
                  onClick={() => setShowPartidaConfirm(false)} 
                  className="game-button bg-zinc-800 text-white font-bold py-2 text-xs flex-1 uppercase"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* BOTÃO MESTRE DE SINCRONIZAÇÃO */}
        <div className="md:col-span-2 mt-4">
          <button
            onClick={handleSaveAll}
            disabled={savingPerfil}
            className="game-button bg-white text-black w-full py-6 text-2xl font-black italic uppercase shadow-[0px_0px_20px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-95 transition-all"
          >
            {savingPerfil ? "SINCRONIZANDO..." : "SALVAR TODAS AS ALTERAÇÕES NO SISTEMA"}
          </button>
        </div>

      </div>
    </div>
  );
}