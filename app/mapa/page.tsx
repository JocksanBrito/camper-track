"use client";

import { useState, useEffect } from "react";
import { TrackMap } from "@/components/TrackMap";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MapaPage() {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
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
          lat: 40.6333, 
          lng: 15.8000, 
          label: c.destino,
          timestamp: c.data_partida || new Date().toISOString(),
        }));
        mergedPoints = [...mergedPoints, ...calPts];
      }
      setPoints(mergedPoints);
    };
    loadRealData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-4 md:p-8 pb-24">
      <header className="w-full max-w-4xl flex justify-between items-center border-b-2 border-zinc-800 pb-4 mb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black italic tracking-tighter text-[var(--mario-blue)]">ROTA DA MISSÃO</h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Visão Expandida do Trajeto</p>
        </div>
        <Link href="/" className="game-button bg-zinc-800 px-4 py-2 text-xs font-bold flex items-center gap-1">
          <ArrowLeft size={16} /> VOLTAR
        </Link>
      </header>

      <main className="w-full max-w-4xl h-[60vh] relative">
        <TrackMap points={points} />
      </main>

      <BottomNav />
    </div>
  );
}
