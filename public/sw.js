// Offline shell for the staff console. Caches only static assets and page shells;
// API responses (/api/*) are never cached here, so account data stays in the
// sign-out-wiped SQLite database instead.
const CACHE = "amortrav-shell-v1";
const SHELLS = ["/console", "/sign-in"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Every console section renders from the same client workspace.
    if (request.mode === "navigate") {
      const shell = await caches.match("/console");
      if (shell) return shell;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/sqlite/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/fonts/")
  ) {
    event.respondWith(cacheFirst(request));
  } else if (
    url.pathname.startsWith("/console") ||
    SHELLS.includes(url.pathname) ||
    url.pathname === "/offline-db.worker.mjs"
  ) {
    event.respondWith(networkFirst(request));
  }
});
