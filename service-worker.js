// Version of the cache
const CACHE_VERSION = "v1";
const CACHE_NAME = `closer-cache-${CACHE_VERSION}`;

// List of resources to cache
const RESOURCES_TO_CACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "db.js",
  "sounds/flip.mp3",
  "sounds/click.mp3",
];
// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      // Only cache same-origin requests and standard HTTP/HTTPS schemes
      if (
        event.request.url.startsWith(self.location.origin) &&
        (event.request.url.startsWith("http:") ||
          event.request.url.startsWith("https:"))
      ) {
        try {
          // Try to get from cache first
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, fetch from network
          const response = await fetch(event.request);

          // Cache the response if it's valid
          if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
          }

          return response;
        } catch (error) {
          console.error("Service Worker fetch error:", error);
          // Return a fallback response if both cache and network fail
          return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        }
      }

      // For non-same-origin or non-HTTP(S) requests, just fetch from network
      return fetch(event.request);
    })()
  );
});
