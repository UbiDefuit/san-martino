import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type Voce = { id: string; nome: string; dove: string; anno: string; geo?: [number, number] };  // geo: [lat, lng] della casa, quando la conosciamo

/* Le voci del 1987. "dove" si aggiorna man mano che scopriamo chi abitava dove. */
export const VOCI: Voce[] = [
  { id: 'Tiziano', nome: 'Tiziano', dove: 'Sui campi sopra il paese', anno: '1987' },
  { id: 'Gelinda', nome: 'Gelinda', dove: 'Sulle scale di casa', anno: '1987' },
  { id: 'Eulario', nome: 'Eulario', dove: 'Sulla strada della valle', anno: '1987' },
  { id: 'Clorinda', nome: 'Clorinda', dove: 'Nel cortile dei panni stesi', anno: '1987' },
  { id: 'Giulia', nome: 'Giulia', dove: 'Nel vicolo del borgo', anno: '1987' },
  { id: 'Malia', nome: 'Malia', dove: 'Al balcone', anno: '1987' },
  { id: 'Bianca', nome: 'Bianca', dove: 'Al capezzale', anno: '1987' },
  { id: 'Gustavo', nome: 'Gustavo', dove: 'Sulla porta di casa', anno: '1987' },
  { id: 'Gigino', nome: 'Gigino', dove: 'Seduto sul muretto', anno: '1987' },
  { id: 'Armida', nome: 'Armida', dove: 'Davanti al muro di sasso', anno: '1987' },
  { id: 'Viterbo', nome: 'Viterbo "il Fabbro"', dove: 'Sulla terrazza', anno: '1987' },
];

export default function Voci() {
  const [sel, setSel] = useState<Voce | null>(null);

  // deep link dai QR: #/voci?chi=Gelinda
  useEffect(() => {
    const q = location.hash.split('?')[1] || '';
    const chi = new URLSearchParams(q).get('chi');
    if (chi) {
      const v = VOCI.find((x) => x.id.toLowerCase() === chi.toLowerCase());
      if (v) setSel(v);
    }
  }, []);

  return (
    <div className="animate-fade-in-up pt-10 space-y-8">
      <div>
        <p className="text-[10px] tracked gold">Il paese che si racconta</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white mt-2">Le voci di San Martino</h1>
        <p className="text-neutral-200 text-[15px] leading-relaxed mt-4 max-w-2xl">
          Nel 1987 Don Paolo passò di casa in casa con la videocamera. Quasi tutte queste persone
          non ci sono più. Tocca un volto: torna a parlare, con la sua voce, nel posto dov'era.
        </p>
        <p className="text-neutral-500 text-xs mt-3 max-w-2xl">
          Nelle borgate stiamo mettendo le targhe: inquadri il QR sul muro e senti chi abitava lì.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {VOCI.map((v) => (
          <button key={v.id} onClick={() => setSel(v)} className="text-left group">
            <div className="relative overflow-hidden border border-neutral-800 group-hover:border-[#C9A227] transition">
              <img src={'./memorie/cast/' + (v.id === 'Viterbo' ? 'Viterbo_il_Fabbro' : v.id) + '.jpg'} alt={v.nome}
                className="w-full group-hover:scale-[1.04] transition duration-700" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/35">
                <span className="w-10 h-10 rounded-full border border-white/80 flex items-center justify-center text-white text-sm">▶</span>
              </div>
            </div>
            <p className="font-display text-[15px] text-white mt-2 leading-tight">{v.nome}</p>
            <p className="text-[11px] text-neutral-500 leading-tight">{v.dove}</p>
          </button>
        ))}
      </div>

      <p className="text-neutral-500 text-xs max-w-2xl">
        Le voci vengono da <span className="text-neutral-300">“Tiziano e i suoi parrocchiani”</span>, il film
        di Don Paolo del 1987, restaurato dall'associazione. Se riconosci qualcuno che non ha ancora un nome,
        o sai dove abitava, scrivici: ogni tassello è memoria salvata.
      </p>

      {sel && createPortal(
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <video src={'./voci/' + sel.id + '.mp4'} controls autoPlay playsInline className="w-full border border-neutral-700 bg-black" />
            <div className="flex items-baseline justify-between gap-4 mt-3">
              <div>
                <p className="font-display text-2xl text-white">{sel.nome}</p>
                <p className="text-neutral-400 text-xs">{sel.dove} · {sel.anno}</p>
              </div>
              <button onClick={() => setSel(null)}
                className="border border-neutral-600 text-white px-5 py-2.5 text-xs uppercase tracking-[0.15em] hover:border-white shrink-0">
                Chiudi
              </button>
            </div>
          </div>
        </div>, document.body)}
    </div>
  );
}
