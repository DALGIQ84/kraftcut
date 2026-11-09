// KRAFTCUT: кешира програмата, за да работи и без интернет след инсталиране.
var CACHE = 'kraftcut-v11';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Първо от мрежата (винаги най-новата версия от GitHub), а ако няма интернет или е бавно - от кеша.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request, { cache: 'no-cache' }).then(function (r) {
        if (r && (r.status === 200 || r.type === 'opaque')) c.put(e.request, r.clone());
        return r;
      });
      if (!hit) return net;
      var timeout = new Promise(function (res) { setTimeout(function () { res(hit); }, 3000); });
      return Promise.race([net.catch(function () { return hit; }), timeout]);
    });
  }));
});
