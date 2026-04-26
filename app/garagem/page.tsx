"use client";

import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import { ArrowLeft, Gauge, Fuel, Zap, Thermometer } from "lucide-react";

export default function GaragemPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 md:p-8 pb-24">
      <header className="w-full max-w-4xl flex justify-between items-center border-b-2 border-zinc-800 pb-4 mb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black italic tracking-tighter text-[var(--mario-yellow)]">GARAGEM DA ELEVAN</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Telemetria do Veículo</p>
        </div>
        <Link href="/" className="game-button bg-zinc-800 px-4 py-2 text-xs font-bold flex items-center gap-1">
          <ArrowLeft size={16} /> VOLTAR
        </Link>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 text-[var(--mario-yellow)]">
            <Gauge /> Velocidade & Potência
          </h2>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Velocidade Atual</span>
            <span className="text-2xl font-black text-white italic">0 KM/H</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Rotação do Motor</span>
            <span className="text-2xl font-black text-white italic">800 RPM</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 text-[var(--mario-red)]">
            <Fuel /> Combustível & Autonomia
          </h2>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Nível do Tanque</span>
            <span className="text-2xl font-black text-white italic">75%</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Autonomia Estimada</span>
            <span className="text-2xl font-black text-white italic">450 KM</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 text-[var(--mario-blue)]">
            <Zap /> Sistema Elétrico
          </h2>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Tensão da Bateria</span>
            <span className="text-2xl font-black text-white italic">12.8 V</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Carga Solar</span>
            <span className="text-2xl font-black text-green-500 italic">ATIVO</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 text-zinc-400">
            <Thermometer /> Climatização
          </h2>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Temperatura Interna</span>
            <span className="text-2xl font-black text-white italic">22°C</span>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-zinc-800">
            <span className="font-bold text-xs uppercase text-zinc-400">Temperatura Externa</span>
            <span className="text-2xl font-black text-white italic">18°C</span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
