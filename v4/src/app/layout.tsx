import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Wedding RSVP Platform',
    template: '%s | Wedding RSVP Platform'
  },
  description: 'Complete wedding RSVP management system with guest management, communication tools, and accommodation booking.',
  keywords: ['wedding', 'rsvp', 'guest management', 'wedding planning', 'event management'],
  authors: [{ name: 'Wedding RSVP Platform' }],
  creator: 'Wedding RSVP Platform',
  metadataBase: new URL('https://wedding-rsvp-platform.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wedding-rsvp-platform.vercel.app',
    title: 'Wedding RSVP Platform',
    description: 'Complete wedding RSVP management system with guest management, communication tools, and accommodation booking.',
    siteName: 'Wedding RSVP Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Wedding RSVP Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wedding RSVP Platform',
    description: 'Complete wedding RSVP management system with guest management, communication tools, and accommodation booking.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#D4AF37',
      },
    ],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D4AF37' },
    { media: '(prefers-color-scheme: dark)', color: '#D4AF37' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}