/**
 * Atomic Clock & Weather Display - Hardened Service Worker
 * Security-hardened service worker with advanced caching strategies
 * Version: 2.0.0-Hardened
 */

const CACHE_NAME = 'atomic-clock-harden-v2.0.0';
const STATIC_CACHE = 'atomic-clock-static-v2.0.0';
const DYNAMIC_CACHE = 'atomic-clock-dynamic-v2.0.0';
const API_CACHE = 'atomic-clock-api-v2.0.0';

// Security: Trusted resources only
const TRUSTED_ORIGINS = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.openweathermap.org',
    'https://api.weatherapi.com',
    'https://ipapi.co'
];

// Performance: Critical resources to cache
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/theme-preloader.js',
    '/styles/dark.css',
    '/styles/ocean.css',
    '/styles/sunset.css',
    '/styles/forest.css',
    '/styles/cyberpunk.css',
    '/styles/galaxy.css',
    '/styles/aurora.css',
    '/styles/vintage.css',
    '/styles/minimal.css',
    '/styles/neon.css',
    '/styles/candy.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;600;700&display=swap'
];

// Security: Cache configuration
const CACHE_CONFIG = {
    static: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 100
    },
    dynamic: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        maxEntries: 50
    },
    api: {
        maxAge: 10 * 60 * 1000, // 10 minutes
        maxEntries: 20
    }
};

// Performance: Rate limiting for API calls
const API_RATE_LIMIT = {
    requests: 10,
    window: 60 * 1000, // 1 minute
    current: []
};

// Security: Input validation
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return TRUSTED_ORIGINS.includes(parsed.origin) || parsed.origin === self.location.origin;
    } catch {
        return false;
    }
}

// Security: Sanitize cache key
function sanitizeCacheKey(url) {
    try {
        const parsed = new URL(url);
        return parsed.pathname + parsed.search;
    } catch {
        return null;
    }
}

// Performance: Cache cleanup
async function cleanupCache(cacheName, maxEntries) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > maxEntries) {
            const keysToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
        }
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}

// Security: Rate limiting check
function isRateLimited() {
    const now = Date.now();
    API_RATE_LIMIT.current = API_RATE_LIMIT.current.filter(timestamp => 
        now - timestamp < API_RATE_LIMIT.window
    );
    
    if (API_RATE_LIMIT.current.length >= API_RATE_LIMIT.requests) {
        return true;
    }
    
    API_RATE_LIMIT.current.push(now);
    return false;
}

// Performance: Cache with expiration
async function cacheWithExpiration(cacheName, request, response, maxAge) {
    try {
        const cache = await caches.open(cacheName);
        const cacheKey = sanitizeCacheKey(request.url);
        
        if (!cacheKey) return;
        
        // Create response with cache headers
        const responseToCache = response.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cached-at', Date.now().toString());
        headers.set('sw-cache-max-age', maxAge.toString());
        
        const cachedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
        });
        
        await cache.put(request, cachedResponse);
    } catch (error) {
        console.error('Cache with expiration failed:', error);
    }
}

// Security: Check if cached response is expired
function isExpired(response) {
    const cachedAt = parseInt(response.headers.get('sw-cached-at') || '0');
    const maxAge = parseInt(response.headers.get('sw-cache-max-age') || '0');
    return Date.now() - cachedAt > maxAge;
}

// Performance: Network first strategy for API calls
async function networkFirst(request) {
    try {
        // Security: Rate limiting
        if (isRateLimited()) {
            throw new Error('Rate limit exceeded');
        }
        
        // Security: Validate URL
        if (!isValidUrl(request.url)) {
            throw new Error('Invalid URL');
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await cacheWithExpiration(API_CACHE, request, networkResponse, CACHE_CONFIG.api.maxAge);
            return networkResponse;
        } else {
            throw new Error(`Network error: ${networkResponse.status}`);
        }
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        try {
            const cachedResponse = await caches.match(request);
            if (cachedResponse && !isExpired(cachedResponse)) {
                return cachedResponse;
            }
        } catch (cacheError) {
            console.error('Cache fallback failed:', cacheError);
        }
        
        // Return offline response
        return new Response(
            JSON.stringify({ 
                error: 'Offline', 
                message: 'Network unavailable and no cached data',
                timestamp: Date.now()
            }), 
            { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
}

// Performance: Cache first strategy for static resources
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse && !isExpired(cachedResponse)) {
            return cachedResponse;
        }
        
        // Security: Validate URL
        if (!isValidUrl(request.url)) {
            throw new Error('Invalid URL');
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await cacheWithExpiration(STATIC_CACHE, request, networkResponse, CACHE_CONFIG.static.maxAge);
            return networkResponse;
        }
        
        return cachedResponse || networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        
        try {
            const cachedResponse = await caches.match(request);
            return cachedResponse || new Response('Resource not available offline', { status: 503 });
        } catch {
            return new Response('Resource not available', { status: 404 });
        }
    }
}

// Performance: Stale while revalidate strategy
async function staleWhileRevalidate(request) {
    try {
        const cachedResponse = await caches.match(request);
        const cachePromise = cachedResponse ? Promise.resolve(cachedResponse) : null;
        
        // Security: Validate URL
        if (!isValidUrl(request.url)) {
            return cachedResponse || new Response('Invalid request', { status: 400 });
        }
        
        const networkPromise = fetch(request).then(async response => {
            if (response.ok) {
                await cacheWithExpiration(DYNAMIC_CACHE, request, response, CACHE_CONFIG.dynamic.maxAge);
            }
            return response;
        }).catch(error => {
            console.log('Network request failed:', error);
            return cachedResponse;
        });
        
        // Return cached version immediately, update in background
        if (cachePromise) {
            networkPromise; // Fire and forget
            return cachePromise;
        }
        
        return networkPromise;
    } catch (error) {
        console.error('Stale while revalidate failed:', error);
        
        try {
            const cachedResponse = await caches.match(request);
            return cachedResponse || new Response('Resource not available', { status: 404 });
        } catch {
            return new Response('Resource not available', { status: 404 });
        }
    }
}

// Security: Handle install event
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker: Static resources cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Install failed:', error);
            })
    );
});

// Security: Handle activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
            .then(() => {
                // Clean up caches
                return Promise.all([
                    cleanupCache(STATIC_CACHE, CACHE_CONFIG.static.maxEntries),
                    cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG.dynamic.maxEntries),
                    cleanupCache(API_CACHE, CACHE_CONFIG.api.maxEntries)
                ]);
            })
            .catch((error) => {
                console.error('Service Worker: Activate failed:', error);
            })
    );
});

// Security: Handle fetch events
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Security: Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Security: Validate URL
    if (!isValidUrl(request.url)) {
        console.warn('Service Worker: Blocking suspicious request:', request.url);
        return;
    }
    
    // Performance: Route requests to appropriate strategies
    if (STATIC_RESOURCES.includes(url.pathname) || 
        url.pathname.startsWith('/styles/') ||
        url.origin === 'https://fonts.googleapis.com' ||
        url.origin === 'https://fonts.gstatic.com') {
        
        // Cache first for static resources
        event.respondWith(cacheFirst(request));
        
    } else if (url.origin === 'https://api.openweathermap.org' ||
               url.origin === 'https://api.weatherapi.com' ||
               url.origin === 'https://ipapi.co') {
        
        // Network first for API calls
        event.respondWith(networkFirst(request));
        
    } else if (url.origin === self.location.origin) {
        
        // Stale while revalidate for dynamic content
        event.respondWith(staleWhileRevalidate(request));
        
    } else {
        
        // Security: Block unknown origins
        console.warn('Service Worker: Blocking unknown origin:', url.origin);
        event.respondWith(
            new Response('Request blocked by service worker', { status: 403 })
        );
    }
});

// Performance: Handle message events
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        // Handle cache update requests
        updateCache(event.data.url);
    }
});

// Performance: Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Performance: Update cache for specific URL
async function updateCache(url) {
    try {
        if (!isValidUrl(url)) return;
        
        const request = new Request(url);
        const response = await fetch(request);
        
        if (response.ok) {
            await cacheWithExpiration(DYNAMIC_CACHE, request, response, CACHE_CONFIG.dynamic.maxAge);
            console.log('Cache updated for:', url);
        }
    } catch (error) {
        console.error('Cache update failed:', error);
    }
}

// Performance: Background sync
async function doBackgroundSync() {
    try {
        // Sync any pending actions
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Security: Handle push events (if needed)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        // Security: Validate push data
        if (data && typeof data === 'object' && data.title) {
            event.waitUntil(
                self.registration.showNotification(data.title, {
                    body: data.body || '',
                    icon: data.icon || '/favicon.ico',
                    badge: data.badge || '/favicon.ico',
                    tag: data.tag || 'default',
                    requireInteraction: data.requireInteraction || false,
                    actions: data.actions || []
                })
            );
        }
    }
});

// Security: Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action) {
        // Handle specific action clicks
        console.log('Notification action clicked:', event.action);
    } else {
        // Handle notification body click
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Performance: Periodic background sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-cache') {
        event.waitUntil(updateAllCaches());
    }
});

// Performance: Update all caches
async function updateAllCaches() {
    try {
        console.log('Updating all caches...');
        
        // Update static resources
        for (const resource of STATIC_RESOURCES) {
            await updateCache(resource);
        }
        
        console.log('All caches updated');
    } catch (error) {
        console.error('Cache update failed:', error);
    }
}

// Security: Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled promise rejection:', event.reason);
});

// Performance: Cleanup on termination
self.addEventListener('beforeunload', () => {
    console.log('Service Worker: Terminating...');
});

console.log('Service Worker: Hardened version loaded successfully');
