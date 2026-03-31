import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

/**
 * Sitemap for Google Search Console and other crawlers.
 * Includes /ai-humanizer and / for "AI humanizer" queries + other key URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const now = new Date()

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/ai-humanizer`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.98,
    },
    {
      url: `${base}/bypass-turnitin`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/paraphraser`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${base}/citation`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${base}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.55,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.45,
    },
    {
      url: `${base}/forgot-password`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.25,
    },
  ]
}
