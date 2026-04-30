const CACHE_NAME = 'mrs-lubricants-v1'
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    // Don't intercept API calls or non-GET requests
    if (event.request.method !== 'GET') return
    if (event.request.url.includes('/api/')) return

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.status === 200) {
                    const cloned = response.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, cloned)
                    })
                }
                return response
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request)
            })
    )
})
