import { getSiteUrl } from '@/lib/site-url'
import { buildSitemapXml, xmlSitemapResponse, type SitemapEntry } from '@/lib/sitemap-xml'

/**
 * Main sitemap. Submit https://YOUR_DOMAIN/sitemap.xml in Google Search Console.
 */
export async function GET() {
  const base = getSiteUrl()

  const entries: SitemapEntry[] = [
    { loc: base, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/ai-humanizer`, changefreq: 'weekly', priority: '0.98' },
    { loc: `${base}/bypass-turnitin`, changefreq: 'weekly', priority: '0.95' },
    { loc: `${base}/pricing`, changefreq: 'monthly', priority: '0.9' },
    { loc: `${base}/paraphraser`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${base}/citation`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${base}/register`, changefreq: 'monthly', priority: '0.55' },
    { loc: `${base}/login`, changefreq: 'monthly', priority: '0.45' },
    { loc: `${base}/forgot-password`, changefreq: 'yearly', priority: '0.25' },
  ]

  return xmlSitemapResponse(buildSitemapXml(entries))
}
