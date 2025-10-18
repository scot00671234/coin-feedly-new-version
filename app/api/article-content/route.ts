import { NextRequest, NextResponse } from 'next/server'
import { extractArticleContent } from '@/lib/article-extractor'
import { extractImages } from '@/lib/enhanced-image-handler'
import { formatContent } from '@/lib/content-formatter'
import { createFallbackContent } from '@/lib/fallback-system'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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

    // Extract article content using enhanced system
    const extractedContent = await extractArticleContent(url, rssItem, {
      timeout: 15000,
      maxRetries: 3,
      includeImages: true,
      sanitizeContent: true,
      fallbackToRSS: true
    })

    // Extract images separately for better handling
    const images = await extractImages(url, extractedContent.content, rssItem, {
      maxImages: 5,
      minWidth: 200,
      minHeight: 150,
      preferHighQuality: true,
      includeFallbacks: true,
      category: extractedContent.source || 'default',
      title: extractedContent.title
    })

    // Format content for better display
    const formattedContent = formatContent(extractedContent.content, {
      maxLength: 10000,
      preserveFormatting: true,
      removeAds: true,
      removeSocial: true,
      removeComments: true,
      addLineBreaks: true,
      detectLanguage: true,
      extractLinks: true,
      extractImages: true
    })

    // If extraction failed, try fallback system
    if (!extractedContent.success || extractedContent.confidence < 0.5) {
      const fallbackContent = await createFallbackContent(url, rssItem, {
        useRSSFallback: true,
        useCategoryDetection: true,
        usePlaceholderImages: true,
        useGeneratedContent: true,
        maxRetries: 2,
        timeout: 10000
      })

      return NextResponse.json({
        success: false,
        content: fallbackContent.content,
        title: fallbackContent.title,
        description: fallbackContent.description,
        author: fallbackContent.author,
        source: fallbackContent.source,
        publishedAt: fallbackContent.publishedAt,
        category: fallbackContent.category,
        images: [fallbackContent.imageUrl],
        confidence: fallbackContent.confidence,
        fallbackReason: fallbackContent.fallbackReason,
        formatted: formattedContent,
        extractionMethod: 'fallback'
      })
    }

    return NextResponse.json({
      success: true,
      content: extractedContent.content,
      title: extractedContent.title,
      description: extractedContent.description,
      author: extractedContent.author,
      source: extractedContent.source,
      publishedAt: extractedContent.publishedAt,
      images: images.map(img => img.url),
      confidence: extractedContent.confidence,
      extractionMethod: extractedContent.extractionMethod,
      formatted: formattedContent,
      wordCount: formattedContent.wordCount,
      readingTime: formattedContent.readingTime,
      language: formattedContent.language,
      hasImages: formattedContent.hasImages,
      hasLinks: formattedContent.hasLinks
    })

  } catch (error) {
    console.error('Error fetching article content:', error)
    
    // Try ultimate fallback
    try {
      const fallbackContent = await createFallbackContent(
        request.url, 
        null, 
        { useGeneratedContent: true }
      )
      
      return NextResponse.json({
        success: false,
        content: fallbackContent.content,
        title: fallbackContent.title,
        description: fallbackContent.description,
        author: fallbackContent.author,
        source: fallbackContent.source,
        publishedAt: fallbackContent.publishedAt,
        category: fallbackContent.category,
        images: [fallbackContent.imageUrl],
        confidence: fallbackContent.confidence,
        fallbackReason: 'Error fallback',
        extractionMethod: 'fallback'
      })
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return NextResponse.json({ 
        error: 'Failed to fetch article content and fallback failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }
}
