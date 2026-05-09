// Product/Offer schema generator for deal pages.
// Renders to JSON-LD <script type="application/ld+json"> tag.

interface SchemaDeal {
  id: number
  title: string
  description?: string | null
  image_url?: string | null
  deal_price: number
  original_price?: number | null
  country?: string
  expires_at?: string | null
  retailer_name?: string
  is_active?: boolean
  upvote_count?: number
  downvote_count?: number
  comment_count?: number
}

export function buildProductSchema(deal: SchemaDeal): object {
  const currency = deal.country === 'CA' ? 'CAD' : 'USD'

  // Aggregate rating from votes if we have any
  const totalVotes = (deal.upvote_count || 0) + (deal.downvote_count || 0)
  const ratingValue = totalVotes > 0
    ? 3 + 2 * ((deal.upvote_count || 0) / totalVotes)
    : null

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": deal.title,
    "description": deal.description || `${deal.title} — available now at ${deal.retailer_name || 'a featured retailer'}.`,
    "image": deal.image_url || 'https://daily.deals/icon.svg',
    "offers": {
      "@type": "Offer",
      "url": `https://daily.deals/deal/${deal.id}`,
      "priceCurrency": currency,
      "price": deal.deal_price,
      "availability": deal.is_active === false
        ? "https://schema.org/Discontinued"
        : "https://schema.org/InStock",
      ...(deal.expires_at && { "priceValidUntil": deal.expires_at }),
      ...(deal.retailer_name && {
        "seller": { "@type": "Organization", "name": deal.retailer_name }
      }),
    },
  }

  if (ratingValue !== null && totalVotes >= 3) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": ratingValue.toFixed(1),
      "reviewCount": totalVotes + (deal.comment_count || 0),
      "bestRating": 5,
      "worstRating": 1,
    }
  }

  return schema
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url,
    })),
  }
}
