const saveCacheKey = 'v1';

this.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(saveCacheKey).then((cache) => {
            return cache.addAll([
                '/',
                '/javascripts/index.js',
                '/javascripts/canvas.js',
                '/stylesheets/style.css',
                'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'
            ])
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
