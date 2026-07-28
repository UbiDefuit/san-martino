import React, { useEffect, useState } from 'react';
import { PROGETTI, STORIE, EVENTO_URL, WHATSAPP_URL, EMAIL, Progetto } from './data';
import Gemello from './Gemello';

type Route = 'home' | 'progetti' | 'gemello' | 'storie' | 'sostienici' | 'chisiamo';

const routeFromHash = (): Route => {
  const h = location.hash.replace('#/', '');
  return (['progetti', 'gemello', 'storie', 'sostienici', 'chisiamo'].includes(h) ? h : 'home') as Route;
};

const eur = (n: number) => n.toLocaleString('it-IT') + ' €';

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 mb-3">{children}</div>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-neutral-950 border border-neutral-800 p-6 ' + className}>{children}</div>;
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
function Home() {
  return (
    <div className="space-y-14 animate-fade-in-up">
      <section className="text-center pt-14">
        <img src="./icona-app.svg" alt="San Martino 2.0" className="w-28 mx-auto mb-8 border border-neutral-800" />
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400 mb-4">San Martino Vallata · Appennino modenese</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">La valle che<br />non si arrende</h1>
        <p className="text-neutral-200 mt-6 max-w-xl mx-auto text-[15px] leading-relaxed">
          San Martino è una frazione di montagna che il tempo stava spegnendo.
          Noi — volontari, famiglie, gente della valle — abbiamo deciso di riaccenderla:
          sentieri riaperti, eventi che riempiono il borgo, la memoria che diventa archivio,
          progetti concreti per riportare vita. Questa è la nostra piattaforma.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <BtnLink href="#/progetti" primary>I progetti</BtnLink>
          <BtnLink href="#/sostienici">Dai una mano</BtnLink>
        </div>
      </section>

      <section>
        <Card className="border-white/30">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img src="./canonica.jpg" alt="Chiesa di San Martino" className="w-full sm:w-44 h-32 object-cover" />
            <div className="flex-1 text-center sm:text-left">
              <Label>Evento in corso</Label>
              <h2 className="text-2xl font-bold text-white">Into the Wild — First Edition</h2>
              <p className="text-neutral-300 text-sm mt-1">Sabato 1 agosto · camminata sui sentieri ritrovati · colazione per tutti</p>
            </div>
            <BtnLink href={EVENTO_URL} external primary>Iscriviti</BtnLink>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        {[['6,2 km', 'di sentieri riaperti dai volontari'], ['6', 'progetti per il borgo'], ['1', 'valle da salvare']].map(([n, l]) => (
          <Card key={l}>
            <div className="text-3xl font-light text-white">{n}</div>
            <div className="text-[11px] uppercase tracking-[0.15em] text-neutral-400 mt-2">{l}</div>
          </Card>
        ))}
      </section>

      <section>
        <a href="#/gemello" className="block">
          <Card className="border-white/30 hover:border-white transition text-center py-10">
            <Label>Innovazione</Label>
            <h2 className="text-2xl font-bold text-white">Esplora il gemello digitale</h2>
            <p className="text-neutral-300 text-sm mt-2 max-w-md mx-auto">
              La valle in 3D — rilievo reale, satellite, sentieri — con i progetti di rigenerazione
              georeferenziati sul territorio. Toccali, sorvolali.
            </p>
            <span className="inline-block mt-5 bg-white text-black px-6 py-3 font-semibold uppercase tracking-[0.15em] text-xs">Entra nel gemello</span>
          </Card>
        </a>
      </section>

      <section>
        <Label>Dal dossier San Martino 2030</Label>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROGETTI.slice(0, 4).map((p) => (
            <a key={p.id} href="#/progetti" className="block">
              <Card className="h-full hover:border-neutral-500 transition">
                <h3 className="font-bold text-white">{p.titolo}</h3>
                <p className="text-neutral-300 text-sm mt-2">{p.sintesi}</p>
              </Card>
            </a>
          ))}
        </div>
      </section>
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
      <h1 className="text-3xl font-bold text-white">I progetti</h1>
      <p className="text-neutral-300 text-[15px] max-w-2xl">
        Sei progetti concreti per far rivivere San Martino, dal dossier "San Martino 2030".
        Ognuno ha un obiettivo, un budget e una strada per finanziarlo. Le barre si muovono
        con le donazioni, i bandi vinti e gli sponsor: seguile crescere.
      </p>
      {PROGETTI.map((p) => <SchedaProgetto key={p.id} p={p} />)}
    </div>
  );
}

// ---------- Storie ----------
function Storie() {
  return (
    <div className="space-y-5 animate-fade-in-up pt-10">
      <h1 className="text-3xl font-bold text-white">Le storie</h1>
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
      <h1 className="text-3xl font-bold text-white">Dai una mano</h1>
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
          per San Martino vale moltissimo. Il codice fiscale da indicare arriverà qui
          appena completata la registrazione.
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
      <h1 className="text-3xl font-bold text-white">Chi siamo</h1>
      <Card>
        <p className="text-neutral-200 text-[15px] leading-relaxed">
          <span className="text-white font-semibold">Associazione di Promozione Sociale San Martino 2.0 APS</span> —
          per tutti “The Valley” — è nata per la tutela e la rinascita del territorio
          montano di San Martino Vallata. Sede: via Carloni 5, loc. San Martino, 41040 Polinago (MO).
          Da statuto operiamo, senza scopo di lucro, per la salvaguardia dell'ambiente, la tutela e la
          valorizzazione del patrimonio culturale e del paesaggio, le attività culturali, educative e
          ricreative di interesse sociale e l'inclusione delle persone fragili (D.lgs 117/17, Codice del Terzo settore).
          Siamo volontari: gente del borgo, figli e nipoti di chi c'è nato, persone che
          hanno scelto questa valle. Puliamo sentieri, organizziamo eventi, raccogliamo memorie
          e costruiamo — anche digitalmente — il futuro di un posto che non vogliamo veder sparire.
        </p>
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
  const [route, setRoute] = useState<Route>(routeFromHash());
  useEffect(() => {
    const on = () => { setRoute(routeFromHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const nav: { r: Route; label: string }[] = [
    { r: 'home', label: 'Home' },
    { r: 'progetti', label: 'Progetti' },
    { r: 'gemello', label: 'Gemello' },
    { r: 'storie', label: 'Storie' },
    { r: 'sostienici', label: 'Sostienici' },
    { r: 'chisiamo', label: 'Chi siamo' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="#/" className="font-bold tracking-tight">SM<span className="text-neutral-400">2030</span></a>
          <nav className="flex gap-4 sm:gap-6 overflow-x-auto">
            {nav.map((n) => (
              <a key={n.r} href={'#/' + (n.r === 'home' ? '' : n.r)}
                className={'text-[11px] uppercase tracking-[0.15em] whitespace-nowrap transition ' +
                  (route === n.r ? 'text-white border-b border-white pb-1' : 'text-neutral-400 hover:text-white')}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 pb-20">
        {route === 'home' && <Home />}
        {route === 'progetti' && <Progetti />}
        {route === 'gemello' && <Gemello />}
        {route === 'storie' && <Storie />}
        {route === 'sostienici' && <Sostienici />}
        {route === 'chisiamo' && <ChiSiamo />}
      </main>
      <footer className="border-t border-neutral-800 py-10 text-center space-y-3">
        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">San Martino 2.0 — The Valley</p>
        <p className="text-xs text-neutral-500">APS per la rinascita di San Martino Vallata · Polinago (MO)</p>
        <a href={EVENTO_URL} target="_blank" rel="noreferrer"
          className="inline-block text-xs text-neutral-300 underline underline-offset-4 hover:text-white">
          → App dell'evento Into the Wild
        </a>
      </footer>
    </div>
  );
}
