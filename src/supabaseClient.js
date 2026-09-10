import { createClient } from "@supabase/supabase-js";

// Prendi questi due valori da Supabase: Project Settings > API
// Poi mettili in un file .env nella root del progetto Vite:
//
// VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
// VITE_SUPABASE_ANON_KEY=la-tua-chiave-anon-pubblica
//
// Non committare mai il file .env su GitHub (Vite lo esclude già di default).

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || "https://tuo-progetto.supabase.co",
  supabaseAnonKey || "chiave-anon-placeholder"
);

export const MEDIA_BUCKET = "giardino-media";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}