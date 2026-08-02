import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ttStats, ttRegister, ttGetTicket, ttFindTicket, TtParticipant, TtStats } from './supa';

const input = 'w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-white transition';

export default function Gramignata() {
  const [stats, setStats] = useState<TtStats | null>(null);
  const [nome, setNome] = useState(''); const [contatto, setContatto] = useState('');
  const [adulti, setAdulti] = useState(2); const [bimbi, setBimbi] = useState(0);
  const [note, setNote] = useState(''); const [consenso, setConsenso] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [mio, setMio] = useState<TtParticipant | null>(null);
  const [qr, setQr] = useState('');
  const [recupero, setRecupero] = useState('');

  const EVENTO = new Date('2026-08-08T19:00:00+02:00').getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, EVENTO - now);
  const gg = Math.floor(diff / 86400000), hh = Math.floor(diff / 3600000) % 24,
    mm = Math.floor(diff / 60000) % 60, ss = Math.floor(diff / 1000) % 60;
  useEffect(() => { ttStats().then(setStats); }, []);
  useEffect(() => {
    const tid = localStorage.getItem('tt_tid');
    if (tid) ttGetTicket(tid).then((p) => { if (p) setMio(p); });
  }, []);
  useEffect(() => { if (mio) QRCode.toDataURL('tt:' + mio.id, { width: 280, margin: 1 }).then(setQr); }, [mio]);

  const chiuse = stats ? (new Date() > new Date(stats.deadline) || stats.taken >= stats.cap) : false;
  const rimasti = stats ? Math.max(0, stats.cap - stats.taken) : null;

  const invia = async () => {
    setErr('');
    if (nome.trim().length < 2) { setErr('Inserisci il nome'); return; }
    if (contatto.trim().length < 3) { setErr('Inserisci un contatto (telefono o email)'); return; }
    if (!consenso) { setErr('Serve il consenso privacy'); return; }
    setBusy(true);
    try {
      const p = await ttRegister({ name: nome.trim(), contact: contatto.trim(), adults: adulti, children: bimbi, notes: note.trim(), consent: consenso });
      localStorage.setItem('tt_tid', p.id);
      setMio(p);
      ttStats().then(setStats);
    } catch (e: any) {
      const m = String(e.message || e);
      setErr(m.includes('duplicate') ? 'Questo contatto risulta già iscritto: usa "Recupera tagliandino" qui sotto.' : m.includes('esauriti') ? 'Posti esauriti.' : m.includes('chiuse') ? 'Le iscrizioni sono chiuse.' : 'Errore: ' + m);
    }
    setBusy(false);
  };

  const recupera = async () => {
    setErr('');
    const f = await ttFindTicket(recupero.trim());
    if (!f) { setErr('Nessuna iscrizione trovata con questo contatto.'); return; }
    localStorage.setItem('tt_tid', f.id);
    const p = await ttGetTicket(f.id);
    if (p) setMio(p);
  };

  if (mio) {
    return (
      <div className="space-y-5 animate-fade-in-up pt-10 max-w-sm mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">La Gramignata · 8 agosto</p>
        <h1 className="text-3xl font-bold text-white">Ci sei, {mio.name.split(' ')[0]}!</h1>
        <p className="text-neutral-300 text-sm">{mio.adults} adulti · {mio.children} bambini — mostra questo QR all'arrivo.</p>
        {qr && <img src={qr} alt="QR tagliandino" className="mx-auto bg-white p-3" style={{ width: 240 }} />}
        <p className="text-neutral-400 text-xs">Sabato 8 agosto, ore 19:00 · Chiesa di San Martino. Contributo: 20 € adulti · 10 € bambini — si paga alla serata.</p>
        {mio.checked_in && <p className="text-emerald-400 text-sm font-semibold">✓ Check-in effettuato — buon appetito!</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pt-10 max-w-md mx-auto">
      <div className="-mx-5 relative mb-14">
        <img src="./hero-gramignata.jpg" alt="Il tramonto sulla valle di San Martino"
             className="w-full h-[210px] object-cover object-bottom" />
        <div className="absolute inset-0 hero-fade" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-9 w-[92px] h-[92px] badge-disc flex items-center justify-center">
          <img src="./gramignata-mark.svg" alt="" className="w-[86px] h-[86px]" />
        </div>
      </div>
      <div className="text-center space-y-3">
        <h1 className="font-display text-5xl text-white leading-none">La Gramignata</h1>
        <div className="w-12 h-[2px] mx-auto" style={{ background: '#A8322A' }} />
        <p className="text-[11px] tracked text-white font-bold">Sabato 8 agosto 2026 · ore 19</p>
        <p className="text-[12px] text-neutral-400">Chiesa di San Martino — San Martino Vallata, Polinago</p>
        <p className="text-neutral-300 text-sm pt-1">La cena di San Martino sotto le stelle della valle. Contributo: 20 € adulti · 10 € bambini, a sostegno dei progetti della valle — si paga alla serata.</p>
        <div className="grid grid-cols-4 gap-2 text-center border border-neutral-800 py-3">
          {[[gg, 'giorni'], [hh, 'ore'], [mm, 'min'], [ss, 'sec']].map(([v, l]) => (
            <div key={l as string}>
              <div className="text-2xl font-light text-white tabular-nums">{String(v).padStart(2, '0')}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        {stats && (
          <p className="text-amber-300 text-sm font-semibold">
            {stats.taken} iscritti · {rimasti} posti disponibili · iscrizioni entro le 20:00 di mercoledì 5 agosto
          </p>
        )}
      </div>
      <div className="hairline bg-neutral-950 p-6 space-y-5">
        <p className="text-[10px] tracked gold text-center">Il menù della serata</p>
        <div className="rule-gold w-10 mx-auto" />
        <div className="space-y-4 text-center">
          {[['Per iniziare', 'Spritz e Gin Lemon, con stuzzichini'],
            ['Il piatto', 'Gramigna alla salsiccia'],
            ['Dalla piastra', 'Tigelle e gnocco fritto'],
            ['Per finire', 'La crescentina fritta di San Martino']].map(([t, v], i) => (
            <div key={t} className={i > 0 ? 'pt-4 border-t border-neutral-800/80' : ''}>
              <p className="text-[10px] tracked gold">{t}</p>
              <p className="font-display text-lg text-white mt-1">{v}</p>
            </div>
          ))}
        </div>
        <div className="hairline py-3 text-center">
          <p className="font-display text-xl text-white">20 € adulti · 10 € bambini</p>
          <p className="text-neutral-400 text-[11px] mt-1">acqua e vino inclusi nel coperto</p>
        </div>
        <p className="text-neutral-500 text-xs text-center">Intolleranze o allergie? Scrivilo nelle note dell'iscrizione: la cucina ne tiene conto.</p>
      </div>
      {chiuse ? (
        <p className="text-center text-red-400 font-semibold">Iscrizioni chiuse{stats && stats.taken >= stats.cap ? ': posti esauriti' : ''}. Chiedi nel gruppo WhatsApp per eventuali rinunce.</p>
      ) : (
        <div className="space-y-3">
          <input placeholder="Nome e cognome" value={nome} onChange={(e) => setNome(e.target.value)} className={input} />
          <input placeholder="Telefono o email" value={contatto} onChange={(e) => setContatto(e.target.value)} className={input} />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-neutral-300 text-sm space-y-1 block">Adulti
              <input type="number" min={1} max={20} value={adulti} onChange={(e) => setAdulti(Math.max(1, +e.target.value || 1))} className={input} />
            </label>
            <label className="text-neutral-300 text-sm space-y-1 block">Bambini
              <input type="number" min={0} max={20} value={bimbi} onChange={(e) => setBimbi(Math.max(0, +e.target.value || 0))} className={input} />
            </label>
          </div>
          <input placeholder="Note (intolleranze, seggioloni…)" value={note} onChange={(e) => setNote(e.target.value)} className={input} />
          <label className="flex items-start gap-2 text-neutral-300 text-xs">
            <input type="checkbox" checked={consenso} onChange={(e) => setConsenso(e.target.checked)} className="mt-0.5" />
            <span>Acconsento al trattamento dei dati per la gestione dell'evento.</span>
          </label>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button onClick={invia} disabled={busy}
            className="w-full bg-white text-black px-3 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs disabled:opacity-40 hover:bg-neutral-200 transition">
            {busy ? 'Invio…' : 'Iscrivimi alla Gramignata'}
          </button>
        </div>
      )}
      <div className="border-t border-neutral-800 pt-4 space-y-2">
        <p className="text-neutral-400 text-xs uppercase tracking-[0.2em]">Già iscritto? Recupera il tagliandino</p>
        <div className="flex gap-2">
          <input placeholder="Il contatto usato all'iscrizione" value={recupero} onChange={(e) => setRecupero(e.target.value)}
            className="flex-1 bg-black border border-neutral-800 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white transition" />
          <button onClick={recupera} className="border border-neutral-700 text-white px-4 text-sm hover:border-white transition">Trova</button>
        </div>
      </div>
    </div>
  );
}
