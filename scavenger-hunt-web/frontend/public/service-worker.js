// Minimal offline cache: caches the app shell so clue text and challenge
// descriptions still load with no signal in the Gothic Quarter. Submissions
// (which need the network) are NOT cached — they'll simply fail with a
// visible error until connectivity returns, by design (no silent data loss).

const CACHE_NAME = "bcn-hunt-shell-v1";
const SHELL_FILES = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  // Network-first for API calls; cache-first for everything else (app shell, assets).
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
