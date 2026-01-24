/**
 * @file service-worker-register.tsx
 * @description Service Worker 등록 컴포넌트
 *
 * 클라이언트 사이드에서 Service Worker를 등록합니다.
 */

'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
