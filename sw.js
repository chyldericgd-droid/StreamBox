/* Relative-path service worker for plain static hosting and project subdirectories. */
const CACHE_NAME = "streambox-congo-v5-3";
const BASE_URL = new URL("./", self.registration.scope);
const CORE_FILES = [
  new URL("./", BASE_URL).href,
  new URL("./index.html", BASE_URL).href,
  new URL("./manifest.webmanifest", BASE_URL).href
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("streambox-congo-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  const basePath = new URL(BASE_URL).pathname;
  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(basePath)) return;
  // Trends are dynamic; let the browser reach the API instead of returning a stale cached response.
  if (requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(request)) || (await cache.match(new URL("./index.html", BASE_URL).href)) || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
