// Enhanced extraction pipeline with multiple strategies and intelligent fallbacks

import { extractArticleContent, ExtractedContent, ExtractionOptions } from './article-extractor'
import { validateContent, assessContentQuality, ContentScore, ContentQuality } from './content-validation'
import { generateFallbackContent, FallbackContent, FallbackOptions } from './fallback-content-generator'

export interface EnhancedExtractionResult {
  success: boolean
  content: string
  title: string
  description: string
  author?: string
  source?: string
  publishedAt?: Date
  images: string[]
  confidence: number
  extractionMethod: 'rss' | 'html' | 'api' | 'fallback' | 'ai-generated' | 'visual' | 'browser'
  quality: ContentQuality
  score: ContentScore
  fallbackReason?: string
  formatted?: any
  wordCount?: number
  readingTime?: number
  language?: string
  hasImages?: boolean
  hasLinks?: boolean
}

export interface PipelineOptions extends ExtractionOptions {
  useBrowserAutomation?: boolean
  useAIGeneration?: boolean
  useVisualFallbacks?: boolean
  enableCaching?: boolean
  cacheTimeout?: number
  maxRetries?: number
  timeout?: number
  strictMode?: boolean
}

const DEFAULT_OPTIONS: PipelineOptions = {
  timeout: 15000,
  maxRetries: 3,
  includeImages: true,
  sanitizeContent: true,
  fallbackToRSS: true,
  useBrowserAutomation: false,
  useAIGeneration: false,
  useVisualFallbacks: true,
  enableCaching: true,
  cacheTimeout: 3600000, // 1 hour
  strictMode: false
}

// Simple in-memory cache (in production, use Redis)
const extractionCache = new Map<string, { result: EnhancedExtractionResult, timestamp: number }>()

/**
 * Enhanced extraction pipeline with multiple strategies
 */
export async function extractWithEnhancedPipeline(
  url: string,
  rssItem?: any,
  options: PipelineOptions = {}
): Promise<EnhancedExtractionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Check cache first
  if (opts.enableCaching) {
    const cached = getCachedResult(url, opts.cacheTimeout)
    if (cached) {
      return cached
    }
  }
  
  // Phase 1: Fast HTML extraction
  let result = await tryHTMLExtraction(url, rssItem, opts)
  if (result && result.quality.level === 'high') {
    cacheResult(url, result, opts.cacheTimeout)
    return result
  }
  
  // Phase 2: RSS fallback
  if (opts.fallbackToRSS && rssItem) {
    result = await tryRSSExtraction(url, rssItem, opts)
    if (result && result.quality.level === 'high') {
      cacheResult(url, result, opts.cacheTimeout)
      return result
    }
  }
  
  // Phase 3: Browser automation (if enabled)
  if (opts.useBrowserAutomation) {
    result = await tryBrowserExtraction(url, opts)
    if (result && result.quality.level === 'high') {
      cacheResult(url, result, opts.cacheTimeout)
      return result
    }
  }
  
  // Phase 4: API-based extraction
  result = await tryAPIExtraction(url, opts)
  if (result && result.quality.level === 'high') {
    cacheResult(url, result, opts.cacheTimeout)
    return result
  }
  
  // Phase 5: AI generation (if enabled)
  if (opts.useAIGeneration) {
    result = await tryAIGeneration(url, rssItem, opts)
    if (result) {
      cacheResult(url, result, opts.cacheTimeout)
      return result
    }
  }
  
  // Phase 6: Generate fallback content
  result = await generateIntelligentFallback(url, rssItem, opts)
  cacheResult(url, result, opts.cacheTimeout)
  return result
}

/**
 * Phase 1: Try HTML extraction
 */
async function tryHTMLExtraction(
  url: string,
  rssItem: any,
  options: PipelineOptions
): Promise<EnhancedExtractionResult | null> {
  try {
    const extracted = await extractArticleContent(url, rssItem, {
      timeout: options.timeout,
      maxRetries: options.maxRetries,
      includeImages: options.includeImages,
      sanitizeContent: options.sanitizeContent,
      fallbackToRSS: false // We handle RSS separately
    })
    
    if (!extracted.success) return null
    
    return processExtractionResult(extracted, url, rssItem, options)
  } catch (error) {
    console.warn(`HTML extraction failed for ${url}:`, error)
    return null
  }
}

/**
 * Phase 2: Try RSS extraction
 */
async function tryRSSExtraction(
  url: string,
  rssItem: any,
  options: PipelineOptions
): Promise<EnhancedExtractionResult | null> {
  try {
    const extracted = await extractArticleContent(url, rssItem, {
      timeout: options.timeout,
      maxRetries: 1,
      includeImages: options.includeImages,
      sanitizeContent: options.sanitizeContent,
      fallbackToRSS: true
    })
    
    if (!extracted.success) return null
    
    return processExtractionResult(extracted, url, rssItem, options)
  } catch (error) {
    console.warn(`RSS extraction failed for ${url}:`, error)
    return null
  }
}

/**
 * Phase 3: Try browser automation
 */
async function tryBrowserExtraction(
  url: string,
  options: PipelineOptions
): Promise<EnhancedExtractionResult | null> {
  try {
    // This would integrate with Puppeteer/Playwright
    // For now, return null to indicate not implemented
    console.warn('Browser automation not implemented yet')
    return null
  } catch (error) {
    console.warn(`Browser extraction failed for ${url}:`, error)
    return null
  }
}

/**
 * Phase 4: Try API-based extraction
 */
async function tryAPIExtraction(
  url: string,
  options: PipelineOptions
): Promise<EnhancedExtractionResult | null> {
  try {
    // This would integrate with services like Mercury, Readability, etc.
    // For now, return null to indicate not implemented
    console.warn('API extraction not implemented yet')
    return null
  } catch (error) {
    console.warn(`API extraction failed for ${url}:`, error)
    return null
  }
}

/**
 * Phase 5: Try AI generation
 */
async function tryAIGeneration(
  url: string,
  rssItem: any,
  options: PipelineOptions
): Promise<EnhancedExtractionResult | null> {
  try {
    // This would integrate with OpenAI/Claude
    // For now, return null to indicate not implemented
    console.warn('AI generation not implemented yet')
    return null
  } catch (error) {
    console.warn(`AI generation failed for ${url}:`, error)
    return null
  }
}

/**
 * Phase 6: Generate intelligent fallback
 */
async function generateIntelligentFallback(
  url: string,
  rssItem: any,
  options: PipelineOptions
): Promise<EnhancedExtractionResult> {
  // Extract basic information from URL and RSS
  const title = rssItem?.title || extractTitleFromURL(url)
  const description = rssItem?.description || rssItem?.content || ''
  const author = rssItem?.author || rssItem?.creator
  const publishedAt = rssItem?.pubDate ? new Date(rssItem.pubDate) : new Date()
  const source = extractSourceFromURL(url)
  const images = rssItem?.enclosure ? [rssItem.enclosure.url] : []
  
  // Create minimal score for fallback
  const score: ContentScore = {
    textLength: description.length,
    imageCount: images.length,
    structureQuality: 0.1,
    readabilityScore: 0.1,
    overallConfidence: 0.1,
    hasTitle: !!title,
    hasDescription: !!description,
    hasAuthor: !!author,
    hasPublishDate: !!publishedAt,
    hasImages: images.length > 0,
    hasLinks: false,
    isComplete: false
  }
  
  const quality = assessContentQuality(score)
  
  // Generate fallback content
  const fallback = await generateFallbackContent(
    url,
    title,
    description,
    score,
    quality,
    author,
    source,
    publishedAt,
    images,
    rssItem,
    {
      useAIGeneration: options.useAIGeneration,
      useVisualFallbacks: options.useVisualFallbacks,
      useRSSFallback: options.fallbackToRSS,
      generateSummary: true,
      addExternalLink: true
    }
  )
  
  return {
    success: false,
    content: fallback.content,
    title: fallback.title,
    description: fallback.description,
    author: fallback.author,
    source: fallback.source,
    publishedAt: fallback.publishedAt,
    images: fallback.images,
    confidence: fallback.confidence,
    extractionMethod: fallback.extractionMethod,
    quality,
    score,
    fallbackReason: fallback.fallbackReason
  }
}

/**
 * Process extraction result and validate content
 */
function processExtractionResult(
  extracted: ExtractedContent,
  url: string,
  rssItem: any,
  options: PipelineOptions
): EnhancedExtractionResult {
  // Validate content quality
  const score = validateContent(
    extracted.content,
    extracted.title,
    extracted.description,
    extracted.author,
    extracted.publishedAt,
    extracted.images,
    {
      minTextLength: 200,
      strictMode: options.strictMode
    }
  )
  
  const quality = assessContentQuality(score)
  
  return {
    success: extracted.success,
    content: extracted.content,
    title: extracted.title,
    description: extracted.description,
    author: extracted.author,
    source: extracted.source,
    publishedAt: extracted.publishedAt,
    images: extracted.images,
    confidence: extracted.confidence,
    extractionMethod: extracted.extractionMethod,
    quality,
    score,
    fallbackReason: quality.level === 'minimal' ? 'Low quality content' : undefined
  }
}

/**
 * Extract title from URL as fallback
 */
function extractTitleFromURL(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/').filter(segment => segment.length > 0)
    
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1]
      return lastSegment
        .replace(/[-_]/g, ' ')
        .replace(/\.[^/.]+$/, '')
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    return 'Article'
  } catch {
    return 'Article'
  }
}

/**
 * Extract source from URL
 */
function extractSourceFromURL(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'Unknown Source'
  }
}

/**
 * Get cached result
 */
function getCachedResult(url: string, cacheTimeout?: number): EnhancedExtractionResult | null {
  const cached = extractionCache.get(url)
  if (!cached) return null
  
  const now = Date.now()
  const timeout = cacheTimeout || 3600000
  
  if (now - cached.timestamp > timeout) {
    extractionCache.delete(url)
    return null
  }
  
  return cached.result
}

/**
 * Cache result
 */
function cacheResult(url: string, result: EnhancedExtractionResult, cacheTimeout?: number): void {
  extractionCache.set(url, {
    result,
    timestamp: Date.now()
  })
}

/**
 * Clear cache (useful for testing)
 */
export function clearExtractionCache(): void {
  extractionCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number, entries: string[] } {
  return {
    size: extractionCache.size,
    entries: Array.from(extractionCache.keys())
  }
}
