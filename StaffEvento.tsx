import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ttStaffList, ttCheckIn, ttCheckInN, ttResetCheckin, ttGetTicket } from './supa';

interface P {
  id: string; name: string; contact?: string; adults: number; children: number;
  notes?: string | null; checked_in: boolean;
  arrived_adults?: number | null; arrived_children?: number | null;
}

const ADULTO = 20, BIMBO = 10;


function Contatore({ label, val, max, set }: { label: string; val: number; max: number; set: (n: number) => void }) {
  return (
    <div className="border border-neutral-800 p-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">{label}</p>
      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={() => set(Math.max(0, val - 1))}
          className="w-9 h-9 border border-neutral-700 text-white text-lg leading-none hover:border-white">-</button>
        <span className="text-2xl font-bold text-white w-8 tabular-nums">{val}</span>
        <button onClick={() => set(Math.min(max, val + 1))}
          className="w-9 h-9 border border-neutral-700 text-white text-lg leading-none hover:border-white">+</button>
      </div>
      <p className="text-[10px] text-neutral-500 mt-2">su {max} prenotati</p>
    </div>
  );
}

export default function StaffEvento() {
  const [pin, setPin] = useState(sessionStorage.getItem('sm2_staff_pin') || '');
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('sm2_staff_pin'));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<P[]>([]);
  const [msg, setMsg] = useState('');
  const [scanning, setScanning] = useState(false);
  const [query, setQuery] = useState('');
  const [soloDaFare, setSoloDaFare] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastSeen = useRef<Record<string, number>>({});

  // pannello "chi è arrivato?"
  const [conf, setConf] = useState<P | null>(null);
  const [nA, setNA] = useState(0);
  const [nB, setNB] = useState(0);

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

  const apriConferma = (p: P) => {
    setConf(p);
    setNA(p.arrived_adults ?? p.adults);
    setNB(p.arrived_children ?? p.children);
    setMsg('');
  };

  /** Prenotazione da 1 sola persona: registra subito. Altrimenti chiede chi c'è. */
  const registra = async (p: P) => {
    if (p.adults + p.children <= 1) {
      try { await ttCheckIn(p.id, pin); setMsg('✓ ' + p.name); refresh(); }
      catch (e: any) { setMsg('Errore: ' + (e.message || e)); }
      return;
    }
    apriConferma(p);
  };

  const conferma = async (a: number, b: number) => {
    if (!conf) return;
    try {
      await ttCheckInN(conf.id, pin, a, b);
      setMsg('✓ ' + conf.name + ' — ' + a + ' adulti · ' + b + ' bambini' +
        (a + b < conf.adults + conf.children ? ' (mancano ' + (conf.adults + conf.children - a - b) + ')' : ''));
      setConf(null);
      refresh();
    } catch (e: any) { setMsg('Errore: ' + (e.message || e)); }
  };

  const onScan = async (raw: string) => {
    const id = raw.startsWith('tt:') ? raw.slice(3) : raw;
    const now = Date.now();
    if (lastSeen.current[id] && now - lastSeen.current[id] < 8000) return;
    lastSeen.current[id] = now;
    try {
      const p = (await ttGetTicket(id)) as P | null;
      if (!p) { setMsg('QR non riconosciuto'); return; }
      const gia = list.find((x) => x.id === id);
      const rec = { ...(gia || {}), ...p } as P;
      if (rec.checked_in) {
        const a = rec.arrived_adults ?? rec.adults, b = rec.arrived_children ?? rec.children;
        setMsg('Già registrato: ' + rec.name + ' (' + a + 'A·' + b + 'B). Tocca per correggere.');
        apriConferma(rec);
        return;
      }
      await registra(rec);
    } catch (e: any) { setMsg('Errore: ' + (e.message || e)); }
  };

  const startScan = async () => {
    setScanning(true); setMsg('');
    setTimeout(async () => {
      const sc = new Html5Qrcode('scanner-ev');
      scannerRef.current = sc;
      try {
        await sc.start({ facingMode: 'environment' }, { fps: 8, qrbox: 220 }, (t) => onScan(t), () => {});
      } catch { setMsg('Fotocamera non disponibile — usa la lista qui sotto'); setScanning(false); }
    }, 100);
  };
  const stopScan = async () => { await scannerRef.current?.stop().catch(() => {}); setScanning(false); };

  const arrA = (p: P) => (p.checked_in ? (p.arrived_adults ?? p.adults) : 0);
  const arrB = (p: P) => (p.checked_in ? (p.arrived_children ?? p.children) : 0);

  const tot = list.reduce((n, p) => n + p.adults + p.children, 0);
  const arrivati = list.reduce((n, p) => n + arrA(p) + arrB(p), 0);
  const incasso = list.reduce((n, p) => n + arrA(p) * ADULTO + arrB(p) * BIMBO, 0);
  const mancanti = tot - arrivati;

  const q = query.trim().toLowerCase();
  const filtered = list
    .filter((p) => (!q || p.name.toLowerCase().includes(q) || (p.contact || '').toLowerCase().includes(q)))
    .filter((p) => (!soloDaFare || arrA(p) + arrB(p) < p.adults + p.children));

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

      <div className="grid grid-cols-4 gap-2 text-center">
        {[[String(tot), 'attesi'], [String(arrivati), 'arrivati'], [String(mancanti), 'mancano'], [incasso + ' €', 'incassato']].map(([v, l]) => (
          <div key={l} className="border border-neutral-800 py-3">
            <div className="text-xl font-bold text-white">{v}</div>
            <div className="text-[9px] text-neutral-400 uppercase tracking-[0.12em] mt-1">{l}</div>
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
      <p className="text-neutral-500 text-[11px] text-center">
        Se il QR non si legge, cerca il nome nella lista qui sotto e tocca <span className="text-neutral-300">Arrivato</span>.
      </p>
      {msg && <p className="text-center text-sm text-amber-300">{msg}</p>}

      {/* ---- pannello conferma presenze ---- */}
      {conf && (
        <div className="hairline bg-neutral-950 p-4 space-y-4">
          <div className="text-center">
            <p className="text-[10px] tracked gold">Chi è arrivato?</p>
            <p className="font-display text-2xl text-white mt-1">{conf.name}</p>
            <p className="text-neutral-400 text-xs mt-1">
              Ha prenotato per {conf.adults} adulti · {conf.children} bambini
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Contatore label="Adulti" val={nA} max={conf.adults} set={setNA} />
            <Contatore label="Bambini" val={nB} max={conf.children} set={setNB} />
          </div>

          <p className="text-center text-sm text-white">
            Da incassare ora: <span className="font-bold">{nA * ADULTO + nB * BIMBO} €</span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => conferma(conf.adults, conf.children)}
              className="bg-white text-black py-3 font-semibold uppercase tracking-[0.15em] text-xs">
              Ci sono tutti
            </button>
            <button onClick={() => conferma(nA, nB)}
              className="border border-neutral-600 text-white py-3 font-semibold uppercase tracking-[0.15em] text-xs hover:border-white">
              Conferma {nA + nB}
            </button>
          </div>
          <button onClick={() => setConf(null)}
            className="w-full text-neutral-500 text-xs hover:text-white">Annulla</button>
          <p className="text-neutral-500 text-[11px] text-center">
            Se gli altri arrivano dopo, ritocca il nome nella lista e aggiorna il numero.
          </p>
        </div>
      )}

      <input placeholder="Cerca per nome o contatto…" value={query} onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white" />

      <label className="flex items-center gap-2 text-xs text-neutral-400">
        <input type="checkbox" checked={soloDaFare} onChange={(e) => setSoloDaFare(e.target.checked)} />
        Mostra solo chi deve ancora arrivare (o è arrivato in parte)
      </label>

      <div className="space-y-1">
        {filtered.map((p) => {
          const a = arrA(p), b = arrB(p);
          const attesi = p.adults + p.children;
          const parziale = p.checked_in && a + b < attesi;
          return (
            <div key={p.id} className="flex items-center justify-between gap-2 border-b border-neutral-800 py-2 text-sm">
              <span className="text-neutral-200 min-w-0">
                {p.name}{' '}
                <span className="text-neutral-500">({p.adults}A·{p.children}B)</span>
                {p.checked_in && (
                  <span className={parziale ? 'text-amber-300 text-xs' : 'text-emerald-400 text-xs'}>
                    {' '}— arrivati {a}A·{b}B{parziale ? ' (mancano ' + (attesi - a - b) + ')' : ''}
                  </span>
                )}
                {p.notes ? <span className="text-amber-300/70 text-xs"> — {p.notes}</span> : null}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {p.checked_in ? (
                  <>
                    <button className="border border-neutral-700 px-2 py-0.5 text-xs text-white hover:border-white"
                      onClick={() => apriConferma(p)}>correggi</button>
                    <button title="Annulla arrivo" className="text-neutral-500 hover:text-white"
                      onClick={async () => { await ttResetCheckin(p.id, pin).catch(() => {}); refresh(); }}>↺</button>
                  </>
                ) : (
                  <button className="bg-white text-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em]"
                    onClick={() => registra(p)}>arrivato</button>
                )}
              </span>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-neutral-500 text-xs">Nessuna iscrizione.</p>}
        {list.length > 0 && filtered.length === 0 && <p className="text-neutral-500 text-xs">Nessun risultato.</p>}
      </div>

      <button disabled={list.length === 0}
        onClick={() => {
          const rows = [['Nome', 'Contatto', 'Adulti prenotati', 'Bambini prenotati', 'Adulti arrivati', 'Bambini arrivati', 'Incassato €', 'Note', 'Arrivato']]
            .concat(list.map((p) => [
              p.name, p.contact || '', String(p.adults), String(p.children),
              String(arrA(p)), String(arrB(p)),
              String(arrA(p) * ADULTO + arrB(p) * BIMBO),
              p.notes || '', p.checked_in ? 'SI' : 'NO',
            ]));
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
