const CACHE_VERSION = 'v12';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({type: 'window', includeUncontrolled: true}))
      .then(clients => {
        // Tell every open tab to reload so they get the new version
        clients.forEach(c => c.postMessage({type: 'SW_UPDATED', version: CACHE_VERSION}));
      })
  );
  return self.clients.claim();
});

// Always fetch HTML fresh from the network, bypassing the HTTP cache
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(new Request(e.request.url, {cache: 'no-store'}))
        .catch(() => caches.match(e.request))
    );
  }
});
