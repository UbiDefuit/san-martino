import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ttStaffList, ttCheckIn, ttCheckInN, ttResetCheckin, ttGetTicket, ttStaffAdd } from './supa';

interface P {
  id: string; name: string; contact?: string; adults: number; children: number;
  notes?: string | null; checked_in: boolean;
  arrived_adults?: number | null; arrived_children?: number | null;
}

const ADULTO = 20, BIMBO = 10;


function Contatore({ label, val, max, set, nota }: { label: string; val: number; max: number; set: (n: number) => void; nota?: string }) {
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
      {nota !== undefined ? (nota ? <p className="text-[10px] text-neutral-500 mt-2">{nota}</p> : null) : <p className="text-[10px] text-neutral-500 mt-2">su {max} prenotati</p>}
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

  // aggiunta all'ingresso
  const [addOpen, setAddOpen] = useState(false);
  const [aNome, setANome] = useState('');
  const [aAd, setAAd] = useState(2);
  const [aBi, setABi] = useState(0);
  const [aNote, setANote] = useState('');

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

  const stampaPdf = () => {
    const logo = new URL('./logo.svg', location.href).href;
    const oggi = new Date().toLocaleString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const esc = (x: any) => String(x ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const righe = list.map((p) => {
      const a = arrA(p), b = arrB(p);
      const attesi = p.adults + p.children;
      const stato = !p.checked_in ? 'atteso' : (a + b < attesi ? 'parziale' : 'arrivato');
      return `<tr class="${stato}">
        <td>${esc(p.name)}</td>
        <td class="c">${p.adults}</td><td class="c">${p.children}</td>
        <td class="c">${p.checked_in ? a : '—'}</td><td class="c">${p.checked_in ? b : '—'}</td>
        <td class="c">${p.checked_in ? (a * ADULTO + b * BIMBO) + ' €' : '—'}</td>
        <td class="note">${esc(p.notes || '')}</td>
      </tr>`;
    }).join('');

    const html = `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>La Gramignata — elenco</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Lato:wght@300;400;700&display=swap">
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Lato, Arial, sans-serif; color: #111; margin: 0; }
  header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #C9A227; padding-bottom: 10px; }
  header img { width: 54px; height: 54px; }
  h1 { font-family: Lora, Georgia, serif; font-size: 22px; margin: 0; font-weight: 600; }
  .sub { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #8a8a8a; margin-top: 3px; }
  .stampato { margin-left: auto; text-align: right; font-size: 10px; color: #8a8a8a; }
  .stats { display: flex; gap: 8px; margin: 14px 0 10px; }
  .stat { flex: 1; border: 1px solid #d8d4c8; padding: 8px; text-align: center; }
  .stat b { display: block; font-size: 20px; font-family: Lora, serif; }
  .stat span { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: #8a8a8a; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { text-align: left; font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: #8a8a8a;
       border-bottom: 1px solid #C9A227; padding: 6px 4px; }
  td { padding: 5px 4px; border-bottom: 1px solid #ececec; }
  td.c { text-align: center; }
  td.note { color: #7a7a7a; font-size: 10px; }
  tr.arrivato td:first-child::before { content: "\\2713 "; color: #1a7f37; }
  tr.parziale td:first-child::before { content: "\\25CF "; color: #b8860b; }
  tr.parziale { background: #fdf8ec; }
  tfoot td { font-weight: 700; border-top: 2px solid #C9A227; padding-top: 8px; }
  footer { margin-top: 14px; font-size: 9px; color: #9a9a9a; text-align: center; }
  @media print { .noprint { display: none; } }
  .noprint { margin: 16px 0; text-align: center; }
  .noprint button { font: inherit; padding: 10px 18px; background: #111; color: #fff; border: 0; cursor: pointer; }
</style></head><body>
<header>
  <img src="${logo}" alt="">
  <div>
    <h1>La Gramignata</h1>
    <div class="sub">Sabato 8 agosto 2026 · San Martino Vallata</div>
  </div>
  <div class="stampato">Elenco per la cucina<br>stampato il ${oggi}</div>
</header>

<div class="stats">
  <div class="stat"><b>${tot}</b><span>attesi</span></div>
  <div class="stat"><b>${arrivati}</b><span>arrivati</span></div>
  <div class="stat"><b>${mancanti}</b><span>mancano</span></div>
  <div class="stat"><b>${incasso} €</b><span>incassato</span></div>
</div>

<table>
  <thead><tr>
    <th>Nome</th><th class="c">Ad. pren.</th><th class="c">Bim. pren.</th>
    <th class="c">Ad. arriv.</th><th class="c">Bim. arriv.</th><th class="c">Incassato</th><th>Note</th>
  </tr></thead>
  <tbody>${righe}</tbody>
  <tfoot><tr>
    <td>Totale (${list.length} prenotazioni)</td>
    <td class="c">${list.reduce((n, p) => n + p.adults, 0)}</td>
    <td class="c">${list.reduce((n, p) => n + p.children, 0)}</td>
    <td class="c">${list.reduce((n, p) => n + arrA(p), 0)}</td>
    <td class="c">${list.reduce((n, p) => n + arrB(p), 0)}</td>
    <td class="c">${incasso} €</td><td></td>
  </tr></tfoot>
</table>

<footer>APS San Martino 2.0 — documento interno, contiene dati personali: non diffondere.</footer>
<div class="noprint"><button onclick="window.print()">Stampa / salva come PDF</button></div>
<script>window.onload = function () { setTimeout(function () { window.print(); }, 600); };<\/script>
</body></html>`;

    const w = window.open('', '_blank');
    if (!w) { setMsg('Il browser ha bloccato la finestra: consenti i popup e riprova.'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  };

  const aggiungi = async () => {
    if (aNome.trim().length < 2) { setMsg('Serve almeno il nome'); return; }
    try {
      await ttStaffAdd(pin, aNome.trim(), aAd, aBi, aNote.trim());
      setMsg('✓ Aggiunto ' + aNome.trim() + ' — ' + (aAd * ADULTO + aBi * BIMBO) + ' € da incassare');
      setANome(''); setAAd(2); setABi(0); setANote(''); setAddOpen(false);
      refresh();
    } catch (e: any) { setMsg('Errore: ' + (e.message || e)); }
  };

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

      {/* ---- pannello conferma presenze: finestra in primo piano ---- */}
      {conf && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
          onClick={() => setConf(null)}>
        <div className="w-full max-w-md hairline bg-neutral-950 p-4 space-y-4 max-h-[88vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
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
        </div>
      )}

      {/* ---- aggiunta all'ingresso ---- */}
      {addOpen ? (
        <div className="hairline bg-neutral-950 p-4 space-y-3">
          <p className="text-[10px] tracked gold text-center">Aggiungi all'ingresso</p>
          <p className="text-neutral-400 text-xs text-center">Per chi si presenta senza prenotazione. Viene registrato subito come arrivato.</p>
          <input placeholder="Nome e cognome" value={aNome} onChange={(e) => setANome(e.target.value)}
            className="w-full bg-black border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white" />
          <div className="grid grid-cols-2 gap-3">
            <Contatore label="Adulti" val={aAd} max={20} set={setAAd} nota="" />
            <Contatore label="Bambini" val={aBi} max={20} set={setABi} nota="" />
          </div>
          <input placeholder="Note (allergie, tavolo…)" value={aNote} onChange={(e) => setANote(e.target.value)}
            className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white" />
          <p className="text-center text-sm text-white">Da incassare: <span className="font-bold">{aAd * ADULTO + aBi * BIMBO} €</span></p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={aggiungi} className="bg-white text-black py-3 font-semibold uppercase tracking-[0.15em] text-xs">Aggiungi</button>
            <button onClick={() => setAddOpen(false)} className="border border-neutral-600 text-white py-3 uppercase tracking-[0.15em] text-xs hover:border-white">Annulla</button>
          </div>
        </div>
      ) : (
        <button onClick={() => { setAddOpen(true); setMsg(''); }}
          className="w-full border border-neutral-700 text-white py-3 text-xs uppercase tracking-[0.15em] hover:border-white">
          + Aggiungi all'ingresso (senza prenotazione)
        </button>
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

      <button disabled={list.length === 0} onClick={stampaPdf}
        className="w-full border border-neutral-700 text-white px-4 py-3 text-xs uppercase tracking-[0.15em] hover:border-white disabled:opacity-40">
        Stampa / salva PDF per la cucina
      </button>
    </div>
  );
}
