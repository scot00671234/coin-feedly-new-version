// Enhanced article content extraction with multiple fallback strategies

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
    // Strategy 1: Look for structured data (JSON-LD, microdata)
    const structuredData = extractStructuredData(html)
    if (structuredData) {
      return {
        title: structuredData.title || '',
        description: structuredData.description || '',
        content: structuredData.content || '',
        images: structuredData.images || [],
        author: structuredData.author,
        publishedAt: structuredData.publishedAt,
        source: structuredData.source,
        success: true,
        extractionMethod: 'html' as const,
        confidence: 0.9
      }
    }
    
    // Strategy 2: Common article selectors using regex
    const articlePatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*post-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    ]
    
    let articleContent = ''
    for (const pattern of articlePatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        articleContent = match[1]
        break
      }
    }
    
    if (articleContent) {
      const content = extractContentFromHTML(articleContent, options)
      return {
        title: content.title || '',
        description: content.description || '',
        content: content.content || '',
        images: content.images || [],
        author: content.author,
        publishedAt: content.publishedAt,
        source: content.source,
        success: true,
        extractionMethod: 'html' as const,
        confidence: 0.8
      }
    }
    
    // Strategy 3: Heuristic content extraction
    const heuristicContent = extractContentHeuristically(html, options)
    return {
      title: heuristicContent.title || '',
      description: heuristicContent.description || '',
      content: heuristicContent.content || '',
      images: heuristicContent.images || [],
      author: heuristicContent.author,
      publishedAt: heuristicContent.publishedAt,
      source: heuristicContent.source,
      success: true,
      extractionMethod: 'html' as const,
      confidence: 0.6
    }
    
  } catch (error) {
    console.error('HTML extraction error:', error)
    return createFallbackContent(url)
  }
}

// Extract structured data from JSON-LD and microdata
function extractStructuredData(html: string): Partial<ExtractedContent> | null {
  try {
    // Try JSON-LD first
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const contentMatch = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
          if (contentMatch && contentMatch[1]) {
            const data = JSON.parse(contentMatch[1])
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
          }
        } catch (e) {
          continue
        }
      }
    }
    
    // Try microdata
    const microdataMatch = html.match(/<[^>]*itemtype=["'][^"']*Article[^"']*["'][^>]*>([\s\S]*?)<\/[^>]*>/i)
    if (microdataMatch) {
      const articleHtml = microdataMatch[0]
      const titleMatch = articleHtml.match(/<[^>]*itemprop=["']headline["'][^>]*>([^<]+)<\/[^>]*>/i) || 
                        articleHtml.match(/<[^>]*itemprop=["']name["'][^>]*>([^<]+)<\/[^>]*>/i)
      const descMatch = articleHtml.match(/<[^>]*itemprop=["']description["'][^>]*>([^<]+)<\/[^>]*>/i)
      const contentMatch = articleHtml.match(/<[^>]*itemprop=["']articleBody["'][^>]*>([\s\S]*?)<\/[^>]*>/i)
      const authorMatch = articleHtml.match(/<[^>]*itemprop=["']author["'][^>]*>([^<]+)<\/[^>]*>/i)
      const dateMatch = articleHtml.match(/<[^>]*itemprop=["']datePublished["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      const sourceMatch = articleHtml.match(/<[^>]*itemprop=["']publisher["'][^>]*>([^<]+)<\/[^>]*>/i)
      
      return {
        title: titleMatch ? cleanText(titleMatch[1]) : '',
        description: descMatch ? cleanText(descMatch[1]) : '',
        content: contentMatch ? cleanText(contentMatch[1]) : '',
        author: authorMatch ? cleanText(authorMatch[1]) : '',
        publishedAt: dateMatch ? new Date(dateMatch[1]) : undefined,
        source: sourceMatch ? cleanText(sourceMatch[1]) : '',
        images: extractImagesFromMicrodata(articleHtml)
      }
    }
    
    return null
  } catch (error) {
    console.error('Structured data extraction error:', error)
    return null
  }
}

// Extract content from HTML string
function extractContentFromHTML(html: string, options: ExtractionOptions): Partial<ExtractedContent> {
  const title = extractTitleFromHTML(html)
  const description = extractDescriptionFromHTML(html)
  const content = extractMainContentFromHTML(html, options)
  const images = options.includeImages ? extractImagesFromHTML(html) : []
  const author = extractAuthorFromHTML(html)
  const publishedAt = extractPublishedDateFromHTML(html)
  const source = extractSourceFromHTML(html)
  
  return {
    title: title || '',
    description: description || '',
    content: content || '',
    images: images || [],
    author,
    publishedAt,
    source
  }
}

// Heuristic content extraction when no clear article structure is found
function extractContentHeuristically(html: string, options: ExtractionOptions): Partial<ExtractedContent> {
  // Find the largest text block (likely main content)
  const textBlocks = html.match(/<(p|div|section)[^>]*>([\s\S]*?)<\/(p|div|section)>/gi) || []
  const sortedBlocks = textBlocks
    .map(block => ({ 
      content: block, 
      textLength: (block.replace(/<[^>]*>/g, '').length || 0) 
    }))
    .sort((a, b) => b.textLength - a.textLength)
  
  const mainContent = sortedBlocks[0]?.content || ''
  
  return {
    title: extractTitleFromHTML(html) || '',
    description: extractDescriptionFromHTML(html) || '',
    content: mainContent ? extractMainContentFromHTML(mainContent, options) : '',
    images: options.includeImages ? extractImagesFromHTML(html) : [],
    author: extractAuthorFromHTML(html),
    publishedAt: extractPublishedDateFromHTML(html),
    source: extractSourceFromHTML(html)
  }
}

// Helper functions for extracting specific content parts
function extractTitleFromHTML(html: string): string {
  const titlePatterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<[^>]*itemprop=["']headline["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*headline[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*article-title[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*post-title[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<title[^>]*>([^<]+)<\/title>/i
  ]
  
  for (const pattern of titlePatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  return ''
}

function extractDescriptionFromHTML(html: string): string {
  const descPatterns = [
    /<[^>]*itemprop=["']description["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*excerpt[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*summary[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  ]
  
  for (const pattern of descPatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  return ''
}

function extractMainContentFromHTML(html: string, options: ExtractionOptions): string {
  // Remove unwanted elements using regex
  let content = html
  
  // Remove script and style tags
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Remove unwanted elements
  const unwantedPatterns = [
    /<nav[^>]*>[\s\S]*?<\/nav>/gi,
    /<header[^>]*>[\s\S]*?<\/header>/gi,
    /<footer[^>]*>[\s\S]*?<\/footer>/gi,
    /<aside[^>]*>[\s\S]*?<\/aside>/gi,
    /<[^>]*class=["'][^"']*advertisement[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
    /<[^>]*class=["'][^"']*ads[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
    /<[^>]*class=["'][^"']*social-share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
    /<[^>]*class=["'][^"']*comments[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
    /<[^>]*class=["'][^"']*related-articles[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
    /<[^>]*class=["'][^"']*sidebar[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
    /<[^>]*class=["'][^"']*menu[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
  ]
  
  unwantedPatterns.forEach(pattern => {
    content = content.replace(pattern, '')
  })
  
  // Extract text content
  content = content.replace(/<[^>]*>/g, '')
  
  if (options.sanitizeContent) {
    content = sanitizeContent(content)
  }
  
  return content
}

function extractImagesFromHTML(html: string): string[] {
  const images: string[] = []
  
  // Extract from img tags
  const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
  if (imgMatches) {
    imgMatches.forEach(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/i)
      if (srcMatch && isValidImageUrl(srcMatch[1])) {
        images.push(srcMatch[1])
      }
    })
  }
  
  // Extract from background images
  const bgMatches = html.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi)
  if (bgMatches) {
    bgMatches.forEach(match => {
      const urlMatch = match.match(/url\(['"]?([^'")]+)['"]?\)/i)
      if (urlMatch && isValidImageUrl(urlMatch[1])) {
        images.push(urlMatch[1])
      }
    })
  }
  
  return [...new Set(images)] // Remove duplicates
}

function extractAuthorFromHTML(html: string): string {
  const authorPatterns = [
    /<[^>]*itemprop=["']author["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*author[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*byline[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*writer[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["'][^>]*>/i
  ]
  
  for (const pattern of authorPatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  return ''
}

function extractPublishedDateFromHTML(html: string): Date | undefined {
  const datePatterns = [
    /<[^>]*itemprop=["']datePublished["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<[^>]*class=["'][^"']*date[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*published[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*timestamp[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<time[^>]*datetime=["']([^"']+)["'][^>]*>/i
  ]
  
  for (const pattern of datePatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const date = new Date(match[1])
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  return undefined
}

function extractSourceFromHTML(html: string): string {
  const sourcePatterns = [
    /<[^>]*itemprop=["']publisher["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*source[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*publication[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i,
    /<[^>]*class=["'][^"']*site-name[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i
  ]
  
  for (const pattern of sourcePatterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
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

// Extract images from microdata
function extractImagesFromMicrodata(html: string): string[] {
  const images: string[] = []
  
  const imgMatches = html.match(/<[^>]*itemprop=["']image["'][^>]*>/gi)
  if (imgMatches) {
    imgMatches.forEach(match => {
      const srcMatch = match.match(/src=["']([^"']+)["']/i) || 
                      match.match(/content=["']([^"']+)["']/i)
      if (srcMatch && isValidImageUrl(srcMatch[1])) {
        images.push(srcMatch[1])
      }
    })
  }
  
  return images
}

// Clean text by removing unwanted characters and normalizing
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
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
