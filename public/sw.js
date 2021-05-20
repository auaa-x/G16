const CACHE_NAME = 'v3';

const filesToCache = [
    '/',
    '/javascripts/index.js',
    '/stylesheets/style.css',
]

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
    );

    // define api response for no network request
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (CACHE_NAME !== key) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});
