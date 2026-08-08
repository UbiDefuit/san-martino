// Dati della piattaforma — modificare qui testi, obiettivi e raccolte.
export const EVENTO_URL = 'https://ubidefuit.github.io/camminata-san-martino/';
export const WHATSAPP_URL = 'https://chat.whatsapp.com/Irv0U5KNHroKef4iLJtWua';
export const EMAIL = 'sanmartinovallata@gmail.com';

export interface Progetto {
  id: string;
  geo: [number, number];      // [lat, lon] — posizione del pin sul gemello
  titolo: string;
  sintesi: string;
  descrizione: string;
  azioni: string[];
  budgetMin: number;
  budgetMax: number;
  raccolti: number;          // aggiornare a mano (per ora)
  stato: 'in corso' | 'in avvio' | 'in progettazione' | 'in valutazione';
  fonti: string;
}

export const PROGETTI: Progetto[] = [
  {
    id: 'sentieri', geo: [44.38210, 10.69340], titolo: 'La rete dei sentieri ritrovati',
    sintesi: 'Sentieri riaperti dai volontari, da segnalare e mantenere per sempre.',
    descrizione: 'I volontari hanno già ripulito e riaperto i sentieri storici della frazione — la camminata Into the Wild li percorre tutti. Ora vogliamo renderli permanenti: segnaletica, manutenzione programmata e collegamento alla rete escursionistica dell\'Appennino.',
    azioni: ['Cartellonistica con QR verso mappe e racconti', 'Programma "adotta un sentiero" per famiglie e aziende', 'Collegamento ai percorsi dell\'Appennino modenese'],
    budgetMin: 15000, budgetMax: 30000, raccolti: 0, stato: 'in corso',
    fonti: 'GAL, Comune, sponsor locali',
  },
  {
    id: 'spazio', geo: [44.38724, 10.68936], titolo: 'Uno spazio per la comunità',
    sintesi: 'Un locale del borgo che torna a vivere: ristoro, riunioni, base per gli eventi.',
    descrizione: 'San Martino non ha più un luogo dove trovarsi. Vogliamo recuperare un locale della frazione come presidio di comunità: punto ristoro nei weekend, sala per le riunioni e base operativa per gli eventi.',
    azioni: ['Studio di fattibilità con Comune e proprietà', 'Ristrutturazione leggera con cantiere partecipato', 'Aperture a turni gestite dai volontari'],
    budgetMin: 40000, budgetMax: 120000, raccolti: 0, stato: 'in progettazione',
    fonti: 'Fondazione di Modena, GAL, crowdfunding',
  },
  {
    id: 'memoria', geo: [44.38790, 10.68870], titolo: 'La memoria del borgo',
    sintesi: 'Foto d\'epoca, voci degli anziani, storie delle famiglie: l\'archivio di San Martino.',
    descrizione: 'Ogni anziano che se ne va porta con sé un pezzo di San Martino. Stiamo raccogliendo foto d\'epoca, interviste e storie per costruire l\'archivio digitale del borgo — che vivrà su questa piattaforma e in una mostra annuale.',
    azioni: ['Raccolta materiali porta a porta', 'Digitalizzazione e pubblicazione nelle Storie', 'QR sui luoghi raccontati e mostra annuale'],
    budgetMin: 3000, budgetMax: 8000, raccolti: 0, stato: 'in avvio',
    fonti: 'Crowdfunding civico, 5×1000, fondazioni',
  },
  {
    id: 'eventi', geo: [44.38660, 10.69010], titolo: 'Il calendario che non si ferma',
    sintesi: 'La Festa di San Martino — polenta, vino novello e castagne — è il perno da sempre. Attorno, le nuove tappe.',
    descrizione: 'La nostra scansione del tempo è la Festa di San Martino di novembre, che l\'associazione fa da anni: polentata, vino novello e castagne. Attorno a quella tappa fissa costruiamo la stagione: la camminata d\'estate, la Tortellonata, la primavera. Ogni appuntamento vive sulla piattaforma digitale — e alla Festa di San Martino si annunciano i risultati dell\'anno: le idee dell\'anfora votate, i progetti avviati, il rendiconto.',
    azioni: ['Camminata Into the Wild (1 agosto)', 'Tortellonata (8 agosto)', 'FESTA DI SAN MARTINO — polenta, novello e castagne (novembre, la tradizione di sempre): qui si annunciano le idee vincitrici dell\'anfora', 'Festa di primavera'],
    budgetMin: 2000, budgetMax: 5000, raccolti: 0, stato: 'in corso',
    fonti: 'Offerte agli eventi, sponsor, quote soci',
  },
  {
    id: 'cammini', geo: [44.37900, 10.68940], titolo: 'San Martino nei cammini',
    sintesi: 'Una tappa del turismo lento: chi cammina l\'Appennino deve passare di qui.',
    descrizione: 'L\'Appennino è attraversato da cammini sempre più frequentati. Vogliamo che San Martino diventi tappa o deviazione segnalata, con i servizi minimi per accogliere i camminatori.',
    azioni: ['Accordi con le reti dei cammini regionali', 'Punto acqua, ristoro e spazio tenda', 'Pacchetto "weekend a San Martino" con guide locali'],
    budgetMin: 10000, budgetMax: 25000, raccolti: 0, stato: 'in progettazione',
    fonti: 'GAL, Regione, APT',
  },
  {
    id: 'casa-borgate', geo: [44.38810, 10.68520], titolo: 'La Casa delle Borgate',
    sintesi: 'Ospitalit\u00e0 culturale dell\u2019APS: dormire nella valle e viverla, non solo visitarla. Idea in valutazione.',
    descrizione: 'Una \u201ccasa per ferie\u201d gestita dall\u2019associazione (la forma che la legge regionale prevede per gli enti non profit): posti letto per escursionisti, famiglie, scolaresche e gruppi, sempre legati a un\u2019esperienza \u2014 i weekend delle borgate, la raccolta delle storie, i laboratori. Non un B&B: ospitalit\u00e0 con uno scopo. Il progetto \u00e8 in valutazione: il primo passo \u00e8 trovare l\u2019immobile giusto (comodato o accordo), poi la verifica fiscale e la SCIA. Nel frattempo si parte con i weekend-esperienza appoggiati alle strutture vicine convenzionate.',
    azioni: ['Individuare l\u2019immobile (comodato/accordo)', 'Verifica fiscale con il commercialista (attivit\u00e0 secondarie ETS)', 'Weekend delle borgate pilota con pernotto convenzionato', 'SCIA casa per ferie quando c\u2019\u00e8 l\u2019edificio'],
    budgetMin: 60000, budgetMax: 150000, raccolti: 0, stato: 'in valutazione',
    fonti: 'Bandi 2027, comodato immobile, crowdfunding, sponsor',
  },
  {
    id: 'gemello', geo: [44.38860, 10.69050], titolo: 'Il gemello digitale di San Martino',
    sintesi: 'La copia digitale del borgo: com\'era, com\'è, come sarà.',
    descrizione: 'Il territorio in 3D c\'è già (lo vedi nell\'app dell\'evento). I prossimi strati: il modello 3D del borgo dalla fotogrammetria col drone, le foto d\'epoca sovrapposte al presente, e i progetti di rigenerazione visualizzati prima di realizzarli.',
    azioni: ['Volo fotogrammetrico e modello 3D navigabile', 'Modalità "com\'era / com\'è" con le foto storiche', 'Anteprima 3D degli interventi di rigenerazione'],
    budgetMin: 5000, budgetMax: 15000, raccolti: 0, stato: 'in avvio',
    fonti: 'Bandi digitalizzazione, sponsor tecnologici',
  },
];

export interface Storia { id: string; titolo: string; testo: string; data: string; }
export const STORIE: Storia[] = [
  {
    id: 'da-cappella-a-parrocchia', titolo: 'Da cappella a parrocchia', data: '1569\u20131627',
    testo: 'Prima ancora di essere parrocchia, \u201cVallata\u201d compare nell\u2019indice di una visita pastorale del 1569 conservata nell\u2019Archivio Diocesano di Modena. Nel 1627 la comunit\u00e0 ottenne l\u2019autonomia da Cassano: una piccola frazione di montagna che conquista la propria chiesa. La tradizione popolare racconta di una donna ricca che avrebbe finanziato l\u2019edificio per non dover pi\u00f9 scendere a Cassano \u2014 leggenda, forse, ma con dentro un nucleo di verit\u00e0 che stiamo cercando negli archivi. [Fonti: ACMo O.I.33; CEI]',
  },
  {
    id: 'rondine-1644', titolo: 'La Madonna della Rondine: documento e leggenda', data: '1644',
    testo: 'L\u2019Oratorio della Beata Vergine della Rondine \u00e8 documentato dal 1644, opera di maestranze locali. La memoria del paese lo lega allo scampato pericolo della peste e tramanda racconti miracolosi attorno all\u2019immagine della Madonna. Qui ogni anno si celebra ancora la sua funzione: quattro secoli di devozione ininterrotta, in un edificio che oggi chiede di essere riaperto e curato. [Fonti: Catalogo ICCD 0800264192; tradizione locale]',
  },
  {
    id: 'paese-che-si-sposto', titolo: 'Il paese che si spost\u00f2', data: '1746\u20131756',
    testo: 'Nel dicembre 1746 una grande frana si stacc\u00f2 dal versante nord del Monte San Martino; un anno dopo il movimento si riattiv\u00f2 e travolse la chiesa e parte dell\u2019abitato, allora chiamato Vallata. La comunit\u00e0 non si arrese: ricostru\u00ec la chiesa su un colle pi\u00f9 sicuro e la riapr\u00ec al culto il 19 maggio 1756. Non \u00e8 la storia di un edificio: \u00e8 la storia di un paese che ha imparato a convivere con una montagna che si muove \u2014 lo rifar\u00e0 nel 1960, nel 1966, nel 2013. [Fonti: Archivio frane storiche Regione E-R; CEI; Comune di Polinago]',
  },
  {
    id: 'monte-1944', titolo: 'Monte San Martino, 1944', data: 'Primavera\u2013autunno 1944',
    testo: 'Nella primavera del 1944 Mario Nardi raggiunse San Martino con una ventina di giovani: nacque la formazione partigiana Arturo Anderlini, con base sul monte. In settembre l\u2019area fu investita da un rastrellamento tedesco: il partigiano Emilio Mazzi, vent\u2019anni, ferito e catturato, fu ucciso il 19 settembre. Un cippo a San Martino lo ricorda ancora. Questi sentieri, prima di essere un percorso di camminata, sono stati una via di libert\u00e0. [Fonti: Atlante Formazioni Partigiane; Atlante delle stragi; Resistenza mAPPe]',
  },
  {
    id: 'nove-firme', titolo: 'Nove firme in via Carloni', data: '23 settembre 2018',
    testo: 'Il 23 settembre 2018, in via Carloni 5, nove persone firmano l\u2019atto costitutivo dell\u2019Associazione di Promozione Sociale San Martino 2.0. Quota sociale: dieci euro. Gli scopi, neri su bianco: promuovere arte, tradizioni e cultura della frazione, educare a muoversi nella natura, accrescere il senso d\u2019appartenenza, stimolare un turismo etico e sostenibile. Otto anni dopo, quelle nove firme sono sentieri riaperti, feste che riempiono il sagrato e una valle che si racconta al mondo. Il 23 settembre \u00e8 il nostro compleanno \u2014 e ogni anno, da adesso, sar\u00e0 il giorno in cui pubblichiamo le idee della comunit\u00e0.',
  },
  {
    id: 'battesimo-2023', titolo: 'Il secondo battesimo del millennio', data: '5 febbraio 2023',
    testo: 'Domenica 5 febbraio 2023, campane a festa: nella chiesa di San Martino viene battezzato il piccolo Gabriele, secondo battesimo in parrocchia in venticinque anni \u2014 il primo era stato suo fratello. La mamma, battezzata qui da bambina, ha scelto di restare a vivere nel borgo con l\u2019azienda agricola di famiglia. \u00c8 la notizia che ha fatto scrivere ai giornali quello che noi sappiamo da sempre: questa valle non si arrende. [Fonte: Il Resto del Carlino, 28/1/2023]',
  },
  {
    id: 'sentieri-ritrovati', titolo: 'I sentieri ritrovati', data: 'Estate 2026',
    testo: 'Per anni i sentieri di San Martino sono stati inghiottiti dai rovi. Questa primavera i volontari dell\'associazione li hanno riaperti a colpi di decespugliatore e pazienza: 6,2 chilometri di storia che tornano a respirare. Il 1° agosto li percorreremo tutti insieme, per la prima volta.',
  },
  {
    id: 'prima-edizione', titolo: 'Into the Wild — First Edition', data: '1 agosto 2026',
    testo: 'La prima camminata comunitaria di San Martino 2.0: ritrovo all\'alba alla chiesa, 6,2 km sui sentieri ritrovati, colazione per tutti al rientro. Questa storia la scriveremo insieme — e la racconteremo qui, con le foto di chi c\'era.',
  },
];
