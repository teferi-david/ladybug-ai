import { getSiteUrl } from '@/lib/site-url'

/**
 * schema.org JSON-LD for brand + web app — helps search engines understand the product.
 */
export function SeoJsonLd() {
  const base = getSiteUrl()

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Ladybug AI',
        url: base,
        description:
          'Ladybug AI builds an AI humanizer and writing tools so AI-generated text reads naturally.',
      },
      {
        '@type': 'WebSite',
        name: 'Undetectable AI Humanizer: Ladybug AI',
        url: base,
        description:
          'Humanizer AI for students and writers: paste AI text and get a natural, human-style rewrite.',
        publisher: { '@type': 'Organization', name: 'Ladybug AI', url: base },
      },
      {
        '@type': 'WebApplication',
        name: 'Ladybug AI Humanizer',
        url: base,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier with optional Pro subscription for higher limits.',
        },
        description:
          'Rewrite AI-generated drafts into natural, human-like wording. Humanizer AI and Ladybug AI humanizer for clearer essays and papers.',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
