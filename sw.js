const CACHE_NAME = 'edel-pwa-v1';
const urlsToCache = [
    '/Edelmmt/',
    '/Edelmmt/index.html',
    '/Edelmmt/manifest.json',
    '/Edelmmt/icon-192.png',
    '/Edelmmt/icon-256.png',
    '/Edelmmt/icon-384.png',
    '/Edelmmt/icon-512.png'
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
                // Cache'de varsa onu döndür
                if (response) {
                    return response;
                }

                // Cache'de yoksa ağdan al ve cache'e ekle
                return fetch(event.request)
                    .then(response => {
                        // Geçersiz yanıtları önbelleğe alma
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Yanıtı klonla ve cache'e ekle
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.log('❌ Fetch hatası:', error);
                        // Çevrimdışıysan bir hata mesajı döndürebilirsin
                        return new Response('İnternet bağlantısı yok', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Bildirimler ve push olayları (isteğe bağlı)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Yeni bir bildirim var!',
        icon: '/Edelmmt/icon-192.png',
        badge: '/Edelmmt/icon-192.png'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'EDEL Bildirimi', options)
    );
});

console.log('🔄 Service Worker başlatıldı');
