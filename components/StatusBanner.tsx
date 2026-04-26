"use client";

import { Coffee, Moon, Zap, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface StatusBannerProps {
  status: "traveling" | "stopped";
  currentLocation: string;
  nextDestination?: string;
  updatedAt: string; // ISO String
}

export function StatusBanner({
  status,
  currentLocation,
  nextDestination,
  updatedAt,
}: StatusBannerProps) {
  const [timeElapsed, setTimeElapsed] = useState("");
  const [displayState, setDisplayState] = useState<
    "traveling" | "stopped" | "sleeping"
  >(status);

  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: "user" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const totalOnline = Object.keys(state).length;
        setOnlineCount(totalOnline > 0 ? totalOnline : 1);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const calculateTime = () => {
      const updated = new Date(updatedAt).getTime();
      const now = new Date().getTime();
      const diffMs = now - updated;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Lógica Zzz (> 12h parado)
      if (status === "stopped" && diffHours > 12) {
        setDisplayState("sleeping");
      } else {
        setDisplayState(status);
      }

      // Telemetria
      if (diffHours < 1) {
        setTimeElapsed(`${Math.floor(diffMs / (1000 * 60))} min`);
      } else if (diffHours < 24) {
        setTimeElapsed(`${Math.floor(diffHours)}h`);
      } else {
        setTimeElapsed(`${Math.floor(diffHours / 24)}d`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [status, updatedAt]);

  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
    setFormattedTime(
      new Date(updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [updatedAt]);

  const stateConfig = {
    traveling: {
      title: "VIAJANDO AGORA",
      desc: `Destino: ${nextDestination || "Próximo Checkpoint"}`,
      icon: Zap,
      color: "bg-green-500 animate-pulse",
    },
    stopped: {
      title: "ESTACIONADO / PIT STOP",
      desc: `Parados em: ${currentLocation}`,
      icon: Coffee,
      color: "bg-[var(--mario-blue)]",
    },
    sleeping: {
      title: "Em Repouso",
      desc: "MODO REPOUSO: Recuperando energias",
      icon: Moon,
      color: "bg-purple-600",
    },
  };

  const currentConfig = stateConfig[displayState];
  const Icon = currentConfig.icon;

  return (
    <div className="w-full glass-panel p-4 rounded-xl relative bg-zinc-900/50 flex items-center justify-between transition-all duration-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4">
        {/* Ícone Flutuante */}
        <div
          className={`p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white ${currentConfig.color} animate-bounce-slow`}
        >
          <Icon
            size={24}
            fill={displayState === "sleeping" ? "currentColor" : "none"}
          />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-sm font-black uppercase tracking-wider">
            {currentConfig.title}
          </span>
          <span className="text-xs text-zinc-300">{currentConfig.desc}</span>
          {status === 'traveling' && (
            <span className="text-[10px] text-[var(--mario-yellow)] font-black uppercase mt-0.5">Início: {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        <div className="flex items-center gap-1 text-[9px] bg-green-500/20 text-green-400 font-black uppercase px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">
          <Users size={10} fill="currentColor" />
          <span>{onlineCount} Online</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase">
          <Clock size={12} />
          <span>{timeElapsed}</span>
        </div>
        <span className="text-[9px] text-zinc-500 font-bold">
          Último sinal: {formattedTime}
        </span>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
