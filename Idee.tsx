import React, { useEffect, useState } from 'react';
import { ideaInvia, ideeTotale } from './supa';

const input = 'w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-white transition';
const LUOGHI_IDEA = ['', 'San Martino (nucleo)', 'La Chiesa', 'Oratorio della Rondine', 'Cà dei Rossi', 'Cà Carloni', 'Il Poggio', 'Cà Marastoni', 'Cà Lunga', 'Monte San Martino', 'I sentieri', 'Tutta la valle'];

export default function Idee() {
  const [tot, setTot] = useState<number | null>(null);
  const [idea, setIdea] = useState(''); const [luogo, setLuogo] = useState('');
  const [aiuto, setAiuto] = useState(''); const [contatto, setContatto] = useState('');
  const [fatto, setFatto] = useState(false); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { ideeTotale().then(setTot); }, []);

  const invia = async () => {
    setErr('');
    if (idea.trim().length < 5) { setErr('Scrivi la tua idea (almeno qualche parola).'); return; }
    setBusy(true);
    const ok = await ideaInvia(idea, luogo, aiuto, contatto);
    setBusy(false);
    if (!ok) { setErr('Qualcosa è andato storto, riprova.'); return; }
    setFatto(true);
    ideeTotale().then(setTot);
  };

  if (fatto) {
    return (
      <div className="space-y-5 animate-fade-in-up pt-12 max-w-md mx-auto text-center">
        <p className="text-5xl">🏺</p>
        <h1 className="text-3xl font-bold text-white">Idea nell'anfora!</h1>
        <p className="text-neutral-300 text-sm">Grazie. È anonima, come quelle su carta. Il 23 settembre — l'ottavo compleanno dell'associazione — pubblicheremo tutte le idee raccolte, e le tre più fattibili andranno ai voti. Le vincitrici saranno annunciate alla Festa di San Martino.</p>
        {tot !== null && <p className="text-amber-300 font-semibold">{tot} idee raccolte finora</p>}
        <button onClick={() => { setFatto(false); setIdea(''); setLuogo(''); setAiuto(''); setContatto(''); }}
          className="border border-neutral-700 text-white px-4 py-2.5 text-sm hover:border-white transition">Ne ho un'altra</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pt-10 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <p className="text-5xl">🏺</p>
        <h1 className="text-3xl font-bold text-white">L'anfora delle idee</h1>
        <p className="text-neutral-300 text-sm">Come teniamo vivo San Martino? Scrivi la tua idea: è <span className="text-white font-semibold">anonima</span>, finisce nella stessa anfora dei post-it della Tortellonata.</p>
        {tot !== null && tot > 0 && <p className="text-amber-300 text-sm font-semibold">{tot} idee già raccolte</p>}
      </div>
      <div className="space-y-3">
        <label className="text-neutral-300 text-sm block space-y-1">Cosa ti piacerebbe fare o trovare a San Martino che oggi non c'è?
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={400} rows={4} placeholder="La tua idea…" className={input} />
        </label>
        <label className="text-neutral-300 text-sm block space-y-1">Riguarda un luogo preciso? <span className="text-neutral-500">(facoltativo)</span>
          <select value={luogo} onChange={(e) => setLuogo(e.target.value)} className={input}>
            {LUOGHI_IDEA.map((l) => <option key={l} value={l}>{l || '—'}</option>)}
          </select>
        </label>
        <label className="text-neutral-300 text-sm block space-y-1">Puoi metterci qualcosa tu? Tempo, mani, un sapere, un attrezzo… <span className="text-neutral-500">(facoltativo)</span>
          <input value={aiuto} onChange={(e) => setAiuto(e.target.value)} maxLength={200} placeholder="Es. so potare i castagni, ho un trattore…" className={input} />
        </label>
        <label className="text-neutral-300 text-sm block space-y-1">Un contatto, solo se vuoi essere ricontattato <span className="text-neutral-500">(facoltativo — altrimenti resti anonimo)</span>
          <input value={contatto} onChange={(e) => setContatto(e.target.value)} maxLength={120} placeholder="Telefono o email" className={input} />
        </label>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button onClick={invia} disabled={busy}
          className="w-full bg-white text-black px-3 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs disabled:opacity-40 hover:bg-neutral-200 transition">
          {busy ? 'Invio…' : "Metti l'idea nell'anfora"}
        </button>
        <p className="text-neutral-500 text-xs text-center">Le idee saranno pubblicate in forma aggregata dopo una lettura di buon senso. Nessun dato è obbligatorio oltre all'idea.</p>
      </div>
    </div>
  );
}
