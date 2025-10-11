import Parser from 'rss-parser'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure', { keepArray: true }],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['summary', 'summary'],
    ],
  },
  timeout: 10000, // 10 second timeout for better image extraction
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
})

export interface RSSFeedItem {
  title?: string
  description?: string
  content?: string
  contentEncoded?: string
  summary?: string
  link?: string
  pubDate?: string
  enclosure?: any[]
  mediaContent?: any[]
  mediaThumbnail?: any[]
}

export interface RSSFeed {
  title: string
  description?: string
  link: string
  items: RSSFeedItem[]
}

export async function parseRSSFeed(url: string): Promise<RSSFeed> {
  try {
    const feed = await parser.parseURL(url)
    
    if (!feed) {
      throw new Error('No feed data received')
    }
    
    return {
      title: feed.title || 'Untitled Feed',
      description: feed.description || '',
      link: feed.link || url,
      items: Array.isArray(feed.items) ? feed.items : [],
    }
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error)
    // Return empty feed instead of throwing to prevent app crashes
    return {
      title: 'Error Feed',
      description: 'Failed to load feed',
      link: url,
      items: [],
    }
  }
}

export function extractImageUrl(item: RSSFeedItem): string | undefined {
  try {
    console.log(`Extracting image for: "${item.title?.substring(0, 50)}..."`)
    
    // Helper function to clean and validate URLs
    const cleanUrl = (url: string, baseUrl?: string): string | null => {
      if (!url) return null
      
      // Remove quotes and clean up
      url = url.replace(/['"]/g, '').trim()
      
      // Handle relative URLs
      if (url.startsWith('//')) {
        url = 'https:' + url
      } else if (url.startsWith('/') && baseUrl) {
        try {
          const base = new URL(baseUrl)
          url = base.origin + url
        } catch (e) {
          return null
        }
      }
      
      // Validate URL
      try {
        const parsed = new URL(url)
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          return url
        }
      } catch (e) {
        return null
      }
      
      return null
    }

    // Helper function to extract images from HTML content
    const extractFromHtml = (html: string, baseUrl?: string): string | null => {
      if (!html) return null
      
      // Multiple patterns for different HTML structures
      const patterns = [
        /<img[^>]+src="([^"]+)"/gi,
        /<img[^>]+src='([^']+)'/gi,
        /<img[^>]+src=([^\s>]+)/gi,
        /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi,
        /<figure[^>]*>.*?<img[^>]+src="([^"]+)"/gi,
        /<picture[^>]*>.*?<img[^>]+src="([^"]+)"/gi
      ]
      
      for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
          const url = cleanUrl(match[1], baseUrl)
          if (url && url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
            console.log('Found image in HTML:', url)
            return url
          }
        }
      }
      
      return null
    }

    // 1. Media content (highest quality)
    if (item.mediaContent && Array.isArray(item.mediaContent)) {
      for (const media of item.mediaContent) {
        if (media?.url) {
          const url = cleanUrl(media.url, item.link)
          if (url && (media.type?.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
            console.log('Found image in mediaContent:', url)
            return url
          }
        }
      }
    }

    // 2. Media thumbnail
    if (item.mediaThumbnail && Array.isArray(item.mediaThumbnail)) {
      for (const thumbnail of item.mediaThumbnail) {
        if (thumbnail?.url) {
          const url = cleanUrl(thumbnail.url, item.link)
          if (url) {
            console.log('Found image in mediaThumbnail:', url)
            return url
          }
        }
      }
    }

    // 3. Enclosure (attachments)
    if (item.enclosure && Array.isArray(item.enclosure)) {
      for (const enc of item.enclosure) {
        if (enc?.url) {
          const url = cleanUrl(enc.url, item.link)
          if (url && (enc.type?.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
            console.log('Found image in enclosure:', url)
            return url
          }
        }
      }
    }

    // 4. Extract from contentEncoded (often has better images)
    if (item.contentEncoded) {
      const url = extractFromHtml(item.contentEncoded, item.link)
      if (url) return url
    }

    // 5. Extract from content
    if (item.content) {
      const url = extractFromHtml(item.content, item.link)
      if (url) return url
    }

    // 6. Extract from description
    if (item.description) {
      const url = extractFromHtml(item.description, item.link)
      if (url) return url
    }

    // 7. Extract from summary
    if (item.summary) {
      const url = extractFromHtml(item.summary, item.link)
      if (url) return url
    }

    // 8. Try to find any image URL in all text content
    const allText = [
      item.title || '',
      item.description || '',
      item.content || '',
      item.contentEncoded || '',
      item.summary || ''
    ].join(' ')
    
    const urlMatch = allText.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s"'<>]*)?/gi)
    if (urlMatch) {
      for (const match of urlMatch) {
        const url = cleanUrl(match, item.link)
        if (url) {
          console.log('Found image URL in text content:', url)
          return url
        }
      }
    }

    console.log('No image found for:', item.title?.substring(0, 30))
    return undefined

  } catch (error) {
    console.error('Error extracting image URL:', error)
    return undefined
  }
}