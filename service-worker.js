const CACHE_NAME = 'closer-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './db.js',
  './sounds/flip.mp3',
  './sounds/click.mp3',
  './favicon/favicon.svg',
  './favicon/favicon.ico',
  './favicon/apple-touch-icon.png',
  './favicon/favicon-96x96.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Attivazione del Service Worker e pulizia delle vecchie cache
self.addEventListener('activate', (event) => {
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

// Strategia Cache First con Network Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Restituisce la risorsa dalla cache se presente
        }
        return fetch(event.request)
          .then((response) => {
            // Verifica che la risposta sia valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona la risposta perché è un one-time-use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});