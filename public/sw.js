/**
 * Service Worker for offline support
 * 
 * 기본적인 오프라인 캐싱을 제공합니다.
 * MVP 단계에서는 기본 페이지만 캐싱합니다.
 */

const CACHE_NAME = 'campx-v2'; // 버전 업데이트로 Service Worker 재등록 강제
const urlsToCache = [
  '/',
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - 캐시 생성
self.addEventListener('install', (event) => {
  // 새 버전이 설치되면 즉시 활성화
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  // 즉시 클라이언트 제어권 획득
  event.waitUntil(
    Promise.all([
      // 오래된 캐시 삭제
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // 모든 클라이언트에 즉시 적용
      self.clients.claim(),
    ])
  );
});

// Fetch event - 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 개발 모드 리소스는 Service Worker가 처리하지 않음
  // - Next.js HMR WebSocket
  // - Next.js 개발 서버 리소스 (_next/static)
  // - WebSocket 프로토콜
  if (
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/__nextjs_')
  ) {
    return; // Service Worker가 가로채지 않음
  }
  
  // non-GET 요청은 Service Worker가 처리하지 않음
  if (event.request.method !== 'GET') {
    return; // 네트워크 요청만 처리, 캐시하지 않음
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 응답이 유효하면 캐시에 저장 (GET 요청만)
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 찾기 (GET 요청만)
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
