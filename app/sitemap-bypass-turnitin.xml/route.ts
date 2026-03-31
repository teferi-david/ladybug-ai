import { getSiteUrl } from '@/lib/site-url'
import { buildSitemapXml, xmlSitemapResponse } from '@/lib/sitemap-xml'

/**
 * Single-URL sitemap for the Bypass Turnitin guide landing page.
 * Submit in Google Search Console: https://YOUR_DOMAIN/sitemap-bypass-turnitin.xml
 */
export async function GET() {
  const base = getSiteUrl()
  const xml = buildSitemapXml([
    {
      loc: `${base}/bypass-turnitin`,
      changefreq: 'weekly',
      priority: '0.99',
    },
  ])
  return xmlSitemapResponse(xml)
}
