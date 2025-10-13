// SEO utility functions for articles

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100) // Limit length for SEO
}

export function generateSEOTitle(title: string, category: string): string {
  const categoryKeywords = {
    'bitcoin': 'Bitcoin News & Analysis',
    'altcoins': 'Altcoin Updates & Price Analysis',
    'defi': 'DeFi Protocol News & Updates',
    'macro': 'Crypto Market Analysis & Trends',
    'trading': 'Cryptocurrency Trading News',
    'blockchain': 'Blockchain Technology Updates'
  }

  const categoryText = categoryKeywords[category.toLowerCase() as keyof typeof categoryKeywords] || 'Crypto News'
  
  // If title is already SEO optimized, return as is
  if (title.length > 60) {
    return `${title} | ${categoryText}`
  }
  
  return `${title} | ${categoryText}`
}

export function generateSEODescription(description: string, category: string): string {
  const categoryPrefixes = {
    'bitcoin': 'Latest Bitcoin news, price analysis, and market updates. Stay informed with expert insights on Bitcoin trends and developments.',
    'altcoins': 'Comprehensive altcoin news and analysis. Get the latest updates on Ethereum, Solana, and other major cryptocurrencies.',
    'defi': 'DeFi protocol news, yield farming updates, and decentralized finance analysis. Stay ahead of the DeFi revolution.',
    'macro': 'Crypto market analysis, regulatory updates, and macroeconomic trends affecting cryptocurrency prices and adoption.',
    'trading': 'Cryptocurrency trading news, technical analysis, and market insights for traders and investors.',
    'blockchain': 'Blockchain technology updates, network upgrades, and enterprise adoption news in the crypto space.'
  }

  const prefix = categoryPrefixes[category.toLowerCase() as keyof typeof categoryPrefixes] || 'Latest cryptocurrency news and analysis.'
  
  if (description && description.length > 100) {
    return description.substring(0, 150) + '...'
  }
  
  return description || prefix
}

export function generateKeywords(title: string, category: string, description?: string): string[] {
  const baseKeywords = [
    'crypto news',
    'cryptocurrency',
    'blockchain',
    'crypto market',
    'crypto analysis'
  ]

  const categoryKeywords = {
    'bitcoin': ['bitcoin news', 'bitcoin price', 'bitcoin analysis', 'btc news', 'bitcoin updates'],
    'altcoins': ['altcoin news', 'ethereum news', 'solana news', 'altcoin price', 'crypto altcoins'],
    'defi': ['defi news', 'decentralized finance', 'defi protocols', 'yield farming', 'defi analysis'],
    'macro': ['crypto market analysis', 'crypto trends', 'market outlook', 'crypto regulation', 'macro crypto'],
    'trading': ['crypto trading', 'trading analysis', 'crypto signals', 'trading news', 'crypto investment'],
    'blockchain': ['blockchain news', 'blockchain technology', 'blockchain updates', 'distributed ledger', 'blockchain innovation']
  }

  const titleKeywords = title
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)

  const descriptionKeywords = description
    ? description
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
    : []

  const categorySpecific = categoryKeywords[category.toLowerCase() as keyof typeof categoryKeywords] || []

  return [
    ...baseKeywords,
    ...categorySpecific,
    ...titleKeywords,
    ...descriptionKeywords
  ].slice(0, 15) // Limit to 15 keywords for SEO
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function generateArticleSchema(article: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.featuredImage || article.imageUrl,
    author: {
      '@type': 'Person',
      name: article.author || article.source?.name || 'Unknown'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coin Feedly',
      logo: {
        '@type': 'ImageObject',
        url: 'https://coinfeedly.com/icon.svg'
      }
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coinfeedly.com/article/${article.slug}`
    },
    keywords: article.keywords?.join(', ') || '',
    wordCount: article.content ? article.content.split(' ').length : 0,
    timeRequired: article.readingTime ? `PT${article.readingTime}M` : undefined,
    about: {
      '@type': 'Thing',
      name: article.category
    }
  }
}
