
const CACHE_NAME = "rl-assistant-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(["/", "/index.html", "/style.css", "/app.js"])
    )
  );
});

self.addEventListener("fetch", event => {
  if (event.request.url.includes("/api/chat")) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
