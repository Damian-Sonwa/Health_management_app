// NuviaCare Service Worker
const CACHE_NAME = 'nuviacare-v1.6.0';
const RUNTIME_CACHE = 'nuviacare-runtime';
const API_CACHE = 'nuviacare-api';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/animated-heart.svg',
  '/manifest.json',
  '/images/bp-machine.jpg',
  '/images/glucose-machine.jpg',
  '/images/doctor.jpg',
  '/images/Family.jpg'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    (async () => {
      // Delete ALL old caches - fresh start with new version
      const cacheNames = await caches.keys();
      console.log('[SW] Found caches:', cacheNames);
      console.log('[SW] Current version:', CACHE_NAME);
      
      // Delete all caches that don't match current version
      const currentVersion = CACHE_NAME.match(/v(\d+\.\d+\.\d+)/)?.[1];
      
      await Promise.all(
        cacheNames.map(async (name) => {
          // Only keep exact current cache name
          if (name === CACHE_NAME) {
            console.log('[SW] Keeping current cache:', name);
            return;
          }
          // Check if it's an old version cache
          const versionMatch = name.match(/nuviacare-v(\d+\.\d+\.\d+)/);
          if (versionMatch && versionMatch[1] !== currentVersion) {
            console.log('[SW] Deleting old version cache:', name);
            await caches.delete(name);
          } else {
            // Delete runtime and API caches too for fresh start
            console.log('[SW] Deleting cache:', name);
            await caches.delete(name);
          }
        })
      );
      
      // Claim all clients immediately
      await self.clients.claim();
      
      // Send message to all clients to reload with force flag
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATED', cacheVersion: CACHE_NAME, forceReload: true });
      });
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Only cache successful GET requests
            if (request.method === 'GET' && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // If network fails, try cache
            return cache.match(request);
          });
      })
    );
    return;
  }

  // HTML files - Network First strategy (always get latest, no caching)
  // On mobile, be even more aggressive about not caching HTML
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
        .then((response) => {
          // Don't cache HTML - always get fresh
          // Create a new response with no-cache headers
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          newHeaders.set('Pragma', 'no-cache');
          newHeaders.set('Expires', '0');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        })
        .catch(() => {
          // Fallback to cache only if network completely fails (offline)
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to index.html for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
        })
    );
    return;
  }

  // JS and CSS files - Network First, bypass cache if version mismatch
  // On mobile, don't cache JS/CSS to ensure latest version
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request, { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
        .then((response) => {
          // Only cache if response has hash in filename (versioned assets)
          const hasHash = url.pathname.match(/[a-f0-9]{8,}\.(js|css)$/);
          if (hasHash && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Images - Network First with cache-busting (always get fresh images)
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((response) => {
          // Only cache if response is successful and not a cache-busted request
          if (response.status === 200 && !url.search.includes('v=')) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Other static assets - Cache First strategy (fonts, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        });
      });
    }).catch(() => {
      // If both cache and network fail, return offline page
      if (request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let notificationData = {
    title: 'NuviaCare',
    body: 'You have a new notification',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'nuviacare-notification',
    requireInteraction: false
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-vitals') {
    event.waitUntil(syncVitals());
  }
  if (event.tag === 'sync-medications') {
    event.waitUntil(syncMedications());
  }
});

// Sync functions
async function syncVitals() {
  try {
    // Get pending vitals from IndexedDB or cache
    // Send to server
    console.log('[Service Worker] Syncing vitals...');
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Vitals sync failed:', error);
    return Promise.reject(error);
  }
}

async function syncMedications() {
  try {
    console.log('[Service Worker] Syncing medications...');
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] Medications sync failed:', error);
    return Promise.reject(error);
  }
}

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

