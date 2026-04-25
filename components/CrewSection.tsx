"use client";

interface CrewMember {
  name: string;
  role: string;
  avatar: string;
}

interface CrewSectionProps {
  driver: CrewMember;
  passenger: CrewMember;
}

export function CrewSection({ driver, passenger }: CrewSectionProps) {
  return (
    <div className="w-full glass-panel p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/50">
      <h3 className="text-xs font-black uppercase tracking-widest text-center mb-4 text-zinc-400">
        Tripulação (Character Select)
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Motorista */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="relative w-20 h-20 rounded-full border-4 border-[var(--mario-red)] overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-all">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-red-500/50" />
            <img
              src={
                driver.avatar ||
                "https://api.dicebear.com/7.x/pixel-art/svg?seed=driver"
              }
              alt={driver.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter text-[var(--mario-red)]">
            {driver.name}
          </span>
          <span className="text-[10px] font-bold uppercase text-white bg-red-600 px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {driver.role}
          </span>
        </div>

        {/* Passageiro */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="relative w-20 h-20 rounded-full border-4 border-[var(--mario-blue)] overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-all">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-blue-500/50" />
            <img
              src={
                passenger.avatar ||
                "https://api.dicebear.com/7.x/pixel-art/svg?seed=passenger"
              }
              alt={passenger.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter text-[var(--mario-blue)]">
            {passenger.name}
          </span>
          <span className="text-[10px] font-bold uppercase text-white bg-blue-600 px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {passenger.role}
          </span>
        </div>
      </div>
    </div>
  );
}
