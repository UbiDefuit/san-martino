import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Persona = { nome: string; img: string };

/* Presenze X-Ray: intervalli reali di presenza in scena, ricavati fotogramma per fotogramma
   (campionamento ogni 8 s). Si correggono qui, senza toccare il video. */
const C = './memorie/cast/';
const PERSONE: { nome: string; img: string; intervalli: [number, number][] }[] = [
  { nome: 'Tiziano', img: C + 'Tiziano.jpg', intervalli: [[12, 56], [292, 504], [584, 596], [956, 968], [1028, 1058]] },
  { nome: 'Gelinda', img: C + 'Gelinda.jpg', intervalli: [[54, 174]] },
  { nome: 'Eulario', img: C + 'Eulario.jpg', intervalli: [[194, 286]] },
  { nome: 'Ornella', img: C + 'Ornella.jpg', intervalli: [[286, 472]] },
  { nome: 'Giulia', img: C + 'Giulia.jpg', intervalli: [[506, 588]] },
  { nome: 'Mary', img: C + 'Mary.jpg', intervalli: [[594, 630], [706, 740]] },
  { nome: 'Irma', img: C + 'Irma.jpg', intervalli: [[594, 630], [706, 740]] },
  { nome: 'Gilda', img: C + 'Gilda.jpg', intervalli: [[738, 832]] },
  { nome: 'Gustavo', img: C + 'Gustavo.jpg', intervalli: [[900, 928]] },
  { nome: 'Bianca', img: C + 'Bianca.jpg', intervalli: [[836, 886]] },
  { nome: 'Gigino', img: C + 'Gigino.jpg', intervalli: [[928, 958]] },
  { nome: 'Armida', img: C + 'Armida.jpg', intervalli: [[1028, 1058]] },
  { nome: 'Viterbo "il Fabbro"', img: C + 'Viterbo_il_Fabbro.jpg', intervalli: [[960, 1004]] },
  { nome: 'Romano', img: C + 'Romano.jpg', intervalli: [[1056, 1098]] },
];

/* X-Ray del trailer: stessa logica, timeline del montaggio (cartello 3,2 s + clip da 6,5 s). */
export const XRAY_TRAILER: { nome: string; img: string; intervalli: [number, number][] }[] = [
  { nome: 'Tiziano', img: C + 'Tiziano.jpg', intervalli: [[3.2, 9.7], [22.7, 29.2], [48.7, 55.2]] },
  { nome: 'Gelinda', img: C + 'Gelinda.jpg', intervalli: [[9.7, 16.2]] },
  { nome: 'Eulario', img: C + 'Eulario.jpg', intervalli: [[16.2, 22.7]] },
  { nome: 'Ornella', img: C + 'Ornella.jpg', intervalli: [[22.7, 29.2]] },
  { nome: 'Giulia', img: C + 'Giulia.jpg', intervalli: [[29.2, 35.7]] },
  { nome: 'Mary', img: C + 'Mary.jpg', intervalli: [[35.7, 42.2]] },
  { nome: 'Irma', img: C + 'Irma.jpg', intervalli: [[35.7, 42.2]] },
  { nome: 'Viterbo "il Fabbro"', img: C + 'Viterbo_il_Fabbro.jpg', intervalli: [[42.2, 48.7]] },
  { nome: 'Armida', img: C + 'Armida.jpg', intervalli: [[48.7, 55.2]] },
  { nome: 'Romano', img: C + 'Romano.jpg', intervalli: [[55.2, 61.7]] },
];

type Dati = typeof PERSONE;
const inScena = (dati: Dati, t: number): Persona[] =>
  dati.filter((p) => p.intervalli.some(([a, b]) => t >= a && t < b));

export default function XRayPlayer({ src, onClose, dati = PERSONE }: { src: string; onClose: () => void; dati?: Dati }) {
  const vid = useRef<HTMLVideoElement>(null);
  const [presenti, setPresenti] = useState<Persona[]>([]);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    const v = vid.current; if (!v) return;
    const tick = () => {
      const t = v.currentTime;
      setPresenti(inScena(dati, t));
    };
    const onPause = () => { setPausa(true); tick(); };
    const onPlay = () => setPausa(false);
    v.addEventListener('timeupdate', tick);
    v.addEventListener('pause', onPause);
    v.addEventListener('play', onPlay);
    return () => { v.removeEventListener('timeupdate', tick); v.removeEventListener('pause', onPause); v.removeEventListener('play', onPlay); };
  }, [dati]);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <video ref={vid} src={src} controls autoPlay playsInline className="w-full" />

        {/* chi è in scena — sempre visibile, discreto */}
        {presenti.length > 0 && !pausa && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur px-3 py-2 pointer-events-none">
            <div className="flex -space-x-2">
              {presenti.map((p) => (
                <img key={p.nome} src={p.img} alt="" className="w-8 h-10 object-cover border border-neutral-600" />
              ))}
            </div>
            <span className="text-white text-xs">{presenti.map((p) => p.nome).join(' · ')}</span>
          </div>
        )}

        {/* pausa = pannello X-Ray pieno, come Prime */}
        {pausa && (
          <div className="absolute inset-y-0 left-0 w-64 sm:w-72 bg-black/85 backdrop-blur p-5 overflow-y-auto">
            <p className="text-[10px] tracked gold mb-3">In questa scena</p>
            {presenti.length > 0 ? presenti.map((p) => (
              <div key={p.nome} className="flex items-center gap-3 mb-3">
                <img src={p.img} alt={p.nome} className="w-14 h-[70px] object-cover border border-neutral-700" />
                <div>
                  <p className="text-white text-sm font-display">{p.nome}</p>
                  <p className="text-neutral-500 text-[11px]">San Martino Vallata</p>
                </div>
              </div>
            )) : <p className="text-neutral-400 text-xs">Nessuno in scena — paesaggi della frazione.</p>}
            <p className="text-[10px] tracked gold mt-6 mb-3">Nel film</p>
            <div className="grid grid-cols-3 gap-2">
              {dati.map((p) => (
                <img key={p.nome} src={p.img} alt={p.nome} title={p.nome} className="w-full object-cover border border-neutral-800" />
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose}
          className="absolute top-3 right-3 bg-black/70 border border-neutral-600 text-white w-9 h-9 hover:border-white">✕</button>
      </div>
    </div>, document.body);
}
