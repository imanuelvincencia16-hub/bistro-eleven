/* Bistro Eleven service worker. */
const CACHE = "bistro-eleven-v2";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/manifest.id.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon.svg"
];
const CDN = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|images\.unsplash\.com|plus\.unsplash\.com)$/;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(SHELL.map(u => c.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

const save = (req, res) =>
  res && res.ok && (new URL(req.url).origin === self.location.origin || CDN.test(new URL(req.url).hostname))
    ? caches.open(CACHE).then(c => c.put(req, res.clone())).catch(() => {})
    : undefined;

const cacheFirst = async req => {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  save(req, res);
  return res;
};

const networkFirst = async req => {
  try {
    const res = await fetch(req);
    save(req, res);
    return res;
  } catch (err) {
    const hit = await caches.match(req);
    if (hit) return hit;
    if (req.mode === "navigate" || req.destination === "document") {
      const shell = (await caches.match("/index.html")) || (await caches.match("/"));
      if (shell) return shell;
    }
    throw err;
  }
};

const revalidate = async req => {
  const hit = await caches.match(req);
  const fresh = fetch(req).then(res => { save(req, res); return res; }).catch(() => null);
  return hit || (await fresh) || Response.error();
};

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const local = url.origin === self.location.origin;
  if (!local && !CDN.test(url.hostname)) return;

  if (req.mode === "navigate" || req.destination === "document") { e.respondWith(networkFirst(req)); return; }
  if (local && url.pathname.startsWith("/assets/")) { e.respondWith(cacheFirst(req)); return; }
  if (!local) { e.respondWith(revalidate(req)); return; }
  e.respondWith(networkFirst(req));
});

self.addEventListener("message", e => {
  if (e.data === "skip-waiting") self.skipWaiting();
});
