import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free AI Humanizer - Best AI Tool for Students | Ladybug AI',
  description: 'Free AI Humanizer for students! Make AI text sound human, paraphrase essays, and generate citations. The best AI writing assistant for students. Try free - no credit card required.',
  keywords: 'free ai humanizer, ai humanizer free, best ai tool for students, ai writing assistant, paraphraser, citation generator, humanize ai text, student writing tools',
  openGraph: {
    title: 'Free AI Humanizer - Best AI Tool for Students',
    description: 'Transform AI-generated text into natural, human-like writing. Free trial for students!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Humanizer for Students',
    description: 'Make AI text sound human. Free AI writing tools for students.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}

