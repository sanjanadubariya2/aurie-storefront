/* Aurie service worker — installable app + offline browsing.
 *
 * What it caches:
 *   - the app shell (index.html) — network first, cached copy when offline
 *   - built assets (/assets/*, hashed filenames) — cache first, they never change
 *   - product photos (Cloudinary) — stale-while-revalidate, capped
 *   - the public catalogue (GET /api/products, /collections, /settings) —
 *     stale-while-revalidate, so the shop can be browsed without a signal
 * What it never touches: anything signed-in (orders, account, auth, checkout,
 * payments) and every non-GET request. Those always go to the network.
 */
const VERSION = 'aurie-v1'
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`
const IMAGES = `${VERSION}-images`
const DATA = `${VERSION}-data`
const MAX_IMAGES = 120

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/icon.svg', '/manifest.webmanifest'])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const PUBLIC_DATA = /\/api\/(products|collections|settings)(\/[^/]+\/reviews)?$/

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}

async function staleWhileRevalidate(request, cacheName, max) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((res) => {
      if (res.ok) {
        cache.put(request, res.clone())
        if (max) trim(cacheName, max)
      }
      return res
    })
    .catch(() => cached)
  return cached || network
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Page navigations: try the network, fall back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(SHELL).then((c) => c.put('/', res.clone()))
          return res
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => {
      const copy = res.clone()
      if (res.ok) caches.open(ASSETS).then((c) => c.put(request, copy))
      return res
    })))
    return
  }

  if (url.hostname === 'res.cloudinary.com' || (url.origin === self.location.origin && url.pathname.startsWith('/products/'))) {
    event.respondWith(staleWhileRevalidate(request, IMAGES, MAX_IMAGES))
    return
  }

  if (PUBLIC_DATA.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, DATA))
  }
  // Everything else (auth, account, orders, payments…) goes straight to the network.
})
