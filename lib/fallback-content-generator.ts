// Enhanced fallback content generation system

import { ContentScore, ContentQuality } from './content-validation'

export interface FallbackContent {
  content: string
  title: string
  description: string
  author?: string
  source?: string
  publishedAt?: Date
  images: string[]
  confidence: number
  fallbackReason: string
  extractionMethod: 'rss' | 'html' | 'api' | 'fallback' | 'ai-generated' | 'visual'
}

export interface FallbackOptions {
  useAIGeneration?: boolean
  useVisualFallbacks?: boolean
  useRSSFallback?: boolean
  generateSummary?: boolean
  addExternalLink?: boolean
  maxRetries?: number
  timeout?: number
}

const DEFAULT_OPTIONS: FallbackOptions = {
  useAIGeneration: false,
  useVisualFallbacks: true,
  useRSSFallback: true,
  generateSummary: true,
  addExternalLink: true,
  maxRetries: 2,
  timeout: 10000
}

/**
 * Generates fallback content based on content quality assessment
 */
export async function generateFallbackContent(
  url: string,
  title: string,
  description: string,
  author?: string,
  source?: string,
  publishedAt?: Date,
  images: string[] = [],
  rssItem?: any,
  score: ContentScore,
  quality: ContentQuality,
  options: FallbackOptions = {}
): Promise<FallbackContent> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Determine the best fallback strategy
  const strategy = quality.fallbackStrategy
  
  switch (strategy) {
    case 'full-content':
      return generateFullContentFallback(url, title, description, author, source, publishedAt, images, score)
    
    case 'enhanced-preview':
      return generateEnhancedPreviewFallback(url, title, description, author, source, publishedAt, images, score, rssItem, opts)
    
    case 'visual-card':
      return generateVisualCardFallback(url, title, description, author, source, publishedAt, images, score, opts)
    
    case 'external-link':
      return generateExternalLinkFallback(url, title, description, author, source, publishedAt, images, score)
    
    default:
      return generateMinimalFallback(url, title, description, author, source, publishedAt, images, score)
  }
}

/**
 * Generates full content fallback (high confidence)
 */
function generateFullContentFallback(
  url: string,
  title: string,
  description: string,
  author?: string,
  source?: string,
  publishedAt?: Date,
  images: string[] = [],
  score: ContentScore
): FallbackContent {
  return {
    content: `
      <div class="article-content">
        <header class="article-header">
          <h1 class="article-title">${title}</h1>
          ${author ? `<div class="article-author">By ${author}</div>` : ''}
          ${publishedAt ? `<div class="article-date">${formatDate(publishedAt)}</div>` : ''}
        </header>
        
        <div class="article-body">
          <div class="article-description">
            <p>${description}</p>
          </div>
          
          <div class="content-quality-indicator">
            <span class="quality-badge quality-high">Full Article</span>
            <span class="confidence-score">${Math.round(score.overallConfidence * 100)}% confidence</span>
          </div>
        </div>
      </div>
    `,
    title,
    description,
    author,
    source,
    publishedAt,
    images,
    confidence: score.overallConfidence,
    fallbackReason: 'High confidence content',
    extractionMethod: 'html'
  }
}

/**
 * Generates enhanced preview fallback (medium confidence)
 */
function generateEnhancedPreviewFallback(
  url: string,
  title: string,
  description: string,
  author?: string,
  source?: string,
  publishedAt?: Date,
  images: string[] = [],
  score: ContentScore,
  rssItem?: any,
  options: FallbackOptions
): FallbackContent {
  const summary = options.generateSummary ? generateAISummary(title, description) : description
  
  return {
    content: `
      <div class="enhanced-preview">
        <header class="preview-header">
          <h1 class="preview-title">${title}</h1>
          <div class="preview-meta">
            ${author ? `<span class="author">By ${author}</span>` : ''}
            ${publishedAt ? `<span class="date">${formatDate(publishedAt)}</span>` : ''}
            ${source ? `<span class="source">${source}</span>` : ''}
          </div>
        </header>
        
        <div class="preview-content">
          <div class="preview-description">
            <p>${summary}</p>
          </div>
          
          ${images.length > 0 ? `
            <div class="preview-images">
              <img src="${images[0]}" alt="${title}" class="preview-image" />
            </div>
          ` : ''}
          
          <div class="preview-actions">
            <a href="${url}" target="_blank" class="read-more-btn">
              Read Full Article
            </a>
            <div class="content-quality-indicator">
              <span class="quality-badge quality-medium">Summary</span>
              <span class="confidence-score">${Math.round(score.overallConfidence * 100)}% confidence</span>
            </div>
          </div>
        </div>
      </div>
    `,
    title,
    description: summary,
    author,
    source,
    publishedAt,
    images,
    confidence: score.overallConfidence,
    fallbackReason: 'Partial content with enhanced preview',
    extractionMethod: 'fallback'
  }
}

/**
 * Generates visual card fallback (low confidence)
 */
function generateVisualCardFallback(
  url: string,
  title: string,
  description: string,
  author?: string,
  source?: string,
  publishedAt?: Date,
  images: string[] = [],
  score: ContentScore,
  options: FallbackOptions
): FallbackContent {
  const heroImage = images[0] || generateCryptoImage(title)
  const category = detectCategoryFromTitle(title)
  
  return {
    content: `
      <div class="visual-card">
        <div class="card-image">
          <img src="${heroImage}" alt="${title}" class="hero-image" />
          <div class="image-overlay">
            <div class="overlay-content">
              <h1 class="card-title">${title}</h1>
              <p class="card-description">${description}</p>
            </div>
          </div>
        </div>
        
        <div class="card-content">
          <div class="card-meta">
            ${author ? `<span class="author">By ${author}</span>` : ''}
            ${publishedAt ? `<span class="date">${formatDate(publishedAt)}</span>` : ''}
            ${source ? `<span class="source">${source}</span>` : ''}
          </div>
          
          <div class="card-actions">
            <a href="${url}" target="_blank" class="card-btn primary">
              Read Full Story
            </a>
            <button class="card-btn secondary">Save for Later</button>
          </div>
          
          <div class="content-quality-indicator">
            <span class="quality-badge quality-low">Preview</span>
            <span class="confidence-score">${Math.round(score.overallConfidence * 100)}% confidence</span>
          </div>
        </div>
      </div>
    `,
    title,
    description,
    author,
    source,
    publishedAt,
    images: [heroImage],
    confidence: score.overallConfidence,
    fallbackReason: 'Visual content with minimal text',
    extractionMethod: 'visual'
  }
}

/**
 * Generates external link fallback (minimal confidence)
 */
function generateExternalLinkFallback(
  url: string,
  title: string,
  description: string,
  author?: string,
  source?: string,
  publishedAt?: Date,
  images: string[] = [],
  score: ContentScore
): FallbackContent {
  return {
    content: `
      <div class="external-link-card">
        <div class="link-header">
          <h1 class="link-title">${title}</h1>
          <div class="link-meta">
            ${author ? `<span class="author">By ${author}</span>` : ''}
            ${publishedAt ? `<span class="date">${formatDate(publishedAt)}</span>` : ''}
            ${source ? `<span class="source">${source}</span>` : ''}
          </div>
        </div>
        
        <div class="link-content">
          <p class="link-description">${description}</p>
          
          <div class="link-actions">
            <a href="${url}" target="_blank" class="external-link-btn">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Continue reading on ${source || 'original source'}
            </a>
          </div>
          
          <div class="content-quality-indicator">
            <span class="quality-badge quality-minimal">External Link</span>
            <span class="confidence-score">${Math.round(score.overallConfidence * 100)}% confidence</span>
          </div>
        </div>
      </div>
    `,
    title,
    description,
    author,
    source,
    publishedAt,
    images,
    confidence: score.overallConfidence,
    fallbackReason: 'Minimal content, external link required',
    extractionMethod: 'fallback'
  }
}

/**
 * Generates minimal fallback (last resort)
 */
function generateMinimalFallback(
  url: string,
  title: string,
  description: string,
  author?: string,
  source?: string,
  publishedAt?: Date,
  images: string[] = [],
  score: ContentScore
): FallbackContent {
  return {
    content: `
      <div class="minimal-fallback">
        <h1 class="fallback-title">${title}</h1>
        <p class="fallback-description">${description || 'Content unavailable'}</p>
        <a href="${url}" target="_blank" class="fallback-link">
          View Original Article
        </a>
      </div>
    `,
    title,
    description: description || 'Content unavailable',
    author,
    source,
    publishedAt,
    images,
    confidence: 0.1,
    fallbackReason: 'Minimal fallback - last resort',
    extractionMethod: 'fallback'
  }
}

/**
 * Generates AI summary for enhanced previews
 */
function generateAISummary(title: string, description: string): string {
  // This would integrate with an AI service like OpenAI
  // For now, return an enhanced description
  if (description.length > 200) {
    return description.substring(0, 200) + '...'
  }
  return description
}

/**
 * Generates crypto-themed image based on title
 */
function generateCryptoImage(title: string): string {
  const category = detectCategoryFromTitle(title)
  const imageMap: Record<string, string> = {
    'bitcoin': '/images/crypto/bitcoin-bg.jpg',
    'ethereum': '/images/crypto/ethereum-bg.jpg',
    'defi': '/images/crypto/defi-bg.jpg',
    'altcoins': '/images/crypto/altcoins-bg.jpg',
    'macro': '/images/crypto/macro-bg.jpg',
    'default': '/images/crypto/default-bg.jpg'
  }
  
  return imageMap[category] || imageMap.default
}

/**
 * Detects category from title for image selection
 */
function detectCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) return 'bitcoin'
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) return 'ethereum'
  if (titleLower.includes('defi') || titleLower.includes('decentralized')) return 'defi'
  if (titleLower.includes('altcoin') || titleLower.includes('crypto')) return 'altcoins'
  if (titleLower.includes('market') || titleLower.includes('price')) return 'macro'
  
  return 'default'
}

/**
 * Formats date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
