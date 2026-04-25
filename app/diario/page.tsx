"use client";

import { useState, useEffect } from "react";
import { Camera, ArrowLeft, Upload, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function DiarioDeBordo() {
  const { isLoggedIn } = useAuth();
  const [photos] = useState<any[]>([]);
  const [legenda, setLegenda] = useState("");

  const mockPhotos = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=400&q=80",
      legenda: "Primeira parada no Posto Graal!",
      checkpoint: "Posto Graal",
      data: "24/04/2026",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
      legenda: "Pôr do sol maravilhoso na estrada.",
      checkpoint: "Ribeirão Preto",
      data: "24/04/2026",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-4 pt-12 pb-24 gap-6">
      {/* Botão Voltar */}
      <div className="w-full max-w-md md:max-w-4xl flex justify-start">
        <Link
          href="/"
          className="game-button bg-zinc-800 text-white text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Voltar para o Mapa
        </Link>
      </div>

      <main className="w-full max-w-md md:max-w-4xl flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Camera
            size={48}
            className="text-[var(--mario-red)] animate-bounce"
          />
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--mario-yellow)]">
            Diário de Bordo
          </h1>
          <p className="text-xs text-zinc-400">
            Momentos capturados na nossa expedição
          </p>
        </div>

        {/* Formulário de Postagem (Apenas Logados) */}
        {isLoggedIn && (
          <form className="w-full glass-panel p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-900/50 flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Upload size={16} /> Novo Registro
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Foto
              </label>
              <input
                type="file"
                className="text-xs text-zinc-400 bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl w-full font-bold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Legenda
              </label>
              <textarea
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                placeholder="Como foi esse momento?"
                className="bg-zinc-800 border-2 border-zinc-700 p-2 rounded-xl text-white text-xs font-bold h-16 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success("Foto enviada com sucesso!");
                setLegenda("");
              }}
              className="game-button bg-[var(--mario-green)] text-white w-full text-xs mt-1"
            >
              Publicar no Diário
            </button>
          </form>
        )}

        {/* Galeria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {(photos.length > 0 ? photos : mockPhotos).map((photo) => (
            <div
              key={photo.id}
              className="glass-panel p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-800/50 flex flex-col gap-2"
            >
              <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-black bg-zinc-900">
                <img
                  src={photo.url}
                  alt={photo.legenda}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[8px] bg-zinc-900/80 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border border-zinc-700">
                  <MapPin size={8} /> {photo.checkpoint}
                </span>
              </div>
              <p className="text-sm font-bold text-left text-zinc-100">
                {photo.legenda}
              </p>
              <span className="text-[10px] font-medium text-left text-zinc-400 mt-auto">
                {photo.data}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
