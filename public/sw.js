// Service worker for Daily.Deals PWA — minimal offline support + cache control

const CACHE_NAME = 'daily-deals-v1'
const STATIC_CACHE = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Don't cache API or admin requests — always fresh
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) {
    return
  }

  // Network-first for HTML pages — keeps deals fresh
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, copy))
          return res
        })
        .catch(() => caches.match(request).then(r => r || new Response('Offline — please reconnect', {
          status: 503, headers: { 'Content-Type': 'text/plain' }
        })))
    )
    return
  }

  // Cache-first for static assets (images, fonts, CSS, JS)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (res.ok && (request.url.includes('/_next/static/') || /\.(png|jpg|svg|woff2|css|js)$/.test(request.url))) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, copy))
        }
        return res
      })
    })
  )
})

// Push notifications — for daily deal alerts (future)
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Deal', {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow(event.notification.data.url || '/'))
})
