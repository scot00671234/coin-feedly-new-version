import Parser from 'rss-parser'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure', { keepArray: true }],
    ],
  },
})

export interface RSSFeedItem {
  title?: string
  description?: string
  content?: string
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
    return {
      title: feed.title || '',
      description: feed.description,
      link: feed.link || '',
      items: feed.items as any,
    }
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error)
    throw error
  }
}

export function extractImageUrl(item: RSSFeedItem): string | undefined {
  try {
    // Try to extract image from various sources
    if (item.enclosure && Array.isArray(item.enclosure) && item.enclosure.length > 0) {
      const imageEnclosure = item.enclosure.find(enc => 
        enc && typeof enc === 'object' && 
        (enc.type?.startsWith('image/') || enc.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      )
      if (imageEnclosure?.url) return imageEnclosure.url
    }

    if (item.mediaContent && Array.isArray(item.mediaContent) && item.mediaContent.length > 0) {
      const imageContent = item.mediaContent.find(media => 
        media && typeof media === 'object' &&
        (media.type?.startsWith('image/') || media.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      )
      if (imageContent?.url) return imageContent.url
    }

    if (item.mediaThumbnail && Array.isArray(item.mediaThumbnail) && item.mediaThumbnail.length > 0) {
      const thumbnail = item.mediaThumbnail[0]
      if (thumbnail && typeof thumbnail === 'object' && thumbnail.url) {
        return thumbnail.url
      }
    }

    // Try to extract from description HTML
    if (item.description) {
      const imgMatch = item.description.match(/<img[^>]+src="([^"]+)"/i)
      if (imgMatch?.[1]) return imgMatch[1]
    }
  } catch (error) {
    console.error('Error extracting image URL:', error)
  }

  return undefined
}