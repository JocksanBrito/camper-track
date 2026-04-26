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
          .select("nome, foto_url")
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
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-zinc-900 border-2 border-black px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {onlineUsers.length} Online Agora
      </button>

      {isOpen && (
        <div className="absolute top-10 z-[50] bg-zinc-950 border-2 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 min-w-[200px] text-left">
          <p className="text-[9px] font-black uppercase text-zinc-400 border-b border-zinc-800 pb-1 mb-1 flex items-center gap-1">
            <Users size={12} /> Tripulantes Online ({membersOnline.length})
          </p>
          
          {membersOnline.length === 0 ? (
            <p className="text-[10px] text-zinc-600 font-bold italic">Nenhum membro logado.</p>
          ) : (
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
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">{u.nome}</span>
                </div>
              ))}
            </div>
          )}

          {visitorsCount > 0 && (
            <p className="text-[9px] font-black uppercase text-zinc-500 pt-1 border-t border-zinc-800 mt-1 flex justify-between">
              <span>Visitantes:</span>
              <span>{visitorsCount}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
