const CACHE_NAME = 'opentok-v1';
const STATIC_CACHE = 'opentok-static-v1';
const DYNAMIC_CACHE = 'opentok-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static files - cache first
    if (STATIC_FILES.includes(url.pathname)) {
      event.respondWith(
        caches.match(request)
          .then((response) => response || fetch(request))
      );
    }
    // API requests - network first, cache fallback
    else if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return caches.match(request)
              .then((response) => {
                if (response) return response;
                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                  return caches.match('/offline.html');
                }
              });
          })
      );
    }
    // Other requests - network first
    else {
      event.respondWith(
        fetch(request)
          .catch(() => {
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          })
      );
    }
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'OpenTok',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'opentok-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-72x72.png'
      }
    ]
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
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'open' action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
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

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync-likes') {
    event.waitUntil(syncLikes());
  } else if (event.tag === 'background-sync-comments') {
    event.waitUntil(syncComments());
  }
});

// Sync functions for offline actions
async function syncLikes() {
  try {
    // Get pending likes from IndexedDB
    const pendingLikes = await getPendingLikes();
    
    for (const like of pendingLikes) {
      try {
        await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(like)
        });
        await removePendingLike(like.id);
      } catch (error) {
        console.error('Failed to sync like:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncComments() {
  try {
    // Get pending comments from IndexedDB
    const pendingComments = await getPendingComments();
    
    for (const comment of pendingComments) {
      try {
        await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comment)
        });
        await removePendingComment(comment.id);
      } catch (error) {
        console.error('Failed to sync comment:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers (simplified - you'd implement these based on your needs)
async function getPendingLikes() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingLike(id) {
  // Implementation would depend on your IndexedDB setup
}

async function getPendingComments() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingComment(id) {
  // Implementation would depend on your IndexedDB setup
}
