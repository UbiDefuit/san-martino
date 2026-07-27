// Dati della piattaforma — modificare qui testi, obiettivi e raccolte.
export const EVENTO_URL = 'https://ubidefuit.github.io/camminata-san-martino/';
export const WHATSAPP_URL = 'https://chat.whatsapp.com/Irv0U5KNHroKef4iLJtWua';
export const EMAIL = 'sanmartino20.thevalley@gmail.com'; // SEGNAPOSTO: sostituire con l'email reale dell'APS

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
  stato: 'in corso' | 'in avvio' | 'in progettazione';
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
    sintesi: 'Da un evento all\'anno a una stagione: camminata, castagnata, ciaspolata, primavera.',
    descrizione: 'Into the Wild è il primo di una serie: vogliamo un calendario di 3-4 appuntamenti l\'anno che tenga vivo il borgo in ogni stagione, sulla piattaforma digitale che abbiamo già costruito.',
    azioni: ['Camminata estiva (1 agosto — iscrizioni aperte!)', 'Castagnata d\'autunno', 'Ciaspolata o camminata invernale', 'Festa di primavera'],
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
    id: 'sentieri-ritrovati', titolo: 'I sentieri ritrovati', data: 'Estate 2026',
    testo: 'Per anni i sentieri di San Martino sono stati inghiottiti dai rovi. Questa primavera i volontari dell\'associazione li hanno riaperti a colpi di decespugliatore e pazienza: 6,2 chilometri di storia che tornano a respirare. Il 1° agosto li percorreremo tutti insieme, per la prima volta.',
  },
  {
    id: 'prima-edizione', titolo: 'Into the Wild — First Edition', data: '1 agosto 2026',
    testo: 'La prima camminata comunitaria di San Martino 2.0: ritrovo all\'alba alla chiesa, 6,2 km sui sentieri ritrovati, colazione per tutti al rientro. Questa storia la scriveremo insieme — e la racconteremo qui, con le foto di chi c\'era.',
  },
];
