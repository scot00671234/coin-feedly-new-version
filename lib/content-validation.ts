// Enhanced content validation and confidence scoring system

export interface ContentScore {
  textLength: number
  imageCount: number
  structureQuality: number
  readabilityScore: number
  overallConfidence: number
  hasTitle: boolean
  hasDescription: boolean
  hasAuthor: boolean
  hasPublishDate: boolean
  hasImages: boolean
  hasLinks: boolean
  isComplete: boolean
}

export interface ContentQuality {
  level: 'high' | 'medium' | 'low' | 'minimal'
  confidence: number
  issues: string[]
  recommendations: string[]
  fallbackStrategy: 'full-content' | 'enhanced-preview' | 'visual-card' | 'external-link'
}

export interface ValidationOptions {
  minTextLength?: number
  minImageCount?: number
  requireTitle?: boolean
  requireDescription?: boolean
  requireAuthor?: boolean
  requirePublishDate?: boolean
  strictMode?: boolean
}

const DEFAULT_OPTIONS: ValidationOptions = {
  minTextLength: 200,
  minImageCount: 0,
  requireTitle: true,
  requireDescription: false,
  requireAuthor: false,
  requirePublishDate: false,
  strictMode: false
}

/**
 * Validates and scores article content quality
 */
export function validateContent(
  content: string,
  title: string,
  description: string,
  author?: string,
  publishedAt?: Date | string,
  images: string[] = [],
  options: ValidationOptions = {}
): ContentScore {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Clean content for analysis
  const cleanContent = content.replace(/<[^>]*>/g, '').trim()
  const textLength = cleanContent.length
  
  // Count images in content
  const contentImages = (content.match(/<img[^>]*>/gi) || []).length
  const totalImages = images.length + contentImages
  
  // Check for required elements
  const hasTitle = title && title.length > 0
  const hasDescription = description && description.length > 0
  const hasAuthor = author && author.length > 0
  const hasPublishDate = publishedAt !== undefined && publishedAt !== null
  
  // Check for content structure
  const hasImages = totalImages > 0
  const hasLinks = /<a[^>]*href[^>]*>/i.test(content)
  
  // Calculate structure quality (0-1)
  const structureQuality = calculateStructureQuality(content, textLength)
  
  // Calculate readability score (0-1)
  const readabilityScore = calculateReadabilityScore(cleanContent)
  
  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence({
    textLength,
    totalImages,
    structureQuality,
    readabilityScore,
    hasTitle,
    hasDescription,
    hasAuthor,
    hasPublishDate,
    hasImages,
    hasLinks,
    minTextLength: opts.minTextLength
  })
  
  return {
    textLength,
    imageCount: totalImages,
    structureQuality,
    readabilityScore,
    overallConfidence,
    hasTitle,
    hasDescription,
    hasAuthor,
    hasPublishDate,
    hasImages,
    hasLinks,
    isComplete: overallConfidence >= 0.7
  }
}

/**
 * Determines content quality level and fallback strategy
 */
export function assessContentQuality(score: ContentScore): ContentQuality {
  const { overallConfidence, textLength, imageCount, hasTitle, hasDescription } = score
  
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Identify issues
  if (!hasTitle) {
    issues.push('Missing title')
    recommendations.push('Extract title from HTML or use description as fallback')
  }
  
  if (textLength < 200) {
    issues.push('Content too short')
    recommendations.push('Try browser automation or AI content generation')
  }
  
  if (imageCount === 0) {
    issues.push('No images found')
    recommendations.push('Add fallback images or visual elements')
  }
  
  if (!hasDescription) {
    issues.push('No description available')
    recommendations.push('Generate description from content or use title')
  }
  
  // Determine quality level and strategy
  let level: ContentQuality['level']
  let fallbackStrategy: ContentQuality['fallbackStrategy']
  
  if (overallConfidence >= 0.8 && textLength >= 500) {
    level = 'high'
    fallbackStrategy = 'full-content'
  } else if (overallConfidence >= 0.6 && textLength >= 200) {
    level = 'medium'
    fallbackStrategy = 'enhanced-preview'
  } else if (overallConfidence >= 0.3 && (textLength >= 100 || imageCount > 0)) {
    level = 'low'
    fallbackStrategy = 'visual-card'
  } else {
    level = 'minimal'
    fallbackStrategy = 'external-link'
  }
  
  return {
    level,
    confidence: overallConfidence,
    issues,
    recommendations,
    fallbackStrategy
  }
}

/**
 * Calculates structure quality based on HTML structure
 */
function calculateStructureQuality(content: string, textLength: number): number {
  if (textLength === 0) return 0
  
  let score = 0
  
  // Check for proper HTML structure
  const hasParagraphs = /<p[^>]*>/i.test(content)
  const hasHeadings = /<h[1-6][^>]*>/i.test(content)
  const hasLists = /<(ul|ol)[^>]*>/i.test(content)
  const hasDivs = /<div[^>]*>/i.test(content)
  
  if (hasParagraphs) score += 0.3
  if (hasHeadings) score += 0.2
  if (hasLists) score += 0.1
  if (hasDivs) score += 0.1
  
  // Check for content density (avoid too many empty tags)
  const tagCount = (content.match(/<[^>]*>/g) || []).length
  const textToTagRatio = textLength / Math.max(tagCount, 1)
  
  if (textToTagRatio > 50) score += 0.2
  else if (textToTagRatio > 20) score += 0.1
  
  // Check for proper content length
  if (textLength > 1000) score += 0.1
  else if (textLength > 500) score += 0.05
  
  return Math.min(score, 1)
}

/**
 * Calculates basic readability score
 */
function calculateReadabilityScore(text: string): number {
  if (text.length === 0) return 0
  
  const words = text.split(/\s+/).filter(word => word.length > 0)
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
  const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0)
  
  if (words.length === 0 || sentences.length === 0) return 0
  
  // Average words per sentence
  const avgWordsPerSentence = words.length / sentences.length
  
  // Average characters per word
  const avgCharsPerWord = text.length / words.length
  
  // Calculate basic readability (simplified Flesch Reading Ease)
  let score = 0
  
  // Prefer moderate sentence length (10-20 words)
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
    score += 0.4
  } else if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 30) {
    score += 0.2
  }
  
  // Prefer moderate word length (4-6 characters)
  if (avgCharsPerWord >= 4 && avgCharsPerWord <= 6) {
    score += 0.3
  } else if (avgCharsPerWord >= 3 && avgCharsPerWord <= 8) {
    score += 0.15
  }
  
  // Prefer multiple paragraphs
  if (paragraphs.length >= 3) {
    score += 0.2
  } else if (paragraphs.length >= 2) {
    score += 0.1
  }
  
  // Bonus for reasonable content length
  if (words.length >= 100) {
    score += 0.1
  }
  
  return Math.min(score, 1)
}

/**
 * Calculates overall confidence score
 */
function calculateOverallConfidence(params: {
  textLength: number
  totalImages: number
  structureQuality: number
  readabilityScore: number
  hasTitle: boolean
  hasDescription: boolean
  hasAuthor: boolean
  hasPublishDate: boolean
  hasImages: boolean
  hasLinks: boolean
  minTextLength: number
}): number {
  const {
    textLength,
    totalImages,
    structureQuality,
    readabilityScore,
    hasTitle,
    hasDescription,
    hasAuthor,
    hasPublishDate,
    hasImages,
    hasLinks,
    minTextLength
  } = params
  
  let confidence = 0
  
  // Text length factor (40% weight)
  const textScore = Math.min(textLength / minTextLength, 2) // Cap at 2x minimum
  confidence += (textScore / 2) * 0.4
  
  // Structure quality (25% weight)
  confidence += structureQuality * 0.25
  
  // Readability (15% weight)
  confidence += readabilityScore * 0.15
  
  // Required elements (20% weight)
  const requiredElements = [hasTitle, hasDescription].filter(Boolean).length
  confidence += (requiredElements / 2) * 0.2
  
  // Optional elements bonus
  const optionalElements = [hasAuthor, hasPublishDate, hasImages, hasLinks].filter(Boolean).length
  confidence += (optionalElements / 4) * 0.1
  
  // Image bonus
  if (totalImages > 0) {
    confidence += Math.min(totalImages / 5, 1) * 0.05
  }
  
  return Math.min(confidence, 1)
}

/**
 * Gets content quality badge information
 */
export function getContentQualityBadge(confidence: number): {
  text: string
  color: string
  bgColor: string
} {
  if (confidence >= 0.8) {
    return {
      text: 'Full Article',
      color: 'text-green-700',
      bgColor: 'bg-green-100'
    }
  } else if (confidence >= 0.6) {
    return {
      text: 'Summary',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100'
    }
  } else if (confidence >= 0.3) {
    return {
      text: 'Preview',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100'
    }
  } else {
    return {
      text: 'External Link',
      color: 'text-red-700',
      bgColor: 'bg-red-100'
    }
  }
}

/**
 * Validates if content meets minimum requirements
 */
export function isContentValid(score: ContentScore, options: ValidationOptions = {}): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  if (opts.strictMode) {
    return score.overallConfidence >= 0.8 && 
           score.textLength >= opts.minTextLength &&
           score.hasTitle
  }
  
  return score.overallConfidence >= 0.3 && score.hasTitle
}
