const saveCacheKey = 'v3';
const filesToCache = [
    '/',
    '/javascripts/index.js',
    '/stylesheets/style.css',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'
]

this.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(saveCacheKey).then((cache) => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

this.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
    );

    // define api response for no network request
});

this.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (saveCacheKey !== key) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
