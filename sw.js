const CACHE_NAME = 'warnehold-shell-v4';
const SHELL = ['/index.html','/warnehold-major-update.css','/warnehold-major-update.js','/assets/warnehold-bg-auth.svg','/assets/warnehold-bg-world.svg','/assets/warnehold-bg-battle.svg','/assets/warnehold-bg-shop.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('warnehold-shell-') && k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

async function networkFirst(request, timeoutMs) {
  const cache = await caches.open(CACHE_NAME);
  const network = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('network-timeout')), timeoutMs));
  try {
    return await Promise.race([network, timeout]);
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(new Request('/index.html', {method:'GET', credentials:'same-origin', cache:'no-store'}), 3500)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || networkFirst(request, 3500))
  );
});
