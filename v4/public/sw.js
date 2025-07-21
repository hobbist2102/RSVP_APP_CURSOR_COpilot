// Wedding RSVP Platform Service Worker
// Version 1.0.0 - Advanced caching and offline support

const CACHE_NAME = 'rsvp-v1';
const STATIC_CACHE_NAME = 'rsvp-static-v1';
const DYNAMIC_CACHE_NAME = 'rsvp-dynamic-v1';
const API_CACHE_NAME = 'rsvp-api-v1';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache for offline access
const CACHEABLE_APIS = [
  '/api/events/',
  '/api/guests/',
  '/api/ceremonies/',
  '/api/accommodation/'
];

// Routes that should work offline
const OFFLINE_FALLBACK_ROUTES = [
  '/rsvp',
  '/admin',
  '/admin/guests',
  '/admin/events'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Cache First with Network Fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - Cache First
    event.respondWith(handleStaticAsset(request));
  } else if (OFFLINE_FALLBACK_ROUTES.some(route => url.pathname.startsWith(route))) {
    // App routes - Network First with Offline Fallback
    event.respondWith(handleAppRoute(request));
  } else {
    // Other requests - Stale While Revalidate
    event.respondWith(handleOtherRequests(request));
  }
});

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cache', 'SW-CACHE');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Return offline response for known endpoints
    if (url.pathname.includes('/guests') || url.pathname.includes('/events')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline mode - data unavailable',
          offline: true,
          cached_data: null
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', 'X-Cache': 'SW-OFFLINE' }
        }
      );
    }
    
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Handle app routes with network-first and offline fallback
async function handleAppRoute(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the page for offline access
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for app route, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort - basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Wedding RSVP</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .container { max-width: 400px; }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { font-size: 1.1rem; line-height: 1.6; opacity: 0.9; }
            .icon { font-size: 4rem; margin-bottom: 2rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>You're Offline</h1>
            <p>The Wedding RSVP platform is not available right now. Please check your internet connection and try again.</p>
            <p><small>Some features may be available when you're back online.</small></p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html', 'X-Cache': 'SW-OFFLINE-FALLBACK' }
      }
    );
  }
}

// Handle other requests with stale-while-revalidate
async function handleOtherRequests(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Serve from cache immediately if available
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cache
    return cachedResponse;
  });
  
  // Return cached version immediately, update in background
  return cachedResponse || fetchPromise;
}

// Background sync for RSVP submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'rsvp-sync') {
    event.waitUntil(syncRsvpSubmissions());
  }
  
  if (event.tag === 'guest-data-sync') {
    event.waitUntil(syncGuestData());
  }
});

// Sync offline RSVP submissions
async function syncRsvpSubmissions() {
  try {
    // Get pending RSVP submissions from IndexedDB
    const pendingSubmissions = await getPendingRsvpSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/rsvp/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          await removePendingSubmission(submission.id);
          console.log('[SW] Successfully synced RSVP submission:', submission.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync RSVP submission:', submission.id, error);
      }
    }
  } catch (error) {
    console.log('[SW] Error during RSVP sync:', error);
  }
}

// Sync guest data changes
async function syncGuestData() {
  try {
    // Sync any pending guest updates
    const pendingUpdates = await getPendingGuestUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(`/api/guests/${update.guestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await removePendingGuestUpdate(update.id);
          console.log('[SW] Successfully synced guest update:', update.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync guest update:', update.id, error);
      }
    }
  } catch (error) {
    console.log('[SW] Error during guest data sync:', error);
  }
}

// IndexedDB helpers for offline storage
async function getPendingRsvpSubmissions() {
  // Placeholder - would implement IndexedDB storage
  return [];
}

async function removePendingSubmission(id) {
  // Placeholder - would implement IndexedDB removal
  console.log('[SW] Would remove pending submission:', id);
}

async function getPendingGuestUpdates() {
  // Placeholder - would implement IndexedDB storage
  return [];
}

async function removePendingGuestUpdate(id) {
  // Placeholder - would implement IndexedDB removal
  console.log('[SW] Would remove pending guest update:', id);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    title: 'Wedding RSVP Update',
    body: 'New RSVP response received',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'rsvp-notification',
    data: {
      url: '/admin/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View Dashboard',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.title = data.title || options.title;
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.log('[SW] Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/admin/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'CACHE_INVALIDATE') {
    // Invalidate specific cache entries
    const { pattern } = event.data;
    event.waitUntil(invalidateCache(pattern));
  }
  
  if (event.data && event.data.type === 'OFFLINE_RSVP') {
    // Store RSVP submission for later sync
    event.waitUntil(storeOfflineRsvp(event.data.payload));
  }
});

// Cache invalidation helper
async function invalidateCache(pattern) {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes(pattern)) {
        await cache.delete(request);
        console.log('[SW] Invalidated cache for:', request.url);
      }
    }
  }
}

// Store offline RSVP submission
async function storeOfflineRsvp(data) {
  // Would implement IndexedDB storage for offline submissions
  console.log('[SW] Would store offline RSVP:', data);
}