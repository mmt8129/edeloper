const CACHE_VERSION = 'edel-v1.0.0'; // Değişiklik yapınca bu versiyon numarasını güncelle
const CACHE_NAME = `edel-cache-${CACHE_VERSION}`;
const URLS_TO_CACHE = [
  '/edeloper/',
  '/edeloper/index.html',
  '/edeloper/manifest.json',
  '/edeloper/icon-196.png',
  '/edeloper/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache açıldı:', CACHE_NAME);
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).catch(() => {
          return new Response('İnternet bağlantısı yok', { status: 404 });
        });
      })
  );
});
