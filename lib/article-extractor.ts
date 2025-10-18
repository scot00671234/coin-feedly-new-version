// Enhanced article content extraction with multiple fallback strategies
import { JSDOM } from 'jsdom'

export interface ExtractedContent {
  title: string
  description: string
  content: string
  images: string[]
  author?: string
  publishedAt?: Date
  source?: string
  success: boolean
  extractionMethod: 'rss' | 'html' | 'api' | 'fallback'
  confidence: number
}

export interface ExtractionOptions {
  timeout?: number
  maxRetries?: number
  includeImages?: boolean
  sanitizeContent?: boolean
  fallbackToRSS?: boolean
}

const DEFAULT_OPTIONS: ExtractionOptions = {
  timeout: 15000,
  maxRetries: 3,
  includeImages: true,
  sanitizeContent: true,
  fallbackToRSS: true
}

// Enhanced HTML content extraction with multiple strategies
export async function extractArticleContent(
  url: string, 
  rssItem?: any,
  options: ExtractionOptions = {}
): Promise<ExtractedContent> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Strategy 1: Try direct HTML extraction
  try {
    const htmlContent = await fetchWithRetry(url, opts)
    if (htmlContent) {
      const extracted = await extractFromHTML(htmlContent, url, opts)
      if (extracted.success && extracted.confidence > 0.7) {
        return extracted
      }
    }
  } catch (error) {
    console.warn(`HTML extraction failed for ${url}:`, error)
  }

  // Strategy 2: Fallback to RSS content if available
  if (opts.fallbackToRSS && rssItem) {
    try {
      const rssContent = extractFromRSS(rssItem, opts)
      if (rssContent.success) {
        return rssContent
      }
    } catch (error) {
      console.warn(`RSS extraction failed for ${url}:`, error)
    }
  }

  // Strategy 3: Try API-based extraction (Mercury, Readability, etc.)
  try {
    const apiContent = await extractFromAPI(url, opts)
    if (apiContent.success) {
      return apiContent
    }
  } catch (error) {
    console.warn(`API extraction failed for ${url}:`, error)
  }

  // Strategy 4: Final fallback - minimal content
  return createFallbackContent(url, rssItem)
}

// Fetch HTML with retry logic and proper error handling
async function fetchWithRetry(url: string, options: ExtractionOptions): Promise<string | null> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= (options.maxRetries || 3); attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CoinFeedly/1.0; +https://coinfeedly.com)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      return html
      
    } catch (error) {
      lastError = error as Error
      console.warn(`Fetch attempt ${attempt} failed for ${url}:`, error)
      
      if (attempt < (options.maxRetries || 3)) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw lastError || new Error('All fetch attempts failed')
}

// Extract content from HTML using multiple strategies
async function extractFromHTML(html: string, url: string, options: ExtractionOptions): Promise<ExtractedContent> {
  try {
    const dom = new JSDOM(html, { url })
    const document = dom.window.document
    
    // Strategy 1: Look for structured data (JSON-LD, microdata)
    const structuredData = extractStructuredData(document)
    if (structuredData) {
      return {
        ...structuredData,
        success: true,
        extractionMethod: 'html',
        confidence: 0.9
      }
    }
    
    // Strategy 2: Common article selectors
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      '.story-body',
      '.article-body',
      '.post-body',
      'main'
    ]
    
    let articleElement: Element | null = null
    for (const selector of articleSelectors) {
      articleElement = document.querySelector(selector)
      if (articleElement) break
    }
    
    if (articleElement) {
      const content = extractContentFromElement(articleElement, options)
      return {
        ...content,
        success: true,
        extractionMethod: 'html',
        confidence: 0.8
      }
    }
    
    // Strategy 3: Heuristic content extraction
    const heuristicContent = extractContentHeuristically(document, options)
    return {
      ...heuristicContent,
      success: true,
      extractionMethod: 'html',
      confidence: 0.6
    }
    
  } catch (error) {
    console.error('HTML extraction error:', error)
    return createFallbackContent(url)
  }
}

// Extract structured data from JSON-LD and microdata
function extractStructuredData(document: Document): Partial<ExtractedContent> | null {
  try {
    // Try JSON-LD first
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent || '')
        if (data['@type'] === 'Article' || data['@type'] === 'NewsArticle') {
          return {
            title: data.headline || data.name || '',
            description: data.description || '',
            content: data.articleBody || '',
            author: data.author?.name || data.author?.[0]?.name || '',
            publishedAt: data.datePublished ? new Date(data.datePublished) : undefined,
            source: data.publisher?.name || '',
            images: extractImagesFromStructuredData(data)
          }
        }
      } catch (e) {
        continue
      }
    }
    
    // Try microdata
    const articleElement = document.querySelector('[itemtype*="Article"], [itemtype*="NewsArticle"]')
    if (articleElement) {
      return {
        title: articleElement.querySelector('[itemprop="headline"], [itemprop="name"]')?.textContent?.trim() || '',
        description: articleElement.querySelector('[itemprop="description"]')?.textContent?.trim() || '',
        content: articleElement.querySelector('[itemprop="articleBody"]')?.textContent?.trim() || '',
        author: articleElement.querySelector('[itemprop="author"]')?.textContent?.trim() || '',
        publishedAt: articleElement.querySelector('[itemprop="datePublished"]')?.getAttribute('content') ? 
          new Date(articleElement.querySelector('[itemprop="datePublished"]')!.getAttribute('content')!) : undefined,
        source: articleElement.querySelector('[itemprop="publisher"]')?.textContent?.trim() || '',
        images: Array.from(articleElement.querySelectorAll('[itemprop="image"]')).map(img => 
          img.getAttribute('src') || img.getAttribute('content') || ''
        ).filter(Boolean)
      }
    }
    
    return null
  } catch (error) {
    console.error('Structured data extraction error:', error)
    return null
  }
}

// Extract content from a specific element
function extractContentFromElement(element: Element, options: ExtractionOptions): Partial<ExtractedContent> {
  const title = extractTitle(element)
  const description = extractDescription(element)
  const content = extractMainContent(element, options)
  const images = options.includeImages ? extractImages(element) : []
  const author = extractAuthor(element)
  const publishedAt = extractPublishedDate(element)
  const source = extractSource(element)
  
  return {
    title,
    description,
    content,
    images,
    author,
    publishedAt,
    source
  }
}

// Heuristic content extraction when no clear article structure is found
function extractContentHeuristically(document: Document, options: ExtractionOptions): Partial<ExtractedContent> {
  // Find the largest text block (likely main content)
  const textBlocks = Array.from(document.querySelectorAll('p, div, section'))
    .map(el => ({ element: el, textLength: el.textContent?.length || 0 }))
    .sort((a, b) => b.textLength - a.textLength)
  
  const mainContent = textBlocks[0]?.element
  
  return {
    title: extractTitle(document.body),
    description: extractDescription(document.body),
    content: mainContent ? extractMainContent(mainContent, options) : '',
    images: options.includeImages ? extractImages(document.body) : [],
    author: extractAuthor(document.body),
    publishedAt: extractPublishedDate(document.body),
    source: extractSource(document.body)
  }
}

// Helper functions for extracting specific content parts
function extractTitle(element: Element): string {
  const titleSelectors = [
    'h1',
    '[itemprop="headline"]',
    '.title',
    '.headline',
    '.article-title',
    '.post-title'
  ]
  
  for (const selector of titleSelectors) {
    const titleEl = element.querySelector(selector)
    if (titleEl?.textContent?.trim()) {
      return titleEl.textContent.trim()
    }
  }
  
  return ''
}

function extractDescription(element: Element): string {
  const descSelectors = [
    '[itemprop="description"]',
    '.description',
    '.excerpt',
    '.summary',
    'meta[name="description"]'
  ]
  
  for (const selector of descSelectors) {
    const descEl = element.querySelector(selector)
    if (descEl) {
      const content = descEl.getAttribute('content') || descEl.textContent?.trim()
      if (content) return content
    }
  }
  
  return ''
}

function extractMainContent(element: Element, options: ExtractionOptions): string {
  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.social-share', '.comments',
    '.related-articles', '.sidebar', '.menu'
  ]
  
  const clone = element.cloneNode(true) as Element
  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove())
  })
  
  // Extract text content
  let content = clone.textContent || ''
  
  if (options.sanitizeContent) {
    content = sanitizeContent(content)
  }
  
  return content
}

function extractImages(element: Element): string[] {
  const images: string[] = []
  
  // Extract from img tags
  element.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src')
    if (src && isValidImageUrl(src)) {
      images.push(src)
    }
  })
  
  // Extract from background images
  element.querySelectorAll('*').forEach(el => {
    const style = el.getAttribute('style')
    if (style) {
      const bgMatch = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i)
      if (bgMatch && isValidImageUrl(bgMatch[1])) {
        images.push(bgMatch[1])
      }
    }
  })
  
  return [...new Set(images)] // Remove duplicates
}

function extractAuthor(element: Element): string {
  const authorSelectors = [
    '[itemprop="author"]',
    '.author',
    '.byline',
    '.writer',
    'meta[name="author"]'
  ]
  
  for (const selector of authorSelectors) {
    const authorEl = element.querySelector(selector)
    if (authorEl) {
      const content = authorEl.getAttribute('content') || authorEl.textContent?.trim()
      if (content) return content
    }
  }
  
  return ''
}

function extractPublishedDate(element: Element): Date | undefined {
  const dateSelectors = [
    '[itemprop="datePublished"]',
    '.date',
    '.published',
    '.timestamp',
    'time[datetime]'
  ]
  
  for (const selector of dateSelectors) {
    const dateEl = element.querySelector(selector)
    if (dateEl) {
      const dateStr = dateEl.getAttribute('datetime') || dateEl.getAttribute('content') || dateEl.textContent?.trim()
      if (dateStr) {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
  }
  
  return undefined
}

function extractSource(element: Element): string {
  const sourceSelectors = [
    '[itemprop="publisher"]',
    '.source',
    '.publication',
    '.site-name'
  ]
  
  for (const selector of sourceSelectors) {
    const sourceEl = element.querySelector(selector)
    if (sourceEl?.textContent?.trim()) {
      return sourceEl.textContent.trim()
    }
  }
  
  return ''
}

// Extract content from RSS item
function extractFromRSS(rssItem: any, options: ExtractionOptions): ExtractedContent {
  const title = rssItem.title || ''
  const description = rssItem.description || ''
  const content = rssItem.content || rssItem.contentEncoded || description
  const images = options.includeImages ? extractImagesFromRSS(rssItem) : []
  const author = rssItem.creator || rssItem.author || ''
  const publishedAt = rssItem.pubDate ? new Date(rssItem.pubDate) : undefined
  const source = rssItem.source || ''
  
  return {
    title,
    description: sanitizeContent(description),
    content: sanitizeContent(content),
    images,
    author,
    publishedAt,
    source,
    success: true,
    extractionMethod: 'rss',
    confidence: 0.7
  }
}

// Extract images from RSS item
function extractImagesFromRSS(rssItem: any): string[] {
  const images: string[] = []
  
  // Media content
  if (rssItem.mediaContent) {
    rssItem.mediaContent.forEach((media: any) => {
      if (media.url && media.type?.startsWith('image/')) {
        images.push(media.url)
      }
    })
  }
  
  // Media thumbnail
  if (rssItem.mediaThumbnail) {
    rssItem.mediaThumbnail.forEach((thumb: any) => {
      if (thumb.url) {
        images.push(thumb.url)
      }
    })
  }
  
  // Enclosure
  if (rssItem.enclosure) {
    rssItem.enclosure.forEach((enc: any) => {
      if (enc.url && enc.type?.startsWith('image/')) {
        images.push(enc.url)
      }
    })
  }
  
  // Extract from content
  const content = rssItem.content || rssItem.contentEncoded || rssItem.description || ''
  const imgMatches = content.match(/<img[^>]+src="([^"]+)"/gi)
  if (imgMatches) {
    imgMatches.forEach(match => {
      const srcMatch = match.match(/src="([^"]+)"/)
      if (srcMatch && isValidImageUrl(srcMatch[1])) {
        images.push(srcMatch[1])
      }
    })
  }
  
  return [...new Set(images)]
}

// Extract images from structured data
function extractImagesFromStructuredData(data: any): string[] {
  const images: string[] = []
  
  if (data.image) {
    if (typeof data.image === 'string') {
      images.push(data.image)
    } else if (Array.isArray(data.image)) {
      images.push(...data.image)
    } else if (data.image.url) {
      images.push(data.image.url)
    }
  }
  
  return images.filter(isValidImageUrl)
}

// API-based extraction (placeholder for services like Mercury API)
async function extractFromAPI(url: string, options: ExtractionOptions): Promise<ExtractedContent> {
  // This would integrate with services like:
  // - Mercury API
  // - Readability API
  // - Diffbot
  // - Custom extraction service
  
  // For now, return a placeholder
  return createFallbackContent(url)
}

// Create fallback content when all extraction methods fail
function createFallbackContent(url: string, rssItem?: any): ExtractedContent {
  const title = rssItem?.title || 'Article'
  const description = rssItem?.description || 'Content not available'
  const content = rssItem?.content || rssItem?.description || 'Full content could not be extracted.'
  const images = rssItem ? extractImagesFromRSS(rssItem) : []
  
  return {
    title,
    description: sanitizeContent(description),
    content: sanitizeContent(content),
    images,
    author: rssItem?.creator || rssItem?.author || '',
    publishedAt: rssItem?.pubDate ? new Date(rssItem.pubDate) : undefined,
    source: rssItem?.source || '',
    success: false,
    extractionMethod: 'fallback',
    confidence: 0.3
  }
}

// Sanitize content by removing unwanted characters and normalizing whitespace
function sanitizeContent(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

// Validate image URL
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
           /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(parsed.pathname)
  } catch {
    return false
  }
}
