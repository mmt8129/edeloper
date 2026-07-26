const CACHE_NAME = 'edel-pwa-v1';
const urlsToCache = [
    '/edeloper/',
    '/edeloper/index.html',
    '/edeloper/manifest.json',
    '/edeloper/icon-192.png',
    '/edeloper/icon-256.png',
    '/edeloper/icon-384.png',
    '/edeloper/icon-512.png'
];

// Service Worker kurulumu
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache açılıyor...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker kuruldu ve cache oluşturuldu');
                return self.skipWaiting();
            })
    );
});

// Service Worker aktivasyonu
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
        }).then(() => {
            console.log('✅ Service Worker aktif ve hazır');
            return self.clients.claim();
        })
    );
});

// Fetch olayları (ağ istekleri)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.log('❌ Fetch hatası:', error);
                        return new Response('İnternet bağlantısı yok', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

console.log('🔄 Service Worker başlatıldı');
