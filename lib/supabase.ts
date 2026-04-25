import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Busca apenas os pontos de rastreamento CONFIRMADOS pelo administrador.
 * Garante a privacidade dos dados brutos de GPS.
 */
export async function getPublicTrackPoints() {
  const { data, error } = await supabase
    .from("track_points")
    .select("*")
    .eq("is_confirmed", true) // Filtro de Privacidade Total
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Erro ao buscar pontos públicos:", error);
    return [];
  }

  return data;
}
