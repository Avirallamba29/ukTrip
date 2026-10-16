// Service worker for offline access to the trip app + all ticket PDFs.
// Bump CACHE_NAME (e.g. v1 -> v2) whenever tickets/ or the HTML changes,
// so returning visitors pick up the new files instead of stale cached ones.
const CACHE_NAME = 'uktrip-cache-v90';

const PRECACHE_URLS = [
  './',
  './index.html',
  './london-edinburgh-trip.html',
  './spends.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  './tickets/aariv-birth-certificate.pdf',
  './tickets/share-code-aviral.pdf',
  './tickets/share-code-chhavi.pdf',
  './tickets/share-code-aariv.pdf',
  './tickets/flight-indigo-6e3-del-lhr.pdf',
  './tickets/boarding-indigo-6e3-17oct.pdf',
  './tickets/flight-airindia-ai2016-lhr-del.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-adult1.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-adult2.pdf',
  './tickets/train-lner-kgx-edinburgh-21oct-aariv-child.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-adult1.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-adult2.pdf',
  './tickets/train-avanti-edinburgh-euston-24oct-aariv-child.pdf',
  './tickets/hotel-pullman-london-17-21oct.pdf',
  './tickets/hotel-pullman-london-24-25oct.pdf',
  './tickets/hotel-glasshouse-edinburgh-21-24oct.pdf',
  './tickets/luggage-all-bags.jpg',
  './tickets/luggage-all-bags-2.jpg',
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
  './tickets/highland-tour-confirmation.pdf',
  './tickets/ticket-bigbus-hoponhopoff-19oct.pdf',
  './tickets/ticket-bigbus-manage-booking.pdf',
  './tickets/pullman-luggage-storage-confirmation.eml',
  './tickets/trainline-phone-confirmation-546920566196.png',
  './tickets/screenshots/trainline-phone-confirm-b55-56.png',
  './tickets/screenshots/lner-coachB-seatmap-55-58.png',
  './tickets/screenshots/lner-coachB-seatmap-key.png',
  './tickets/screenshots/lner-coachB-seatmap-full.png',
  './tickets/screenshots/lner-coach-order-front-to-back.png',
  './tickets/images/bigbus-photo.jpg',
  './tickets/insurance-aviral.pdf',
  './tickets/insurance-chhavi.pdf',
  './tickets/insurance-aariv.pdf',
  './tickets/insurance-aviral-tataaig.pdf',
  './tickets/insurance-chhavi-tataaig.pdf',
  './tickets/insurance-aariv-tataaig.pdf',
  './tickets/hsbc-zero-forex-offer-tnc.pdf',
  './tickets/ticket-britishmuseum-18oct-1240.pdf',
  './tickets/ticket-naturalhistorymuseum-19oct-1300.pdf',
  './tickets/ticket-sciencemuseum-19oct-1630.png',
  './tickets/ticket-londoneye-20oct.pdf',
  './tickets/ticket-edinburghcastle-22oct-voucher.pdf',
  './tickets/screenshots/headout-castle-meeting-point.jpg',
  './tickets/screenshots/headout-eye-meeting-point.jpg',
  './tickets/screenshots/headout-sealife-meeting-policy.jpg',
  './tickets/screenshots/headout-sealife-qr-1of3.jpg',
  './tickets/screenshots/headout-sealife-qr-2of3.jpg',
  './tickets/screenshots/headout-sealife-qr-3of3.jpg',
  './tickets/screenshots/headout-cruise-qr-1of3.jpg',
  './tickets/screenshots/headout-cruise-qr-2of3.jpg',
  './tickets/screenshots/headout-cruise-qr-3of3.jpg',
  './tickets/screenshots/headout-cruise-westminster-pier.jpg',
  './tickets/screenshots/headout-cruise-waterloo-tower-piers.jpg',
  './tickets/screenshots/headout-cruise-greenwich-pier.jpg',
  './tickets/images/attr-air-india.jpg',
  './tickets/images/attr-borough-market.jpg',
  './tickets/images/attr-british-museum.jpg',
  './tickets/images/attr-calton-hill.jpg',
  './tickets/images/attr-glen-coe.jpg',
  './tickets/images/attr-heathrow-t2.jpg',
  './tickets/images/attr-highland-cow.jpg',
  './tickets/images/attr-indigo.jpg',
  './tickets/images/attr-loch-ness.jpg',
  './tickets/images/attr-nhm.jpg',
  './tickets/images/attr-regent-street.jpg',
  './tickets/images/attr-royal-mile.jpg',
  './tickets/images/attr-science-museum.jpg',
  './tickets/images/attr-sky-garden.jpg',
  './tickets/images/attr-tower-bridge.jpg',
  './tickets/images/attr-victoria-street.jpg',
  './tickets/images/attr-avanti.jpg',
  './tickets/images/attr-lner-azuma.jpg',
  './tickets/images/attr-kings-cross.jpg',
  './tickets/images/attr-cutty-sark.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // one missing or renamed file must not stop every other file from being stored:
      // add them one by one and let the Docs page's "offline copy" check report any gaps.
      return Promise.all(PRECACHE_URLS.map((u) => cache.add(u).catch(() => null)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
    // v85: any open page that doesn't answer the ping is an older version of the app (pre-v85) — reload it so the
    // phone shows the version that was just uploaded, without the "close and reopen twice" dance.
    .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
    .then((list) => Promise.all(list.map((c) => new Promise((done) => {
      let answered = false;
      try {
        const ch = new MessageChannel();
        ch.port1.onmessage = () => { answered = true; done(); };
        c.postMessage({ type: 'uktrip-ping' }, [ch.port2]);
      } catch (e) { return done(); }
      setTimeout(() => { if (!answered && 'navigate' in c) { c.navigate(c.url).catch(() => {}); } done(); }, 1000);
    }))))
  );
});

// Cache-first for everything in scope, falling back to the network
// (and caching what it fetches) for anything not precached.
// v85: the page itself (index.html / london-edinburgh-trip.html / a navigation) is fetched from the network first,
// so an upload shows up on the very next open; the cached copy is used only when offline or the network is slow (>4 s).
function networkFirstPage(req) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  const fresh = new Request(req.url, { cache: 'no-store', credentials: 'same-origin', signal: ctrl.signal });
  return fetch(fresh).then((res) => {
    clearTimeout(timer);
    if (res && res.status === 200) {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req.url, copy));
    }
    return res;
  }).catch(() => {
    clearTimeout(timer);
    return caches.match(req.url, { ignoreVary: true, ignoreSearch: true })
      .then((c) => c || caches.match('./index.html', { ignoreVary: true }))
      .then((c) => c || new Response('Offline and no saved copy yet — open the app once on Wi-Fi.', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isPage = event.request.mode === 'navigate' ||
    (url.origin === self.location.origin && (/\/(index|london-edinburgh-trip)\.html$/.test(url.pathname) || url.pathname.endsWith('/')));
  if (isPage) { event.respondWith(networkFirstPage(event.request)); return; }
  event.respondWith(
    caches.match(event.request, { ignoreVary: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const ok = response && ((response.status === 200 && (response.type === 'basic' || response.type === 'cors')) || response.type === 'opaque');
        if (ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// ---- Web Push: lock-screen alerts for new voice notes ----
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(d.title || 'London & Edinburgh', {
    body: d.body || '', icon: './icon-192.png', badge: './icon-192.png', tag: d.tag || 'voice-note', renotify: true,
    data: { url: d.url || './index.html' }
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './index.html', self.registration.scope).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ('focus' in c) { if ('navigate' in c) c.navigate(target); return c.focus(); } }
    return clients.openWindow(target);
  }));
});
