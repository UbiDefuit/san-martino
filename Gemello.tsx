import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TRACK, ELES } from './track';
import { PROGETTI, Progetto } from './data';

const eur = (n: number) => n.toLocaleString('it-IT') + ' €';

export default function Gemello() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const flyTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [flying, setFlying] = useState(false);
  const [sel, setSel] = useState<Progetto | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'gemello',
      style: {
        version: 8,
        sources: {
          sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri, Maxar, Earthstar Geographics', maxzoom: 18 },
          dem: { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 14 },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#181a17' } },
          { id: 'sat', type: 'raster', source: 'sat' },
        ],
      } as any,
      center: [TRACK[0][1], TRACK[0][0]],
      zoom: 13.6, pitch: 62, bearing: 155, maxPitch: 78,
      attributionControl: { compact: true } as any,
    });
    map.on('style.load', () => {
      map.setTerrain({ source: 'dem', exaggeration: 1.4 } as any);
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: TRACK.map((p) => [p[1], p[0]]) } } });
      map.addLayer({ id: 'route-glow', type: 'line', source: 'route', paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-opacity': 0.25, 'line-blur': 4 } });
      map.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#ffffff', 'line-width': 3 } });
      // pin dei progetti
      PROGETTI.forEach((p) => {
        const el = document.createElement('button');
        el.className = 'gemello-pin';
        el.innerHTML = '<span></span>';
        el.title = p.titolo;
        el.addEventListener('click', (e) => { e.stopPropagation(); setSel(p); });
        new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.geo[1], p.geo[0]])
          .addTo(map);
      });
      setReady(true);
    });
    mapRef.current = map;
    return () => {
      if (flyTimer.current) clearInterval(flyTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const stopFly = () => {
    if (flyTimer.current) clearInterval(flyTimer.current);
    flyTimer.current = null;
    setFlying(false);
  };

  const flyover = () => {
    const map = mapRef.current;
    if (!map) return;
    if (flying) { stopFly(); map.easeTo({ center: [TRACK[0][1], TRACK[0][0]], zoom: 13.6, pitch: 62, bearing: 155, duration: 2000 }); return; }
    setFlying(true);
    const len = TRACK.length;
    let i = 0;
    let smPos: [number, number] | null = null, smLook: [number, number] | null = null, smAlt: number | null = null;
    const avg = (idx: number, r: number): [number, number] => {
      const a = Math.max(0, idx - r), b = Math.min(len - 1, idx + r);
      let la = 0, lo = 0, n = 0;
      for (let k = a; k <= b; k++) { la += TRACK[k][0]; lo += TRACK[k][1]; n++; }
      return [la / n, lo / n];
    };
    flyTimer.current = setInterval(() => {
      try {
        i += 4;
        if (i >= len - 6) { stopFly(); map.easeTo({ center: [TRACK[0][1], TRACK[0][0]], zoom: 13.6, pitch: 62, bearing: 155, duration: 2500 }); return; }
        const camIdx = Math.max(0, i - 22), lookIdx = Math.min(i + 14, len - 1);
        const pos = avg(camIdx, 10), look = avg(lookIdx, 6);
        const alt = Math.max(...ELES.slice(camIdx, lookIdx + 1)) + 220;
        smPos = smPos ? [smPos[0] + (pos[0] - smPos[0]) * 0.15, smPos[1] + (pos[1] - smPos[1]) * 0.15] : pos;
        smLook = smLook ? [smLook[0] + (look[0] - smLook[0]) * 0.2, smLook[1] + (look[1] - smLook[1]) * 0.2] : look;
        smAlt = smAlt !== null ? smAlt + (alt - smAlt) * 0.1 : alt;
        map.jumpTo(map.calculateCameraOptionsFromTo(
          new maplibregl.LngLat(smPos[1], smPos[0]), smAlt,
          new maplibregl.LngLat(smLook[1], smLook[0]), ELES[lookIdx]));
      } catch { stopFly(); }
    }, 70);
  };

  return (
    <div className="animate-fade-in-up pt-10 space-y-5">
      <h1 className="text-3xl font-bold text-white">Il gemello digitale</h1>
      <p className="text-neutral-300 text-[15px] max-w-2xl">
        Questo non è un rendering: è San Martino — il rilievo vero della valle, il satellite,
        i 6,2 km di sentieri riaperti dai volontari. E ogni progetto di rigenerazione è lì,
        al suo posto sul territorio: <span className="text-white">tocca i pin bianchi</span> per esplorarli.
      </p>
      <div className="relative">
        <div id="gemello" className="h-[62vh] border border-neutral-800" />
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
