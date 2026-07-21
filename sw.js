// SE7EN V2 service worker
// Bump CACHE on every release.
const CACHE = 'se7env2-v18';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// cache:'reload' is essential: without it the browser may serve these files
// from its own HTTP cache (GitHub Pages sets max-age), so a freshly installed
// service worker would cache a stale index.html and the app would never update.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: the tablet must work with no network at all.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
