import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { VOCI, Voce } from './Voci';

/* La Camminata della Memoria: cammini per il borgo e le voci del 1987
   ti vengono incontro da sole, casa per casa. Nessun QR: il GPS sa dove sei. */

const RAGGIO_IN = 18;   // metri: la voce parte
const RAGGIO_OUT = 32;  // metri: esci dalla casa (isteresi)

const distanza = (a: [number, number], b: [number, number]) => {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

const CASE = VOCI.filter((v) => v.geo) as (Voce & { geo: [number, number] })[];

export default function Camminata() {
  const prova = (location.hash.split('?')[1] || '').includes('prova');
  const [attiva, setAttiva] = useState(false);
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [precisione, setPrecisione] = useState<number | null>(null);
  const [incontrate, setIncontrate] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('sm2030_camminata') || '[]'); } catch { return []; }
  });
  const [voce, setVoce] = useState<Voce | null>(null);
  const [bloccata, setBloccata] = useState(false); // autoplay negato: serve un tocco
  const [gpsErr, setGpsErr] = useState<string | null>(null);
  const dentro = useRef<Set<string>>(new Set());
  const watchId = useRef<number | null>(null);
  const wake = useRef<any>(null);
  const vid = useRef<HTMLVideoElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const meMk = useRef<maplibregl.Marker | null>(null);
  const caseMk = useRef<Record<string, HTMLElement>>({});
  const posRef = useRef<[number, number] | null>(null);
  const voceRef = useRef<Voce | null>(null);
  voceRef.current = voce;

  const salva = (arr: string[]) => { setIncontrate(arr); localStorage.setItem('sm2030_camminata', JSON.stringify(arr)); };

  // minimappa: il borgo, le case, e tu
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'camminata-mappa',
      style: {
        version: 8,
        sources: {
          sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri', maxzoom: 18 },
          ortofoto: {
            type: 'raster',
            tiles: ['https://servizigis.regione.emilia-romagna.it/wms/agea2023_rgb?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Agea2023_RGB&STYLES=&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=512&HEIGHT=512&FORMAT=image/jpeg'],
            tileSize: 512, attribution: 'Ortofoto AGEA 2023 — RER',
          },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#181a17' } },
          { id: 'sat', type: 'raster', source: 'sat' },
          { id: 'ortofoto', type: 'raster', source: 'ortofoto', minzoom: 13, paint: { 'raster-fade-duration': 300 } },
        ],
      } as any,
      center: [10.68466, 44.38851], zoom: 16.1, pitch: 0,
      attributionControl: { compact: true } as any,
    });
    map.on('load', () => {
      setTimeout(() => {
        const att = document.querySelector('#camminata-mappa .maplibregl-ctrl-attrib');
        if (att) { att.classList.remove('maplibregl-compact-show'); att.removeAttribute('open'); }
      }, 300);
    });
    CASE.forEach((v) => {
      const el = document.createElement('div');
      el.className = 'cam-casa';
      el.innerHTML = '<span class="cam-casa-icona">⌂</span><span class="cam-casa-nome">' + v.nome + '</span>';
      caseMk.current[v.id] = el;
      new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([v.geo[1], v.geo[0]]).addTo(map);
      if (prova) el.addEventListener('click', () => muoviti([v.geo[0] + 0.00005, v.geo[1]]));
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stato visivo delle case (incontrate = oro pieno)
  useEffect(() => {
    CASE.forEach((v) => {
      const el = caseMk.current[v.id];
      if (el) el.classList.toggle('cam-casa-fatta', incontrate.includes(v.id));
    });
  }, [incontrate]);

  const muoviti = (p: [number, number]) => {
    posRef.current = p; setPos(p);
    const map = mapRef.current;
    if (map) {
      if (!meMk.current) {
        const el = document.createElement('div'); el.className = 'cam-io';
        meMk.current = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([p[1], p[0]]).addTo(map);
      } else meMk.current.setLngLat([p[1], p[0]]);
      map.easeTo({ center: [p[1], p[0]], duration: 800 } as any);
    }
    // geofence con isteresi
    CASE.forEach((v) => {
      const d = distanza(p, v.geo);
      if (d <= RAGGIO_IN && !dentro.current.has(v.id)) {
        dentro.current.add(v.id);
        incontra(v);
      } else if (d > RAGGIO_OUT) {
        dentro.current.delete(v.id);
      }
    });
  };

  const incontra = (v: Voce) => {
    if (voceRef.current) return; // una voce alla volta: la prossima al prossimo passo
    try { navigator.vibrate?.([140, 70, 140]); } catch { /* ok */ }
    setVoce(v);
    if (!incontrate.includes(v.id)) salva([...incontrate, v.id]);
  };

  // quando cambia la voce, prova a farla parlare
  useEffect(() => {
    const el = vid.current;
    if (!voce || !el) return;
    setBloccata(false);
    const p = el.play();
    if (p) p.then(() => window.dispatchEvent(new CustomEvent('sm-voce', { detail: el })))
      .catch(() => setBloccata(true));
    return () => window.dispatchEvent(new Event('sm-voce-off'));
  }, [voce]);

  const inizia = async () => {
    setGpsErr(null);
    // sblocca l'audio col gesto: un play/pause a volume zero
    const el = vid.current;
    if (el) { el.muted = true; try { await el.play(); el.pause(); } catch { /* ok */ } el.muted = false; }
    try { wake.current = await (navigator as any).wakeLock?.request('screen'); } catch { /* ok */ }
    setAttiva(true);
    if (prova) { muoviti([44.38851, 10.68466]); return; }
    if (!('geolocation' in navigator)) { setGpsErr('Questo dispositivo non ha il GPS.'); return; }
    watchId.current = navigator.geolocation.watchPosition(
      (p) => { setPrecisione(Math.round(p.coords.accuracy)); muoviti([p.coords.latitude, p.coords.longitude]); },
      () => setGpsErr('Serve il permesso di posizione: consentilo e riprova.'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  };

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    try { wake.current?.release(); } catch { /* ok */ }
    window.dispatchEvent(new Event('sm-voce-off'));
  }, []);

  const complete = incontrate.length >= CASE.length;

  return (
    <div className="animate-fade-in-up pt-10 space-y-5">
      <div>
        <p className="text-[10px] tracked gold">Il paese che si racconta · dal vivo</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white mt-2">La camminata della memoria</h1>
        <p className="text-neutral-200 text-[15px] leading-relaxed mt-4 max-w-2xl">
          Cammina per San Martino col telefono in mano. Quando passi davanti a una delle case,
          il telefono vibra e chi ci abitava nel 1987 ti parla — con la sua voce. Nessun QR: il paese sa dove sei.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-5 max-w-2xl">
          {[
            ['1', 'Premi «Inizia»', 'Un tocco solo: si attivano GPS e audio. Poi il telefono puoi anche metterlo in tasca.'],
            ['2', 'Cammina per il borgo', 'Niente QR, niente da inquadrare. Segui la mappa o vai a naso tra le case.'],
            ['3', 'La casa ti chiama', 'A meno di 18 metri: vibrazione, e la voce di chi ci abitava parte da sola.'],
          ].map(([n2, t, d]) => (
            <div key={n2} className="border border-neutral-800 bg-neutral-950 p-4">
              <span className="font-display text-2xl gold">{n2}</span>
              <p className="text-white text-sm font-semibold mt-1">{t}</p>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div id="camminata-mappa" className="h-[52vh] border border-neutral-800" />

        {!attiva && (
          <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center px-6">
            <p className="font-display text-2xl text-white mb-1">{CASE.length} voci ti aspettano</p>
            <p className="text-neutral-300 text-sm mb-5 max-w-xs">Attiva il GPS e cammina: le case ti chiameranno una per una.</p>
            <button onClick={inizia}
              className="bg-[#C9A227] text-black px-8 py-3.5 font-semibold uppercase tracking-[0.18em] text-sm hover:bg-[#E0BF5C] transition">
              Inizia la camminata
            </button>
            {prova && <p className="text-[11px] text-amber-300 mt-3">Modalità prova: tocca una casa sulla mappa per «esserci».</p>}
          </div>
        )}

        {attiva && (
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-3 pointer-events-none">
            <div className="bg-black/80 border border-neutral-700 backdrop-blur px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">{incontrate.length} di {CASE.length} voci</p>
              <div className="flex gap-1 mt-1">
                {CASE.map((v) => (
                  <span key={v.id} title={v.nome}
                    className={'w-2 h-2 rounded-full ' + (incontrate.includes(v.id) ? 'bg-[#E0BF5C]' : 'bg-neutral-700')} />
                ))}
              </div>
            </div>
            {precisione !== null && !prova && (
              <div className="bg-black/80 border border-neutral-700 backdrop-blur px-3 py-2 text-[10px] text-neutral-300">GPS ±{precisione} m</div>
            )}
          </div>
        )}

        {voce && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-[340px] z-20 bg-black/90 border border-[#C9A227]/60 backdrop-blur p-3 hero-el">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">Sei davanti alla casa di</p>
                <p className="font-display text-2xl text-white leading-tight">{voce.nome}</p>
              </div>
              <button onClick={() => setVoce(null)} className="text-neutral-400 hover:text-white text-lg leading-none px-1" aria-label="Chiudi">&times;</button>
            </div>
            {bloccata && (
              <button onClick={() => { const el = vid.current; if (el) el.play().then(() => { setBloccata(false); window.dispatchEvent(new CustomEvent('sm-voce', { detail: el })); }).catch(() => undefined); }}
                className="w-full mb-2 bg-[#C9A227] text-black text-xs uppercase tracking-[0.15em] font-semibold py-2">
                &#9654; Ascolta {voce.nome}
              </button>
            )}
            <video ref={vid} src={'./voci/' + voce.id + '.mp4'} controls playsInline
              onEnded={() => setVoce(null)}
              className="w-full bg-black border border-neutral-800" />
          </div>
        )}
      </div>

      {complete && (
        <div className="border border-[#C9A227]/60 bg-neutral-950 p-6 text-center">
          <p className="font-display text-2xl text-white">Hai ascoltato tutte le {CASE.length} voci.</p>
          <p className="text-neutral-300 text-sm mt-2">Il paese ti ha raccontato tutto quello che ricorda — per ora. Grazie di aver camminato con loro.</p>
          <button onClick={() => { salva([]); dentro.current.clear(); }}
            className="mt-4 border border-neutral-600 text-neutral-300 px-5 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-white hover:text-white transition">
            Ricomincia
          </button>
        </div>
      )}

      <p className="text-neutral-500 text-xs max-w-2xl">
        Consigli: attiva il GPS, tieni lo schermo acceso e cammina piano — la voce parte entro {RAGGIO_IN} metri dalla casa.
        Le voci già incontrate restano segnate in oro. Funziona anche senza campo, se hai già aperto il sito una volta. La tua posizione resta sul telefono: non viene inviata né salvata da nessuna parte.
      </p>
    </div>
  );
}
