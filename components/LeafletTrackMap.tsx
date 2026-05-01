"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Crosshair, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Corrige problemas com os ícones padrão do Leaflet no Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface Point {
  id: string | number;
  lat: number;
  lng: number;
  label?: string;
}

interface LeafletTrackMapProps {
  points: Point[];
}

const mapStyles = {
  game: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  night: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

export default function LeafletTrackMap({ points }: LeafletTrackMapProps) {
  const [style, setStyle] = useState<keyof typeof mapStyles>("game");
  const [isManual, setIsManual] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(1);

  useEffect(() => {
    if (!isManual) {
      const currentHour = new Date().getHours();
      const isNightTime = currentHour >= 18 || currentHour < 6;
      setStyle(isNightTime ? "night" : "game");
    }
  }, [isManual]);

  useEffect(() => {
    fixLeafletIcon();
  }, []);



  const [roadPositions, setRoadPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!points || points.length < 2) return;
      try {
        // Filtra pontos duplicados consecutivos para evitar erro 500 no OSRM
        const uniquePoints = points.reduce((acc: any[], current: any) => {
          const last = acc[acc.length - 1];
          if (!last || last.lat !== current.lat || last.lng !== current.lng) {
            acc.push(current);
          }
          return acc;
        }, []);

        if (uniquePoints.length < 2) return;

        const coordsString = uniquePoints.map((p) => `${p.lng},${p.lat}`).join(";");
        const url = `/api/route-proxy?coords=${coordsString}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const routeCoords = data.routes[0].geometry.coordinates;
          const mappedCoords = routeCoords.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRoadPositions(mappedCoords);
        } else {
          setRoadPositions(points.map((p) => [p.lat, p.lng]));
        }
      } catch (error) {
        console.error("Erro ao buscar rota OSRM:", error);
        setRoadPositions(points.map((p) => [p.lat, p.lng]));
      }
    };

    fetchRoute();
  }, [points]);

  if (!points || points.length === 0) return null;

  const positions = points.map((p) => [p.lat, p.lng] as [number, number]);
  const lastPoint = points[points.length - 1];

  const isNight = style === "night";

  const camperIcon = L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative flex items-center justify-center" style="width: 40px; height: 40px;">
        <div class="absolute inset-0 bg-red-500 rounded-full blur-md ${
          isNight ? "opacity-100 scale-125" : "opacity-50"
        } animate-pulse transition-all duration-1000"></div>
        <div class="relative bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const checkpointIcon = L.divIcon({
    className: "custom-checkpoint-icon",
    html: `
      <div class="relative flex items-center justify-center" style="width: 16px; height: 16px;">
        <div class="w-4 h-4 bg-zinc-900 border-4 ${
          isNight ? "border-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" : "border-blue-500"
        } rounded-full transition-all duration-1000"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const toggleStyle = () => {
    setIsManual(true);
    setStyle((current) => {
      if (current === "game") return "satellite";
      if (current === "satellite") return "night";
      return "game";
    });
  };

  return (
    <div className="glass-panel p-1 rounded-xl game-border-blue relative w-full h-[350px] overflow-hidden bg-zinc-900/50">
      <style>{`
        .leaflet-tile {
          transition: opacity 1s ease-in-out !important;
        }
      `}</style>

      <MapContainer
        center={[lastPoint.lat, lastPoint.lng]}
        zoom={5}
        scrollWheelZoom={false}
        className="w-full h-full rounded-lg z-0"
      >
        <TileLayer
          url={mapStyles.game}
          opacity={style === "game" ? 1 : 0}
          attribution='&copy; CartoDB'
        />
        <TileLayer
          url={mapStyles.satellite}
          opacity={style === "satellite" ? 1 : 0}
          attribution='&copy; Esri'
        />
        <TileLayer
          url={mapStyles.night}
          opacity={style === "night" ? 1 : 0}
          attribution='&copy; CartoDB'
        />

        <Polyline
          positions={roadPositions.length > 0 ? roadPositions : positions}
          pathOptions={{
            color: isNight ? "#22c55e" : "#3b82f6",
            weight: isNight ? 8 : 6,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "10, 10",
          }}
        />

        {points.slice(0, -1).map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={checkpointIcon}
          />
        ))}

        <Marker
          position={[lastPoint.lat, lastPoint.lng]}
          icon={camperIcon}
        />

        {/* Controles Internos do Mapa */}
        <LocationButton points={points} />
        <MapController center={[lastPoint.lat, lastPoint.lng]} />
      </MapContainer>

      {/* Botão de Troca de Camadas */}
      <button
        onClick={toggleStyle}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1000] game-button bg-zinc-800 text-white p-3 rounded-xl border-2 border-white shadow-lg hover:bg-zinc-700 active:scale-95 transition-all"
        title="Trocar Estilo do Mapa"
      >
        <Layers size={20} />
      </button>

      <div className="absolute top-2 left-4 z-[1000] text-[10px] font-bold bg-zinc-900/80 px-2 py-0.5 rounded-full text-white uppercase tracking-wider">
        Modo: {style} {isManual ? "(Manual)" : "(Auto)"}
      </div>


    </div>
  );
}

// Componente para o Botão de Localização e fitBounds
function LocationButton({ points }: { points: Point[] }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 14, {
          duration: 2,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Não foi possível obter sua localização.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (points && points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return (
    <button
      onClick={handleLocationClick}
      disabled={loading}
      className="absolute right-4 bottom-4 z-[1000] game-button bg-zinc-800 text-white p-3 rounded-xl border-2 border-white shadow-lg hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50"
      title="Minha Localização"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin text-[var(--mario-yellow)]" />
      ) : (
        <Crosshair size={20} />
      )}
    </button>
  );
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}
