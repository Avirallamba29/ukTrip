// Service worker for offline access to the trip app + all ticket PDFs.
// Bump CACHE_NAME (e.g. v1 -> v2) whenever tickets/ or the HTML changes,
// so returning visitors pick up the new files instead of stale cached ones.
const CACHE_NAME = 'uktrip-cache-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './london-edinburgh-trip.html',
  './tickets/flight-indigo-6e3-del-lhr.pdf',
  './tickets/flight-airindia-ai2016-lhr-del.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-adult1.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-adult2.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-adult1.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-adult2.pdf',
  './tickets/hotel-pullman-london-17-21oct.pdf',
  './tickets/hotel-pullman-london-24-25oct.pdf',
  './tickets/hotel-mountroyal-edinburgh-21-24oct.pdf',
  './tickets/ticket-naturalhistorymuseum-19oct-main.pdf',
  './tickets/ticket-naturalhistorymuseum-backup.pdf',
  './tickets/ticket-britishmuseum-18oct.pdf',
  './tickets/ticket-sciencemuseum-19oct.pdf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for everything in scope, falling back to the network
// (and caching what it fetches) for anything not precached.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
