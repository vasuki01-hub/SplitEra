self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('splitera-cache').then((cache) => cache.addAll([
      './', './index.html',  // add all your files here
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});