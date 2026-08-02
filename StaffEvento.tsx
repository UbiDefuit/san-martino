import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ttStaffList, ttCheckIn, ttResetCheckin, ttGetTicket } from './supa';

interface P { id: string; name: string; contact?: string; adults: number; children: number; notes?: string | null; checked_in: boolean; }

export default function StaffEvento() {
  const [pin, setPin] = useState(sessionStorage.getItem('sm2_staff_pin') || '');
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('sm2_staff_pin'));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<P[]>([]);
  const [msg, setMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const [query, setQuery] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastSeen = useRef<Record<string, number>>({});

  const refresh = () => ttStaffList(pin).then((d) => setList(d as P[])).catch(() => {});
  useEffect(() => { if (authed) refresh(); }, [authed]);

  const entra = async () => {
    setErr(''); setBusy(true);
    try {
      await ttStaffList(pin);
      sessionStorage.setItem('sm2_staff_pin', pin);
      setAuthed(true);
    } catch { setErr('PIN errato'); }
    setBusy(false);
  };

  const onScan = async (raw: string) => {
    const id = raw.startsWith('tt:') ? raw.slice(3) : raw;
    const now = Date.now();
    if (lastSeen.current[id] && now - lastSeen.current[id] < 8000) return;
    lastSeen.current[id] = now;
    try {
      const p = await ttGetTicket(id);
      if (!p) { setMsg('QR non riconosciuto'); return; }
      if (p.checked_in) { setMsg('✓ ' + p.name + ': già registrato'); return; }
      await ttCheckIn(id, pin);
      setMsg('✓ ' + p.name + ' — ' + p.adults + ' adulti · ' + p.children + ' bambini');
      refresh();
    } catch (e: any) { setMsg('Errore: ' + (e.message || e)); }
  };

  const startScan = async () => {
    setScanning(true); setMsg('');
    setTimeout(async () => {
      const sc = new Html5Qrcode('scanner-ev');
      scannerRef.current = sc;
      try {
        await sc.start({ facingMode: 'environment' }, { fps: 8, qrbox: 220 }, (t) => onScan(t), () => {});
      } catch { setMsg('Fotocamera non disponibile'); setScanning(false); }
    }, 100);
  };
  const stopScan = async () => { await scannerRef.current?.stop().catch(() => {}); setScanning(false); };

  const tot = list.reduce((n, p) => n + p.adults + p.children, 0);
  const arrivati = list.filter((p) => p.checked_in).reduce((n, p) => n + p.adults + p.children, 0);
  const incasso = list.filter((p) => p.checked_in).reduce((n, p) => n + p.adults * 20 + p.children * 10, 0);
  const filtered = query ? list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())) : list;

  if (!authed) {
    return (
      <div className="space-y-4 animate-fade-in-up pt-12 max-w-xs mx-auto text-center">
        <h1 className="text-2xl font-bold text-white">Staff · La Gramignata</h1>
        <p className="text-neutral-300 text-sm">Area riservata ai volontari.</p>
        <input type="password" inputMode="numeric" placeholder="PIN" value={pin}
          onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entra()}
          className="w-full bg-black border border-neutral-800 px-4 py-3.5 text-white text-center tracking-[0.5em] focus:outline-none focus:border-white transition" />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button onClick={entra} disabled={busy}
          className="w-full bg-white text-black px-3 py-3 font-semibold uppercase tracking-[0.15em] text-xs disabled:opacity-40">
          {busy ? 'Verifica…' : 'Entra'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up pt-8">
      <h1 className="text-2xl font-bold text-white">Staff · La Gramignata</h1>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[[String(tot), 'attesi'], [String(arrivati), 'arrivati'], [incasso + ' €', 'incassato']].map(([v, l]) => (
          <div key={l} className="border border-neutral-800 py-3">
            <div className="text-2xl font-bold text-white">{v}</div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] mt-1">{l}</div>
          </div>
        ))}
      </div>

      {scanning ? (
        <>
          <div id="scanner-ev" className="w-full" />
          <button onClick={stopScan} className="w-full border border-neutral-700 text-white py-3 text-xs uppercase tracking-[0.15em]">Ferma scansione</button>
        </>
      ) : (
        <button onClick={startScan} className="w-full bg-white text-black py-3.5 font-semibold uppercase tracking-[0.15em] text-xs">
          Scansiona tagliandino
        </button>
      )}
      {msg && <p className="text-center text-sm text-amber-300">{msg}</p>}

      <input placeholder="Cerca per nome…" value={query} onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white" />

      <div className="space-y-1">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 border-b border-neutral-800 py-2 text-sm">
            <span className="text-neutral-200">
              {p.name} <span className="text-neutral-500">({p.adults}A·{p.children}B · {p.adults * 20 + p.children * 10} €)</span>
              {p.notes ? <span className="text-amber-300/80 text-xs"> — {p.notes}</span> : null}
            </span>
            <span className="flex items-center gap-2 shrink-0">
              {p.checked_in
                ? <><span className="text-emerald-400 text-xs">✓</span>
                    <button title="Annulla" className="text-neutral-500 hover:text-white"
                      onClick={async () => { await ttResetCheckin(p.id, pin).catch(() => {}); refresh(); }}>↺</button></>
                : <button className="border border-neutral-700 px-2 py-0.5 text-xs text-white hover:border-white"
                    onClick={async () => { await ttCheckIn(p.id, pin).catch(() => {}); refresh(); }}>arrivato</button>}
            </span>
          </div>
        ))}
        {list.length === 0 && <p className="text-neutral-500 text-xs">Nessuna iscrizione.</p>}
      </div>

      <button disabled={list.length === 0}
        onClick={() => {
          const rows = [['Nome', 'Contatto', 'Adulti', 'Bambini', 'Totale €', 'Note', 'Arrivato']]
            .concat(list.map((p) => [p.name, p.contact || '', String(p.adults), String(p.children), String(p.adults * 20 + p.children * 10), p.notes || '', p.checked_in ? 'SI' : 'NO']));
          const csv = '﻿' + rows.map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(';')).join('\n');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
          a.download = 'gramignata.csv'; a.click();
        }}
        className="border border-neutral-700 text-white px-4 py-2 text-xs hover:border-white disabled:opacity-40">
        Esporta CSV per la cucina
      </button>
    </div>
  );
}
