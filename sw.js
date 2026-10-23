const CACHE_VERSION = 'v99';
const CACHE_NAME = 'gs-' + CACHE_VERSION;
const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const PRECACHE = ['./', './index.html', './index-v2.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all([
        cache.addAll(PRECACHE),
        // Cached separately so a CDN hiccup doesn't block install
        fetch(SUPABASE_JS).then(r => { if (r.ok) return cache.put(SUPABASE_JS, r); }).catch(() => {})
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({type: 'window', includeUncontrolled: true}))
      .then(clients => {
        // Tell every open tab to reload so they get the new version
        clients.forEach(c => c.postMessage({type: 'SW_UPDATED', version: CACHE_VERSION}));
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // HTML: network-first (fresh when online), cached copy when offline
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(new Request(req.url, {cache: 'no-store'}))
        .then(r => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return r;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./')))
    );
    return;
  }

  // Supabase JS bundle + same-origin assets: cache-first, refill cache on miss
  const url = new URL(req.url);
  if (req.url.indexOf(SUPABASE_JS) === 0 || url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(r => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return r;
      }))
    );
  }
  // Everything else (Supabase API calls etc.): straight to network
});
