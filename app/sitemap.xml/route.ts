import { getSiteUrl } from '@/lib/site-url'

/** Escape for XML text content (URLs can contain & etc.) */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

type Entry = { loc: string; changefreq: string; priority: string }

function buildSitemapXml(entries: Entry[]): string {
  const lastmod = new Date().toISOString().split('T')[0]
  const body = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`
}

/**
 * Explicit XML sitemap so crawlers always receive application/xml (not an HTML shell).
 * Submit https://YOUR_DOMAIN/sitemap.xml in Google Search Console.
 */
export async function GET() {
  const base = getSiteUrl()

  const entries: Entry[] = [
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

  const xml = buildSitemapXml(entries)

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
