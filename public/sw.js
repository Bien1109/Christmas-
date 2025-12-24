self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("noel-3d").then(cache => {
      return cache.addAll(["/", "/index.html", "/christmas.mp3"]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      return resp || fetch(e.request);
    })
  );
});
