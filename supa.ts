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

// ---------------- Tortellonata (8 agosto 2026) ----------------
export interface TtParticipant { id: string; name: string; adults: number; children: number; checked_in: boolean; }
export interface TtStats { taken: number; cap: number; deadline: string; }

export async function ttStats(): Promise<TtStats | null> {
  const { data, error } = await supa.rpc('tt_public_stats');
  if (error) return null;
  return data as TtStats;
}
export async function ttRegister(p: { name: string; contact: string; adults: number; children: number; notes: string; consent: boolean }): Promise<TtParticipant> {
  const id = crypto.randomUUID();
  const { error } = await supa.from('tt_participants')
    .insert({ id, name: p.name, contact: p.contact, adults: p.adults, children: p.children, notes: p.notes, consent: p.consent });
  if (error) throw error;
  return { id, name: p.name, adults: p.adults, children: p.children, checked_in: false };
}
export async function ttGetTicket(id: string): Promise<TtParticipant | null> {
  const { data, error } = await supa.rpc('tt_get_ticket', { p_id: id });
  if (error || !data || !(data as any[]).length) return null;
  return (data as any[])[0] as TtParticipant;
}
export async function ttFindTicket(contact: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supa.rpc('tt_find_ticket', { p_contact: contact });
  if (error || !data || !(data as any[]).length) return null;
  return (data as any[])[0];
}

// ---------------- Anfora delle idee ----------------
export async function ideaInvia(idea: string, luogo: string, aiuto: string, contatto: string): Promise<boolean> {
  const { error } = await supa.from('sm2030_idee').insert({
    idea: idea.trim().slice(0, 400),
    luogo: luogo || null,
    aiuto: aiuto.trim() ? aiuto.trim().slice(0, 200) : null,
    contatto: contatto.trim() ? contatto.trim().slice(0, 120) : null,
  });
  return !error;
}
export async function ideeTotale(): Promise<number> {
  const { data, error } = await supa.rpc('sm2030_idee_count');
  return error ? 0 : (data as number) || 0;
}
