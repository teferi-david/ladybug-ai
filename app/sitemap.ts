import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const lastModified = new Date()

  const paths = [
    '',
    '/pricing',
    '/login',
    '/register',
    '/forgot-password',
    '/paraphraser',
    '/citation',
  ]

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
    priority: path === '' ? 1 : path === '/pricing' ? 0.9 : 0.6,
  }))
}
