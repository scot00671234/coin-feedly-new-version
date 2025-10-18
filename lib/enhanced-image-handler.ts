// Enhanced image handling with multiple extraction strategies and fallbacks
import { getRandomCryptoImage, getCryptoImageByIndex } from './crypto-images'

export interface ImageInfo {
  url: string
  alt?: string
  title?: string
  width?: number
  height?: number
  source: 'rss' | 'html' | 'structured' | 'fallback'
  quality: 'high' | 'medium' | 'low'
  isValid: boolean
}

export interface ImageExtractionOptions {
  maxImages?: number
  minWidth?: number
  minHeight?: number
  preferHighQuality?: boolean
  includeFallbacks?: boolean
  category?: string
  title?: string
}

const DEFAULT_OPTIONS: ImageExtractionOptions = {
  maxImages: 5,
  minWidth: 200,
  minHeight: 150,
  preferHighQuality: true,
  includeFallbacks: true
}

// Enhanced image extraction with multiple strategies
export async function extractImages(
  url: string,
  htmlContent?: string,
  rssItem?: any,
  options: ImageExtractionOptions = {}
): Promise<ImageInfo[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const images: ImageInfo[] = []
  
  // Strategy 1: Extract from HTML content
  if (htmlContent) {
    const htmlImages = extractImagesFromHTML(htmlContent, url, opts)
    images.push(...htmlImages)
  }
  
  // Strategy 2: Extract from RSS item
  if (rssItem) {
    const rssImages = extractImagesFromRSS(rssItem, opts)
    images.push(...rssImages)
  }
  
  // Strategy 3: Try to fetch and analyze the page for additional images
  if (images.length < (opts.maxImages || 5)) {
    try {
      const additionalImages = await fetchAdditionalImages(url, opts)
      images.push(...additionalImages)
    } catch (error) {
      console.warn(`Failed to fetch additional images for ${url}:`, error)
    }
  }
  
  // Strategy 4: Add fallback images if needed
  if (opts.includeFallbacks && images.length === 0) {
    const fallbackImages = generateFallbackImages(opts.category, opts.title)
    images.push(...fallbackImages)
  }
  
  // Filter, validate, and sort images
  return processImages(images, opts)
}

// Extract images from HTML content
function extractImagesFromHTML(html: string, baseUrl: string, options: ImageExtractionOptions): ImageInfo[] {
  const images: ImageInfo[] = []
  
  try {
    // Use regex to find all img tags
    const imgRegex = /<img[^>]+>/gi
    let match
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imgTag = match[0]
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i)
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i)
      const titleMatch = imgTag.match(/title=["']([^"']*)["']/i)
      const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i)
      const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i)
      
      if (srcMatch) {
        const src = resolveUrl(srcMatch[1], baseUrl)
        if (src && isValidImageUrl(src)) {
          images.push({
            url: src,
            alt: altMatch?.[1] || '',
            title: titleMatch?.[1] || '',
            width: widthMatch ? parseInt(widthMatch[1]) : undefined,
            height: heightMatch ? parseInt(heightMatch[1]) : undefined,
            source: 'html',
            quality: determineImageQuality(src, widthMatch?.[1], heightMatch?.[1]),
            isValid: true
          })
        }
      }
    }
    
    // Also look for background images
    const bgImageRegex = /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi
    let bgMatch
    
    while ((bgMatch = bgImageRegex.exec(html)) !== null) {
      const src = resolveUrl(bgMatch[1], baseUrl)
      if (src && isValidImageUrl(src)) {
        images.push({
          url: src,
          source: 'html',
          quality: determineImageQuality(src),
          isValid: true
        })
      }
    }
    
    // Look for picture elements with multiple sources
    const pictureRegex = /<picture[^>]*>([\s\S]*?)<\/picture>/gi
    let pictureMatch
    
    while ((pictureMatch = pictureRegex.exec(html)) !== null) {
      const pictureContent = pictureMatch[1]
      const sourceRegex = /<source[^>]+srcset=["']([^"']+)["']/gi
      let sourceMatch
      
      while ((sourceMatch = sourceRegex.exec(pictureContent)) !== null) {
        const srcset = sourceMatch[1]
        const urls = srcset.split(',').map(s => s.trim().split(' ')[0])
        
        for (const url of urls) {
          const src = resolveUrl(url, baseUrl)
          if (src && isValidImageUrl(src)) {
            images.push({
              url: src,
              source: 'html',
              quality: determineImageQuality(src),
              isValid: true
            })
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error extracting images from HTML:', error)
  }
  
  return images
}

// Extract images from RSS item
function extractImagesFromRSS(rssItem: any, options: ImageExtractionOptions): ImageInfo[] {
  const images: ImageInfo[] = []
  
  try {
    // Media content (highest quality)
    if (rssItem.mediaContent && Array.isArray(rssItem.mediaContent)) {
      rssItem.mediaContent.forEach((media: any) => {
        if (media?.url && media.type?.startsWith('image/')) {
          images.push({
            url: media.url,
            source: 'rss',
            quality: determineImageQuality(media.url, media.width, media.height),
            isValid: true
          })
        }
      })
    }
    
    // Media thumbnail
    if (rssItem.mediaThumbnail && Array.isArray(rssItem.mediaThumbnail)) {
      rssItem.mediaThumbnail.forEach((thumb: any) => {
        if (thumb?.url) {
          images.push({
            url: thumb.url,
            source: 'rss',
            quality: 'medium',
            isValid: true
          })
        }
      })
    }
    
    // Enclosure
    if (rssItem.enclosure && Array.isArray(rssItem.enclosure)) {
      rssItem.enclosure.forEach((enc: any) => {
        if (enc?.url && enc.type?.startsWith('image/')) {
          images.push({
            url: enc.url,
            source: 'rss',
            quality: determineImageQuality(enc.url),
            isValid: true
          })
        }
      })
    }
    
    // Extract from content fields
    const contentFields = [
      rssItem.content,
      rssItem.contentEncoded,
      rssItem.description,
      rssItem.summary
    ]
    
    for (const content of contentFields) {
      if (content) {
        const imgMatches = content.match(/<img[^>]+src="([^"]+)"/gi)
        if (imgMatches) {
          imgMatches.forEach((match: string) => {
            const srcMatch = match.match(/src="([^"]+)"/)
            if (srcMatch && isValidImageUrl(srcMatch[1])) {
              images.push({
                url: srcMatch[1],
                source: 'rss',
                quality: determineImageQuality(srcMatch[1]),
                isValid: true
              })
            }
          })
        }
      }
    }
    
  } catch (error) {
    console.error('Error extracting images from RSS:', error)
  }
  
  return images
}

// Fetch additional images by analyzing the page
async function fetchAdditionalImages(url: string, options: ImageExtractionOptions): Promise<ImageInfo[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoinFeedly/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    return extractImagesFromHTML(html, url, options)
    
  } catch (error) {
    console.warn(`Failed to fetch additional images:`, error)
    return []
  }
}

// Generate fallback images based on category and title
function generateFallbackImages(category?: string, title?: string): ImageInfo[] {
  const images: ImageInfo[] = []
  
  if (category || title) {
    const fallbackUrl = getRandomCryptoImage(category || 'default', title)
    images.push({
      url: fallbackUrl,
      alt: title || 'Crypto news image',
      source: 'fallback',
      quality: 'medium',
      isValid: true
    })
  }
  
  return images
}

// Process and filter images
function processImages(images: ImageInfo[], options: ImageExtractionOptions): ImageInfo[] {
  // Remove duplicates based on URL
  const uniqueImages = images.filter((img, index, arr) => 
    arr.findIndex(i => i.url === img.url) === index
  )
  
  // Filter by size requirements
  const filteredImages = uniqueImages.filter(img => {
    if (!options.minWidth && !options.minHeight) return true
    
    const width = img.width || 0
    const height = img.height || 0
    
    if (options.minWidth && width < options.minWidth) return false
    if (options.minHeight && height < options.minHeight) return false
    
    return true
  })
  
  // Sort by quality and preference
  const sortedImages = filteredImages.sort((a, b) => {
    if (options.preferHighQuality) {
      const qualityOrder = { high: 3, medium: 2, low: 1 }
      const qualityDiff = qualityOrder[b.quality] - qualityOrder[a.quality]
      if (qualityDiff !== 0) return qualityDiff
    }
    
    // Prefer larger images
    const aSize = (a.width || 0) * (a.height || 0)
    const bSize = (b.width || 0) * (b.height || 0)
    return bSize - aSize
  })
  
  // Limit to maxImages
  return sortedImages.slice(0, options.maxImages)
}

// Determine image quality based on URL and dimensions
function determineImageQuality(url: string, width?: string | number, height?: string | number): 'high' | 'medium' | 'low' {
  const w = typeof width === 'string' ? parseInt(width) : width || 0
  const h = typeof height === 'string' ? parseInt(height) : height || 0
  
  // Check URL for quality indicators
  if (url.includes('large') || url.includes('high') || url.includes('hd')) {
    return 'high'
  }
  
  if (url.includes('medium') || url.includes('thumb')) {
    return 'medium'
  }
  
  if (url.includes('small') || url.includes('tiny')) {
    return 'low'
  }
  
  // Check dimensions
  const area = w * h
  if (area > 1000000) return 'high' // > 1MP
  if (area > 200000) return 'medium' // > 200KP
  return 'low'
}

// Resolve relative URLs to absolute URLs
function resolveUrl(url: string, baseUrl: string): string | null {
  try {
    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
      return 'https:' + url
    }
    
    // Handle relative URLs
    if (url.startsWith('/')) {
      const base = new URL(baseUrl)
      return base.origin + url
    }
    
    // Handle absolute URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Handle relative URLs without leading slash
    const base = new URL(baseUrl)
    return new URL(url, base.origin).href
    
  } catch (error) {
    console.warn(`Failed to resolve URL ${url} with base ${baseUrl}:`, error)
    return null
  }
}

// Validate image URL
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    // Check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }
    
    // Check file extension
    const pathname = parsed.pathname.toLowerCase()
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff']
    
    if (!validExtensions.some(ext => pathname.endsWith(ext))) {
      return false
    }
    
    // Check for common image CDN patterns
    const cdnPatterns = [
      /images\.unsplash\.com/,
      /cdn\./,
      /img\./,
      /static\./,
      /assets\./,
      /media\./,
      /photos\./,
      /pics\./
    ]
    
    if (cdnPatterns.some(pattern => pattern.test(url))) {
      return true
    }
    
    // Check for image-related query parameters
    const imageParams = ['image', 'img', 'photo', 'picture', 'pic']
    const hasImageParam = imageParams.some(param => 
      parsed.searchParams.has(param) || parsed.pathname.includes(param)
    )
    
    return hasImageParam || validExtensions.some(ext => pathname.endsWith(ext))
    
  } catch {
    return false
  }
}

// Get the best image from a collection
export function getBestImage(images: ImageInfo[]): ImageInfo | null {
  if (images.length === 0) return null
  
  // Sort by quality and size
  const sorted = images.sort((a, b) => {
    const qualityOrder = { high: 3, medium: 2, low: 1 }
    const qualityDiff = qualityOrder[b.quality] - qualityOrder[a.quality]
    if (qualityDiff !== 0) return qualityDiff
    
    const aSize = (a.width || 0) * (a.height || 0)
    const bSize = (b.width || 0) * (b.height || 0)
    return bSize - aSize
  })
  
  return sorted[0]
}

// Create a responsive image set
export function createResponsiveImageSet(images: ImageInfo[]): {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
} {
  const bestImage = getBestImage(images)
  if (!bestImage) {
    return {
      src: getRandomCryptoImage('default'),
      alt: 'Crypto news image'
    }
  }
  
  // Create srcSet for responsive images
  const highQualityImages = images.filter(img => img.quality === 'high')
  if (highQualityImages.length > 1) {
    const srcSet = highQualityImages
      .map(img => `${img.url} ${img.width || 800}w`)
      .join(', ')
    
    return {
      src: bestImage.url,
      srcSet,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      alt: bestImage.alt || 'Article image'
    }
  }
  
  return {
    src: bestImage.url,
    alt: bestImage.alt || 'Article image'
  }
}
