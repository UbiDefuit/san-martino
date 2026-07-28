import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TRACK, ELES } from './track';
import { PROGETTI, Progetto } from './data';

const eur = (n: number) => n.toLocaleString('it-IT') + ' €';

// Luoghi verificati della frazione
export const LUOGHI: { geo: [number, number]; nome: string; big?: boolean; zoom: number }[] = [
  { geo: [44.38851, 10.68466], nome: 'San Martino', big: true, zoom: 16.8 },
  { geo: [44.3872, 10.6893], nome: 'La Chiesa', zoom: 17.0 },
  { geo: [44.38831, 10.69083], nome: 'Oratorio della Rondine', zoom: 17.0 },
  { geo: [44.38870, 10.68366], nome: 'Oratorio di Sant\u2019Antonio Abate', zoom: 17.0 },
  { geo: [44.38852, 10.68394], nome: 'Cappella di San Giovanni (1686)', zoom: 17.0 },
  { geo: [44.38590, 10.69285], nome: 'Oratorio dei SS. Geminiano e Pellegrino', zoom: 17.0 },
  { geo: [44.38740, 10.69393], nome: 'C\u00e0 Barbino', zoom: 16.8 },
  { geo: [44.38599, 10.69274], nome: 'C\u00e0 Carloni', zoom: 16.8 },
  { geo: [44.38437, 10.69189], nome: 'Il Poggio', zoom: 16.8 },
  { geo: [44.38570, 10.70296], nome: 'C\u00e0 Marastoni', zoom: 16.8 },
  { geo: [44.38946, 10.68199], nome: 'C\u00e0 dei Rossi', zoom: 16.8 },
  { geo: [44.39180, 10.68252], nome: 'C\u00e0 Lunga', zoom: 16.8 },
  { geo: [44.3790, 10.6894], nome: 'Monte San Martino', zoom: 15.2 },
];

export default function Gemello() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const flyTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flying, setFlying] = useState(false);
  const [sel, setSel] = useState<Progetto | null>(null);
  const [panorama, setPanorama] = useState<{ foto: string; titolo: string } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [luogoSel, setLuogoSel] = useState<{ geo: [number, number]; nome: string } | null>(null);
  const [racconto, setRacconto] = useState(false);
  const [showSentiero, setShowSentiero] = useState(true);
  const [showPerimetro, setShowPerimetro] = useState(true);
  const [showBorghi, setShowBorghi] = useState(false);
  const [showProgetti, setShowProgetti] = useState(true);
  const [legenda, setLegenda] = useState(true);
  const luoghiMk = useRef<maplibregl.Marker[]>([]);
  const progettiMk = useRef<maplibregl.Marker[]>([]);
  const [sottotitolo, setSottotitolo] = useState('');
  const raccontoRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'gemello',
      style: {
        version: 8,
        sources: {
          sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri, Maxar, Earthstar Geographics', maxzoom: 18 },
          dem: { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 14 },
          ortofoto: {
            type: 'raster',
            tiles: ['https://servizigis.regione.emilia-romagna.it/wms/agea2023_rgb?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Agea2023_RGB&STYLES=&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/jpeg'],
            tileSize: 256,
            attribution: 'Ortofoto AGEA 2023 — Regione Emilia-Romagna',
          },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#181a17' } },
          { id: 'sat', type: 'raster', source: 'sat' },
          { id: 'ortofoto', type: 'raster', source: 'ortofoto', minzoom: 13, paint: { 'raster-fade-duration': 300 } },
        ],
      } as any,
      center: [10.6905, 44.3838],
      zoom: 12.8, pitch: 60, bearing: 168, maxPitch: 78,
      attributionControl: { compact: true } as any,
    });
    map.on('style.load', () => {
      map.setTerrain({ source: 'dem', exaggeration: 1.4 } as any);
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: TRACK.map((p) => [p[1], p[0]]) } } });
      map.addLayer({ id: 'route-glow', type: 'line', source: 'route', paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.25, 'line-blur': 4 } });
      map.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#ffffff', 'line-width': 3 } });
      // toponimi — nascosti di default: si accendono dalla legenda
      LUOGHI.forEach((l) => {
        const el = document.createElement('button');
        el.className = 'gemello-label' + (l.big ? ' gemello-label-big' : '');
        el.textContent = l.nome;
        el.title = 'Vai a ' + l.nome;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setZoomed(true);
          map.flyTo({ center: [l.geo[1], l.geo[0]], zoom: l.zoom, pitch: 55, bearing: 168, duration: 2800 });
        });
        el.style.display = 'none';
        const mk = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([l.geo[1], l.geo[0]])
          .addTo(map);
        luoghiMk.current.push(mk);
      });

      // punti panorama: entra nella foto reale del luogo
      const PANORAMI: { geo: [number, number]; foto: string; titolo: string }[] = [
        { geo: [44.38718, 10.68933], foto: './canonica.jpg', titolo: 'La Chiesa di San Martino — il ritrovo' },
      ];
      PANORAMI.forEach((pt) => {
        const el = document.createElement('button');
        el.className = 'gemello-cam';
        el.textContent = '📷';
        el.title = pt.titolo;
        el.addEventListener('click', (e) => { e.stopPropagation(); setPanorama(pt); });
        progettiMk.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([pt.geo[1], pt.geo[0]])
          .addTo(map));
      });

      // pin dei progetti
      PROGETTI.forEach((p) => {
        const el = document.createElement('button');
        el.className = 'gemello-pin';
        el.innerHTML = '<span></span>';
        el.title = p.titolo;
        el.addEventListener('click', (e) => { e.stopPropagation(); setSel(p); });
        progettiMk.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.geo[1], p.geo[0]])
          .addTo(map));
      });
      // perimetro indicativo della frazione di San Martino
      const PERIMETRO: [number, number][] = [
        [10.6795, 44.3925], [10.6980, 44.3925], [10.7060, 44.3890],
        [10.7060, 44.3830], [10.6980, 44.3800], [10.6940, 44.3760],
        [10.6860, 44.3755], [10.6800, 44.3800], [10.6780, 44.3870],
        [10.6795, 44.3925],
      ];
      map.addSource('perimetro', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: PERIMETRO } },
      });
      map.addLayer({
        id: 'perimetro', type: 'line', source: 'perimetro',
        paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-dasharray': [3, 3], 'line-opacity': 0.55 },
      });

      // strato notte + luci dei nuclei (per il finale del racconto)
      map.addLayer({ id: 'notte', type: 'background', paint: { 'background-color': '#04070c', 'background-opacity': 0 } });
      const NUCLEI: [number, number][] = [
        [44.38851, 10.68466], [44.38740, 10.69393], [44.38599, 10.69274],
        [44.38437, 10.69189], [44.3872, 10.6893],
      ];
      map.addSource('luci', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: NUCLEI.map((n, i) => ({ type: 'Feature', properties: { idx: i }, geometry: { type: 'Point', coordinates: [n[1], n[0]] } })) },
      });
      map.addLayer({
        id: 'luci-glow', type: 'circle', source: 'luci',
        filter: ['<', ['get', 'idx'], -1],
        paint: { 'circle-color': '#ffd9a0', 'circle-radius': 18, 'circle-blur': 1, 'circle-opacity': 0.9 },
      });
      map.addLayer({
        id: 'luci-core', type: 'circle', source: 'luci',
        filter: ['<', ['get', 'idx'], -1],
        paint: { 'circle-color': '#fff3d6', 'circle-radius': 4, 'circle-opacity': 1 },
      });
      setReady(true);
    });
    mapRef.current = map;
    return () => {
      if (flyTimer.current) clearInterval(flyTimer.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    luoghiMk.current.forEach((m) => { m.getElement().style.display = showBorghi ? '' : 'none'; });
  }, [showBorghi]);
  useEffect(() => {
    progettiMk.current.forEach((m) => { m.getElement().style.display = showProgetti ? '' : 'none'; });
  }, [showProgetti]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const v = (on: boolean) => (on ? 'visible' : 'none');
    try {
      map.setLayoutProperty('route', 'visibility', v(showSentiero));
      map.setLayoutProperty('route-glow', 'visibility', v(showSentiero));
      map.setLayoutProperty('perimetro', 'visibility', v(showPerimetro));
    } catch { /* layer non pronti */ }
  }, [showSentiero, showPerimetro, ready]);

  const diveTo = (l: { geo: [number, number]; zoom: number; nome?: string }) => {
    setZoomed(true);
    setLuogoSel(l.nome ? (l as { geo: [number, number]; nome: string }) : null);
    mapRef.current?.flyTo({ center: [l.geo[1], l.geo[0]], zoom: l.zoom, pitch: 55, bearing: 168, duration: 2800 });
  };

  const stopFly = () => {
    if (flyTimer.current) clearInterval(flyTimer.current);
    flyTimer.current = null;
    setFlying(false);
  };

  // "Il racconto della valle": tour cinematico con sottotitoli e finale notturno
  const attesa = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const stopRacconto = () => {
    raccontoRef.current = false;
    setRacconto(false); setSottotitolo('');
    const map = mapRef.current;
    if (map) {
      map.setPaintProperty('notte', 'background-opacity', 0);
      map.setFilter('luci-glow', ['<', ['get', 'idx'], -1]);
      map.setFilter('luci-core', ['<', ['get', 'idx'], -1]);
      map.easeTo({ center: [10.6905, 44.3838], zoom: 12.8, pitch: 60, bearing: 168, duration: 2000 });
    }
  };
  const avviaRacconto = async () => {
    const map = mapRef.current;
    if (!map || racconto) return;
    setRacconto(true);
    raccontoRef.current = true;
    const tappe: { c: [number, number]; z: number; p: number; b: number; t: string; hold: number }[] = [
      { c: [10.68466, 44.38851], z: 16.6, p: 55, b: 160, t: 'San Martino. Il nucleo che d\u00e0 il nome alla frazione, sulla via che cuce la vallata.', hold: 2400 },
      { c: [10.6893, 44.3872], z: 17.0, p: 55, b: 168, t: 'La chiesa: parrocchia dal 1627. Travolta dalle frane del 1746\u201347, riaperta al culto nel 1756 su un colle pi\u00f9 sicuro.', hold: 2800 },
      { c: [10.69083, 44.38831], z: 17.0, p: 55, b: 165, t: 'L\u2019Oratorio della Madonna della Rondine, 1644: quattro secoli di devozione.', hold: 2400 },
      { c: [10.69393, 44.38740], z: 16.6, p: 55, b: 170, t: 'C\u00e0 Barbino — pietre che resistono da secoli.', hold: 2200 },
      { c: [10.69274, 44.38599], z: 16.6, p: 55, b: 172, t: 'C\u00e0 Carloni, affacciata sui campi.', hold: 2200 },
      { c: [10.69189, 44.38437], z: 16.6, p: 55, b: 175, t: 'Il Poggio — i tetti che vogliamo rivedere abitati.', hold: 2400 },
      { c: [10.6894, 44.3790], z: 14.6, p: 62, b: 168, t: 'E sopra tutto il Monte San Martino: base partigiana nel 1944, oggi 6,2 km di sentieri riaperti a mano dai volontari.', hold: 3000 },
    ];
    try {
      for (const tp of tappe) {
        if (!raccontoRef.current) return;
        setSottotitolo(tp.t);
        map.flyTo({ center: tp.c, zoom: tp.z, pitch: tp.p, bearing: tp.b, duration: 3400 });
        await attesa(3400 + tp.hold);
      }
      if (!raccontoRef.current) return;
      // il finale: cala la notte, la valle si riaccende
      setSottotitolo('Poi, una casa alla volta, la valle si è spenta.');
      map.easeTo({ center: [10.6905, 44.3850], zoom: 13.3, pitch: 58, bearing: 168, duration: 3000 });
      map.setPaintProperty('notte', 'background-opacity-transition' as any, { duration: 3500 } as any);
      map.setPaintProperty('notte', 'background-opacity', 0.78);
      await attesa(4800);
      if (!raccontoRef.current) return;
      setSottotitolo('Ogni progetto riaccende una luce.');
      for (let i = 0; i < 5; i++) {
        if (!raccontoRef.current) return;
        map.setFilter('luci-glow', ['<=', ['get', 'idx'], i]);
        map.setFilter('luci-core', ['<=', ['get', 'idx'], i]);
        await attesa(900);
      }
      await attesa(1200);
      if (!raccontoRef.current) return;
      setSottotitolo('SAN MARTINO 2030 — LA VALLE CHE NON SI ARRENDE');
      await attesa(4000);
    } finally {
      if (raccontoRef.current) stopRacconto();
    }
  };

  const rafRef = useRef<number | null>(null);
  const [preparo, setPreparo] = useState<number | null>(null);
  const voloAnnullato = useRef(false);
  const stopVolo = () => {
    voloAnnullato.current = true;
    setPreparo(null);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setFlying(false);
    const map = mapRef.current;
    if (map) {
      try { map.setLayoutProperty('ortofoto', 'visibility', 'visible'); } catch { /* ok */ }
      map.easeTo({ center: [10.6905, 44.3838], zoom: 12.8, pitch: 60, bearing: 168, duration: 2500 });
    }
  };

  const flyover = async () => {
    const map = mapRef.current;
    if (!map) return;
    if (flying) { stopVolo(); return; }
    setFlying(true);
    voloAnnullato.current = false;
    // niente ortofoto WMS durante il volo veloce: il satellite su CDN tiene il passo
    try { map.setLayoutProperty('ortofoto', 'visibility', 'none'); } catch { /* ok */ }
    const len = TRACK.length;
    const DUR = 24000;

    // PRECARICO: percorro la rotta dietro il sipario, le tile entrano in cache
    setPreparo(0);
    const N = 30;
    const avgP = (idx: number, r: number): [number, number] => {
      const a = Math.max(0, idx - r), b = Math.min(len - 1, idx + r);
      let la = 0, lo = 0, n = 0;
      for (let k = a; k <= b; k++) { la += TRACK[k][0]; lo += TRACK[k][1]; n++; }
      return [la / n, lo / n];
    };
    // simulo la STESSA traiettoria smussata del volo (sottopassi senza render)
    let pPos: [number, number] | null = null, pLook: [number, number] | null = null, pAlt: number | null = null;
    const SUB = 18; // sottopassi di smussamento fra un campione e l'altro
    for (let k = 0; k <= N; k++) {
      if (voloAnnullato.current) { setPreparo(null); return; }
      for (let q = 0; q < SUB; q++) {
        const p = Math.min(1, (k + q / SUB) / N);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const i = Math.min(len - 7, Math.max(0, Math.floor(e * (len - 7))));
        const camIdx = Math.max(0, i - 22), lookIdx = Math.min(i + 16, len - 1);
        const pos = avgP(camIdx, 10), look = avgP(lookIdx, 6);
        const alt = Math.max(...ELES.slice(camIdx, lookIdx + 1)) + 240;
        pPos = pPos ? [pPos[0] + (pos[0] - pPos[0]) * 0.08, pPos[1] + (pos[1] - pPos[1]) * 0.08] : pos;
        pLook = pLook ? [pLook[0] + (look[0] - pLook[0]) * 0.12, pLook[1] + (look[1] - pLook[1]) * 0.12] : look;
        pAlt = pAlt !== null ? pAlt + (alt - pAlt) * 0.06 : alt;
      }
      const lookIdxK = Math.min(Math.floor(((k / N) * (len - 7))) + 16, len - 1);
      try {
        map.jumpTo(map.calculateCameraOptionsFromTo(
          new maplibregl.LngLat(pPos![1], pPos![0]), pAlt!,
          new maplibregl.LngLat(pLook![1], pLook![0]), ELES[lookIdxK]));
      } catch { /* continua */ }
      await new Promise<void>((res) => {
        const to = setTimeout(res, 750);
        map.once('idle', () => { clearTimeout(to); res(); });
      });
      setPreparo(Math.round((k / N) * 100));
    }
    if (voloAnnullato.current) { setPreparo(null); return; }
    setPreparo(null);
    const avg = (idx: number, r: number): [number, number] => {
      const a = Math.max(0, idx - r), b = Math.min(len - 1, idx + r);
      let la = 0, lo = 0, n = 0;
      for (let k = a; k <= b; k++) { la += TRACK[k][0]; lo += TRACK[k][1]; n++; }
      return [la / n, lo / n];
    };
    let smPos: [number, number] | null = null, smLook: [number, number] | null = null, smAlt: number | null = null;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = (now - t0) / DUR;
      if (p >= 1) { stopVolo(); return; }
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const i = Math.min(len - 7, Math.max(0, Math.floor(e * (len - 7))));
      const camIdx = Math.max(0, i - 22), lookIdx = Math.min(i + 16, len - 1);
      const pos = avg(camIdx, 10), look = avg(lookIdx, 6);
      const alt = Math.max(...ELES.slice(camIdx, lookIdx + 1)) + 240;
      smPos = smPos ? [smPos[0] + (pos[0] - smPos[0]) * 0.08, smPos[1] + (pos[1] - smPos[1]) * 0.08] : pos;
      smLook = smLook ? [smLook[0] + (look[0] - smLook[0]) * 0.12, smLook[1] + (look[1] - smLook[1]) * 0.12] : look;
      smAlt = smAlt !== null ? smAlt + (alt - smAlt) * 0.06 : alt;
      try {
        map.jumpTo(map.calculateCameraOptionsFromTo(
          new maplibregl.LngLat(smPos[1], smPos[0]), smAlt,
          new maplibregl.LngLat(smLook[1], smLook[0]), ELES[lookIdx]));
      } catch { stopVolo(); return; }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="animate-fade-in-up pt-10 space-y-5">
      <h1 className="text-3xl font-bold text-white">Il gemello digitale</h1>
      <p className="text-neutral-300 text-[15px] max-w-2xl">
        Questo non è un rendering: è il territorio della frazione di San Martino — il nucleo storico,
        Cà Barbino, Cà Carloni, il Poggio, la chiesa e il Monte San Martino (perimetro indicativo tratteggiato).
        In bianco, i 6,2 km di sentieri riaperti dai volontari. E ogni progetto di rigenerazione è lì,
        al suo posto sul territorio: <span className="text-white">tocca i pin bianchi</span> per i progetti, <span className="text-white">tocca i nomi dei borghi</span> per scendere a livello delle case.
      </p>
      <div className="relative">
        <div id="gemello" className="h-[62vh] border border-neutral-800" />
        {zoomed && (
          <button onClick={() => {
            setZoomed(false);
            setLuogoSel(null);
            mapRef.current?.easeTo({ center: [10.6905, 44.3838], zoom: 12.8, pitch: 60, bearing: 168, duration: 2500 });
          }}
            className="absolute top-3 left-3 z-10 bg-black/80 border border-neutral-600 text-white px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur hover:border-white transition">
            ← Torna alla valle
          </button>
        )}
        {zoomed && luogoSel && (
          <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${luogoSel.geo[0]},${luogoSel.geo[1]}`}
            target="_blank" rel="noreferrer"
            className="absolute top-14 left-3 z-10 bg-black/80 border border-neutral-600 text-white px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur hover:border-white transition">
            ◎ Street View
          </a>
        )}
        {!racconto && (
          <div className="absolute top-3 right-3 z-10 w-48 bg-black/85 border border-neutral-700 backdrop-blur text-left">
            <button onClick={() => setLegenda(!legenda)}
              className="w-full px-3 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white flex justify-between items-center">
              Legenda <span>{legenda ? '▾' : '▸'}</span>
            </button>
            {legenda && (
              <div className="px-3 pb-3 space-y-2 max-h-72 overflow-y-auto">
                {([
                  ['Sentiero (6,2 km)', showSentiero, setShowSentiero],
                  ['Perimetro frazione', showPerimetro, setShowPerimetro],
                  ['Nomi dei borghi', showBorghi, setShowBorghi],
                  ['Progetti e panorami', showProgetti, setShowProgetti],
                ] as [string, boolean, (v: boolean) => void][]).map(([label, val, set]) => (
                  <label key={label} className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                    <input type="checkbox" checked={val} onChange={() => set(!val)} className="accent-white" />
                    {label}
                  </label>
                ))}
                <div className="border-t border-neutral-800 pt-2 mt-2 space-y-0.5">
                  {LUOGHI.map((l) => (
                    <button key={l.nome} onClick={() => diveTo(l)}
                      className="block w-full text-left text-xs text-neutral-300 hover:text-white py-1 transition">
                      → {l.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {preparo !== null && (
          <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center gap-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-300">Preparo il volo</p>
            <div className="w-52 h-1 bg-neutral-800 overflow-hidden">
              <div className="h-full bg-white transition-all" style={{ width: preparo + '%' }} />
            </div>
            <p className="text-white text-2xl font-light tabular-nums">{preparo}%</p>
          </div>
        )}
        {sottotitolo && (
          <div className="absolute inset-x-0 bottom-5 text-center px-10 pointer-events-none z-10">
            <span className="inline-block bg-black/75 text-white text-sm sm:text-base px-5 py-3 leading-relaxed backdrop-blur animate-fade-in-up" key={sottotitolo}>
              {sottotitolo}
            </span>
          </div>
        )}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-neutral-300 text-xs uppercase tracking-[0.2em]">
            Carico la valle…
          </div>
        )}
        {sel && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 bg-black/90 border border-neutral-600 p-5 backdrop-blur">
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-bold text-white">{sel.titolo}</h3>
              <button onClick={() => setSel(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <p className="text-neutral-300 text-sm mt-2">{sel.sintesi}</p>
            <div className="h-1 bg-neutral-800 mt-4 overflow-hidden">
              <div className="h-full bg-white" style={{ width: Math.min(100, Math.round((sel.raccolti / sel.budgetMin) * 100)) + '%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400 mt-2">
              <span>raccolti {eur(sel.raccolti)}</span>
              <span>obiettivo {eur(sel.budgetMin)}</span>
            </div>
            <a href="#/progetti" className="inline-block mt-4 text-xs uppercase tracking-[0.2em] text-white underline underline-offset-4">
              Vai al progetto →
            </a>
          </div>
        )}
      </div>
      {panorama && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setPanorama(null)}>
          <img src={panorama.foto} alt={panorama.titolo} className="w-full h-full object-cover kenburns-slow" />
          <div className="absolute bottom-10 inset-x-0 text-center px-14 pointer-events-none">
            <span className="bg-black/70 text-white text-[11px] uppercase tracking-[0.25em] px-4 py-2">{panorama.titolo}</span>
          </div>
          <button onClick={() => setPanorama(null)}
            className="absolute top-4 right-4 bg-black/70 border border-neutral-600 text-white w-10 h-10 text-lg">✕</button>
        </div>
      )}
      <button onClick={racconto ? stopRacconto : avviaRacconto} disabled={!ready}
        className="w-full bg-white text-black px-3 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs transition disabled:opacity-40 hover:bg-neutral-200">
        {racconto ? 'Ferma il racconto' : '▶ Il racconto della valle (60s)'}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={flyover}
          className="border border-neutral-700 text-white hover:border-white px-3 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs transition">
          {flying ? 'Ferma il volo' : 'Volo sulla valle'}
        </button>
        <a href="https://ubidefuit.github.io/camminata-san-martino/" target="_blank" rel="noreferrer"
          className="border border-neutral-700 text-white hover:border-white px-3 py-3.5 font-semibold uppercase tracking-[0.15em] text-xs transition text-center">
          L'app dell'evento
        </a>
      </div>
      <p className="text-neutral-400 text-xs">
        Prossimi strati del gemello: il modello 3D del borgo dalla fotogrammetria col drone,
        le foto d'epoca sovrapposte al presente ("com'era / com'è") e l'anteprima degli interventi di rigenerazione.
      </p>
    </div>
  );
}
