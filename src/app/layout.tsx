import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'EDUPLAY KOREA - 배움이 놀이가 되는 순간',
    template: '%s | EDUPLAY KOREA',
  },
  description: '2022 개정 교육과정 기반 AI 학습 게임 포털. 15가지 이상의 게임 모드로 재미있게 공부하세요!',
  keywords: ['교육', '학습', '게임', '퀴즈', 'AI', '초등교육', '에듀테크', 'EDUPLAY'],
  authors: [{ name: 'EDUPLAY KOREA' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'EDUPLAY KOREA - 배움이 놀이가 되는 순간',
    description: '2022 개정 교육과정 기반 AI 학습 게임 포털',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'EDUPLAY KOREA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDUPLAY KOREA',
    description: '배움이 놀이가 되는 순간',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
