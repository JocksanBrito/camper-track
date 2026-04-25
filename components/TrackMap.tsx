"use client";

import dynamic from "next/dynamic";

const LeafletTrackMap = dynamic(() => import("./LeafletTrackMap"), {
  ssr: false,
  loading: () => (
    <div className="glass-panel p-3 rounded-xl game-border-blue relative w-full h-[350px] flex items-center justify-center bg-zinc-900/50 text-zinc-400 font-bold text-xs uppercase">
      Carregando Mapa...
    </div>
  ),
});

interface Point {
  id: string | number;
  lat: number;
  lng: number;
  label?: string;
}

interface TrackMapProps {
  points: Point[];
}

export function TrackMap({ points }: TrackMapProps) {
  return <LeafletTrackMap points={points} />;
}
