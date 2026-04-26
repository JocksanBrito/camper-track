"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users } from "lucide-react";

export function OnlinePresence() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        const { data: prof } = await supabase
          .from("tripulacao")
          .select("nome, foto_url, role, funcao_missao")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (prof) setProfile(prof);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const presenceKey = user?.id || `anon-${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase.channel("missao-live", {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const uniqueUsers = new Map();

        for (const key in state) {
          const presences = state[key] as any[];
          presences.forEach((p) => {
            if (p.user_id && p.user_id !== "anon") {
              uniqueUsers.set(p.user_id, p);
            } else {
              uniqueUsers.set(key, p);
            }
          });
        }
        setOnlineUsers(Array.from(uniqueUsers.values()));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const trackData = user
            ? {
                user_id: user.id,
                nome: profile?.nome || user.user_metadata?.full_name || "Tripulante",
                foto_url: profile?.foto_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`,
                type: "member",
                role: profile?.role || "usuario",
                funcao: profile?.funcao_missao || "passageiro",
              }
            : {
                user_id: "anon",
                nome: "Visitante",
                foto_url: "",
                type: "visitor",
              };

          await channel.track(trackData);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, profile]);

  const membersOnline = onlineUsers.filter((u) => u.type === "member");
  const visitorsCount = onlineUsers.filter((u) => u.type === "visitor").length;

  return (
    <div className="flex flex-col items-center mt-2 mb-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-zinc-900/60 backdrop-blur-md border-2 border-zinc-800 px-4 py-2 rounded-full hover:border-zinc-700 transition-all active:scale-95 shadow-lg group"
      >
        {/* Pulso Verde */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>

        {/* Facepile de Avatares */}
        {membersOnline.length > 0 && (
          <div className="flex -space-x-2 overflow-hidden">
            {membersOnline.slice(0, 5).map((u, idx) => (
              u.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-950 object-cover"
                  src={u.foto_url}
                  alt={u.nome}
                  title={`${u.nome} (${u.role === 'admin' ? 'Piloto' : u.funcao === 'copiloto' ? 'Copiloto' : 'Passageiro'})`}
                />
              ) : (
                <div
                  key={idx}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white"
                  title={u.nome}
                >
                  {u.nome[0]}
                </div>
              )
            ))}
          </div>
        )}

        {/* Texto do Contador */}
        <span className="text-xs font-bold text-zinc-300">
          {membersOnline.length > 0 
            ? `${membersOnline.length} Membro${membersOnline.length > 1 ? 's' : ''} Online`
            : "Radar Ativo"}
          {visitorsCount > 0 && ` + ${visitorsCount} espectador${visitorsCount > 1 ? 'es' : ''}`}
        </span>
      </button>

      {/* Dropdown de Detalhes */}
      {isOpen && membersOnline.length > 0 && (
        <div className="absolute mt-12 z-[50] bg-zinc-950 border-2 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 min-w-[220px]">
          <p className="text-[9px] font-black uppercase text-zinc-400 border-b border-zinc-800 pb-1 mb-1 flex items-center gap-1">
            <Users size={12} /> Tripulantes Conectados
          </p>
          
          <div className="flex flex-col gap-2">
            {membersOnline.map((u, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {u.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.foto_url} alt={u.nome} className="w-6 h-6 rounded-full border border-black bg-zinc-800 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px] font-bold">
                    {u.nome[0]}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">{u.nome}</span>
                  <span className="text-[8px] font-black uppercase text-[var(--mario-yellow)]">
                    {u.role === 'admin' ? 'Piloto' : u.funcao === 'copiloto' ? 'Copiloto' : 'Passageiro Virtual'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
