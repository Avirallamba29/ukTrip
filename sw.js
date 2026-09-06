// Service worker for offline access to the trip app + all ticket PDFs.
// Bump CACHE_NAME (e.g. v1 -> v2) whenever tickets/ or the HTML changes,
// so returning visitors pick up the new files instead of stale cached ones.
const CACHE_NAME = 'uktrip-cache-v15';

const PRECACHE_URLS = [
  './',
  './index.html',
  './london-edinburgh-trip.html',
  './spends.html',
  './tickets/aariv-birth-certificate.pdf',
  './tickets/share-code-aviral.pdf',
  './tickets/share-code-chhavi.pdf',
  './tickets/share-code-aariv.pdf',
  './tickets/flight-indigo-6e3-del-lhr.pdf',
  './tickets/flight-airindia-ai2016-lhr-del.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-adult1.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-adult2.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-aariv-child.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-adult1.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-adult2.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-aariv-child.pdf',
  './tickets/hotel-pullman-london-17-21oct.pdf',
  './tickets/hotel-pullman-london-24-25oct.pdf',
  './tickets/hotel-mountroyal-edinburgh-21-24oct.pdf',
  './tickets/ticket-naturalhistorymuseum-19oct-main.pdf',
  './tickets/ticket-naturalhistorymuseum-backup.pdf',
  './tickets/ticket-britishmuseum-18oct.pdf',
  './tickets/ticket-sciencemuseum-19oct.pdf',
  './tickets/screenshots/lner-seatmap-coachA-search.png',
  './tickets/screenshots/lner-a57-booking-summary1.png',
  './tickets/screenshots/lner-a57-booking-summary2.png',
  './tickets/screenshots/lner-55-56-confirmed.png',
  './tickets/screenshots/lner-seatmap-coachA-2.png',
  './tickets/screenshots/lner-coach-order-11-03.png',
  './tickets/screenshots/avanti-j18-j19-seat-details.png',
  './tickets/screenshots/avanti-j16-seatmap.png',
  './tickets/screenshots/avanti-j16-booking-summary.png',
  './tickets/screenshots/avanti-journey-details-stops.png',
  './tickets/screenshots/evisa-share-code-intro.png',
  './tickets/screenshots/evisa-share-code-reason.png',
  './tickets/screenshots/evisa-aviral-status-summary.png',
  './tickets/screenshots/evisa-chhavi-status-summary.png',
  './tickets/screenshots/evisa-aariv-status-summary.png',
  './tickets/images/thames-cruise-photo.jpg',
  './tickets/images/sea-life-photo.jpg',
  './tickets/images/london-eye-photo.jpg',
  './tickets/images/edinburgh-castle-photo.jpg',
  './tickets/passport-aviral.pdf',
  './tickets/passport-chhavi.pdf',
  './tickets/passport-aariv.pdf',
  './tickets/ticket-highland-374019708.pdf',
  './tickets/highland-tour-confirmation.pdf'
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
