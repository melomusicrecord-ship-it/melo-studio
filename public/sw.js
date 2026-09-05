// MELO STUDIO HUB - Offline Service Worker (v2)
// Provides 100% offline-first reliability for studio production, IndexedDB and cached assets.

const CACHE_NAME = 'melo-studio-hub-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
];

// Install: precache primary shell assets and take control immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[MeloStudio SW] Pré-armazenando recursos base offline...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[MeloStudio SW] Aviso no precache inicial:', err);
        return self.skipWaiting();
      })
  );
});

// Activate: clean up outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log('[MeloStudio SW] Removendo cache antigo:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Smart offline fallback strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET') {
    return;
  }
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          console.log('[MeloStudio SW] Sem internet detectado: servindo App Shell do cache');
          const cache = await caches.open(CACHE_NAME);
          const cachedHtml = (await cache.match(request)) || (await cache.match('/index.html')) || (await cache.match('/'));
          if (cachedHtml) {
            return cachedHtml;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="utf-8" />
              <title>MELO STUDIO HUB - Modo Offline</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <style>
                body { background: #09090b; color: #f4f4f5; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
                .card { background: #121215; border: 1px solid #27272a; padding: 32px; border-radius: 16px; max-width: 420px; }
                h1 { color: #f59e0b; margin-top: 0; font-size: 20px; }
                p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
                button { background: #f59e0b; color: #09090b; border: 0; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-top: 16px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>🎛️ MELO STUDIO HUB • Modo Offline</h1>
                <p>O aplicativo está operando sem conexão de rede. Seus projetos e configurações locais no IndexedDB continuam salvos e acessíveis.</p>
                <button onclick="window.location.reload()">Recarregar Estúdio</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. API Routes: Network first, with JSON offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            status: 'offline',
            message: 'O servidor backend está offline. A base local de dados e conhecimento do estúdio está sendo utilizada.',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 3. Static Assets (Scripts, Styles, Fonts, Icons, SVGs, Images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate for background freshness
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If it's an image or icon that failed, return the cached icon.svg if available
          if (request.destination === 'image') {
            return caches.match('/icon.svg');
          }
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});

// Client message listener for manual cache sync / status check
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_CURRENT_ASSETS') {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(urls).then(() => {
        if (event.source) {
          event.source.postMessage({ type: 'PRECACHE_COMPLETE', count: urls.length });
        }
      });
    });
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
