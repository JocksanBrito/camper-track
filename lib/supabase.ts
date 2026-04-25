import { createClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

// Sanitização: Remove a barra '/' do final, se houver
const supabaseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

console.log("Supabase Client Inicializado com URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Busca apenas os pontos de rastreamento CONFIRMADOS pelo administrador.
 * Garante a privacidade dos dados brutos de GPS.
 */
export async function getPublicTrackPoints() {
  const { data, error } = await supabase
    .from("track_points")
    .select("*")
    .eq("is_confirmed", true)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Erro ao buscar pontos públicos:", error);
    return [];
  }

  return data;
}
