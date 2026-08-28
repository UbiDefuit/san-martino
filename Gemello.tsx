import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TRACK } from './track';
import { elencoLuci, accendiLuce, Luce, supa } from './supa';
import { PROGETTI, Progetto } from './data';
import { VOCI, Voce } from './Voci';

const eur = (n: number) => n.toLocaleString('it-IT') + ' €';

// Luoghi verificati della frazione
export const LUOGHI: { geo: [number, number]; nome: string; big?: boolean; zoom: number }[] = [
  { geo: [44.38851, 10.68466], nome: 'San Martino', big: true, zoom: 16.8 },
  { geo: [44.3872, 10.6893], nome: 'La Chiesa', zoom: 17.0 },
  { geo: [44.38831, 10.69083], nome: 'Oratorio della Rondine', zoom: 17.0 },
  { geo: [44.38870, 10.68366], nome: 'Oratorio di Sant’Antonio Abate', zoom: 17.0 },
  { geo: [44.38852, 10.68394], nome: 'Cappella di San Giovanni (1686)', zoom: 17.0 },
  { geo: [44.38590, 10.69285], nome: 'Oratorio dei SS. Geminiano e Pellegrino', zoom: 17.0 },
  { geo: [44.38599, 10.69274], nome: 'Cà Carloni', zoom: 16.8 },
  { geo: [44.38437, 10.69189], nome: 'Il Poggio', zoom: 16.8 },
  { geo: [44.38570, 10.70296], nome: 'Cà Marastoni', zoom: 16.8 },
  { geo: [44.38885, 10.68345], nome: 'Cà dei Rossi', zoom: 16.8 },
  { geo: [44.39180, 10.68252], nome: 'Cà Lunga', zoom: 16.8 },
  { geo: [44.3790, 10.6894], nome: 'Monte San Martino', zoom: 15.2 },
];

export const slugLuogo = (nome: string) =>
  nome.toLowerCase().replace(/[’']/g, '').replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Gemello() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const flyTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sel, setSel] = useState<Progetto | null>(null);
  const [panorama, setPanorama] = useState<{ foto: string; titolo: string } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [luogoSel, setLuogoSel] = useState<{ geo: [number, number]; nome: string } | null>(null);
  const [showSentiero, setShowSentiero] = useState(true);
  const [showPerimetro, setShowPerimetro] = useState(true);
  const [showBorghi, setShowBorghi] = useState(false);
  const [showProgetti, setShowProgetti] = useState(true);
  const [showStorica, setShowStorica] = useState(false);
  const [showFrana, setShowFrana] = useState(false);
  const [legenda, setLegenda] = useState(false);
  const [vociOn, setVociOn] = useState(false);
  const [pieno, setPieno] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [voceSel, setVoceSel] = useState<Voce | null>(null);
  const vociMk = useRef<maplibregl.Marker[]>([]);
  const voceVid = useRef<HTMLVideoElement | null>(null);
  const [hint, setHint] = useState(() => !localStorage.getItem('sm2030_gemello_hint'));
  const luoghiMk = useRef<maplibregl.Marker[]>([]);
  const progettiMk = useRef<maplibregl.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [luci, setLuci] = useState<Luce[]>([]);
  const luciRef = useRef<Luce[]>([]);
  const [nomeLuce, setNomeLuce] = useState('');
  const [borgataLuce, setBorgataLuce] = useState('San Martino');
  const [luceAccesa, setLuceAccesa] = useState<string | null>(null);
  const [accendendo, setAccendendo] = useState(false);

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
            tiles: ['https://servizigis.regione.emilia-romagna.it/wms/agea2023_rgb?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Agea2023_RGB&STYLES=&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=512&HEIGHT=512&FORMAT=image/jpeg'],
            tileSize: 512,
            attribution: 'Ortofoto AGEA 2023 — Regione Emilia-Romagna',
          },
          storica: {
            type: 'raster',
            tiles: ['https://servizigis.regione.emilia-romagna.it/wms/carta_storica_regionale_1853?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=carta_storica_regionale_1853&STYLES=&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png'],
            tileSize: 256,
            attribution: 'Carta storica regionale 1853 — Regione Emilia-Romagna',
          },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#181a17' } },
          { id: 'sat', type: 'raster', source: 'sat' },
          { id: 'rilievo', type: 'hillshade', source: 'dem', paint: { 'hillshade-exaggeration': 0.45, 'hillshade-shadow-color': '#0b0d10', 'hillshade-highlight-color': '#f5e9cf', 'hillshade-accent-color': '#2c2a24' } },
          { id: 'ortofoto', type: 'raster', source: 'ortofoto', minzoom: 13, paint: { 'raster-fade-duration': 300 } },
          { id: 'storica', type: 'raster', source: 'storica', minzoom: 11, layout: { visibility: 'none' }, paint: { 'raster-fade-duration': 300, 'raster-opacity': 1 } },
        ],
      } as any,
      center: [10.703, 44.352],
      zoom: 10.8, pitch: 38, bearing: 130, maxPitch: 78,
      attributionControl: { compact: true } as any,
    });
    // partenza cinematografica: lontani e alti, si scende sul paese quando è pronto
    let introDone = false;
    const intro = () => {
      if (introDone) return; introDone = true;
      setReady(true);
      map.easeTo({ center: [10.6905, 44.3838], zoom: 13.5, pitch: 63, bearing: 168, duration: 5500, easing: (t) => 1 - Math.pow(1 - t, 3) } as any);
      // lenta orbita finché nessuno tocca la mappa
      let orbit = true;
      const stop = () => { orbit = false; };
      ['mousedown', 'touchstart', 'wheel', 'dblclick'].forEach((ev) => map.getCanvas().addEventListener(ev, stop, { once: true, passive: true } as any));
      setTimeout(() => {
        const spin = () => {
          if (!orbit || !mapRef.current) return;
          map.setBearing(map.getBearing() + 0.012);
          requestAnimationFrame(spin);
        };
        requestAnimationFrame(spin);
      }, 5600);
    };
    // rete di sicurezza: qualunque cosa succeda, via l'overlay
    map.on('load', intro);
    const failsafe = setTimeout(intro, 9000);
    map.on('error', () => { /* tile mancante o WMS lento: non bloccare la scena */ });

    map.on('style.load', () => {
      try {
      map.setTerrain({ source: 'dem', exaggeration: 1.5 } as any);
      try {
        (map as any).setSky({ 'sky-color': '#0e1a2b', 'horizon-color': '#c98a4b', 'fog-color': '#1a1f28', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.55, 'fog-ground-blend': 0.72 });
      } catch { /* versioni senza sky */ }
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: TRACK.map((p) => [p[1], p[0]]) } } });
      map.addLayer({ id: 'route-glow', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 5.5, 'line-opacity': 0.95 } });
      map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#d92626', 'line-width': 2.5 } });
      map.addLayer({ id: 'route-flow', type: 'line', source: 'route', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 2.5, 'line-opacity': 0.9, 'line-dasharray': [0.6, 5] } });
      // flusso lento dei trattini lungo il sentiero (sequenza di pattern, ciclo continuo)
      const dashSeq = [
        [0, 5, 0.6], [0.1, 5, 0.5], [0.2, 5, 0.4], [0.3, 5, 0.3],
        [0.4, 5, 0.2], [0.5, 5, 0.1], [0.6, 5, 0.001],
      ];
      let dashStep = 0;
      const flow = (ts: number) => {
        if (!map.getLayer('route-flow')) return;
        const step = Math.floor((ts / 120) % dashSeq.length);
        if (step !== dashStep) {
          dashStep = step;
          try { map.setPaintProperty('route-flow', 'line-dasharray', dashSeq[step] as any); } catch { /* ok */ }
        }
        requestAnimationFrame(flow);
      };
      requestAnimationFrame(flow);
      // area indicativa della grande frana 1746-47 (fonte: Archivio frane storiche RER, ID 221348 — localizzazione approssimativa)
      const FRANA: [number, number][] = [
        [10.6868, 44.3798], [10.6925, 44.3782], [10.6965, 44.3838], [10.6975, 44.39],
        [10.696, 44.3965], [10.6935, 44.404], [10.6885, 44.4045], [10.689, 44.396],
        [10.688, 44.389], [10.6852, 44.384], [10.6868, 44.3798],
      ];
      map.addSource('frana', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [FRANA] } } });
      map.addLayer({ id: 'frana-fill', type: 'fill', source: 'frana', layout: { visibility: 'none' }, paint: { 'fill-color': '#d97706', 'fill-opacity': 0.14 } });
      map.addLayer({ id: 'frana-line', type: 'line', source: 'frana', layout: { visibility: 'none' }, paint: { 'line-color': '#f59e0b', 'line-width': 2, 'line-dasharray': [2, 2], 'line-opacity': 0.85 } });
      // toponimi — nascosti di default: si accendono dalla legenda
      LUOGHI.forEach((l) => {
        const el = document.createElement('button');
        el.className = 'gemello-label' + (l.big ? ' gemello-label-big' : '');
        // livelli: 0 = sempre, 1 = borgate (da z14), 2 = oratori/cappelle (da z15.2)
        const tier = l.big || l.nome === 'Monte San Martino' ? 0 : /^(Oratorio|Cappella)/.test(l.nome) ? 2 : 1;
        el.dataset.tier = String(tier);
        el.textContent = l.nome;
        el.title = 'Vai a ' + l.nome;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          diveTo(l);
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

      // le luci della comunità ("Riaccendi la valle")
      map.addSource('luci-com', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'luci-com-glow', type: 'circle', source: 'luci-com',
        paint: { 'circle-color': '#ffd9a0', 'circle-radius': 10, 'circle-blur': 1, 'circle-opacity': 0.75 },
      });
      map.addLayer({
        id: 'luci-com-core', type: 'circle', source: 'luci-com',
        paint: { 'circle-color': '#fff3d6', 'circle-radius': 2.5, 'circle-opacity': 1 },
      });
      map.on('zoom', applyLabels);
      // luci della comunità: carica e resta in ascolto
      const aggiornaLuciSrc = () => {
        const src = map.getSource('luci-com') as maplibregl.GeoJSONSource | undefined;
        if (src) src.setData({ type: 'FeatureCollection', features: luciRef.current.map((l) => ({ type: 'Feature', properties: { nome: l.nome }, geometry: { type: 'Point', coordinates: [l.lng, l.lat] } })) } as any);
      };
      elencoLuci().then((ls) => { luciRef.current = ls; setLuci(ls); aggiornaLuciSrc(); });
      supa.channel('luci')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sm2030_luci' }, (payload: any) => {
          const l = payload.new as Luce;
          if (luciRef.current.some((x) => x.id === l.id)) return;
          luciRef.current = [...luciRef.current, l];
          setLuci(luciRef.current);
          aggiornaLuciSrc();
        })
        .subscribe();
      // deep link: #/gemello?luogo=slug
      try {
        const q = location.hash.split('?')[1];
        const slug = q ? new URLSearchParams(q).get('luogo') : null;
        if (slug) {
          const l = LUOGHI.find((x) => slugLuogo(x.nome) === slug);
          if (l) setTimeout(() => diveTo(l), 1200);
        }
      } catch { /* ok */ }
      } catch (e) { console.warn('gemello init', e); }
      intro();
    });
    mapRef.current = map;
    return () => {
      clearTimeout(failsafe);
      if (flyTimer.current) clearInterval(flyTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyLabels();
  }, [showBorghi]);
  const showBorghiRef = useRef(false);
  showBorghiRef.current = showBorghi;
  const applyLabels = () => {
    const map = mapRef.current;
    if (!map) return;
    const z = map.getZoom();
    luoghiMk.current.forEach((m) => {
      const el = m.getElement() as HTMLElement;
      const tier = Number(el.dataset.tier || 0);
      const minZ = tier === 2 ? 15.2 : tier === 1 ? 14 : 0;
      el.style.display = showBorghiRef.current && z >= minZ ? '' : 'none';
    });
  };
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
      map.setLayoutProperty('route-flow', 'visibility', v(showSentiero));
      map.setLayoutProperty('perimetro', 'visibility', v(showPerimetro));
      map.setLayoutProperty('storica', 'visibility', v(showStorica));
      map.setLayoutProperty('sat', 'visibility', v(!showStorica));
      map.setLayoutProperty('ortofoto', 'visibility', v(!showStorica));
      map.setLayoutProperty('frana-fill', 'visibility', v(showFrana));
      map.setLayoutProperty('frana-line', 'visibility', v(showFrana));
    } catch { /* layer non pronti */ }
  }, [showSentiero, showPerimetro, showStorica, showFrana, ready]);
  const prevStorica = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    // la carta del 1853 si legge solo in piano e da sola: via il satellite, fondo carta, tratti scuri
    try {
      map.setPaintProperty('bg', 'background-color', showStorica ? '#eee7d3' : '#181a17');
      map.setPaintProperty('route', 'line-color', '#d92626');
      map.setPaintProperty('route-glow', 'line-color', '#ffffff');
      map.setPaintProperty('route-flow', 'line-opacity', showStorica ? 0 : 0.9);
      map.setPaintProperty('perimetro', 'line-color', showStorica ? '#374151' : '#ffffff');
    } catch { /* ok */ }
    document.getElementById('gemello')?.classList.toggle('storica-mode', showStorica);
    if (showStorica) {
      if (!showBorghi) setShowBorghi(true);
      map.easeTo({ pitch: 0, bearing: 0, zoom: Math.max(map.getZoom(), 14.3), center: [10.688, 44.3872], duration: 1600 });
    } else if (prevStorica.current && !zoomed) {
      map.easeTo({ pitch: 60, bearing: 168, zoom: 12.8, center: [10.6905, 44.3838], duration: 1600 });
    }
    prevStorica.current = showStorica;
  }, [showStorica, ready]);

  const BORGATE_LUCE: { nome: string; geo: [number, number] }[] = [
    { nome: 'San Martino', geo: [44.38851, 10.68466] },
    { nome: 'Cà Carloni', geo: [44.38599, 10.69274] },
    { nome: 'Il Poggio', geo: [44.38437, 10.69189] },
    { nome: 'Cà Marastoni', geo: [44.38570, 10.70296] },
    { nome: 'Cà dei Rossi', geo: [44.38885, 10.68345] },
    { nome: 'Cà Lunga', geo: [44.39180, 10.68252] },
  ];
  const accendi = async () => {
    const nome = nomeLuce.trim();
    if (!nome || accendendo) return;
    setAccendendo(true);
    const b = BORGATE_LUCE.find((x) => x.nome === borgataLuce) || BORGATE_LUCE[0];
    const jit = () => (Math.random() - 0.5) * 0.0016;
    const l = await accendiLuce(nome, b.geo[0] + jit(), b.geo[1] + jit());
    setAccendendo(false);
    if (!l) return;
    if (!luciRef.current.some((x) => x.id === l.id)) {
      luciRef.current = [...luciRef.current, l];
      setLuci(luciRef.current);
      const map = mapRef.current;
      const src = map?.getSource('luci-com') as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData({ type: 'FeatureCollection', features: luciRef.current.map((x) => ({ type: 'Feature', properties: { nome: x.nome }, geometry: { type: 'Point', coordinates: [x.lng, x.lat] } })) } as any);
    }
    setLuceAccesa(nome);
    setNomeLuce('');
    mapRef.current?.flyTo({ center: [l.lng, l.lat], zoom: 15.6, pitch: 55, bearing: 168, duration: 2600 });
    setZoomed(true);
  };

  // le voci nel paesaggio: la costellazione del 1987 attorno al borgo
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    vociMk.current.forEach((m) => m.remove()); vociMk.current = [];
    if (!vociOn) { setVoceSel(null); return; }
    const C: [number, number] = [10.68466, 44.38851]; // il nucleo del paese
    VOCI.forEach((v, i) => {
      const ang = (i / VOCI.length) * Math.PI * 2 - Math.PI / 2;
      const r = 0.00065 + (i % 3) * 0.00028;
      const pos: [number, number] = [C[0] + Math.cos(ang) * r * 1.35, C[1] + Math.sin(ang) * r];
      const el = document.createElement('button');
      el.className = 'voce-pin';
      el.innerHTML = '<span class="voce-onda"></span><span class="voce-cuore">\u266A</span><span class="voce-nome">' + v.nome + '</span>';
      el.title = 'Ascolta ' + v.nome + ' (1987)';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setVoceSel(v);
        map.easeTo({ center: pos, zoom: Math.max(map.getZoom(), 16.2), pitch: 55, duration: 1600 } as any);
      });
      vociMk.current.push(new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(pos).addTo(map));
    });
    map.easeTo({ center: C, zoom: 15.6, pitch: 55, bearing: 168, duration: 2200 } as any);
    return () => { vociMk.current.forEach((m) => m.remove()); vociMk.current = []; };
  }, [vociOn]);

  // la voce dalla mappa fa ballare il crinale in alto
  useEffect(() => {
    const el = voceVid.current;
    if (voceSel && el) {
      const go = () => window.dispatchEvent(new CustomEvent('sm-voce', { detail: el }));
      el.addEventListener('play', go);
      return () => { el.removeEventListener('play', go); window.dispatchEvent(new Event('sm-voce-off')); };
    }
    window.dispatchEvent(new Event('sm-voce-off'));
  }, [voceSel]);

  // schermo intero: la valle occupa tutto, la mappa si riadatta
  useEffect(() => {
    const on = () => {
      setPieno(!!document.fullscreenElement);
      setTimeout(() => mapRef.current?.resize(), 120);
    };
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  // suggerimento di benvenuto: appare solo la prima volta, poi svanisce per sempre
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => { setHint(false); localStorage.setItem('sm2030_gemello_hint', '1'); }, 9000);
    return () => clearTimeout(t);
  }, [hint]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  const diveTo = (l: { geo: [number, number]; zoom: number; nome?: string }) => {
    setZoomed(true);
    setLuogoSel(l.nome ? (l as { geo: [number, number]; nome: string }) : null);
    mapRef.current?.flyTo({ center: [l.geo[1], l.geo[0]], zoom: l.zoom, pitch: 55, bearing: 168, duration: 2800 });
  };

  const stopFly = () => {
    if (flyTimer.current) clearInterval(flyTimer.current);
    flyTimer.current = null;
    setFlying(false);
    document.getElementById('gemello')?.classList.remove('scena-pulita');
  };

  return (
    <div className="animate-fade-in-up pt-10 space-y-5">
      <h1 className="text-3xl font-bold text-white">Il gemello digitale</h1>
      <div ref={wrapRef} className="relative gemello-wrap">
        <div id="gemello" className="h-[62vh] border border-neutral-800" />
        {hint && ready && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 max-w-[92%] sm:max-w-md bg-black/85 border border-[#C9A227]/50 backdrop-blur px-4 py-2.5 text-center hero-el"
            onClick={() => { setHint(false); localStorage.setItem('sm2030_gemello_hint', '1'); }}>
            <p className="text-[12px] text-neutral-100 leading-snug">
              Territorio vero, non un rendering. <span className="text-amber-300">Tocca i pin bianchi</span> per i progetti,
              <span className="text-amber-300"> i nomi dei borghi</span> per scendere tra le case.
            </p>
          </div>
        )}
        <button onClick={toggleFullscreen}
          className="absolute bottom-[4.7rem] right-3 z-10 w-10 h-10 flex items-center justify-center bg-black/80 border border-neutral-600 text-white text-base backdrop-blur hover:border-[#E0BF5C] transition"
          title={pieno ? 'Esci dallo schermo intero (Esc)' : 'Schermo intero'}
          aria-label={pieno ? 'Esci dallo schermo intero' : 'Schermo intero'}>
          {pieno ? '\u2716' : '\u26F6'}
        </button>
        <button onClick={() => setVociOn(!vociOn)}
          className={'absolute bottom-8 right-3 z-10 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur border transition ' +
            (vociOn ? 'bg-[#C9A227] text-black border-[#C9A227] font-semibold' : 'bg-black/80 text-white border-neutral-600 hover:border-[#E0BF5C]')}
          title="Le voci del 1987 compaiono nel paesaggio">
          {'\u266A'} Le voci del 1987
        </button>
        {voceSel && (
          <div className="absolute bottom-8 left-3 right-3 sm:right-auto sm:w-[340px] z-20 bg-black/90 border border-[#C9A227]/60 backdrop-blur p-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">{voceSel.dove} · 1987</p>
                <p className="font-display text-xl text-white leading-tight">{voceSel.nome}</p>
              </div>
              <button onClick={() => setVoceSel(null)} className="text-neutral-400 hover:text-white text-lg leading-none px-1" aria-label="Chiudi">{'\u00D7'}</button>
            </div>
            <video ref={voceVid} src={'./voci/' + voceSel.id + '.mp4'} controls autoPlay playsInline className="w-full bg-black border border-neutral-800" />
            <p className="text-[10px] text-neutral-500 mt-2">Posizione indicativa nel borgo — le targhe del museo diffuso segneranno i punti esatti. <a href="#/voci" className="underline hover:text-neutral-300">Tutte le voci &rarr;</a></p>
          </div>
        )}
        {showStorica && (
          <div className="absolute bottom-8 left-3 z-10 max-w-[280px] bg-black/80 border border-neutral-700 backdrop-blur px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-1">La valle nel 1853</p>
            <p className="text-[12px] text-neutral-200 leading-snug">Carta topografica dello Stato estense, 1:50.000. I tratteggi sono i versanti: più fitti, più ripidi. Cerca <span className="italic">S. Martino Vallata</span> in corsivo — i nomi in nero sono i luoghi di oggi.</p>
          </div>
        )}
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
        {(
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
                  ['Carta storica 1853', showStorica, setShowStorica],
                  ['Frana 1746–47 (indicativa)', showFrana, setShowFrana],
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
        <div className="absolute inset-0 pointer-events-none z-[5] gemello-vignetta" />
        {!ready && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0b0d10]">
            <svg viewBox="0 0 100 100" className="w-14 h-14 gemello-spin" fill="none">
              <circle cx="50" cy="50" r="44" stroke="#C9A227" strokeWidth="2" strokeDasharray="80 200" strokeLinecap="round" />
            </svg>
            <p className="text-neutral-400 text-[11px] uppercase tracking-[0.3em]">Sto costruendo la valle</p>
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
      <div className="border border-amber-400/40 bg-amber-400/5 p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300">Riaccendi la valle</p>
          <p className="text-[11px] text-neutral-300">{luci.length} {luci.length === 1 ? 'luce accesa' : 'luci accese'}</p>
        </div>
        {luceAccesa ? (
          <p className="text-neutral-100 text-sm">La tua luce brilla nella valle, <span className="font-semibold">{luceAccesa}</span>. Grazie. <button className="underline text-neutral-400 ml-1" onClick={() => setLuceAccesa(null)}>Accendine un’altra</button></p>
        ) : (
          <>
            <p className="text-neutral-300 text-sm">Lascia il tuo nome e accendi una luce sulla mappa: ogni luce dice “io ci credo”.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={nomeLuce} onChange={(e) => setNomeLuce(e.target.value)} maxLength={30} placeholder="Il tuo nome"
                className="flex-1 bg-black/40 border border-neutral-700 focus:border-amber-400 outline-none text-white px-3 py-2.5 text-sm" />
              <select value={borgataLuce} onChange={(e) => setBorgataLuce(e.target.value)}
                className="bg-black/40 border border-neutral-700 text-white px-3 py-2.5 text-sm">
                {BORGATE_LUCE.map((b) => <option key={b.nome} value={b.nome}>{b.nome}</option>)}
              </select>
              <button onClick={accendi} disabled={!nomeLuce.trim() || accendendo || !ready}
                className="bg-amber-400 text-black px-4 py-2.5 font-semibold uppercase tracking-[0.15em] text-xs disabled:opacity-40 hover:bg-amber-300 transition">
                {accendendo ? '…' : 'Accendi ✦'}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
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
