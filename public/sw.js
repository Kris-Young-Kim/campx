/**
 * Service Worker for offline support
 * 
 * 기본적인 오프라인 캐싱을 제공합니다.
 * MVP 단계에서는 기본 페이지만 캐싱합니다.
 */

const CACHE_NAME = 'campx-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - 캐시 생성
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 응답이 유효하면 캐시에 저장
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 찾기
        return caches.match(event.request).then((response) => {
          // 캐시에도 없으면 오프라인 페이지로 리다이렉트
          if (!response && event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return response;
        });
      })
  );
});
