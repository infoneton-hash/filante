/* Filante — fonctionnement hors ligne. Aucune requête vers un tiers.
   En ligne : on prend la version la plus récente du site et on la garde en réserve.
   Hors ligne (ou réseau trop lent) : on sert la réserve. Une mise à jour du jeu arrive donc toute seule. */
const CACHE = 'filante-v1';
const FICHIERS = ['./', 'index.html', 'style.css', 'logique.js', 'textes.js', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'mentions.html'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k.startsWith('filante-v') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const reserve = () => caches.match(e.request, { ignoreSearch: true });
  const reseau = fetch(e.request, { cache: 'no-cache' }).then((r) => {
    if (r && r.ok) { const copie = r.clone(); const u = new URL(e.request.url); caches.open(CACHE).then((c) => c.put(u.origin + u.pathname, copie)); }
    return r;
  });
  const patience = new Promise((ok) => setTimeout(ok, 2500)).then(reserve);
  e.respondWith(Promise.race([reseau.catch(() => null), patience]).then((r) => r || reserve()).then((r) => r || reseau));
});
