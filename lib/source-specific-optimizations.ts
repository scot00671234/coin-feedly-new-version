// Source-specific optimizations for major news sources

export interface SourceConfig {
  name: string
  domain: string
  selectors: {
    title: string[]
    content: string[]
    description: string[]
    author: string[]
    publishedAt: string[]
    images: string[]
  }
  patterns: {
    title: RegExp[]
    content: RegExp[]
    description: RegExp[]
    author: RegExp[]
    publishedAt: RegExp[]
    images: RegExp[]
  }
  strategies: {
    useJavaScript?: boolean
    waitForSelector?: string
    customExtraction?: (html: string) => any
  }
  confidence: {
    base: number
    title: number
    content: number
    description: number
    author: number
    publishedAt: number
    images: number
  }
}

// Source-specific configurations
export const SOURCE_CONFIGS: Record<string, SourceConfig> = {
  'cointelegraph.com': {
    name: 'CoinTelegraph',
    domain: 'cointelegraph.com',
    selectors: {
      title: [
        'h1.article-title',
        'h1.post-title',
        'h1.entry-title',
        'h1',
        '.article-header h1',
        '.post-header h1'
      ],
      content: [
        '.post-content',
        '.article-content',
        '.entry-content',
        '[data-module="ArticleBody"]',
        '.article-body',
        '.story-content',
        'article .content',
        '.post-body'
      ],
      description: [
        '.article-description',
        '.post-excerpt',
        '.entry-summary',
        'meta[name="description"]',
        '.article-meta .description'
      ],
      author: [
        '.article-author',
        '.post-author',
        '.byline',
        '.author-name',
        '[rel="author"]'
      ],
      publishedAt: [
        '.article-date',
        '.post-date',
        '.entry-date',
        'time[datetime]',
        '.publish-date'
      ],
      images: [
        '.article-content img',
        '.post-content img',
        '.entry-content img',
        '.article-image img',
        '.post-image img'
      ]
    },
    patterns: {
      title: [
        /<h1[^>]*class="[^"]*article-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<h1[^>]*class="[^"]*post-title[^"]*"[^>]*>([^<]+)<\/h1>/i
      ],
      content: [
        /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<article[^>]*>([\s\S]*?)<\/article>/i
      ],
      description: [
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
        /<div[^>]*class="[^"]*article-description[^"]*"[^>]*>([^<]+)<\/div>/i
      ],
      author: [
        /<span[^>]*class="[^"]*article-author[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*byline[^"]*"[^>]*>([^<]+)<\/div>/i
      ],
      publishedAt: [
        /<time[^>]*datetime="([^"]*)"[^>]*>/i,
        /<span[^>]*class="[^"]*article-date[^"]*"[^>]*>([^<]+)<\/span>/i
      ],
      images: [
        /<img[^>]*src="([^"]*)"[^>]*class="[^"]*article-image[^"]*"[^>]*>/i,
        /<img[^>]*src="([^"]*)"[^>]*class="[^"]*post-image[^"]*"[^>]*>/i
      ]
    },
    strategies: {
      useJavaScript: true,
      waitForSelector: '.post-content, .article-content',
      customExtraction: (html: string) => {
        // Custom extraction logic for CoinTelegraph
        const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
        const contentMatch = html.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
        
        return {
          title: titleMatch?.[1]?.trim(),
          content: contentMatch?.[1]?.trim(),
          success: !!(titleMatch && contentMatch)
        }
      }
    },
    confidence: {
      base: 0.8,
      title: 0.9,
      content: 0.8,
      description: 0.7,
      author: 0.6,
      publishedAt: 0.7,
      images: 0.8
    }
  },
  
  'decrypt.co': {
    name: 'Decrypt',
    domain: 'decrypt.co',
    selectors: {
      title: [
        'h1.article-title',
        'h1.post-title',
        'h1',
        '.article-header h1'
      ],
      content: [
        '.article-content',
        '.post-content',
        '.entry-content',
        'article .content',
        '.story-content'
      ],
      description: [
        '.article-description',
        '.post-excerpt',
        'meta[name="description"]'
      ],
      author: [
        '.article-author',
        '.post-author',
        '.byline',
        '.author-name'
      ],
      publishedAt: [
        '.article-date',
        '.post-date',
        'time[datetime]',
        '.publish-date'
      ],
      images: [
        '.article-content img',
        '.post-content img',
        '.article-image img'
      ]
    },
    patterns: {
      title: [
        /<h1[^>]*class="[^"]*article-title[^"]*"[^>]*>([^<]+)<\/h1>/i
      ],
      content: [
        /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
      ],
      description: [
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i
      ],
      author: [
        /<span[^>]*class="[^"]*article-author[^"]*"[^>]*>([^<]+)<\/span>/i
      ],
      publishedAt: [
        /<time[^>]*datetime="([^"]*)"[^>]*>/i
      ],
      images: [
        /<img[^>]*src="([^"]*)"[^>]*class="[^"]*article-image[^"]*"[^>]*>/i
      ]
    },
    strategies: {
      useJavaScript: false,
      customExtraction: null
    },
    confidence: {
      base: 0.9,
      title: 0.95,
      content: 0.9,
      description: 0.8,
      author: 0.7,
      publishedAt: 0.8,
      images: 0.9
    }
  },
  
  'coindesk.com': {
    name: 'CoinDesk',
    domain: 'coindesk.com',
    selectors: {
      title: [
        'h1.article-title',
        'h1.post-title',
        'h1',
        '.article-header h1'
      ],
      content: [
        '.article-content',
        '.post-content',
        '.entry-content',
        'article .content'
      ],
      description: [
        '.article-description',
        '.post-excerpt',
        'meta[name="description"]'
      ],
      author: [
        '.article-author',
        '.post-author',
        '.byline'
      ],
      publishedAt: [
        '.article-date',
        '.post-date',
        'time[datetime]'
      ],
      images: [
        '.article-content img',
        '.post-content img'
      ]
    },
    patterns: {
      title: [
        /<h1[^>]*class="[^"]*article-title[^"]*"[^>]*>([^<]+)<\/h1>/i
      ],
      content: [
        /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
      ],
      description: [
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i
      ],
      author: [
        /<span[^>]*class="[^"]*article-author[^"]*"[^>]*>([^<]+)<\/span>/i
      ],
      publishedAt: [
        /<time[^>]*datetime="([^"]*)"[^>]*>/i
      ],
      images: [
        /<img[^>]*src="([^"]*)"[^>]*class="[^"]*article-image[^"]*"[^>]*>/i
      ]
    },
    strategies: {
      useJavaScript: false,
      customExtraction: null
    },
    confidence: {
      base: 0.85,
      title: 0.9,
      content: 0.85,
      description: 0.8,
      author: 0.7,
      publishedAt: 0.8,
      images: 0.85
    }
  },
  
  'bitcoinist.com': {
    name: 'Bitcoinist',
    domain: 'bitcoinist.com',
    selectors: {
      title: [
        'h1.entry-title',
        'h1.post-title',
        'h1',
        '.entry-header h1'
      ],
      content: [
        '.entry-content',
        '.post-content',
        '.article-content',
        'article .content'
      ],
      description: [
        '.entry-summary',
        '.post-excerpt',
        'meta[name="description"]'
      ],
      author: [
        '.entry-author',
        '.post-author',
        '.byline'
      ],
      publishedAt: [
        '.entry-date',
        '.post-date',
        'time[datetime]'
      ],
      images: [
        '.entry-content img',
        '.post-content img'
      ]
    },
    patterns: {
      title: [
        /<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([^<]+)<\/h1>/i
      ],
      content: [
        /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
      ],
      description: [
        /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i
      ],
      author: [
        /<span[^>]*class="[^"]*entry-author[^"]*"[^>]*>([^<]+)<\/span>/i
      ],
      publishedAt: [
        /<time[^>]*datetime="([^"]*)"[^>]*>/i
      ],
      images: [
        /<img[^>]*src="([^"]*)"[^>]*class="[^"]*entry-image[^"]*"[^>]*>/i
      ]
    },
    strategies: {
      useJavaScript: false,
      customExtraction: null
    },
    confidence: {
      base: 0.8,
      title: 0.9,
      content: 0.8,
      description: 0.7,
      author: 0.6,
      publishedAt: 0.7,
      images: 0.8
    }
  }
}

/**
 * Get source configuration for a given URL
 */
export function getSourceConfig(url: string): SourceConfig | null {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    
    // Find matching source config
    for (const [key, config] of Object.entries(SOURCE_CONFIGS)) {
      if (domain.includes(key) || key.includes(domain)) {
        return config
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Extract content using source-specific selectors
 */
export function extractWithSourceSelectors(
  html: string,
  url: string,
  config: SourceConfig
): {
  title: string
  content: string
  description: string
  author: string
  publishedAt: string
  images: string[]
  success: boolean
  confidence: number
} {
  let confidence = config.confidence.base
  let success = true
  
  // Extract title
  const title = extractField(html, config.selectors.title, config.patterns.title) || ''
  if (title) confidence += config.confidence.title
  
  // Extract content
  const content = extractField(html, config.selectors.content, config.patterns.content) || ''
  if (content) confidence += config.confidence.content
  
  // Extract description
  const description = extractField(html, config.selectors.description, config.patterns.description) || ''
  if (description) confidence += config.confidence.description
  
  // Extract author
  const author = extractField(html, config.selectors.author, config.patterns.author) || ''
  if (author) confidence += config.confidence.author
  
  // Extract published date
  const publishedAt = extractField(html, config.selectors.publishedAt, config.patterns.publishedAt) || ''
  if (publishedAt) confidence += config.confidence.publishedAt
  
  // Extract images
  const images = extractImages(html, config.selectors.images, config.patterns.images)
  if (images.length > 0) confidence += config.confidence.images
  
  // Check if extraction was successful
  if (!title || !content) {
    success = false
    confidence = 0.1
  }
  
  return {
    title,
    content,
    description,
    author,
    publishedAt,
    images,
    success,
    confidence: Math.min(confidence, 1)
  }
}

/**
 * Extract a single field using selectors and patterns
 */
function extractField(
  html: string,
  selectors: string[],
  patterns: RegExp[]
): string | null {
  // Try selectors first (if we had a DOM parser)
  // For now, we'll use regex patterns
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  return null
}

/**
 * Extract images using selectors and patterns
 */
function extractImages(
  html: string,
  selectors: string[],
  patterns: RegExp[]
): string[] {
  const images: string[] = []
  
  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      if (match[1]) {
        images.push(match[1])
      }
    }
  }
  
  // Also extract all img tags as fallback
  const imgPattern = /<img[^>]*src="([^"]*)"[^>]*>/gi
  const imgMatches = html.matchAll(imgPattern)
  for (const match of imgMatches) {
    if (match[1] && !images.includes(match[1])) {
      images.push(match[1])
    }
  }
  
  return images
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Check if a source requires JavaScript
 */
export function requiresJavaScript(url: string): boolean {
  const config = getSourceConfig(url)
  return config?.strategies.useJavaScript || false
}

/**
 * Get wait selector for JavaScript sources
 */
export function getWaitSelector(url: string): string | null {
  const config = getSourceConfig(url)
  return config?.strategies.waitForSelector || null
}

/**
 * Get custom extraction function for a source
 */
export function getCustomExtraction(url: string): ((html: string) => any) | null {
  const config = getSourceConfig(url)
  return config?.strategies.customExtraction || null
}
