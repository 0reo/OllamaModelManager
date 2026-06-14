// Service worker for the Ollama Model Manager PWA.
// Strategy:
//   - /api/* and /swagger.json  -> network-only (live Ollama data is never cache-served)
//   - navigations               -> network-first, fall back to the cached app shell offline
//   - other same-origin assets  -> cache-first + background refresh (stale-while-revalidate)
//   - cross-origin (e.g. CDN)    -> passed straight through, never cached
const CACHE = 'omm-shell-v1';
const SHELL = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    // Only manage same-origin requests; let cross-origin (CDN) traffic pass through untouched.
    if (url.origin !== self.location.origin) return;
    // Never cache live API traffic — always go to the network so model data is fresh.
    if (url.pathname.startsWith('/api/') || url.pathname === '/swagger.json') return;

    // App navigations: network-first (fresh HTML), fall back to the cached shell when offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((resp) => {
                    const copy = resp.clone();
                    caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {});
                    return resp;
                })
                .catch(() => caches.match('/').then((m) => m || caches.match('/index.html')))
        );
        return;
    }

    // Static shell assets: serve from cache immediately, refresh in the background.
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((resp) => {
                    if (resp && resp.status === 200) {
                        const copy = resp.clone();
                        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
                    }
                    return resp;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
