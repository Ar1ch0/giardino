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
  supabaseUrl || "https://xctpjwvjfbqioussqvmc.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdHBqd3ZqZmJxaW91c3Nxdm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODM4NjYsImV4cCI6MjEwNDU1OTg2Nn0.c6KJW5CSq9dWkJIr1hzUaTUjvo7dvvXRwQnFszxXM_Q"
);

export const MEDIA_BUCKET = "giardino-media-2";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}