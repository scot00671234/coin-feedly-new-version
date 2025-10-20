import { NextRequest, NextResponse } from 'next/server'
import { extractWithEnhancedPipeline } from '@/lib/enhanced-extraction-pipeline'
import { extractImages } from '@/lib/enhanced-image-handler'
import { formatContent } from '@/lib/content-formatter'
import { getSourceConfig, extractWithSourceSelectors } from '@/lib/source-specific-optimizations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const rssData = searchParams.get('rssData') // Optional RSS data as JSON string

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  let rssItem = null
  if (rssData) {
    try {
      rssItem = JSON.parse(rssData)
    } catch (error) {
      console.warn('Failed to parse RSS data:', error)
    }
  }

  try {

    // Use enhanced extraction pipeline
    const extractedResult = await extractWithEnhancedPipeline(url, rssItem, {
      timeout: 15000,
      maxRetries: 3,
      includeImages: true,
      sanitizeContent: true,
      fallbackToRSS: true,
      useBrowserAutomation: false, // Can be enabled for problematic sites
      useAIGeneration: false, // Can be enabled for premium features
      useVisualFallbacks: true,
      enableCaching: true,
      cacheTimeout: 3600000, // 1 hour
      strictMode: false
    })

    // Extract additional images if needed
    const additionalImages = await extractImages(url, extractedResult.content, rssItem, {
      maxImages: 5,
      minWidth: 200,
      minHeight: 150,
      preferHighQuality: true,
      includeFallbacks: true,
      category: extractedResult.source || 'default',
      title: extractedResult.title
    })

    // Combine images from extraction and additional extraction
    const allImages = [...extractedResult.images, ...additionalImages.map(img => img.url)]
    const uniqueImages = [...new Set(allImages)] // Remove duplicates

    // Check for browser view options
    const browserView = searchParams.get('browserView') === 'true'
    const readingMode = searchParams.get('readingMode') === 'true'

    // Format content for better display
    const formattedContent = formatContent(extractedResult.content, {
      maxLength: browserView ? 15000 : 10000, // Allow longer content for browser view
      preserveFormatting: true,
      removeAds: true,
      removeSocial: true,
      removeComments: true,
      addLineBreaks: true,
      detectLanguage: true,
      extractLinks: true,
      extractImages: true,
      // Browser-specific options
      browserView,
      readingMode,
      removeNavigation: browserView,
      removeSidebars: browserView,
      removeFooters: browserView,
      removeHeaders: browserView,
      enhanceReadability: readingMode
    })

    return NextResponse.json({
      success: extractedResult.success,
      content: extractedResult.content,
      title: extractedResult.title,
      description: extractedResult.description,
      author: extractedResult.author,
      source: extractedResult.source,
      publishedAt: extractedResult.publishedAt,
      images: uniqueImages,
      confidence: extractedResult.confidence,
      extractionMethod: extractedResult.extractionMethod,
      quality: extractedResult.quality,
      score: extractedResult.score,
      fallbackReason: extractedResult.fallbackReason,
      formatted: formattedContent,
      wordCount: formattedContent.wordCount,
      readingTime: formattedContent.readingTime,
      language: formattedContent.language,
      hasImages: formattedContent.hasImages,
      hasLinks: formattedContent.hasLinks
    })

  } catch (error) {
    console.error('Error fetching article content:', error)
    
    // Try ultimate fallback using enhanced pipeline
    try {
      const fallbackResult = await extractWithEnhancedPipeline(url, rssItem, {
        timeout: 5000,
        maxRetries: 1,
        includeImages: true,
        sanitizeContent: true,
        fallbackToRSS: true,
        useBrowserAutomation: false,
        useAIGeneration: false,
        useVisualFallbacks: true,
        enableCaching: false,
        strictMode: false
      })
      
      return NextResponse.json({
        success: false,
        content: fallbackResult.content,
        title: fallbackResult.title,
        description: fallbackResult.description,
        author: fallbackResult.author,
        source: fallbackResult.source,
        publishedAt: fallbackResult.publishedAt,
        images: fallbackResult.images,
        confidence: fallbackResult.confidence,
        extractionMethod: fallbackResult.extractionMethod,
        quality: fallbackResult.quality,
        score: fallbackResult.score,
        fallbackReason: 'Error fallback - enhanced pipeline',
        formatted: null
      })
    } catch (fallbackError) {
      console.error('Enhanced fallback also failed:', fallbackError)
      return NextResponse.json({ 
        error: 'Failed to fetch article content and enhanced fallback failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }
}
