import React, { useState } from 'react';
import { EMAIL } from './data';
import XRayPlayer, { XRAY_TRAILER } from './XRayPlayer';

const CAST = [
  ['Tiziano', 'Tiziano.jpg'], ['Gelinda', 'Gelinda.jpg'], ['Clorinda', 'Clorinda.jpg'],
  ['Eulario', 'Eulario.jpg'], ['Ornella', 'Ornella.jpg'], ['Giulia', 'Giulia.jpg'],
  ['Malia', 'Malia.jpg'], ['Mary', 'Mary.jpg'], ['Irma', 'Irma.jpg'],
  ['Gilda', 'Gilda.jpg'], ['Bianca', 'Bianca.jpg'], ['Gustavo', 'Gustavo.jpg'],
  ['Gigino', 'Gigino.jpg'], ['Armida', 'Armida.jpg'], ['Viterbo "il Fabbro"', 'Viterbo_il_Fabbro.jpg'],
];

export default function Memorie() {
  const [trailer, setTrailer] = useState(false);
  const [xray, setXray] = useState(false);
  return (
    <div className="animate-fade-in-up pt-10 space-y-12">
      {/* billboard */}
      <section className="grid sm:grid-cols-[300px_1fr] gap-8 items-start">
        <img src="./memorie/poster.jpg" alt="Tiziano e i suoi parrocchiani"
          className="w-56 sm:w-full mx-auto border border-neutral-800" />
        <div>
          <p className="text-[10px] tracked gold">Memorie · il cinema della valle</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mt-2">Tiziano e i suoi parrocchiani</h1>
          <p className="text-neutral-400 text-sm mt-3">1987 · 49 min · San Martino Vallata · un film di Don Paolo · restaurato 2026</p>
          <p className="text-neutral-200 text-[15px] leading-relaxed mt-5 max-w-xl">
            Nel 1987 Don Paolo prese la videocamera e girò per le case e i campi della frazione,
            intervistando i vecchi del paese — i volti, le mani, il dialetto di chi ha vissuto
            la valle quando era piena. Quasi tutti se ne sono andati. Le loro voci no: sono qui,
            ripulite e conservate per chi verrà.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={() => setTrailer(true)}
              className="bg-white text-black px-6 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs hover:bg-neutral-200 transition">
              ▶ Guarda il trailer
            </button>
            <button onClick={() => setXray(true)}
              className="border border-[#C9A227] text-[#E0BF5C] px-6 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs hover:bg-[#C9A227]/10 transition">
              Anteprima con X-Ray
            </button>
          </div>
          <p className="text-neutral-500 text-xs mt-3">Nell'anteprima (primi 5 minuti), metti in pausa: compare chi è in scena, come su Prime Video. Il film completo arriva nell'archivio.</p>
        </div>
      </section>

      {/* personaggi */}
      <section>
        <p className="text-[10px] tracked gold mb-1">I protagonisti</p>
        <h2 className="font-display text-2xl text-white mb-4">I volti del paese</h2>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
          {CAST.map(([nome, img]) => (
            <figure key={img}>
              <img src={'./memorie/cast/' + img} alt={nome} className="w-full border border-neutral-800" />
              <figcaption className="text-[12px] text-neutral-200 mt-1.5 leading-tight font-display">{nome}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* nota archivio */}
      <p className="text-neutral-500 text-xs max-w-2xl">
        Il filmato originale (DVD dal riversamento VHS, 2006) è conservato dall'associazione.
        Questa è la prima memoria dell'archivio: se hai in casa videocassette, pellicole o foto
        del paese, portacele — le digitalizziamo e le riportiamo alla luce.
      </p>

      {xray && <XRayPlayer src="./memorie/xray-anteprima.mp4" onClose={() => setXray(false)} />}
      {trailer && <XRayPlayer src="./memorie/trailer.mp4" dati={XRAY_TRAILER} onClose={() => setTrailer(false)} />}
    </div>
  );
}
