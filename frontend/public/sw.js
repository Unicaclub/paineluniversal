const CACHE_NAME = 'meep-events-v1.0.0';
const STATIC_CACHE = 'meep-static-v1.0.0';
const DYNAMIC_CACHE = 'meep-dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

const API_CACHE_PATTERNS = [
  /\/api\/meep\/analytics/,
  /\/api\/eventos/,
  /\/api\/dashboard/
];

const OFFLINE_FALLBACK = '/offline.html';

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && shouldCacheAPI(url.pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 Service Worker: Network failed, trying cache for', url.pathname);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({
        error: 'Offline - dados não disponíveis',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 Service Worker: Network failed for static asset', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.destination === 'document') {
      return caches.match(OFFLINE_FALLBACK);
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

function shouldCacheAPI(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-checkins') {
    event.waitUntil(syncPendingCheckins());
  }
  
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalyticsData());
  }
});

async function syncPendingCheckins() {
  try {
    console.log('📊 Service Worker: Syncing pending check-ins...');
    
    const pendingCheckins = await getStoredData('pending-checkins');
    
    for (const checkin of pendingCheckins) {
      try {
        const response = await fetch('/api/meep/checkin/validate-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkin)
        });
        
        if (response.ok) {
          await removeStoredData('pending-checkins', checkin.id);
          console.log('✅ Service Worker: Check-in synced successfully');
        }
      } catch (error) {
        console.error('❌ Service Worker: Failed to sync check-in', error);
      }
    }
  } catch (error) {
    console.error('❌ Service Worker: Background sync failed', error);
  }
}

async function syncAnalyticsData() {
  try {
    console.log('📈 Service Worker: Syncing analytics data...');
    
    const response = await fetch('/api/meep/analytics/dashboard/1');
    if (response.ok) {
      const data = await response.json();
      await storeData('analytics-cache', data);
      console.log('✅ Service Worker: Analytics data synced');
    }
  } catch (error) {
    console.error('❌ Service Worker: Analytics sync failed', error);
  }
}

async function getStoredData(key) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline-data'], 'readonly');
    const store = transaction.objectStore('offline-data');
    const result = await store.get(key);
    return result ? result.data : [];
  } catch (error) {
    console.error('❌ Service Worker: Failed to get stored data', error);
    return [];
  }
}

async function storeData(key, data) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline-data'], 'readwrite');
    const store = transaction.objectStore('offline-data');
    await store.put({ key, data, timestamp: Date.now() });
  } catch (error) {
    console.error('❌ Service Worker: Failed to store data', error);
  }
}

async function removeStoredData(key, id) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['offline-data'], 'readwrite');
    const store = transaction.objectStore('offline-data');
    const result = await store.get(key);
    
    if (result) {
      const filteredData = result.data.filter(item => item.id !== id);
      await store.put({ key, data: filteredData, timestamp: Date.now() });
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to remove stored data', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('meep-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-data')) {
        db.createObjectStore('offline-data', { keyPath: 'key' });
      }
    };
  });
}

self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do sistema MEEP',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Sistema MEEP', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/meep')
    );
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🎯 Service Worker: MEEP Events Service Worker loaded successfully');
