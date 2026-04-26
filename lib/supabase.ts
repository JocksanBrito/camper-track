import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getPublicTrackPoints() {
  const { data, error } = await supabase
    .from("track_points")
    .select("*")
    .eq("is_confirmed", true)
    .order("timestamp", { ascending: true });
  if (error) return [];
  return data;
}