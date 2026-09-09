/* Funcionamiento sin conexión, pero sin quedarse congelada.
 *
 * La app (el HTML) se pide PRIMERO a la red: así una versión nueva llega
 * sola en cuanto haya señal. Si no hay conexión, se sirve la copia
 * guardada y todo sigue funcionando en el gimnasio.
 *
 * El resto (iconos, manifest) se sirve desde la copia al instante y se
 * refresca en segundo plano.
 *
 * Antes esto era «copia primero» para todo, y la app instalada no se
 * actualizaba nunca.
 */
const VERSION = "2026.09.09-2";
const CACHE   = "barra-" + VERSION;
const ASSETS  = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-maskable.svg"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(() => {})            // sin conexión al instalar: no bloquea
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data === "version" && e.source) e.source.postMessage({ version: VERSION });
});

function pideHTML(req) {
  return req.mode === "navigate" ||
         (req.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;

  // La app: red primero, copia como respaldo.
  if (pideHTML(req)) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  // Lo demás: copia al instante, y se refresca por detrás.
  e.respondWith(
    caches.match(req).then(hit => {
      const red = fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
          return res;
        })
        .catch(() => hit);
      return hit || red;
    })
  );
});
