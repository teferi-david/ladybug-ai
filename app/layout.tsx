import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SiteChrome } from '@/components/site-chrome'
import { SeoJsonLd } from '@/components/seo-json-ld'
import { getSiteUrl } from '@/lib/site-url'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Undetectable AI Humanizer: Ladybug AI',
    template: '%s | Ladybug AI',
  },
  description:
    'Ladybug AI humanizer turns stiff AI drafts into text that sounds human. Paste your draft, get a cleaner rewrite. Free tier included.',
  applicationName: 'Ladybug AI',
  keywords: [
    'ai humanizer',
    'humanizer ai',
    'ladybug ai humanizer',
    'humanizer ai',
    'ladybug ai',
    'humanize ai text',
    'rewrite ai text',
    'ai text humanizer',
  ],
  authors: [{ name: 'Ladybug AI' }],
  creator: 'Ladybug AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // Favicons: 32/48 PNG first so Chrome tabs don’t downscale a 192px asset; ICO is 16+32 only (see generate-favicons).
  icons: {
    icon: [
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    shortcut: '/icon-32.png',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Ladybug AI',
    title: 'Undetectable AI Humanizer: Ladybug AI',
    description:
      'Ladybug AI humanizer: AI humanizer and humanizer AI tool for natural, student-friendly rewrites. Try free.',
    // Opaque JPEG for link previews (Google/social); in-app brand mark is transparent /logo.png.
    images: [{ url: '/logo.jpg', width: 512, height: 512, alt: 'Ladybug AI logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Undetectable AI Humanizer: Ladybug AI',
    description:
      'Humanizer AI and Ladybug AI humanizer: make AI text sound natural. Free tier available.',
    images: ['/logo.jpg'],
  },
  /** Renders <meta name="google-adsense-account" content="..."> in <head> (site-wide). */
  other: {
    'google-adsense-account': 'ca-pub-6972924983170533',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        {/* Google AdSense: loads in document head (beforeInteractive). Site-wide via root layout. */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6972924983170533"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <SeoJsonLd />
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  )
}

