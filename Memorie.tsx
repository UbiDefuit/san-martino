import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { EMAIL } from './data';

const CAST = [
  ['Tiziano', 'Tiziano.jpg'], ['Clorinda', 'Clorinda.jpg'], ['Eulario', 'Eulario.jpg'],
  ['Ornella', 'Ornella.jpg'], ['Giulia', 'Giulia.jpg'], ['Mary', 'Mary.jpg'],
  ['Irma', 'Irma.jpg'], ['Gilda', 'Gilda.jpg'], ['Bianca', 'Bianca.jpg'],
  ['Gustavo', 'Gustavo.jpg'], ['Gigino', 'Gigino.jpg'], ['Armida', 'Armida.jpg'],
  ['Viterbo "il Fabbro"', 'Viterbo_il_Fabbro.jpg'], ['Romano', 'Romano.jpg'],
];

export default function Memorie() {
  const [trailer, setTrailer] = useState(false);
  return (
    <div className="animate-fade-in-up pt-10 space-y-12">
      {/* billboard */}
      <section className="grid sm:grid-cols-[300px_1fr] gap-8 items-start">
        <img src="./memorie/poster.jpg" alt="Le voci di San Martino"
          className="w-56 sm:w-full mx-auto border border-neutral-800" />
        <div>
          <p className="text-[10px] tracked gold">Memorie · il cinema della valle</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mt-2">Le voci di San Martino</h1>
          <p className="text-neutral-400 text-sm mt-3">1988 circa · 49 min · San Martino Vallata · restaurato 2026</p>
          <p className="text-neutral-200 text-[15px] leading-relaxed mt-5 max-w-xl">
            Una videocassetta girata tra le case e i campi della frazione: le interviste ai vecchi
            del paese — i volti, le mani, il dialetto di chi ha vissuto la valle quando era piena.
            Quasi tutti se ne sono andati. Le loro voci no: sono qui, ripulite e conservate
            per chi verrà.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={() => setTrailer(true)}
              className="bg-white text-black px-6 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs hover:bg-neutral-200 transition">
              ▶ Guarda il trailer
            </button>
            <span className="border border-neutral-700 text-neutral-400 px-6 py-3.5 uppercase tracking-[0.15em] text-xs cursor-default">
              Film completo — presto nell'archivio
            </span>
          </div>
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

      {trailer && createPortal(
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setTrailer(false)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <video src="./memorie/trailer.mp4" controls autoPlay playsInline className="w-full border border-neutral-700" />
            <button onClick={() => setTrailer(false)}
              className="mt-3 border border-neutral-600 text-white px-5 py-2.5 text-xs uppercase tracking-[0.15em] hover:border-white">
              Chiudi
            </button>
          </div>
        </div>, document.body)}
    </div>
  );
}
