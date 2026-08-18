import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Persona = { nome: string; img: string };
type Scena = { t0: number; t1: number; persone: Persona[] };

/* Dati X-Ray: chi è in scena, minuto per minuto. Si aggiornano qui, senza toccare il video. */
const C = './memorie/cast/';
export const SCENE: Scena[] = [
  { t0: 0, t1: 161.2, persone: [{ nome: 'Clorinda', img: C + 'Clorinda.jpg' }, { nome: 'Tiziano', img: C + 'Tiziano.jpg' }] },
  { t0: 161.2, t1: 186, persone: [{ nome: 'Eulario', img: C + 'Eulario.jpg' }] },
  { t0: 273.6, t1: 501.6, persone: [{ nome: 'Ornella', img: C + 'Ornella.jpg' }, { nome: 'Tiziano', img: C + 'Tiziano.jpg' }] },
  { t0: 501.6, t1: 618.3, persone: [{ nome: 'Giulia', img: C + 'Giulia.jpg' }] },
  { t0: 618.3, t1: 695.6, persone: [{ nome: 'Irma', img: C + 'Irma.jpg' }, { nome: 'Mary', img: C + 'Mary.jpg' }] },
  { t0: 695.6, t1: 824.8, persone: [{ nome: 'Gilda', img: C + 'Gilda.jpg' }] },
  { t0: 824.8, t1: 886.7, persone: [{ nome: 'Bianca', img: C + 'Bianca.jpg' }, { nome: 'Gustavo', img: C + 'Gustavo.jpg' }] },
  { t0: 886.7, t1: 994.7, persone: [{ nome: 'Gigino', img: C + 'Gigino.jpg' }] },
  { t0: 994.7, t1: 1072.2, persone: [{ nome: 'Viterbo "il Fabbro"', img: C + 'Viterbo_il_Fabbro.jpg' }, { nome: 'Armida', img: C + 'Armida.jpg' }] },
  { t0: 1072.2, t1: 1094.5, persone: [{ nome: 'Romano', img: C + 'Romano.jpg' }] },
];

export default function XRayPlayer({ src, onClose }: { src: string; onClose: () => void }) {
  const vid = useRef<HTMLVideoElement>(null);
  const [scena, setScena] = useState<Scena | null>(null);
  const [pausa, setPausa] = useState(false);

  useEffect(() => {
    const v = vid.current; if (!v) return;
    const tick = () => {
      const t = v.currentTime;
      setScena(SCENE.find((s) => t >= s.t0 && t < s.t1) || null);
    };
    const onPause = () => { setPausa(true); tick(); };
    const onPlay = () => setPausa(false);
    v.addEventListener('timeupdate', tick);
    v.addEventListener('pause', onPause);
    v.addEventListener('play', onPlay);
    return () => { v.removeEventListener('timeupdate', tick); v.removeEventListener('pause', onPause); v.removeEventListener('play', onPlay); };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <video ref={vid} src={src} controls autoPlay playsInline className="w-full" />

        {/* chi è in scena — sempre visibile, discreto */}
        {scena && scena.persone.length > 0 && !pausa && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur px-3 py-2 pointer-events-none">
            <div className="flex -space-x-2">
              {scena.persone.map((p) => (
                <img key={p.nome} src={p.img} alt="" className="w-8 h-10 object-cover border border-neutral-600" />
              ))}
            </div>
            <span className="text-white text-xs">{scena.persone.map((p) => p.nome).join(' · ')}</span>
          </div>
        )}

        {/* pausa = pannello X-Ray pieno, come Prime */}
        {pausa && (
          <div className="absolute inset-y-0 left-0 w-64 sm:w-72 bg-black/85 backdrop-blur p-5 overflow-y-auto">
            <p className="text-[10px] tracked gold mb-3">In questa scena</p>
            {scena && scena.persone.length > 0 ? scena.persone.map((p) => (
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
              {[...new Map(SCENE.flatMap((s) => s.persone).map((p) => [p.nome, p])).values()].map((p) => (
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
