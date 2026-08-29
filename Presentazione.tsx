import React, { useEffect, useRef, useState } from 'react';
import Mark2030 from './Mark2030';

/* Modalità presentazione: slide cinematiche per l'assemblea dei soci.
   Frecce / spazio / click per avanzare, F11 per il proiettore.
   Ogni slide può aprire la sezione vera del sito: si presenta DAL prodotto. */

type Slide = {
  kicker: string;
  titolo: React.ReactNode;
  corpo?: React.ReactNode;
  link?: { href: string; label: string };
  scuro?: boolean;
};

function Passo({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="flex-1 min-w-[200px] border border-[#C9A227]/40 bg-black/40 p-5 text-left">
      <div className="font-display text-4xl gold">{n}</div>
      <div className="text-white font-semibold mt-2 text-lg">{t}</div>
      <div className="text-neutral-300 text-sm mt-1 leading-relaxed">{d}</div>
    </div>
  );
}

function Cifrona({ n, l }: { n: string; l: string }) {
  return (
    <div className="text-center px-6">
      <div className="font-display text-6xl sm:text-7xl text-white">{n}</div>
      <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300 mt-2">{l}</div>
    </div>
  );
}

export default function Presentazione() {
  const [i, setI] = useState(0);
  const wrap = useRef<HTMLDivElement | null>(null);

  const SLIDES: Slide[] = [
    {
      kicker: 'Assemblea dei soci · San Martino 2.0 APS',
      titolo: <>San Martino <span className="gold">2030</span></>,
      corpo: (
        <>
          <p className="font-display italic text-2xl text-neutral-200 mt-2">La valle che non si arrende.</p>
          <p className="text-neutral-400 text-sm mt-8">→ freccia destra o click per continuare · F11 per lo schermo intero</p>
        </>
      ),
    },
    {
      kicker: 'Da dove siamo partiti',
      titolo: <>Otto anni di fatti</>,
      corpo: (
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          <Cifrona n="46" l="all'alba sui sentieri" />
          <Cifrona n="6,2 km" l="riaperti a mano" />
          <Cifrona n="80+" l="alla Gramignata" />
          <Cifrona n="17" l="soci che ci credono" />
        </div>
      ),
    },
    {
      kicker: 'Il tesoro ritrovato',
      titolo: <>Un film del 1987, salvato</>,
      corpo: (
        <p className="text-neutral-200 text-lg max-w-2xl mx-auto leading-relaxed mt-4">
          «Tiziano e i suoi parrocchiani»: 49 minuti girati da Don Paolo casa per casa.
          Quasi tutti i protagonisti non ci sono più. L'abbiamo <b className="text-white">ritrovato, restaurato
          e riportato online</b> — immagine, suono e nomi dei volti, ricostruiti insieme alla comunità.
        </p>
      ),
      link: { href: '#/memorie', label: 'Guarda il film' },
    },
    {
      kicker: 'Il paese che si racconta',
      titolo: <>I volti del 1987 tornano a parlare</>,
      corpo: (
        <p className="text-neutral-200 text-lg max-w-2xl mx-auto leading-relaxed mt-4">
          Il filmato è pieno di volti: <b className="text-white">quindici hanno già ritrovato il loro nome</b>,
          gli altri li stiamo riconoscendo insieme alla comunità — anche stasera, con voi.
          Tocchi un volto e <b className="text-white">senti chi era</b>, nel posto dov'era.
        </p>
      ),
      link: { href: '#/voci', label: 'Ascolta le voci' },
    },
    {
      kicker: 'La scoperta di questa settimana',
      titolo: <>Ogni voce ha ritrovato la sua casa</>,
      corpo: (
        <p className="text-neutral-200 text-lg max-w-2xl mx-auto leading-relaxed mt-4">
          Con la memoria di chi c'era stiamo <b className="text-white">ridando un indirizzo a ogni voce</b>: le prime
          case sono già sulla mappa 3D — «La casa di Gelinda», «La casa di Viterbo»… — e cliccandole,
          chi ci abitava ti parla. Presto le mapperemo tutte.
        </p>
      ),
      link: { href: '#/gemello', label: 'Apri il gemello 3D' },
    },
    {
      kicker: 'La novità che presentiamo oggi',
      titolo: <>La camminata della memoria</>,
      corpo: (
        <>
          <p className="text-neutral-200 text-lg max-w-2xl mx-auto leading-relaxed mt-4 mb-8">
            Cammini per il borgo col telefono. Le case ti riconoscono. E ti parlano.
          </p>
          <div className="flex flex-wrap gap-4 justify-center max-w-3xl mx-auto">
            <Passo n="1" t="Apri e premi Inizia" d="Sul telefono, dal sito. Un solo tocco: attivi GPS e audio." />
            <Passo n="2" t="Cammina per il borgo" d="Nessun QR, niente da inquadrare. Il telefono in tasca o in mano." />
            <Passo n="3" t="La casa ti chiama" d="A 18 metri dalla casa: vibrazione, e la voce del 1987 parte da sola." />
          </div>
        </>
      ),
      link: { href: '#/camminata?prova=1', label: 'Prova dal vivo (modalità demo)' },
    },
    {
      kicker: 'Il prossimo passo',
      titolo: <>Il progetto per la Fondazione di Modena</>,
      corpo: (
        <div className="max-w-2xl mx-auto text-left mt-6 space-y-3 text-lg text-neutral-200">
          <p>→ <b className="text-white">30 nuove interviste</b> agli ultimi testimoni, prima che sia tardi</p>
          <p>→ <b className="text-white">500+ foto e documenti</b> di famiglia digitalizzati</p>
          <p>→ <b className="text-white">Targhe permanenti</b> sulle case: il museo diffuso</p>
          <p>→ <b className="text-white">Drone</b> per le riprese aeree e la fotogrammetria del borgo</p>
          <p className="pt-3 border-t border-neutral-800">Costo: <b className="text-white">13.000 €</b> · chiesti alla Fondazione: <b className="gold">10.000 €</b> · nostri: 3.000 €</p>
          <p className="text-sm text-neutral-400">Domanda pronta sulla piattaforma ROL · esito entro il 20 novembre 2026</p>
        </div>
      ),
    },
    {
      kicker: 'Serve ognuno di voi',
      titolo: <>Cosa vi chiediamo</>,
      corpo: (
        <div className="max-w-2xl mx-auto text-left mt-6 space-y-3 text-lg text-neutral-200">
          <p>→ <b className="text-white">Ricordi e nomi</b>: chi era? dove abitava? come si chiamava quel campo?</p>
          <p>→ <b className="text-white">Foto e documenti</b> nei cassetti: li digitalizziamo e ve li restituiamo</p>
          <p>→ <b className="text-white">Le nonne e i nonni</b>: segnalateci chi può ancora raccontare</p>
          <p>→ <b className="text-white">Due mani</b> alle feste e alle giornate di posa delle targhe</p>
        </div>
      ),
    },
    {
      kicker: 'San Martino 2030',
      titolo: <>La valle che non si arrende</>,
      corpo: (
        <p className="font-display italic text-2xl text-neutral-200 max-w-xl mx-auto leading-relaxed mt-6">
          «Questa valle era dei Da Gomola, legati a Matilde di Canossa. La chiesa cadde con la frana
          del 1746 e fu ricostruita. Noi siamo solo l'ultimo capitolo.»
        </p>
      ),
      link: { href: '#/', label: 'ubidefuit.github.io/san-martino' },
    },
  ];

  const avanti = () => setI((x) => Math.min(x + 1, SLIDES.length - 1));
  const indietro = () => setI((x) => Math.max(x - 1, 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); avanti(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); indietro(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = SLIDES[i];

  return (
    <div ref={wrap}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col cursor-pointer select-none"
      onClick={(e) => { if (!(e.target as HTMLElement).closest('a,button')) avanti(); }}>
      <div className="grana" />
      <div className="lucciole" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, k) => (
          <span key={k} style={{ left: (5 + k * 9.5) + '%', animationDuration: (7 + (k % 5) * 2.2) + 's', animationDelay: (k * 0.9) + 's' }} />
        ))}
      </div>

      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <div className="flex items-center gap-2">
          <Mark2030 className="w-8 h-8 mark-fg" />
          <span className="font-display">San Martino <span className="gold">2030</span></span>
        </div>
        <a href="#/" onClick={(e) => e.stopPropagation()} className="text-neutral-500 hover:text-white text-sm" title="Esci dalla presentazione">✕</a>
      </div>

      <div key={i} className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-10 relative z-10 page-enter">
        <p className="text-[11px] tracked gold mb-4">{s.kicker}</p>
        <h1 className="font-display text-5xl sm:text-7xl leading-tight">{s.titolo}</h1>
        <div className="w-full">{s.corpo}</div>
        {s.link && (
          <a href={s.link.href} onClick={(e) => e.stopPropagation()}
            className="inline-block mt-10 bg-white text-black px-8 py-3.5 font-semibold uppercase tracking-[0.18em] text-sm hover:bg-[#E0BF5C] transition">
            {s.link.label}
          </a>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 pb-6">
        {SLIDES.map((_, k) => (
          <button key={k} onClick={(e) => { e.stopPropagation(); setI(k); }}
            className={'h-1.5 rounded-full transition-all ' + (k === i ? 'w-8 bg-[#E0BF5C]' : 'w-3 bg-neutral-700 hover:bg-neutral-500')}
            aria-label={'Slide ' + (k + 1)} />
        ))}
      </div>
    </div>
  );
}
