import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ttStats, ttRegister, ttGetTicket, ttFindTicket, TtParticipant, TtStats } from './supa';

const input = 'w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-white transition';

export default function Tortellonata() {
  const [stats, setStats] = useState<TtStats | null>(null);
  const [nome, setNome] = useState(''); const [contatto, setContatto] = useState('');
  const [adulti, setAdulti] = useState(2); const [bimbi, setBimbi] = useState(0);
  const [note, setNote] = useState(''); const [consenso, setConsenso] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [mio, setMio] = useState<TtParticipant | null>(null);
  const [qr, setQr] = useState('');
  const [recupero, setRecupero] = useState('');

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
        <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">Tortellonata · 8 agosto</p>
        <h1 className="text-3xl font-bold text-white">Ci sei, {mio.name.split(' ')[0]}!</h1>
        <p className="text-neutral-300 text-sm">{mio.adults} adulti · {mio.children} bambini — mostra questo QR all'arrivo.</p>
        {qr && <img src={qr} alt="QR tagliandino" className="mx-auto bg-white p-3" style={{ width: 240 }} />}
        <p className="text-neutral-400 text-xs">Sabato 8 agosto, ore 19:00 · Chiesa di San Martino. Offerta libera a sostegno dei progetti dell'associazione.</p>
        {mio.checked_in && <p className="text-emerald-400 text-sm font-semibold">✓ Check-in effettuato — buon appetito!</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pt-10 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">Sabato 8 agosto · ore 19:00 · Chiesa di San Martino</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">🍝 TORTELLONATA</h1>
        <p className="text-neutral-300 text-sm">Tortelloni per tutti sotto le stelle della valle. Offerta libera a sostegno dei progetti di San Martino 2030.</p>
        {stats && (
          <p className="text-amber-300 text-sm font-semibold">
            {stats.taken} iscritti · {rimasti} posti disponibili · iscrizioni entro le 20:00 di mercoledì 5 agosto
          </p>
        )}
      </div>
      <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300 text-center">Il menù</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-white font-semibold">Per rompere il ghiaccio</p>
            <p className="text-neutral-300">Gin Lemon e Spritz, con stuzzichini</p>
          </div>
          <div>
            <p className="text-white font-semibold">I tortelloni — tre assaggi</p>
            <p className="text-neutral-300">Burro e salvia · Ragù · e un terzo a sorpresa (funghi o pancetta: si decide all'ultimo, come si fa in valle)</p>
          </div>
          <div>
            <p className="text-white font-semibold">Per finire</p>
            <p className="text-neutral-300">Dolci della comunità e la famosissima <span className="text-white font-semibold">crescentina fritta di San Martino</span></p>
          </div>
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
            {busy ? 'Invio…' : 'Iscrivimi alla Tortellonata'}
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
