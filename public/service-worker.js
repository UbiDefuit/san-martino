// PWA piattaforma San Martino 2030 — network-first con riserva offline
const CACHE = 'sm2030-v114';
const PRECACHE = ['./', './index.html', './manifest.json', './icon-512.png', './icona-app.svg', './canonica.jpg', './stemma-polinago.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== 'sm2030-tiles-v1').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const TILE_CACHE = 'sm2030-tiles-v1';
const TILE_HOSTS = ['servizigis.regione.emilia-romagna.it', 'server.arcgisonline.com', 's3.amazonaws.com'];

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // piastrelle di mappa: prima la cache, poi la rete — la valle si carica una volta sola
  if (TILE_HOSTS.includes(u.hostname)) {
    e.respondWith(
      caches.open(TILE_CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) c.put(req, res.clone());
        return res;
      })))
    );
    return;
  }
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
