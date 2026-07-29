import { createClient } from '@supabase/supabase-js';

// Chiave anon pubblica per design (protetta da RLS lato database)
const URL = 'https://vkhbajdzouyewflcfyqz.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZraGJhamR6b3V5ZXdmbGNmeXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzQ3MTgsImV4cCI6MjA5OTYxMDcxOH0.9N5s4VT7_f8K8nPig_bkBd806WN1gnToA5RrNDkvmtE';

export const supa = createClient(URL, ANON, { auth: { persistSession: false } });

export interface Luce { id: string; nome: string; lat: number; lng: number; }

export async function elencoLuci(): Promise<Luce[]> {
  const { data } = await supa.from('sm2030_luci').select('id,nome,lat,lng').limit(5000);
  return (data as Luce[]) || [];
}

export async function accendiLuce(nome: string, lat: number, lng: number): Promise<Luce | null> {
  const { data, error } = await supa
    .from('sm2030_luci')
    .insert({ nome: nome.trim().slice(0, 30), lat, lng })
    .select('id,nome,lat,lng')
    .single();
  if (error) return null;
  return data as Luce;
}
