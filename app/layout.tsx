import React from "react"
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegister } from '@/src/app/service-worker-register'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CampX - AI 기반 캠핑 DX 솔루션',
  description: 'AI 스케줄러, 3D 캠핑 맵, 스마트 체크인으로 더 편리한 캠핑을 경험하세요.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="CampX" />
        </head>
        <body className={`font-sans antialiased`}>
          {children}
          <Analytics />
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  )
}
