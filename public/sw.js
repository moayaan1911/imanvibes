const STATIC_CACHE = "imanvibes-static-v2";
const RUNTIME_CACHE = "imanvibes-runtime-v2";
const OFFLINE_ASSETS = [
  "/",
  "/quran",
  "/hadith",
  "/names",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

async function cacheResponse(cacheName, request, response) {
  if (!response || !response.ok || request.method !== "GET") {
    return response;
  }

  const cache = await caches.open(cacheName);
  cache.put(request, response.clone()).catch(() => {});
  return response;
}

function shouldBypass(request, url) {
  const accept = request.headers.get("accept") || "";

  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_vercel/") ||
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.searchParams.has("_rsc") ||
    request.headers.has("RSC") ||
    request.headers.has("Next-Router-State-Tree") ||
    accept.includes("text/x-component")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(OFFLINE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (shouldBypass(request, url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(RUNTIME_CACHE, request, response))
        .catch(async () => {
          const cachedPage =
            (await caches.match(request)) || (await caches.match("/"));
          return cachedPage || Response.error();
        }),
    );
    return;
  }

  if (
    ["style", "script", "font", "image"].includes(request.destination) ||
    url.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((networkResponse) =>
            cacheResponse(
              request.destination === "image" ? STATIC_CACHE : RUNTIME_CACHE,
              request,
              networkResponse,
            ),
          )
          .catch(() => cachedResponse);

        if (cachedResponse) {
          event.waitUntil(networkFetch);
          return cachedResponse;
        }

        return networkFetch;
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) =>
        cacheResponse(RUNTIME_CACHE, request, networkResponse),
      );
    }),
  );
});
