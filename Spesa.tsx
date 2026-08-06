import React, { useEffect, useRef, useState } from 'react';
import { gramSpesaList, gramSpesaSet, SpesaRow } from './supa';

const ORD = ['Cucina', 'Piastra', 'Frittura', 'Bar', 'Sala'];

export default function Spesa({ pin }: { pin: string }) {
  const [rows, setRows] = useState<SpesaRow[]>([]);
  const [err, setErr] = useState('');
  const [caricato, setCaricato] = useState(false);
  const [nuovaVoce, setNuovaVoce] = useState('');
  const chi = localStorage.getItem('gram_chi') || '';
  const editing = useRef<Set<string>>(new Set());

  const carica = () => gramSpesaList(pin)
    .then((r) => {
      // non sovrascrivere le righe che l'utente sta modificando in questo momento
      setRows((prev) => r.map((row) => {
        const mia = prev.find((p) => p.id === row.id);
        return mia && editing.current.size && [...editing.current].some((k) => k.startsWith(row.id + ':')) ? mia : row;
      }));
      setCaricato(true);
    })
    .catch((e) => setErr(String(e.message || e)));

  useEffect(() => { carica(); }, []);
  useEffect(() => {
    const t = setInterval(carica, 25000);
    const onFocus = () => carica();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, []);

  const salva = async (r: SpesaRow) => {
    try {
      await gramSpesaSet(pin, r.id, r.voce, r.squadra || '', r.qta || '', r.prezzo, r.preso, r.preso ? chi : (r.chi || ''));
    } catch (e: any) { setErr(String(e.message || e)); carica(); }
  };

  const upd = (id: string, patch: Partial<SpesaRow>, commit = false) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    if (commit) {
      const r = rows.find((x) => x.id === id);
      if (r) salva({ ...r, ...patch });
    }
  };

  const aggiungi = async () => {
    const v = nuovaVoce.trim();
    if (v.length < 2) return;
    const id = 'x-' + v.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + Date.now().toString(36).slice(-4);
    const r: SpesaRow = { id, voce: v, squadra: 'Altro', qta: '', prezzo: null, preso: false, chi: null, updated_at: '' };
    setRows((rs) => [...rs, r]);
    setNuovaVoce('');
    await salva(r);
  };

  const tot = rows.reduce((n, r) => n + (Number(r.prezzo) || 0), 0);
  const speso = rows.filter((r) => r.preso).reduce((n, r) => n + (Number(r.prezzo) || 0), 0);
  const prese = rows.filter((r) => r.preso).length;

  const gruppi = [...ORD.filter((g) => rows.some((r) => (r.squadra || 'Altro') === g)),
                  ...(rows.some((r) => !ORD.includes(r.squadra || 'Altro')) ? ['Altro'] : [])];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[[prese + '/' + rows.length, 'voci prese'],
          [tot ? tot.toFixed(0) + ' €' : '—', 'stima totale'],
          [speso ? speso.toFixed(0) + ' €' : '—', 'già speso']].map(([v, l]) => (
          <div key={l} className="border border-neutral-800 py-3">
            <div className="text-xl font-bold text-white">{v}</div>
            <div className="text-[9px] text-neutral-400 uppercase tracking-[0.12em] mt-1">{l}</div>
          </div>
        ))}
      </div>
      <p className="text-neutral-500 text-[11px] text-center -mt-2">
        Tocca la spunta quando una voce è comprata. Quantità e prezzo si correggono direttamente: si salvano da soli e li vedono tutti.
      </p>
      {err && <p className="text-red-400 text-xs">{err}</p>}
      {!caricato && <p className="text-neutral-500 text-xs">Carico…</p>}

      {gruppi.map((g) => (
        <div key={g}>
          <p className="text-[10px] tracked gold mb-1">{g}</p>
          <div className="border-t border-neutral-800">
            {rows.filter((r) => (r.squadra || 'Altro') === g).map((r) => (
              <div key={r.id} className={'flex items-center gap-2 border-b border-neutral-800/70 py-2 ' + (r.preso ? 'opacity-60' : '')}>
                <button onClick={() => upd(r.id, { preso: !r.preso, chi: !r.preso ? chi : null }, true)}
                  className={'w-6 h-6 shrink-0 border flex items-center justify-center text-[12px] ' +
                    (r.preso ? 'border-emerald-400 text-emerald-400' : 'border-neutral-600')}>
                  {r.preso ? '✓' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={'text-[13px] leading-tight ' + (r.preso ? 'text-neutral-500 line-through' : 'text-white')}>{r.voce}</p>
                  {r.preso && r.chi && <p className="text-[10px] text-emerald-500/80">{r.chi}</p>}
                </div>
                <input value={r.qta || ''} placeholder="q.tà"
                  onFocus={() => editing.current.add(r.id + ':q')}
                  onChange={(e) => upd(r.id, { qta: e.target.value })}
                  onBlur={(e) => { editing.current.delete(r.id + ':q'); upd(r.id, { qta: e.target.value }, true); }}
                  className="w-24 shrink-0 bg-black border border-neutral-800 px-2 py-1.5 text-[12px] text-white text-center focus:outline-none focus:border-white" />
                <div className="relative shrink-0">
                  <input value={r.prezzo ?? ''} placeholder="€" inputMode="decimal"
                    onFocus={() => editing.current.add(r.id + ':p')}
                    onChange={(e) => {
                      const v = e.target.value.replace(',', '.');
                      upd(r.id, { prezzo: v === '' ? null : (isNaN(Number(v)) ? r.prezzo : Number(v)) });
                    }}
                    onBlur={() => { editing.current.delete(r.id + ':p'); const cur = rows.find((x) => x.id === r.id); if (cur) salva(cur); }}
                    className="w-16 bg-black border border-neutral-800 px-2 py-1.5 text-[12px] text-white text-right focus:outline-none focus:border-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <input value={nuovaVoce} onChange={(e) => setNuovaVoce(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aggiungi()}
          placeholder="Manca qualcosa? Aggiungila…"
          className="flex-1 bg-black border border-neutral-800 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white" />
        <button onClick={aggiungi} disabled={nuovaVoce.trim().length < 2}
          className="border border-neutral-700 text-white px-4 text-xs uppercase tracking-[0.12em] hover:border-white disabled:opacity-40">
          Aggiungi
        </button>
      </div>
      <p className="text-neutral-500 text-[11px]">
        Il prezzo è il costo della voce intera (non al pezzo): serve solo a sapere quanto stiamo spendendo.
      </p>
    </div>
  );
}
