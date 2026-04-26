"use client";

import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PlanejadorPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("tripulacao")
        .select("role, funcao_missao")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (prof) {
        if (prof.role !== 'admin' && prof.funcao_missao !== 'copiloto') {
          toast.error("Acesso restrito ao Comando.");
          router.push("/");
          return;
        }
      } else {
        router.push("/");
        return;
      }
      setLoading(false);
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    const fetchPlanned = async () => {
      const { data } = await supabase
        .from("viagens")
        .select("*")
        .eq("status", "planejado");
      if (data) setTrips(data);
    };
    if (!loading) fetchPlanned();
  }, [loading]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origem || !destino) return toast.error("Preencha origem e destino!");

    try {
      const { error } = await supabase.from("viagens").insert({
        origem,
        destino,
        status: 'planejado',
        distancia: "Calculando...",
        created_at: data ? new Date(data).toISOString() : new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Viagem Planejada!");
      setOrigem("");
      setDestino("");
      setData("");
      
      const { data: updated } = await supabase
        .from("viagens")
        .select("*")
        .eq("status", "planejado");
      if (updated) setTrips(updated);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar.");
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-bold text-xs uppercase">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 md:p-8 pb-24">
      <header className="w-full max-w-4xl flex justify-between items-center border-b-2 border-zinc-800 pb-4 mb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black italic tracking-tighter text-[var(--mario-yellow)]">PLANEJADOR DE MISSÃO</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Rotas Futuras</p>
        </div>
        <Link href="/" className="game-button bg-zinc-800 px-4 py-2 text-xs font-bold flex items-center gap-1">
          <ArrowLeft size={16} /> VOLTAR
        </Link>
      </header>

      <main className="w-full max-w-md flex flex-col gap-6">
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/40 flex flex-col gap-4">
          <h2 className="text-sm font-black uppercase text-[var(--mario-yellow)] flex items-center gap-2">
            <Plus size={18} /> Novo Destino
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Origem</label>
            <input type="text" value={origem} onChange={e => setOrigem(e.target.value)} required className="bg-zinc-900 border-2 border-zinc-800 p-2 rounded-xl text-xs font-bold focus:outline-none text-white" placeholder="Ex: Roma" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Destino</label>
            <input type="text" value={destino} onChange={e => setDestino(e.target.value)} required className="bg-zinc-900 border-2 border-zinc-800 p-2 rounded-xl text-xs font-bold focus:outline-none text-white" placeholder="Ex: Paris" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Data Prevista</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)} className="bg-zinc-900 border-2 border-zinc-800 p-2 rounded-xl text-xs font-bold focus:outline-none text-white" />
          </div>
          <button type="submit" className="game-button bg-[var(--mario-green)] text-white font-black py-2 text-xs mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            SALVAR NO CRONOGRAMA
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-black uppercase text-zinc-400">Rotas Planejadas ({trips.length})</h2>
          {trips.map(t => (
            <div key={t.id} className="glass-panel p-4 rounded-xl border border-zinc-800 bg-black/40 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs font-bold">
                <MapPin size={14} className="text-[var(--mario-red)]" />
                <span>{t.origem} ➔ {t.destino}</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700 text-zinc-400 flex items-center gap-1">
                <Calendar size={10} /> Planejado
              </span>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
