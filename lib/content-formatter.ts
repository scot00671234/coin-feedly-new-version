// Enhanced content formatting and sanitization for embedded articles
import { JSDOM } from 'jsdom'

export interface FormattedContent {
  title: string
  description: string
  content: string
  excerpt: string
  wordCount: number
  readingTime: number
  formatted: boolean
  hasImages: boolean
  hasLinks: boolean
  language?: string
}

export interface FormattingOptions {
  maxLength?: number
  preserveFormatting?: boolean
  removeAds?: boolean
  removeSocial?: boolean
  removeComments?: boolean
  addLineBreaks?: boolean
  detectLanguage?: boolean
  extractLinks?: boolean
  extractImages?: boolean
}

const DEFAULT_OPTIONS: FormattingOptions = {
  maxLength: 10000,
  preserveFormatting: true,
  removeAds: true,
  removeSocial: true,
  removeComments: true,
  addLineBreaks: true,
  detectLanguage: true,
  extractLinks: true,
  extractImages: true
}

// Main content formatting function
export function formatContent(
  content: string,
  options: FormattingOptions = {}
): FormattedContent {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Clean and sanitize content
  const cleanedContent = cleanContent(content, opts)
  
  // Extract title and description
  const title = extractTitle(cleanedContent)
  const description = extractDescription(cleanedContent, opts)
  
  // Format main content
  const formattedContent = formatMainContent(cleanedContent, opts)
  
  // Create excerpt
  const excerpt = createExcerpt(formattedContent, opts)
  
  // Calculate metrics
  const wordCount = countWords(formattedContent)
  const readingTime = calculateReadingTime(wordCount)
  
  // Detect language
  const language = opts.detectLanguage ? detectLanguage(formattedContent) : undefined
  
  // Check for embedded elements
  const hasImages = opts.extractImages ? checkForImages(formattedContent) : false
  const hasLinks = opts.extractLinks ? checkForLinks(formattedContent) : false
  
  return {
    title,
    description,
    content: formattedContent,
    excerpt,
    wordCount,
    readingTime,
    formatted: true,
    hasImages,
    hasLinks,
    language
  }
}

// Clean content by removing unwanted elements and normalizing
function cleanContent(content: string, options: FormattingOptions): string {
  try {
    const dom = new JSDOM(content)
    const document = dom.window.document
    
    // Remove unwanted elements
    if (options.removeAds) {
      removeUnwantedElements(document, [
        '.advertisement', '.ads', '.ad', '.banner',
        '[class*="ad-"]', '[id*="ad-"]',
        '.sponsored', '.promo', '.promotion'
      ])
    }
    
    if (options.removeSocial) {
      removeUnwantedElements(document, [
        '.social-share', '.share', '.social',
        '.facebook', '.twitter', '.linkedin',
        '.instagram', '.youtube', '.tiktok',
        '[class*="social"]', '[id*="social"]'
      ])
    }
    
    if (options.removeComments) {
      removeUnwantedElements(document, [
        '.comments', '.comment', '.discussion',
        '.feedback', '.reviews', '.replies',
        '[class*="comment"]', '[id*="comment"]'
      ])
    }
    
    // Remove other unwanted elements
    removeUnwantedElements(document, [
      'script', 'style', 'nav', 'header', 'footer',
      '.menu', '.navigation', '.sidebar',
      '.related', '.recommended', '.suggested',
      '.newsletter', '.subscribe', '.signup',
      '.cookie', '.privacy', '.terms',
      '.disclaimer', '.legal', '.footer'
    ])
    
    // Get cleaned content
    let cleaned = document.body?.textContent || content
    
    // Normalize whitespace
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()
    
    // Limit length
    if (options.maxLength && cleaned.length > options.maxLength) {
      cleaned = cleaned.substring(0, options.maxLength) + '...'
    }
    
    return cleaned
    
  } catch (error) {
    console.error('Error cleaning content:', error)
    // Fallback to simple text cleaning
    return simpleTextClean(content, options)
  }
}

// Remove unwanted elements from DOM
function removeUnwantedElements(document: Document, selectors: string[]): void {
  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(element => {
        element.remove()
      })
    } catch (error) {
      // Ignore invalid selectors
    }
  })
}

// Simple text cleaning fallback
function simpleTextClean(content: string, options: FormattingOptions): string {
  let cleaned = content
    
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned)
  
  // Normalize whitespace
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
  
  // Limit length
  if (options.maxLength && cleaned.length > options.maxLength) {
    cleaned = cleaned.substring(0, options.maxLength) + '...'
  }
  
  return cleaned
}

// Extract title from content
function extractTitle(content: string): string {
  // Try to find title in common patterns
  const titlePatterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<title[^>]*>([^<]+)<\/title>/i,
    /<h2[^>]*>([^<]+)<\/h2>/i,
    /<h3[^>]*>([^<]+)<\/h3>/i
  ]
  
  for (const pattern of titlePatterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  // Fallback: use first line or first sentence
  const lines = content.split('\n').filter(line => line.trim().length > 0)
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    if (firstLine.length > 10 && firstLine.length < 200) {
      return firstLine
    }
  }
  
  return 'Untitled Article'
}

// Extract description from content
function extractDescription(content: string, options: FormattingOptions): string {
  // Try to find description in meta tags or common patterns
  const descPatterns = [
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    /<p[^>]*class=["'][^"']*summary[^"']*["'][^>]*>([^<]+)<\/p>/i,
    /<div[^>]*class=["'][^"']*excerpt[^"']*["'][^>]*>([^<]+)<\/div>/i
  ]
  
  for (const pattern of descPatterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  // Fallback: use first paragraph or first few sentences
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
  if (paragraphs.length > 0) {
    const firstParagraph = cleanText(paragraphs[0])
    if (firstParagraph.length > 50 && firstParagraph.length < 500) {
      return firstParagraph
    }
  }
  
  // Last resort: truncate content
  const cleaned = cleanText(content)
  return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned
}

// Format main content with proper structure
function formatMainContent(content: string, options: FormattingOptions): string {
  let formatted = content
  
  // Remove HTML tags if not preserving formatting
  if (!options.preserveFormatting) {
    formatted = formatted.replace(/<[^>]*>/g, '')
  }
  
  // Decode HTML entities
  formatted = decodeHtmlEntities(formatted)
  
  // Add line breaks for better readability
  if (options.addLineBreaks) {
    formatted = addLineBreaks(formatted)
  }
  
  // Clean up the text
  formatted = cleanText(formatted)
  
  return formatted
}

// Add line breaks for better readability
function addLineBreaks(content: string): string {
  return content
    .replace(/([.!?])\s+/g, '$1\n\n') // Double line break after sentences
    .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Break before new sentences
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .trim()
}

// Create excerpt from content
function createExcerpt(content: string, options: FormattingOptions): string {
  const maxLength = 300
  const sentences = content.split(/[.!?]+/)
  
  let excerpt = ''
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (trimmed && excerpt.length + trimmed.length < maxLength) {
      excerpt += (excerpt ? '. ' : '') + trimmed
    } else {
      break
    }
  }
  
  if (excerpt.length < content.length) {
    excerpt += '...'
  }
  
  return excerpt
}

// Count words in content
function countWords(content: string): number {
  return content
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

// Calculate reading time in minutes
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200
  return Math.ceil(wordCount / wordsPerMinute)
}

// Detect language of content
function detectLanguage(content: string): string {
  // Simple language detection based on common words
  const languages = {
    en: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
    es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo'],
    fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'],
    de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf'],
    it: ['il', 'di', 'e', 'a', 'da', 'in', 'con', 'per', 'su', 'dal', 'della', 'del']
  }
  
  const words = content.toLowerCase().split(/\s+/)
  const scores: { [key: string]: number } = {}
  
  for (const [lang, commonWords] of Object.entries(languages)) {
    scores[lang] = commonWords.reduce((score, word) => {
      return score + words.filter(w => w === word).length
    }, 0)
  }
  
  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0]
  
  return detectedLang || 'en'
}

// Check if content has images
function checkForImages(content: string): boolean {
  return /<img[^>]+>/i.test(content) || 
         /<picture[^>]*>/i.test(content) ||
         /background-image:\s*url\(/i.test(content)
}

// Check if content has links
function checkForLinks(content: string): boolean {
  return /<a[^>]+href=/i.test(content)
}

// Clean text by removing unwanted characters and normalizing
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/[^\w\s.,!?;:()\-'"]/g, '')
    .trim()
}

// Decode HTML entities
function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  }
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity
  })
}

// Format content for display with proper HTML structure
export function formatForDisplay(content: string, options: FormattingOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  try {
    const dom = new JSDOM(content)
    const document = dom.window.document
    
    // Remove unwanted elements
    if (opts.removeAds) {
      removeUnwantedElements(document, [
        '.advertisement', '.ads', '.ad', '.banner',
        '[class*="ad-"]', '[id*="ad-"]',
        '.sponsored', '.promo', '.promotion'
      ])
    }
    
    if (opts.removeSocial) {
      removeUnwantedElements(document, [
        '.social-share', '.share', '.social',
        '.facebook', '.twitter', '.linkedin',
        '.instagram', '.youtube', '.tiktok',
        '[class*="social"]', '[id*="social"]'
      ])
    }
    
    if (opts.removeComments) {
      removeUnwantedElements(document, [
        '.comments', '.comment', '.discussion',
        '.feedback', '.reviews', '.replies',
        '[class*="comment"]', '[id*="comment"]'
      ])
    }
    
    // Clean up remaining elements
    document.querySelectorAll('*').forEach(element => {
      // Remove empty elements
      if (!element.textContent?.trim() && !element.querySelector('img')) {
        element.remove()
      }
      
      // Clean up attributes
      const allowedAttributes = ['href', 'src', 'alt', 'title', 'class', 'id']
      Array.from(element.attributes).forEach(attr => {
        if (!allowedAttributes.includes(attr.name)) {
          element.removeAttribute(attr.name)
        }
      })
    })
    
    return document.body?.innerHTML || content
    
  } catch (error) {
    console.error('Error formatting content for display:', error)
    return content
  }
}

// Extract and format links from content
export function extractLinks(content: string): Array<{ url: string; text: string; title?: string }> {
  const links: Array<{ url: string; text: string; title?: string }> = []
  
  try {
    const dom = new JSDOM(content)
    const document = dom.window.document
    
    document.querySelectorAll('a[href]').forEach(link => {
      const url = link.getAttribute('href')
      const text = link.textContent?.trim() || ''
      const title = link.getAttribute('title') || undefined
      
      if (url && text) {
        links.push({ url, text, title })
      }
    })
    
  } catch (error) {
    console.error('Error extracting links:', error)
  }
  
  return links
}

// Extract and format images from content
export function extractImages(content: string): Array<{ src: string; alt?: string; title?: string; width?: string; height?: string }> {
  const images: Array<{ src: string; alt?: string; title?: string; width?: string; height?: string }> = []
  
  try {
    const dom = new JSDOM(content)
    const document = dom.window.document
    
    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src')
      const alt = img.getAttribute('alt') || undefined
      const title = img.getAttribute('title') || undefined
      const width = img.getAttribute('width') || undefined
      const height = img.getAttribute('height') || undefined
      
      if (src) {
        images.push({ src, alt, title, width, height })
      }
    })
    
  } catch (error) {
    console.error('Error extracting images:', error)
  }
  
  return images
}
