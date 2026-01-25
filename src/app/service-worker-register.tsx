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
      // 개발 모드에서는 Service Worker 비활성화 (선택적)
      // 환경 변수로 제어 가능: NEXT_PUBLIC_ENABLE_SW=false
      const enableSW = process.env.NEXT_PUBLIC_ENABLE_SW !== 'false';
      const isDev = process.env.NODE_ENV === 'development';
      
      // 개발 모드에서 기본적으로 비활성화 (선택적)
      if (isDev && !enableSW) {
        // 기존 Service Worker 해제
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log('Service Worker unregistered in development mode');
          });
        });
        return;
      }
      
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
            
            // Service Worker 업데이트 확인
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 새 버전이 설치되었으면 페이지 새로고침
                    console.log('New Service Worker installed, reloading...');
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
        
        // 주기적으로 업데이트 확인
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        }
      });
    }
  }, []);

  return null;
}
