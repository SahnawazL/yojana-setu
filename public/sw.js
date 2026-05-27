/* ============================================================
   YojanaSahay — Service Worker  (sw.js)
   Place this file in: public/sw.js
   ============================================================ */

const CACHE_NAME = "yojanasahay-v1";

/* Files to cache immediately on install */
const PRE_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

/* ── Install: cache app shell ─────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting(); /* activate immediately */
});

/* ── Activate: remove old caches ─────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: network-first, fall back to cache ────────────── */
self.addEventListener("fetch", (event) => {
  /* Only handle GET requests */
  if (event.request.method !== "GET") return;

  /* Skip Firebase, Groq API, and other external calls —
     let them go straight to the network                   */
  const url = new URL(event.request.url);
  const isExternal =
    url.hostname.includes("firebase") ||
    url.hostname.includes("firestore") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("groq") ||
    url.hostname.includes("emailjs");

  if (isExternal) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        /* Cache a copy of every successful response */
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) =>
          cache.put(event.request, responseClone)
        );
        return networkResponse;
      })
      .catch(() =>
        /* Network failed — serve from cache */
        caches.match(event.request).then(
          (cached) => cached || caches.match("/index.html")
        )
      )
  );
});
