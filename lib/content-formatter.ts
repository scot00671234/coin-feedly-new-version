// Enhanced content formatting and sanitization for embedded articles

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
  // Browser-specific options
  browserView?: boolean
  readingMode?: boolean
  removeNavigation?: boolean
  removeSidebars?: boolean
  removeFooters?: boolean
  removeHeaders?: boolean
  enhanceReadability?: boolean
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
  extractImages: true,
  // Browser-specific defaults
  browserView: false,
  readingMode: false,
  removeNavigation: false,
  removeSidebars: false,
  removeFooters: false,
  removeHeaders: false,
  enhanceReadability: false
}

// Main content formatting function
export function formatContent(
  content: string,
  options: FormattingOptions = {}
): FormattedContent {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Clean and sanitize content
  const cleanedContent = opts.browserView ? cleanContentForBrowser(content, opts) : cleanContent(content, opts)
  
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
    let cleaned = content
    
    // Remove unwanted elements using regex
    if (options.removeAds) {
      const adPatterns = [
        /<[^>]*class=["'][^"']*advertisement[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*ads[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*ad[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*banner[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*ad-[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*sponsored[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*promo[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*promotion[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      adPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    if (options.removeSocial) {
      const socialPatterns = [
        /<[^>]*class=["'][^"']*social-share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*social[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*facebook[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*twitter[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*linkedin[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*instagram[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*youtube[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*tiktok[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*social[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      socialPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    if (options.removeComments) {
      const commentPatterns = [
        /<[^>]*class=["'][^"']*comments[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*discussion[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*feedback[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*reviews[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*replies[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      commentPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    // Remove other unwanted elements
    const unwantedPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /<style[^>]*>[\s\S]*?<\/style>/gi,
      /<nav[^>]*>[\s\S]*?<\/nav>/gi,
      /<header[^>]*>[\s\S]*?<\/header>/gi,
      /<footer[^>]*>[\s\S]*?<\/footer>/gi,
      /<[^>]*class=["'][^"']*menu[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*navigation[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*sidebar[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*related[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*recommended[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*suggested[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*newsletter[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*subscribe[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*signup[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*cookie[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*privacy[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*terms[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*disclaimer[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
      /<[^>]*class=["'][^"']*legal[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
    ]
    
    unwantedPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '')
    })
    
    // Extract text content
    cleaned = cleaned.replace(/<[^>]*>/g, '')
    
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

// Clean content for browser view (preserves HTML structure)
function cleanContentForBrowser(content: string, options: FormattingOptions): string {
  try {
    let cleaned = content
    
    // Remove unwanted elements using regex
    if (options.removeAds) {
      const adPatterns = [
        /<[^>]*class=["'][^"']*advertisement[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*ads[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*ad[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*banner[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*ad-[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*sponsored[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*promo[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*promotion[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      adPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    if (options.removeSocial) {
      const socialPatterns = [
        /<[^>]*class=["'][^"']*social-share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*social[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*facebook[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*twitter[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*linkedin[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*instagram[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*youtube[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*tiktok[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*social[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      socialPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    if (options.removeComments) {
      const commentPatterns = [
        /<[^>]*class=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*comments[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*discussion[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*feedback[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*reviews[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*replies[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      commentPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }

    // Browser-specific cleaning
    if (options.browserView) {
      // Remove navigation elements
      if (options.removeNavigation) {
        const navPatterns = [
          /<nav[^>]*>[\s\S]*?<\/nav>/gi,
          /<[^>]*class=["'][^"']*nav[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*navigation[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*menu[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*pagination[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
        ]
        navPatterns.forEach(pattern => {
          cleaned = cleaned.replace(pattern, '')
        })
      }

      // Remove sidebars
      if (options.removeSidebars) {
        const sidebarPatterns = [
          /<[^>]*class=["'][^"']*sidebar[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*side[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*widget[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*related[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*recommended[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*popular[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*trending[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*id=["'][^"']*sidebar[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
        ]
        sidebarPatterns.forEach(pattern => {
          cleaned = cleaned.replace(pattern, '')
        })
      }

      // Remove footers
      if (options.removeFooters) {
        const footerPatterns = [
          /<footer[^>]*>[\s\S]*?<\/footer>/gi,
          /<[^>]*class=["'][^"']*footer[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*site-footer[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*id=["'][^"']*footer[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
        ]
        footerPatterns.forEach(pattern => {
          cleaned = cleaned.replace(pattern, '')
        })
      }

      // Remove headers (site headers, not article headers)
      if (options.removeHeaders) {
        const headerPatterns = [
          /<header[^>]*>[\s\S]*?<\/header>/gi,
          /<[^>]*class=["'][^"']*site-header[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*main-header[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*class=["'][^"']*page-header[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
          /<[^>]*id=["'][^"']*header[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
        ]
        headerPatterns.forEach(pattern => {
          cleaned = cleaned.replace(pattern, '')
        })
      }

      // Enhance readability for browser view
      if (options.enhanceReadability) {
        // Increase font sizes for better readability
        cleaned = cleaned.replace(/font-size:\s*(\d+)px/gi, (match, size) => {
          const newSize = Math.max(parseInt(size) * 1.2, 16)
          return `font-size: ${newSize}px`
        })
        
        // Improve line height
        cleaned = cleaned.replace(/line-height:\s*([\d.]+)/gi, (match, height) => {
          const newHeight = Math.max(parseFloat(height) * 1.3, 1.5)
          return `line-height: ${newHeight}`
        })
      }
    }
    
    // Remove scripts and styles
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    
    // Normalize whitespace in HTML
    cleaned = cleaned
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
    
    return cleaned
    
  } catch (error) {
    console.error('Error cleaning content for browser:', error)
    return content
  }
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
    let cleaned = content
    
    // Remove unwanted elements using regex
    if (opts.removeAds) {
      const adPatterns = [
        /<[^>]*class=["'][^"']*advertisement[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*ads[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*ad[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*banner[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*ad-[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*sponsored[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*promo[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*promotion[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      adPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    if (opts.removeSocial) {
      const socialPatterns = [
        /<[^>]*class=["'][^"']*social-share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*share[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*social[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*facebook[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*twitter[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*linkedin[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*instagram[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*youtube[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*tiktok[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*social[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      socialPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    if (opts.removeComments) {
      const commentPatterns = [
        /<[^>]*class=["'][^"']*comments[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*discussion[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*feedback[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*reviews[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*class=["'][^"']*replies[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi,
        /<[^>]*id=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/[^>]*>/gi
      ]
      commentPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '')
      })
    }
    
    // Clean up attributes (simplified regex approach)
    cleaned = cleaned.replace(/<([^>]+)>/g, (match, attributes) => {
      // Keep only essential attributes
      const allowedAttrs = ['href', 'src', 'alt', 'title', 'class', 'id']
      const attrMatches = attributes.match(/(\w+)=["']([^"']*)["']/g) || []
      const cleanAttrs = attrMatches
        .filter((attr: string) => {
          const name = attr.split('=')[0]
          return allowedAttrs.includes(name)
        })
        .join(' ')
      
      return cleanAttrs ? `<${cleanAttrs}>` : match
    })
    
    return cleaned
    
  } catch (error) {
    console.error('Error formatting content for display:', error)
    return content
  }
}

// Extract and format links from content
export function extractLinks(content: string): Array<{ url: string; text: string; title?: string }> {
  const links: Array<{ url: string; text: string; title?: string }> = []
  
  try {
    const linkMatches = content.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
    if (linkMatches) {
      linkMatches.forEach(match => {
        const urlMatch = match.match(/href=["']([^"']+)["']/i)
        const textMatch = match.match(/>([\s\S]*?)<\/a>/i)
        const titleMatch = match.match(/title=["']([^"']+)["']/i)
        
        if (urlMatch && textMatch) {
          const url = urlMatch[1]
          const text = textMatch[1].replace(/<[^>]*>/g, '').trim()
          const title = titleMatch ? titleMatch[1] : undefined
          
          if (url && text) {
            links.push({ url, text, title })
          }
        }
      })
    }
    
  } catch (error) {
    console.error('Error extracting links:', error)
  }
  
  return links
}

// Extract and format images from content
export function extractImages(content: string): Array<{ src: string; alt?: string; title?: string; width?: string; height?: string }> {
  const images: Array<{ src: string; alt?: string; title?: string; width?: string; height?: string }> = []
  
  try {
    const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
    if (imgMatches) {
      imgMatches.forEach(match => {
        const srcMatch = match.match(/src=["']([^"']+)["']/i)
        const altMatch = match.match(/alt=["']([^"']*)["']/i)
        const titleMatch = match.match(/title=["']([^"']*)["']/i)
        const widthMatch = match.match(/width=["']?(\d+)["']?/i)
        const heightMatch = match.match(/height=["']?(\d+)["']?/i)
        
        if (srcMatch) {
          images.push({
            src: srcMatch[1],
            alt: altMatch ? altMatch[1] : undefined,
            title: titleMatch ? titleMatch[1] : undefined,
            width: widthMatch ? widthMatch[1] : undefined,
            height: heightMatch ? heightMatch[1] : undefined
          })
        }
      })
    }
    
  } catch (error) {
    console.error('Error extracting images:', error)
  }
  
  return images
}
