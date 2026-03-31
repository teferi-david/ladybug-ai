import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { SeoJsonLd } from '@/components/seo-json-ld'
import { getSiteUrl } from '@/lib/site-url'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ladybug AI — AI Humanizer & Humanizer AI',
    template: '%s | Ladybug AI',
  },
  description:
    'Ladybug AI humanizer: turn AI drafts into natural, human-like text. Humanizer AI for students — paste AI text, get a clearer rewrite. Free tier available.',
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
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Ladybug AI',
    title: 'AI Humanizer — Ladybug AI Humanizer & Humanizer AI',
    description:
      'Ladybug AI humanizer: AI humanizer and humanizer AI tool for natural, student-friendly rewrites. Try free.',
    images: [{ url: '/logo.jpg', width: 512, height: 512, alt: 'Ladybug AI logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ladybug AI — AI Humanizer & Humanizer AI',
    description:
      'Humanizer AI and Ladybug AI humanizer: make AI text sound natural. Free tier available.',
    images: ['/logo.jpg'],
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
        <SeoJsonLd />
        <Navbar />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <footer className="border-t border-gray-100 bg-white py-4 text-center">
          <p className="text-xs text-gray-500">
            Contact us:{' '}
            <a
              href="mailto:teferi.business@gmail.com"
              className="text-gray-600 underline underline-offset-2 hover:text-gray-900"
            >
              teferi.business@gmail.com
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
}

