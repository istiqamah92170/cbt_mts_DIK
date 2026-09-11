/* Service Worker GuruAI Builder — minimal, dua tujuan:
   1) Syarat wajib Chrome supaya aplikasi bisa "Install"/Tambah ke Layar
      Utama (situs yang di-install jauh lebih aman dari penghapusan data
      otomatis dibanding tab/bookmark biasa).
   2) Cache dasar supaya halaman tetap bisa dibuka walau sedang tidak ada
      koneksi internet (data guru sendiri tetap di IndexedDB, bukan di sini).
   TIDAK menyimpan/mengubah data guru sama sekali — murni file aplikasi. */

const CACHE_NAME = 'guruai-builder-v1';
const FILE_UTAMA = './guruai_builder_v1.html';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(FILE_UTAMA).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        /* Simpan salinan terbaru ke cache supaya offline-nya selalu versi terbaru yang pernah dibuka */
        const salinan = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, salinan)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
