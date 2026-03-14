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
  title: '자연스런 캠핑장',
  description: '충청북도 제천의 청정 자연 속 자연스런 캠핑장. 큐어피쉬 체험, 임산물 체험, 바람골길 맑은 공기 체험 등 특별한 자연 체험 프로그램을 경험하세요.',
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
          <meta name="apple-mobile-web-app-title" content="자연스런 캠핑장" />
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
