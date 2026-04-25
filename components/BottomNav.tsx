"use client";

import { Home, Map, Shield, User } from "lucide-react";
import { useState } from "react";

export function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "mapa", label: "Mapa", icon: Map },
    { id: "garagem", label: "Garagem", icon: Shield },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-t-2 border-[var(--game-border)] px-4 py-2 md:hidden">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive
                  ? "text-[var(--mario-red)] scale-110"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={20} fill={isActive ? "currentColor" : "none"} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
