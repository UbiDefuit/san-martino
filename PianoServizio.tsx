import React, { useEffect, useState } from 'react';
import { ttStaffList } from './supa';
import Checklist from './Checklist';

/* ------------------------------------------------------------------ dati */

const SQUADRE: [string, string, string][] = [
  ['Regia', '1 persona', 'Tiene i tempi, decide se si slitta, unica a parlare col gruppo e col parroco'],
  ['Allestimento', '3 persone', 'Tavoli, sedie, luci, cartelli, anfora delle idee (la tensostruttura è fissa: non si monta)'],
  ['Accoglienza', '2 persone', 'App per il check-in, incasso, indicare i tavoli, backup cartaceo'],
  ['Cucina — primo', '3 persone', 'Ragù di salsiccia, pentoloni, cottura e mantecatura della gramigna'],
  ['Piastra', '3 persone', 'Cottura delle crescentine sulle tigelliere e rifornimento continuo dei cesti'],
  ['Frittura', '2 persone', 'Gnocco fritto salato e crescentine fritte dolci — due oli separati'],
  ['Bar', '2 persone', 'Spritz, gin lemon, analcolici per i bambini, vino e acqua ai tavoli'],
  ['Sala e lavaggio', '4 persone', 'Servizio ai tavoli, sbarazzo, differenziata, lavaggio'],
];

type Tappa = { h: string; t: string; chi: string; big?: boolean };

const MATTINA: Tappa[] = [
  { h: '08:30', t: 'Ritiro delle crescentine da Lavacchielli (Pavullo). Subito in frigo.', chi: 'Piastra', big: true },
  { h: '09:00', t: 'Ragù di salsiccia: soffritto, salsiccia sgranata, sfumare, passata. Cuoce piano un paio d’ore.', chi: 'Cucina primo', big: true },
  { h: '11:00', t: 'Ragù pronto: si lascia da parte al fresco, la sera si riscalda soltanto.', chi: 'Cucina primo' },
  { h: '11:00', t: 'Bibite, acqua e vino bianco in fresco. Ghiaccio nel congelatore.', chi: 'Bar' },
  { h: '11:30', t: 'Giro finale: manca qualcosa? Si compra adesso, non nel pomeriggio.', chi: 'Regia' },
];

const POMERIGGIO: Tappa[] = [
  { h: '16:00', t: 'Tavoli e sedie sotto la tensostruttura (già montata). Prova luci esterne.', chi: 'Allestimento' },
  { h: '16:30', t: 'Banco bar: ghiaccio nei contenitori, bottiglie in fresco, arance e limoni tagliati.', chi: 'Bar' },
  { h: '17:00', t: 'Tavoli apparecchiati, tovaglie, tovaglioli, menù sui tavoli.', chi: 'Sala' },
  { h: '17:00', t: 'Tigelliere e friggitrici in postazione. Olio salato e olio dolce ben separati.', chi: 'Piastra + Frittura' },
  { h: '17:30', t: 'Anfora delle idee al suo posto, con biglietti, penne e cartello col QR.', chi: 'Allestimento' },
  { h: '18:00', t: 'Arriva il gruppo: scarico, posizionamento, prova audio.', chi: 'Regia' },
  { h: '18:30', t: 'Banco accoglienza: telefono carico, app aperta, PIN provato, cassetta, PDF stampato.', chi: 'Accoglienza' },
  { h: '18:45', t: 'Crescentine fuori dal frigo: mezz’ora prima, così cuociono meglio.', chi: 'Piastra' },
  { h: '19:00', t: 'Briefing di tutti in cerchio: dieci minuti, si legge questa pagina.', chi: 'Regia', big: true },
];

const SERA: Tappa[] = [
  { h: '19:15', t: 'Si apre. Check-in all’ingresso, si incassa, si indica il tavolo.', chi: 'Accoglienza', big: true },
  { h: '19:30', t: 'Aperitivo: spritz, gin lemon, stuzzichini. Musica di sottofondo bassa.', chi: 'Bar' },
  { h: '19:40', t: 'Si scalda il ragù e si mette l’acqua a bollire.', chi: 'Cucina primo' },
  { h: '20:00', t: 'Si butta la pasta. Ultima chiamata per i ritardatari.', chi: 'Cucina primo' },
  { h: '20:15', t: 'Esce la gramigna alla salsiccia. Servizio ai tavoli, non self-service.', chi: 'Cucina + Sala', big: true },
  { h: '20:45', t: 'Sbarazzo primi. Partono piastra e frittura.', chi: 'Sala' },
  { h: '21:00', t: 'Crescentine e gnocco fritto, in giro continuo finché ce n’è.', chi: 'Piastra + Frittura' },
  { h: '21:30', t: 'Primo set di Incontri nello Chalet (circa un’ora).', chi: 'Regia' },
  { h: '22:15', t: 'Pausa musica. Due minuti al microfono: grazie, e l’anfora delle idee.', chi: 'Regia', big: true },
  { h: '22:20', t: 'Escono le crescentine fritte dolci e il caffè.', chi: 'Frittura' },
  { h: '22:40', t: 'Secondo set. Si balla, si chiacchiera, si scrive nell’anfora.', chi: '—' },
  { h: '23:45', t: 'Chiude la cucina. Il bar resta aperto.', chi: 'Cucina' },
  { h: '00:30', t: 'Saluti. Si spegne la musica.', chi: 'Regia' },
  { h: '00:40', t: 'Sbarazzo, differenziata, tavoli e sedie a posto. La tensostruttura resta.', chi: 'Tutti' },
];

const CUCINA: [string, string[]][] = [
  ['Il primo — gramigna alla salsiccia', [
    'Il ragù si fa la mattina: soffritto, salsiccia sgranata senza budello, sfumare col bianco, passata, due ore di fuoco basso. Poi si tiene al fresco.',
    'La sera si riscalda soltanto — alle 19:40, mentre l’acqua va a bollire.',
    'Acqua salata nei pentoloni già bollente alle 19:50.',
    'Gramigna: cottura molto al dente, si finisce in padella col ragù.',
    'Non cuocere tutto insieme: due turni, così l’ultimo piatto non è scotto.',
    'Parmigiano a scaglie in tavola, non già mescolato.',
  ]],
  ['Crescentine, gnocco e dolce — tutto dalle crescentine Lavacchielli', [
    'Arrivano già formate da Lavacchielli (Pavullo): non si impasta e non si tira niente, solo cuocere.',
    'Le stesse crescentine servono per tutte e tre le portate: in piastra restano crescentine, fritte diventano gnocco fritto, fritte e zuccherate diventano il dolce.',
    'Si ritirano la mattina e vanno subito in frigo. Fuori mezz’ora prima del servizio: fredde di frigo cuociono male.',
    'In piastra: tigelliere ben calde e appena unte. Si servono calde nei cesti col tovagliolo, mai in anticipo.',
    'Fritte salate: olio a 170–175 °C, si gonfiano in pochi secondi, si girano una volta sola.',
    'Fritte dolci: olio pulito e separato, zucchero appena escono, finché sono bollenti.',
    'Due friggitrici distinte: il dolce non deve sapere di salato. È la regola che salva il finale.',
    'Contare circa 7 pezzi a testa in tutto — 3 in piastra, 2-3 fritti salati, 1-2 dolci.',
  ]],
  ['Bar', [
    'Spritz: 3 prosecco · 2 Aperol · 1 soda, ghiaccio abbondante, fetta d’arancia.',
    'Gin lemon: gin, limonata, ghiaccio, fetta di limone.',
    'Per i bambini: limonata e analcolici, sempre pronti in caraffa.',
    'Vino e acqua sono inclusi nel coperto: si portano ai tavoli, non si fanno pagare a parte.',
  ]],
];

const GUAI: [string, string][] = [
  ['Piove', 'Tutti sotto la tensostruttura, tavoli più stretti. Il gruppo suona sotto il tendone, non fuori.'],
  ['Il QR non si legge', 'Si cerca il nome nella lista e si tocca «Arrivato». Funziona sempre.'],
  ['Non c’è campo', 'Si usa il PDF stampato e si segna a penna. Si registra tutto nell’app il giorno dopo.'],
  ['Arrivano senza prenotazione', 'Nell’app: «+ Aggiungi all’ingresso». Si incassa come gli altri.'],
  ['Arrivano in meno', 'Nel pannello «Chi è arrivato?» si abbassa il numero. Si incassa solo per i presenti.'],
  ['Il primo sta finendo', 'La regia lo dice subito alla piastra: si anticipano crescentine e gnocco.'],
  ['Si allunga troppo', 'Si taglia il secondo set, non il dolce. La crescentina fritta è il motivo per cui tornano.'],
];

const DISCORSO = [
  '«Grazie di essere venuti. Siamo l’APS San Martino 2.0: quelli della camminata di agosto, della festa di San Martino, del vino novello e delle castagne. Quest’anno abbiamo riaperto sentieri che non si vedevano da vent’anni, e in quarantasei li abbiamo camminati all’alba.',
  'Stasera vi chiediamo una cosa sola. Su ogni tavolo ci sono dei biglietti: scriveteci cosa vorreste per San Martino nei prossimi dieci anni. Una cosa piccola o una grossa, non importa. È anonimo, nessuno saprà chi l’ha scritta. Poi lo infilate nell’anfora là in fondo.',
  'Le leggiamo tutte. Diventano il piano San Martino 2030, e non è un modo di dire: le tre più fattibili le mettiamo ai voti e ve lo diciamo alla festa di San Martino. Chi preferisce il telefono, c’è il QR sul cartello. Grazie — e adesso musica.»',
];

/* ------------------------------------------------------------------ utils */

const minuti = (h: string) => {
  const [a, b] = h.split(':').map(Number);
  return (a < 6 ? a + 24 : a) * 60 + b; // dopo mezzanotte conta come giorno dopo
};

function Timeline({ tappe, ora }: { tappe: Tappa[]; ora: number }) {
  const idx = tappe.reduce((acc, t, i) => (minuti(t.h) <= ora ? i : acc), -1);
  return (
    <div className="space-y-0">
      {tappe.map((t, i) => {
        const passata = i < idx;
        const adesso = i === idx;
        return (
          <div key={t.h + t.t}
            className={'flex gap-3 py-3 border-b border-neutral-800/70 ' + (passata ? 'opacity-45' : '')}>
            <div className="w-14 shrink-0">
              <span className={'text-sm tabular-nums ' + (adesso ? 'text-white font-bold' : 'gold')}>{t.h}</span>
            </div>
            <div className="min-w-0 flex-1">
              {adesso && <p className="text-[9px] tracked text-white mb-1">◀ adesso</p>}
              <p className={(t.big ? 'font-display text-base ' : 'text-sm ') + 'text-white leading-snug'}>{t.t}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{t.chi}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ pagina */

const TABS = ['Da fare', 'Serata', 'Squadre', 'Cucina', 'Guai'] as const;
type Tab = typeof TABS[number];

export default function PianoServizio() {
  const [pin, setPin] = useState(sessionStorage.getItem('sm2_staff_pin') || '');
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('sm2_staff_pin'));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('Da fare');
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const ora = (now.getHours() < 6 ? now.getHours() + 24 : now.getHours()) * 60 + now.getMinutes();

  const entra = async () => {
    setErr(''); setBusy(true);
    try { await ttStaffList(pin); sessionStorage.setItem('sm2_staff_pin', pin); setAuthed(true); }
    catch { setErr('PIN errato'); }
    setBusy(false);
  };

  if (!authed) {
    return (
      <div className="space-y-4 animate-fade-in-up pt-12 max-w-xs mx-auto text-center">
        <h1 className="text-2xl font-bold text-white">Piano della serata</h1>
        <p className="text-neutral-300 text-sm">Area riservata ai volontari.</p>
        <input type="password" inputMode="numeric" placeholder="PIN" value={pin}
          onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entra()}
          className="w-full bg-black border border-neutral-800 px-4 py-3.5 text-white text-center tracking-[0.5em] focus:outline-none focus:border-white transition" />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button onClick={entra} disabled={busy}
          className="w-full bg-white text-black px-3 py-3 font-semibold uppercase tracking-[0.15em] text-xs disabled:opacity-40">
          {busy ? 'Verifica…' : 'Entra'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up pt-8">
      <div className="text-center">
        <p className="text-[10px] tracked gold">La Gramignata · 8 agosto</p>
        <h1 className="font-display text-3xl text-white mt-1">Piano della serata</h1>
        <p className="text-neutral-500 text-xs mt-1">Chi fa cosa, e quando. Tienila aperta.</p>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={'py-2.5 text-[9px] uppercase tracking-[0.08em] border transition ' +
              (tab === t ? 'border-white text-white' : 'border-neutral-800 text-neutral-500')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Da fare' && <Checklist pin={pin} />}

      {tab === 'Serata' && (
        <div className="space-y-5">
          <div>
            <p className="text-[10px] tracked gold mb-1">Mattina — si cucina</p>
            <Timeline tappe={MATTINA} ora={ora} />
          </div>
          <div>
            <p className="text-[10px] tracked gold mb-1">Pomeriggio — si allestisce</p>
            <Timeline tappe={POMERIGGIO} ora={ora} />
          </div>
          <div>
            <p className="text-[10px] tracked gold mb-1">Sera — si fa</p>
            <Timeline tappe={SERA} ora={ora} />
          </div>
          <div className="hairline bg-neutral-950 p-5 space-y-3">
            <p className="text-[10px] tracked gold text-center">I due minuti al microfono — 22:15</p>
            <p className="text-neutral-400 text-[11px] text-center">Chi parla legge questo, non improvvisa. Un minuto e mezzo, non di più.</p>
            {DISCORSO.map((p, i) => (
              <p key={i} className="text-neutral-200 text-sm leading-relaxed italic">{p}</p>
            ))}
          </div>
        </div>
      )}

      {tab === 'Squadre' && (
        <div className="space-y-3">
          {SQUADRE.map(([nome, n, cosa]) => (
            <div key={nome} className="border-b border-neutral-800 pb-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-lg text-white">{nome}</p>
                <p className="text-[11px] gold shrink-0">{n}</p>
              </div>
              <p className="text-neutral-400 text-[13px] mt-1 leading-snug">{cosa}</p>
            </div>
          ))}
          <div className="hairline p-4 space-y-2">
            <p className="text-[10px] tracked gold">Regole per tutti</p>
            {[
              'Chi sta in cucina non serve ai tavoli e viceversa.',
              'Un solo telefono fa il check-in alla volta: il secondo è di scorta, non in parallelo.',
              'I soldi nella cassetta, non nelle tasche. A fine serata si conta in due e si confronta con l’app.',
              'Il defibrillatore è al Poggio: dirlo ad alta voce nel briefing.',
            ].map((r) => <p key={r} className="text-neutral-300 text-[13px]">· {r}</p>)}
          </div>
        </div>
      )}

      {tab === 'Cucina' && (
        <div className="space-y-5">
          {CUCINA.map(([titolo, punti]) => (
            <div key={titolo} className="hairline bg-neutral-950 p-4">
              <p className="font-display text-lg text-white mb-2">{titolo}</p>
              {punti.map((p) => (
                <p key={p} className="text-neutral-300 text-[13px] leading-snug mb-1.5">· {p}</p>
              ))}
            </div>
          ))}
          <div className="hairline p-4">
            <p className="text-[10px] tracked gold mb-2">Da ordinare / ritirare</p>
            <p className="text-neutral-300 text-[13px] mb-1">· <span className="text-white">Crescentine già formate</span> — Lavacchielli, Pavullo. Sono pronte, vanno solo cotte. Le stesse servono per la piastra, per lo gnocco fritto e per la crescentina fritta dolce: circa <span className="text-white">7 pezzi a persona</span>, per 100 coperti sono 660. Ordinare entro martedì, <span className="text-white">ritiro sabato mattina</span> e subito in frigo.</p>
            <p className="text-neutral-300 text-[13px] mb-1">· <span className="text-white">Salsiccia senza budello</span> dal macellaio — confermare la quantità venerdì, a iscrizioni chiuse.</p>
            <p className="text-neutral-300 text-[13px]">· <span className="text-white">Ghiaccio</span> — finisce sempre. Comprarne il doppio di quanto sembra ragionevole.</p>
          </div>
        </div>
      )}

      {tab === 'Guai' && (
        <div className="space-y-3">
          {GUAI.map(([q, r]) => (
            <div key={q} className="border-b border-neutral-800 pb-3">
              <p className="text-white text-sm font-semibold">{q}</p>
              <p className="text-neutral-400 text-[13px] mt-1 leading-snug">{r}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <a href="#/staff" className="flex-1 text-center border border-neutral-700 text-white py-3 text-[11px] uppercase tracking-[0.15em] hover:border-white">
          Vai al check-in
        </a>
        <a href="https://maps.app.goo.gl/rUAuxyJMV4Pdbpb69" target="_blank" rel="noreferrer"
          className="flex-1 text-center border border-neutral-700 text-white py-3 text-[11px] uppercase tracking-[0.15em] hover:border-white">
          Mappa
        </a>
      </div>
    </div>
  );
}
