import React, { useEffect, useState } from 'react';
import { gramCheckList, gramCheckSet, CheckRow } from './supa';

/* Ogni azione: id stabile (non cambiarlo, è la chiave nel database), testo, squadra.
   critica = senza questa non si apre. */
type Azione = { id: string; t: string; chi: string; critica?: boolean };
type Fase = { titolo: string; quando: string; voci: Azione[] };

export const FASI: Fase[] = [
  {
    titolo: 'Prima della chiusura iscrizioni', quando: 'entro giovedì 6',
    voci: [
      { id: 'ord-crescentine', t: 'Crescentine ordinate da Lavacchielli (Pavullo) — dire la quantità e l’ora del ritiro', chi: 'Piastra', critica: true },
      { id: 'ord-salsiccia', t: 'Salsiccia ordinata dal macellaio', chi: 'Cucina', critica: true },
      { id: 'volontari', t: 'Volontari confermati per ogni squadra: ogni casella ha un nome', chi: 'Regia', critica: true },
      { id: 'gruppo-ok', t: 'Sentito il gruppo: orario di arrivo, cosa serve per l’audio, corrente disponibile', chi: 'Regia' },
    ],
  },
  {
    titolo: 'Il giorno dopo la chiusura', quando: 'venerdì 7',
    voci: [
      { id: 'numeri', t: 'Guardato il numero vero degli iscritti nell’app e aggiornata la lista spesa', chi: 'Regia', critica: true },
      { id: 'conferma-ordini', t: 'Confermate le quantità a Lavacchielli e al macellaio', chi: 'Cucina', critica: true },
      { id: 'spesa-fresco', t: 'Spesa del fresco fatta: parmigiano, arance, limoni', chi: 'Bar + Cucina' },
      { id: 'spesa-bibite', t: 'Bibite, acqua e vino comprati', chi: 'Bar' },
      { id: 'olio', t: 'Olio di frittura comprato', chi: 'Frittura', critica: true },
      { id: 'monouso', t: 'Piatti, bicchieri, posate, tovaglioli e sacchi rifiuti', chi: 'Sala' },
      { id: 'gas', t: 'Bombole del gas controllate: piene, non “quasi piene”', chi: 'Cucina', critica: true },
      { id: 'pdf', t: 'PDF elenco per la cucina stampato (backup se salta la linea)', chi: 'Accoglienza', critica: true },
      { id: 'prova-app', t: 'Provata l’app: un check-in di prova e poi annullato, così nessuno impara la sera stessa', chi: 'Accoglienza', critica: true },
      { id: 'cartelli', t: 'Menù A5 e cartello dell’anfora stampati', chi: 'Allestimento' },
    ],
  },
  {
    titolo: 'Sabato mattina', quando: 'si cucina',
    voci: [
      { id: 'ritiro', t: 'Crescentine ritirate da Lavacchielli e messe in frigo', chi: 'Piastra', critica: true },
      { id: 'ragu', t: 'Ragù di salsiccia fatto e messo al fresco', chi: 'Cucina', critica: true },
      { id: 'fresco-bibite', t: 'Bibite, acqua e bianco in fresco. Ghiaccio nel congelatore', chi: 'Bar' },
      { id: 'giro-finale', t: 'Giro finale: quello che manca si compra adesso, non nel pomeriggio', chi: 'Regia' },
    ],
  },
  {
    titolo: 'Sabato pomeriggio', quando: 'si allestisce',
    voci: [
      { id: 'tavoli', t: 'Tavoli e sedie sistemati sotto la tensostruttura', chi: 'Allestimento', critica: true },
      { id: 'luci', t: 'Luci esterne provate e funzionanti', chi: 'Allestimento' },
      { id: 'bar-pronto', t: 'Banco bar pronto: ghiaccio, bottiglie, arance e limoni tagliati', chi: 'Bar' },
      { id: 'apparecchiato', t: 'Tavoli apparecchiati, menù sui tavoli', chi: 'Sala' },
      { id: 'postazioni', t: 'Tigelliere e friggitrici in postazione', chi: 'Piastra + Frittura', critica: true },
      { id: 'anfora', t: 'Anfora al suo posto con biglietti, penne e cartello col QR', chi: 'Allestimento', critica: true },
      { id: 'gruppo-arrivato', t: 'Gruppo arrivato, posizionato, prova audio fatta', chi: 'Regia' },
      { id: 'crescentine-fuori', t: 'Crescentine fuori dal frigo (mezz’ora prima del servizio)', chi: 'Piastra' },
    ],
  },
  {
    titolo: 'Prima di aprire', quando: 'ore 19:00 — briefing',
    voci: [
      { id: 'telefono', t: 'Telefono del check-in carico, app aperta, PIN provato', chi: 'Accoglienza', critica: true },
      { id: 'cassetta', t: 'Cassetta dell’incasso con fondo cassa in monete', chi: 'Accoglienza', critica: true },
      { id: 'sicurezza', t: 'Estintore e cassetta di primo soccorso vicino alla frittura', chi: 'Frittura', critica: true },
      { id: 'defibrillatore', t: 'Detto a tutti dov’è il defibrillatore (al Poggio)', chi: 'Regia', critica: true },
      { id: 'briefing', t: 'Briefing fatto: ognuno sa la sua squadra e il suo compito', chi: 'Regia', critica: true },
      { id: 'discorso', t: 'Deciso chi parla alle 22:15 e si è letto il testo', chi: 'Regia' },
      { id: 'acqua-bolle', t: 'Ragù a scaldare e acqua a bollire (19:40)', chi: 'Cucina' },
    ],
  },
];

const TUTTE = FASI.flatMap((f) => f.voci);

export default function Checklist({ pin }: { pin: string }) {
  const [stato, setStato] = useState<Record<string, CheckRow>>({});
  const [chi, setChi] = useState(localStorage.getItem('gram_chi') || '');
  const [err, setErr] = useState('');
  const [caricato, setCaricato] = useState(false);

  const carica = () => gramCheckList(pin)
    .then((rows) => {
      const m: Record<string, CheckRow> = {};
      rows.forEach((r) => { m[r.id] = r; });
      setStato(m); setCaricato(true);
    })
    .catch((e) => setErr(String(e.message || e)));

  useEffect(() => { carica(); }, []);
  useEffect(() => {
    const t = setInterval(carica, 20000);
    const onFocus = () => carica();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, []);

  const tocca = async (a: Azione) => {
    const nuovo = !(stato[a.id]?.done);
    setStato((s) => ({ ...s, [a.id]: { id: a.id, done: nuovo, chi: nuovo ? chi || null : null, updated_at: new Date().toISOString() } }));
    try {
      localStorage.setItem('gram_chi', chi);
      await gramCheckSet(pin, a.id, nuovo, nuovo ? chi : '');
    } catch (e: any) { setErr(String(e.message || e)); carica(); }
  };

  const fatte = TUTTE.filter((a) => stato[a.id]?.done).length;
  const perc = Math.round((fatte / TUTTE.length) * 100);
  const critiche = TUTTE.filter((a) => a.critica);
  const critMancanti = critiche.filter((a) => !stato[a.id]?.done);
  const pronti = critMancanti.length === 0;

  return (
    <div className="space-y-5">
      {/* barra pronti */}
      <div className={'p-4 text-center ' + (pronti ? 'border border-emerald-500/60 bg-emerald-500/5' : 'hairline bg-neutral-950')}>
        <p className="text-[10px] tracked gold">Siamo pronti?</p>
        <p className={'font-display text-3xl mt-1 ' + (pronti ? 'text-emerald-400' : 'text-white')}>
          {pronti ? 'Sì, si può aprire' : perc + '%'}
        </p>
        <div className="h-1.5 bg-neutral-800 mt-3">
          <div className={'h-full transition-all ' + (pronti ? 'bg-emerald-400' : 'bg-[#C9A227]')} style={{ width: perc + '%' }} />
        </div>
        <p className="text-neutral-400 text-[12px] mt-2">
          {fatte} di {TUTTE.length} cose fatte
          {!pronti && <> · mancano <span className="text-white">{critMancanti.length}</span> cose indispensabili</>}
        </p>
        {!pronti && critMancanti.length <= 4 && (
          <div className="mt-2 space-y-0.5">
            {critMancanti.map((a) => (
              <p key={a.id} className="text-amber-300 text-[11px]">▸ {a.t}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-[10px] tracked gold">Chi sei (facoltativo)</label>
        <input value={chi} onChange={(e) => setChi(e.target.value)} placeholder="Il tuo nome"
          className="w-full bg-black border border-neutral-800 px-4 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-white" />
        <p className="text-neutral-500 text-[11px] mt-1">Compare accanto alle cose che spunti, così si sa chi le ha fatte.</p>
      </div>

      {err && <p className="text-red-400 text-xs">{err}</p>}
      {!caricato && <p className="text-neutral-500 text-xs">Carico…</p>}

      {FASI.map((f) => {
        const n = f.voci.filter((a) => stato[a.id]?.done).length;
        const tutte = n === f.voci.length;
        return (
          <div key={f.titolo}>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div>
                <p className="font-display text-lg text-white leading-tight">{f.titolo}</p>
                <p className="text-[10px] tracked text-neutral-500">{f.quando}</p>
              </div>
              <p className={'text-[11px] shrink-0 ' + (tutte ? 'text-emerald-400' : 'gold')}>
                {tutte ? '✓ fatto' : n + '/' + f.voci.length}
              </p>
            </div>
            <div className="space-y-0">
              {f.voci.map((a) => {
                const r = stato[a.id];
                const done = !!r?.done;
                return (
                  <button key={a.id} onClick={() => tocca(a)}
                    className="w-full text-left flex gap-3 items-start py-3 border-b border-neutral-800/70 active:opacity-60">
                    <span className={'mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center text-[11px] ' +
                      (done ? 'border-emerald-400 text-emerald-400' : a.critica ? 'border-amber-400/70' : 'border-neutral-600')}>
                      {done ? '✓' : ''}
                    </span>
                    <span className="min-w-0">
                      <span className={'block text-sm leading-snug ' + (done ? 'text-neutral-500 line-through' : 'text-white')}>
                        {a.t}
                      </span>
                      <span className="block text-[11px] text-neutral-500 mt-0.5">
                        {a.chi}
                        {a.critica && !done && <span className="text-amber-400"> · indispensabile</span>}
                        {done && r?.chi && <span className="text-emerald-500/80"> · {r.chi}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-neutral-500 text-[11px] text-center pt-2">
        Le spunte sono condivise: se le tocca un altro volontario le vedi anche tu. Si aggiornano da sole ogni venti secondi.
      </p>
    </div>
  );
}
