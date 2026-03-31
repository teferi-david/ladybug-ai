import { getSiteUrl } from '@/lib/site-url'
import { buildSitemapXml, xmlSitemapResponse } from '@/lib/sitemap-xml'

/**
 * Single-URL sitemap for the AI Humanizer landing page.
 * Submit in Google Search Console: https://YOUR_DOMAIN/sitemap-ai-humanizer.xml
 */
export async function GET() {
  const base = getSiteUrl()
  const xml = buildSitemapXml([
    {
      loc: `${base}/ai-humanizer`,
      changefreq: 'weekly',
      priority: '0.99',
    },
  ])
  return xmlSitemapResponse(xml)
}
