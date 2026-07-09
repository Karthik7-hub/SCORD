const CACHE_NAME = 'scord-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json'
];

// 1. INSTALL: Pre-cache basic shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Intercept requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API requests entirely (let MatchContext sync queue handle them)
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Bypass non-GET requests (e.g. POST, PUT, DELETE, PATCH)
  if (event.request.method !== 'GET') {
    return;
  }

  // Stale-While-Revalidate caching strategy for HTML, JS, CSS, fonts, and assets
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Only cache valid 200 responses
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for offline mode if something isn't cached yet
            return cachedResponse;
          });

        // Return cached response instantly if available, or wait for fetch
        return cachedResponse || fetchPromise;
      });
    })
  );
});
