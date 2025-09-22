
// service-worker.js
const CACHE_NAME = 'eduquest-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/login.html',
  '/game.js',
  '/style.css',
  '/manifest.json', // <-- Add this line
  'https://cdn.jsdelivr.net/npm/chart.js',
  // Precache lesson/game thumbnails (placeholders)
  'https://placeholder-image-service.onrender.com/image/60x60?prompt=math%20lesson%20icon%20with%20calculator&id=lesson-math-1',
  'https://placeholder-image-service.onrender.com/image/60x60?prompt=science%20lesson%20icon%20with%20flask&id=lesson-science-1',
  'https://placeholder-image-service.onrender.com/image/60x60?prompt=geometry%20icon%20with%20triangle%20and%20compass&id=lesson-geometry-1',
  'https://placeholder-image-service.onrender.com/image/60x60?prompt=physics%20icon%20with%20atom%20and%20lightning&id=lesson-physics-1',
  'https://placeholder-image-service.onrender.com/image/60x60?prompt=memory%20cards%20icon%20with%20brain&id=lesson-memory-1'
];
// Install the service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
// Stale-While-Revalidate for images and runtime GETs
self.addEventListener('fetch', function(event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImage = req.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(networkResp => {
            if (networkResp && networkResp.status === 200) {
              cache.put(req, networkResp.clone());
            }
            return networkResp;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Default: cache-first for precached assets, network-first otherwise
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('eduquest-') && k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});