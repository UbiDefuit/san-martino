import React, { useEffect, useRef, useState } from 'react';
import { PROGETTI, STORIE, EVENTO_URL, WHATSAPP_URL, EMAIL, Progetto } from './data';
import Gemello from './Gemello';
import Gramignata from './Gramignata';
import StaffEvento from './StaffEvento';
import Idee from './Idee';
import Memorie from './Memorie';
import Voci from './Voci';
import Mark2030 from './Mark2030';

type Route = 'home' | 'progetti' | 'gemello' | 'storie' | 'memorie' | 'voci' | 'sostienici' | 'chisiamo' | 'gramignata' | 'idee' | 'staff';

const routeFromHash = (): Route => {
  const h = location.hash.replace('#/', '').split('?')[0];
  return (['progetti', 'gemello', 'storie', 'memorie', 'voci', 'sostienici', 'chisiamo', 'gramignata', 'idee', 'staff'].includes(h) ? h : 'home') as Route;
};

const eur = (n: number) => n.toLocaleString('it-IT') + ' €';

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] tracked gold mb-3">{children}</div>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-neutral-950 border border-neutral-800 p-6 lift ' + className}>{children}</div>;
}

function BtnLink({ href, children, primary = false, external = false }: any) {
  const cls = primary
    ? 'bg-white text-black hover:bg-neutral-200'
    : 'border border-neutral-700 text-white hover:border-white';
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={cls + ' inline-block px-6 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs transition text-center'}>
      {children}
    </a>
  );
}

// ---------- Home ----------

function Cifra({ testo }: { testo: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const m = testo.match(/^(~?)(\d+(?:,\d+)?)(.*)$/);
  const [txt, setTxt] = useState(m ? m[1] + '0' + m[3] : testo);
  useEffect(() => {
    if (!m) { setTxt(testo); return; }
    const el = ref.current; if (!el) return;
    const dec = m[2].includes(',') ? 1 : 0;
    const target = parseFloat(m[2].replace(',', '.'));
    let raf = 0, fatto = false;
    const anima = () => {
      fatto = true;
      const t0 = performance.now(), durata = 1400;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / durata);
        const e = 1 - Math.pow(1 - p, 3);
        setTxt(m[1] + (target * e).toFixed(dec).replace('.', ',') + m[3]);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { setTxt(testo); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); anima(); } }, { threshold: 0.4 });
    io.observe(el);
    const t = setTimeout(() => { if (!fatto) setTxt(testo); }, 3500); // nulla resta a zero
    return () => { cancelAnimationFrame(raf); io.disconnect(); clearTimeout(t); };
  }, []);
  return <div ref={ref} className="font-display text-4xl text-white">{txt}</div>;
}


function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    const mostra = (el: Element) => el.classList.add('reveal-in');
    if (!('IntersectionObserver' in window)) { els.forEach(mostra); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { mostra(e.target); io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    els.forEach((el) => io.observe(el));
    const t = setTimeout(() => els.forEach(mostra), 1600); // nulla può restare invisibile
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);
}

const HERO_LOOPS = ['./hero-voci.mp4', './hero-voci-2.mp4', './hero-voci-3.mp4', './hero-voci-4.mp4', './hero-voci-5.mp4', './hero-voci-6.mp4'];

function Home() {
  useReveal();
  const [heroIdx, setHeroIdx] = useState(() => new Date().getHours() % HERO_LOOPS.length); // parte con la scena dell'ora
  const [heroAudio, setHeroAudio] = useState(false);
  const heroVid = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = heroVid.current;
    if (heroAudio && el) window.dispatchEvent(new CustomEvent('sm-voce', { detail: el }));
    else window.dispatchEvent(new Event('sm-voce-off'));
    return () => window.dispatchEvent(new Event('sm-voce-off'));
  }, [heroAudio, heroIdx]);
  const tocco = useRef<{ x: number; y: number } | null>(null);
  return (
    <div className="animate-fade-in-up">
      {/* hero cinematografica a tutta pagina */}
      <section className="hero-cinema -mx-5 relative min-h-[62vh] sm:min-h-[68vh] pt-24 sm:pt-28 flex flex-col justify-end overflow-hidden"
        onTouchStart={(e) => { tocco.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          const t = tocco.current; tocco.current = null; if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
            setHeroIdx((heroIdx + (dx < 0 ? 1 : HERO_LOOPS.length - 1)) % HERO_LOOPS.length);
        }}>
        <img src="./hero-gramignata.jpg" alt="Il tramonto sulla valle di San Martino"
          className="absolute inset-0 w-full h-full object-cover object-bottom hero-zoom" />
        <video key={heroIdx + (heroAudio ? "-a" : "-m")} src={HERO_LOOPS[heroIdx]} autoPlay muted loop playsInline poster="./hero-gramignata.jpg"
          ref={(el) => { heroVid.current = el; if (el) { el.muted = !heroAudio; const p = el.play(); if (p) p.catch(() => {}); } }}
          onVolumeChange={(e) => { /* tiene allineato lo stato se il browser interviene */ }}
          aria-hidden="true" className="hero-video absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-fade" />
        <div className="grana" aria-hidden="true" />
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3">
          <div className="flex gap-1.5">
            {HERO_LOOPS.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} aria-label={'Scena ' + (i + 1)}
                className={'w-2 h-2 rounded-full transition ' + (i === heroIdx ? 'bg-[#E0BF5C]' : 'bg-white/35 hover:bg-white/70')} />
            ))}
          </div>
          <button onClick={() => setHeroAudio(!heroAudio)} aria-label={heroAudio ? 'Spegni le voci' : 'Ascolta le voci'} title={heroAudio ? 'Spegni le voci' : 'Ascolta le voci del 1987'}
            className={'w-9 h-9 rounded-full border backdrop-blur transition flex items-center justify-center ' +
              (heroAudio ? 'border-[#E0BF5C] bg-black/40 text-[#E0BF5C]' : 'border-white/40 bg-black/30 text-white/90 hover:border-white')}>
            {heroAudio ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
          <button onClick={() => setHeroIdx((heroIdx + 1) % HERO_LOOPS.length)} aria-label="Cambia scena"
            className="w-9 h-9 rounded-full border border-white/40 bg-black/30 backdrop-blur text-white/90 hover:border-white transition flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
        <div className="lucciole" aria-hidden="true">
          {[0,1,2,3,4,5,6].map((i) => (
            <span key={i} style={{ left: (8 + i * 13) + '%', animationDelay: (i * 1.9) + 's', animationDuration: (9 + (i % 4) * 3) + 's' }} />
          ))}
        </div>
        <div className="relative px-5 pb-12 text-center">
          <p className="hero-el hd1 text-[11px] tracked text-white/90 mb-4">San Martino Vallata · Appennino modenese</p>
          <h1 className="hero-el hd2 font-display text-4xl sm:text-7xl text-white leading-[1.08]">La valle che<br />non si arrende</h1>
          <div className="hero-el hd3 w-14 h-[2px] mx-auto mt-6" style={{ background: '#A8322A' }} />
          <p className="hero-el hd4 text-neutral-200 mt-6 max-w-xl mx-auto text-[15px] leading-relaxed">
            Quattro oratori, mille anni di storia. San Martino si stava spegnendo:
            noi abbiamo deciso di riaccenderlo — un sentiero, una festa, un'idea alla volta.
          </p>
          <div className="hero-el hd5 flex flex-wrap gap-3 justify-center mt-8">
            <BtnLink href="#/gemello" primary>Esplora la valle in 3D</BtnLink>
            <BtnLink href="#/progetti">I progetti</BtnLink>
          </div>
        </div>
      </section>

      <div className="space-y-14 mt-14">
      <section className="reveal">
        <Card className="border-amber-400/40">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <Label>L'estate continua · venerdì 21 e 28 agosto</Label>
              <h2 className="font-display text-3xl text-white">Ciaccio &amp; Slô</h2>
              <p className="text-neutral-300 text-sm mt-2">
                Apericena a buffet alla Chiesa di San Martino: spritz, birra, crescentine e ciacci —
                e la specialità della casa, <span className="text-white">il ciaccio con gelato</span>,
                tre gusti assortiti, come una focaccina da gelateria (lo "slô", per chi è della valle).
                Musica 70–80–90: la playlist della valle. Aperto a tutti, <span className="text-white">paghi quanto vuoi</span>.
              </p>
            </div>
            <BtnLink href={"https://wa.me/?text=" + encodeURIComponent("Ciaccio & Slô — venerdì 21 e 28 agosto alla Chiesa di San Martino Vallata. Apericena a buffet e ciaccio col gelato, musica 70-80-90. Aperto a tutti, paghi quanto vuoi! https://ubidefuit.github.io/san-martino/")} external primary>Passaparola</BtnLink>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <Label>È già successo</Label>
              <h2 className="font-display text-2xl text-white">La Gramignata — 8 agosto</h2>
              <p className="text-neutral-300 text-sm mt-2">Gramigna alla salsiccia, crescentine e gnocco fritto sotto le stelle, la musica degli Incontri nello Chalet e l'anfora che si è riempita di idee per il paese.</p>
            </div>
            <BtnLink href="#/gramignata">La serata</BtnLink>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img src="./canonica.jpg" alt="Chiesa di San Martino" className="w-full sm:w-44 h-32 object-cover" />
            <div className="flex-1 text-center sm:text-left">
              <Label>È già successo</Label>
              <h2 className="font-display text-2xl text-white">Into the Wild — in 46 all'alba</h2>
              <p className="text-neutral-300 text-sm mt-2">Il 1° agosto abbiamo camminato i 6,2 km di sentieri riaperti a mano. C'è il video.</p>
            </div>
            <BtnLink href={EVENTO_URL} external>Rivivi la giornata</BtnLink>
          </div>
        </Card>
      </section>

      <section className="reveal">
        <a href="#/voci" className="block group">
          <div className="relative overflow-hidden border border-neutral-800 hover:border-[#C9A227] transition bg-neutral-950">
            <div className="flex gap-0 overflow-hidden opacity-45 group-hover:opacity-60 transition">
              {['Tiziano','Gelinda','Eulario','Clorinda','Giulia','Malia','Gigino','Armida'].map((n) => (
                <img key={n} src={'./memorie/cast/' + n + '.jpg'} alt="" className="w-1/4 sm:w-[12.5%] h-96 sm:h-44 object-cover" />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-t from-black/85 via-black/50 to-black/60">
              <Label>Il paese che si racconta</Label>
              <h2 className="font-display text-3xl text-white">Le voci di San Martino</h2>
              <p className="text-neutral-200 text-sm mt-2 max-w-md">Tocca un volto del 1987 e senti la sua voce. Quasi nessuno di loro c'è più.</p>
              <span className="inline-block mt-5 bg-white text-black px-6 py-3 font-semibold uppercase tracking-[0.15em] text-xs">Ascolta la valle</span>
            </div>
          </div>
        </a>
      </section>

      <section className="reveal grid grid-cols-3 gap-3 text-center">
        {[['46', "all'alba sui sentieri"], ['6,2 km', 'riaperti a mano'], ['2030', "l'anno che ci siamo dati"]].map(([n, l]) => (
          <Card key={l}>
            <Cifra testo={n} />
            <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mt-2 leading-snug">{l}</div>
          </Card>
        ))}
      </section>

      <section className="reveal">
        <a href="#/gemello" className="block group">
          <div className="relative overflow-hidden border border-neutral-800 hover:border-[#C9A227] transition">
            <img src="./canonica.jpg" alt="" className="w-full h-56 object-cover opacity-50 group-hover:opacity-65 group-hover:scale-[1.03] transition duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <Label>Il gemello digitale</Label>
              <h2 className="font-display text-3xl text-white">Esplora la valle</h2>
              <p className="text-neutral-300 text-sm mt-2 max-w-md">Il territorio vero in 3D: la chiesa, gli oratori, i sentieri, la frana del 1746. E il racconto che si guarda come un film.</p>
              <span className="inline-block mt-5 bg-white text-black px-6 py-3 font-semibold uppercase tracking-[0.15em] text-xs">Entra</span>
            </div>
          </div>
        </a>
      </section>

      <section className="reveal">
        <Label>Dal dossier San Martino 2030</Label>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROGETTI.slice(0, 4).map((p) => (
            <a key={p.id} href="#/progetti" className="block">
              <Card className="h-full hover:border-neutral-500 transition">
                <h3 className="font-display text-xl text-white">{p.titolo}</h3>
                <p className="text-neutral-300 text-sm mt-2">{p.sintesi}</p>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <section className="reveal text-center border-t border-neutral-800 pt-12">
        <p className="font-display italic text-2xl text-neutral-200 max-w-lg mx-auto leading-relaxed">
          «Questa valle era dei Da Gomola, legati a Matilde di Canossa. La chiesa cadde con la frana del 1746 e fu ricostruita. Noi siamo solo l'ultimo capitolo.»
        </p>
        <div className="mt-6">
          <BtnLink href="#/storie">Le storie della valle</BtnLink>
        </div>
      </section>
      </div>
    </div>
  );
}

// ---------- Progetti ----------
function SchedaProgetto({ p }: { p: Progetto }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(100, Math.round((p.raccolti / p.budgetMin) * 100));
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 border border-neutral-700 text-neutral-300">{p.stato}</span>
          <h3 className="text-xl font-bold text-white mt-3">{p.titolo}</h3>
          <p className="text-neutral-300 text-sm mt-1">{p.sintesi}</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="h-1.5 bg-neutral-800 overflow-hidden">
          <div className="h-full bg-white transition-all" style={{ width: pct + '%' }} />
        </div>
        <div className="flex justify-between text-xs text-neutral-400 mt-2">
          <span>raccolti <span className="text-white">{eur(p.raccolti)}</span></span>
          <span>obiettivo {eur(p.budgetMin)}{p.budgetMax > p.budgetMin ? '–' + eur(p.budgetMax) : ''}</span>
        </div>
      </div>
      {open && (
        <div className="mt-5 space-y-3 text-sm text-neutral-200 leading-relaxed">
          <p>{p.descrizione}</p>
          <ul className="space-y-1.5">
            {p.azioni.map((a) => <li key={a}>— {a}</li>)}
          </ul>
          <p className="text-neutral-400 text-xs uppercase tracking-[0.15em] pt-2">Fonti candidate: {p.fonti}</p>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-300 underline underline-offset-4 hover:text-white">
        {open ? 'Chiudi' : 'Scopri di più'}
      </button>
    </Card>
  );
}

function Progetti() {
  return (
    <div className="space-y-5 animate-fade-in-up pt-10">
      <h1 className="font-display text-4xl text-white">I progetti</h1>
      <p className="text-neutral-300 text-[15px] max-w-2xl">
        Questi sono i primi due progetti avviati. Gli altri li scegliamo insieme:
        le idee raccolte con l'anfora e con il form entrano nel piano San Martino 2030.
      </p>
      {PROGETTI.map((p) => <SchedaProgetto key={p.id} p={p} />)}
      <div className="bg-neutral-950 border border-neutral-800 p-6 text-center">
        <p className="font-display text-2xl text-white">Il prossimo progetto lo proponi tu</p>
        <p className="text-neutral-300 text-sm mt-2 max-w-md mx-auto">
          Stiamo raccogliendo le idee della comunità: scrivi la tua, anche in due righe.
        </p>
        <a href="#/idee" className="inline-block mt-5 bg-white text-black px-6 py-3 font-semibold uppercase tracking-[0.15em] text-xs">
          Dicci la tua idea
        </a>
      </div>
    </div>
  );
}

// ---------- Storie ----------
function Storie() {
  return (
    <div className="space-y-5 animate-fade-in-up pt-10">
      <h1 className="font-display text-4xl text-white">Le storie</h1>
      <p className="text-neutral-300 text-[15px] max-w-2xl">
        Il borgo raccontato da chi lo vive: i lavori sui sentieri, gli eventi, e presto
        l'archivio della memoria — foto d'epoca e voci di chi San Martino l'ha visto cambiare.
      </p>
      {STORIE.map((s) => (
        <Card key={s.id}>
          <Label>{s.data}</Label>
          <h3 className="text-xl font-bold text-white">{s.titolo}</h3>
          <p className="text-neutral-200 text-[15px] leading-relaxed mt-3">{s.testo}</p>
        </Card>
      ))}
      <Card className="text-center">
        <p className="text-neutral-200 text-[15px]">Hai foto d'epoca di San Martino, o un nonno con storie da raccontare?</p>
        <p className="text-neutral-400 text-sm mt-2">Scrivici: ogni foto e ogni voce entrano nell'archivio della memoria del borgo.</p>
        <div className="mt-5"><BtnLink href={'mailto:' + EMAIL}>Contattaci</BtnLink></div>
      </Card>
    </div>
  );
}

// ---------- Sostienici ----------
function Sostienici() {
  return (
    <div className="space-y-5 animate-fade-in-up pt-10">
      <h1 className="font-display text-4xl text-white">Dai una mano</h1>
      <p className="text-neutral-300 text-[15px] max-w-2xl">
        San Martino rinasce con il tempo, le braccia e — sì — anche i fondi di chi ci crede.
        Ogni contributo, di qualsiasi forma, resta nella valle.
      </p>
      <Card>
        <Label>Con il tuo tempo</Label>
        <p className="text-neutral-200 text-[15px] leading-relaxed">
          Giornate sui sentieri, eventi, raccolta delle memorie: c'è un posto per chiunque.
          Entra nel gruppo WhatsApp o scrivici — i lavori si organizzano lì.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <BtnLink href={WHATSAPP_URL} external>Gruppo WhatsApp</BtnLink>
          <BtnLink href={'mailto:' + EMAIL}>Scrivici</BtnLink>
        </div>
      </Card>
      <Card>
        <Label>Con una donazione</Label>
        <p className="text-neutral-200 text-[15px] leading-relaxed">
          Bonifico intestato ad Associazione di Promozione Sociale San Martino 2.0 APS — ogni euro va sui progetti che vedi in queste pagine, e ogni anno pubblichiamo il rendiconto.
        </p>
        <div className="mt-4 border border-neutral-700 p-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">IBAN</p>
          <p className="text-white font-mono text-sm mt-2 break-all">IT13 G030 3266 8200 1000 0695 281</p>
        </div>
      </Card>
      <Card>
        <Label>Con la firma: 5×1000</Label>
        <p className="text-neutral-200 text-[15px] leading-relaxed">
          Nella dichiarazione dei redditi, firma nel riquadro degli enti del Terzo settore e indica il nostro codice fiscale: non ti costa nulla,
          per San Martino vale moltissimo. 
        </p>
        <div className="mt-4 border border-neutral-700 p-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">Codice fiscale APS</p>
          <p className="text-white font-mono text-sm mt-2">94195950368</p>
        </div>
      </Card>
      <Card>
        <Label>Con la tua azienda</Label>
        <p className="text-neutral-200 text-[15px] leading-relaxed">
          Sponsorizzazioni e progetti di responsabilità sociale: "adotta un sentiero",
          sostieni un evento, metti il tuo nome su un progetto di rigenerazione.
          Visibilità vera su un territorio vero.
        </p>
        <div className="mt-5"><BtnLink href={'mailto:' + EMAIL}>Parliamone</BtnLink></div>
      </Card>
    </div>
  );
}

// ---------- Chi siamo ----------
function ChiSiamo() {
  return (
    <div className="space-y-5 animate-fade-in-up pt-10">
      <h1 className="font-display text-4xl text-white">Chi siamo</h1>
      <Card>
        <p className="font-display text-2xl text-white leading-snug">
          Siamo volontari: gente del borgo, chi ci è cresciuto,
          chi questa valle l'ha scelta.
        </p>
        <p className="text-neutral-300 text-[15px] leading-relaxed mt-4">
          Puliamo sentieri, organizziamo feste, raccogliamo memorie e costruiamo — anche digitalmente —
          il futuro di un posto che non vogliamo veder sparire.
        </p>
      </Card>

      <section className="grid sm:grid-cols-3 gap-3 text-center">
        {[['2018', 'nati il 23 settembre, con nove firme'], ['8 anni', 'di feste, sentieri e lavori'], ['1987', 'il film del paese, restaurato']].map(([n, l]) => (
          <Card key={l}>
            <div className="font-display text-3xl text-white">{n}</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mt-2 leading-snug">{l}</div>
          </Card>
        ))}
      </section>

      <Card>
        <Label>Cosa facciamo, per statuto</Label>
        <p className="text-neutral-200 text-[15px] leading-relaxed">
          <span className="text-white font-semibold">Associazione di Promozione Sociale San Martino 2.0 APS</span> —
          per tutti “The Valley” — è nata per la tutela e la rinascita del territorio montano di San Martino Vallata.
          Operiamo senza scopo di lucro per la salvaguardia dell'ambiente, la tutela e la valorizzazione del
          patrimonio culturale e del paesaggio, le attività culturali, educative e ricreative di interesse sociale
          e l'inclusione delle persone fragili (D.lgs 117/17, Codice del Terzo settore).
        </p>
      </Card>

      <Card>
        <Label>Otto anni di cose fatte</Label>
        <ul className="text-neutral-200 text-[15px] leading-relaxed space-y-2">
          <li>· La <span className="text-white">Festa di San Martino</span> ogni novembre — polenta, vino novello e castagne</li>
          <li>· Il <span className="text-white">centro estivo</span> per i ragazzi della valle</li>
          <li>· Una dotazione tutta nostra: <span className="text-white">tensostruttura, tavoli, cucina attrezzata, luci esterne</span></li>
          <li>· La <span className="text-white">canonica</span> della parrocchia, nostra sede, di cui curiamo la manutenzione</li>
          <li>· <span className="text-white">6,2 km di sentieri</span> riaperti a mano, e le memorie del paese digitalizzate</li>
        </ul>
      </Card>
      <Card>
        <Label>Con il patrocinio</Label>
        <div className="flex items-center gap-4">
          <img src="./stemma-polinago.png" alt="Comune di Polinago" className="w-14 bg-white p-1.5" />
          <p className="text-neutral-200 text-sm">Comune di Polinago</p>
        </div>
      </Card>
      <Card>
        <Label>Contatti</Label>
        <p className="text-neutral-200 text-sm">Email: {EMAIL}</p>
        <p className="text-neutral-200 text-sm">PEC: sanmartino2.0@pec.it</p>
        <p className="text-neutral-200 text-sm">C.F. 94195950368 — iscritta al RUNTS</p>
        <p className="text-neutral-200 text-sm mt-1">WhatsApp: <a className="underline underline-offset-4" href={WHATSAPP_URL} target="_blank" rel="noreferrer">gruppo della comunità</a></p>
      </Card>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [light, setLight] = useState(localStorage.getItem('sm2030_theme') === 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('light', light);
    localStorage.setItem('sm2030_theme', light ? 'light' : 'dark');
  }, [light]);
  const [route, setRoute] = useState<Route>(routeFromHash());
  const [menu, setMenu] = useState(false);

  // il crinale che parla davvero: le barre del logo seguono la voce
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    const sorgenti = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
    let raf = 0;
    const barre = () => document.querySelectorAll<SVGRectElement>('#marchio-vivo .mark-bar');
    const livelli = [0, 0, 0, 0, 0, 0, 0];
    const bande = [1, 2, 4, 6, 9, 13, 18];
    const ferma = () => {
      cancelAnimationFrame(raf); raf = 0;
      barre().forEach((b) => { b.style.animation = ''; b.style.transform = ''; });
    };
    const parte = (e: Event) => {
      const el = (e as CustomEvent).detail as HTMLMediaElement;
      try {
        if (!ctx) { ctx = new AudioContext(); analyser = ctx.createAnalyser(); analyser.fftSize = 64; analyser.connect(ctx.destination); }
        ctx.resume();
        if (!sorgenti.has(el)) { const s = ctx.createMediaElementSource(el); sorgenti.set(el, s); }
        sorgenti.get(el)!.connect(analyser!);
        const dati = new Uint8Array(analyser!.frequencyBinCount);
        const passo = () => {
          analyser!.getByteFrequencyData(dati);
          const bs = barre();
          bs.forEach((b, i) => {
            const v = (dati[bande[i]] || 0) / 255;
            livelli[i] = livelli[i] * 0.65 + v * 0.35;
            b.style.animation = 'none';
            b.style.transform = 'scaleY(' + (0.45 + livelli[i] * 0.85).toFixed(3) + ')';
          });
          raf = requestAnimationFrame(passo);
        };
        if (!raf) raf = requestAnimationFrame(passo);
      } catch { /* se l'audio non è instradabile, il logo continua a respirare */ }
    };
    window.addEventListener('sm-voce', parte);
    window.addEventListener('sm-voce-off', ferma);
    return () => { window.removeEventListener('sm-voce', parte); window.removeEventListener('sm-voce-off', ferma); ferma(); if (ctx) ctx.close(); };
  }, []);
  useEffect(() => {
    const on = () => { setRoute(routeFromHash()); setMenu(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const nav: { r: Route; label: string }[] = [
    { r: 'home', label: 'Home' },
    { r: 'progetti', label: 'Progetti' },
    { r: 'gemello', label: 'Gemello' },
    { r: 'storie', label: 'Storie' },
    { r: 'memorie', label: 'Memorie' },
    { r: 'voci', label: 'Le voci' },
    { r: 'sostienici', label: 'Sostienici' },
    { r: 'chisiamo', label: 'Chi siamo' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="#/" className="flex items-center gap-2 shrink-0">
            <span id="marchio-vivo" className="contents"><Mark2030 className="w-8 h-8 mark-fg" /></span>
            <span className="font-display text-base sm:text-lg leading-none whitespace-nowrap">San Martino <span className="gold">2030</span></span>
          </a>
          <div className="flex items-center">
          <nav className="hidden sm:flex gap-6 ml-4">
            {nav.map((n) => (
              <a key={n.r} href={'#/' + (n.r === 'home' ? '' : n.r)}
                className={'text-[11px] uppercase tracking-[0.15em] whitespace-nowrap transition ' +
                  (route === n.r ? 'text-white border-b border-white pb-1' : 'text-neutral-400 hover:text-white')}>
                {n.label}
              </a>
            ))}
          </nav>
          <button onClick={() => setLight(!light)} title={light ? 'Tema scuro' : 'Tema chiaro'}
            className="shrink-0 ml-3 w-8 h-8 flex items-center justify-center border border-neutral-700 text-white hover:border-white transition">
            {light ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
          <button onClick={() => setMenu(!menu)} aria-label="Menu"
            className="sm:hidden shrink-0 ml-2 w-8 h-8 flex items-center justify-center border border-neutral-700 text-white hover:border-white transition">
            {menu ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
          </div>
        </div>
        {menu && (
          <nav className="sm:hidden border-t border-neutral-800 bg-black">
            {nav.map((n) => (
              <a key={n.r} href={'#/' + (n.r === 'home' ? '' : n.r)} onClick={() => setMenu(false)}
                className={'block px-5 py-3.5 text-[12px] uppercase tracking-[0.2em] border-b border-neutral-900 ' +
                  (route === n.r ? 'text-white' : 'text-neutral-400')}>
                {n.label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main className="max-w-3xl mx-auto px-5 pb-20">
        {route === 'home' && <Home />}
        {route === 'progetti' && <Progetti />}
        {route === 'gemello' && <Gemello />}
        {route === 'storie' && <Storie />}
        {route === 'memorie' && <Memorie />}
        {route === 'voci' && <Voci />}
        {route === 'sostienici' && <Sostienici />}
        {route === 'chisiamo' && <ChiSiamo />}
        {route === 'gramignata' && <Gramignata />}
        {route === 'staff' && <StaffEvento />}
        {route === 'idee' && <Idee />}
      </main>
      <footer className="border-t border-neutral-800 py-10 text-center space-y-3">
        <Mark2030 className="w-10 h-10 mx-auto mark-fg" />
        <p className="text-[11px] tracked gold">San Martino 2030 — la valle che non si arrende</p>
        <p className="text-xs text-neutral-500">APS per la rinascita di San Martino Vallata · Polinago (MO)</p>
        
      </footer>
    </div>
  );
}
