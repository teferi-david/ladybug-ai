import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings'],
      },
    ],
    sitemap: [
      `${base}/sitemap.xml`,
      `${base}/sitemap-ai-humanizer.xml`,
      `${base}/sitemap-bypass-turnitin.xml`,
    ],
  }
}
