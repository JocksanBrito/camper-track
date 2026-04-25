interface Point {
  lat: number;
  lng: number;
  timestamp: string | Date;
}

interface LegStats {
  distanceKm: number;
  timeSpentHours: number;
  averageSpeedKmh: number;
}

/**
 * Calcula as estatísticas de um trecho (leg) entre dois pontos.
 * Usa a Fórmula de Haversine para calcular a distância.
 */
export function calculateLegStats(pointA: Point, pointB: Point): LegStats {
  const R = 6371; // Raio da Terra em KM
  
  const dLat = (pointB.lat - pointA.lat) * Math.PI / 180;
  const dLng = (pointB.lng - pointA.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pointA.lat * Math.PI / 180) * Math.cos(pointB.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  
  const timeA = new Date(pointA.timestamp).getTime();
  const timeB = new Date(pointB.timestamp).getTime();
  const timeSpentMs = Math.abs(timeB - timeA);
  const timeSpentHours = timeSpentMs / (1000 * 60 * 60);
  
  const averageSpeedKmh = timeSpentHours > 0 ? distanceKm / timeSpentHours : 0;
  
  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    timeSpentHours: Number(timeSpentHours.toFixed(2)),
    averageSpeedKmh: Number(averageSpeedKmh.toFixed(2)),
  };
}
