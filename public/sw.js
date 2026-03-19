/**
 * SickoGrid Service Worker
 * Strategy:
 *   - App shell (JS/CSS/HTML) → Cache-first, update in background
 *   - /api/* requests        → Network-first, 10s timeout, then cache
 *   - Everything else        → Network-first
 */

const CACHE_VERSION = 'v1'
const SHELL_CACHE   = `sickogrid-shell-${CACHE_VERSION}`
const API_CACHE     = `sickogrid-api-${CACHE_VERSION}`

const SHELL_ASSETS = ['/', '/index.html']

// ── Install: pre-cache the app shell ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate: delete old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: route-based caching strategy ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) return

  // /api/* → Network-first with 10s timeout, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 10_000))
    return
  }

  // Static assets (JS/CSS/fonts) → Cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|svg|png|ico)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
    return
  }

  // HTML navigation → Network-first, fallback to cached /index.html
  event.respondWith(networkFirstFallbackShell(request))
})

// ── Strategies ────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timer)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    clearTimeout(timer)
    const cached = await caches.match(request)
    return cached ?? new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function networkFirstFallbackShell(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return caches.match('/index.html')
  }
}
