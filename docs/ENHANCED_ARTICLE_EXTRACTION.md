# Enhanced Article Extraction System

This document describes the comprehensive article extraction and handling system implemented to improve embedded articles with better image and text extraction, formatting, and fallback mechanisms.

## Overview

The enhanced system provides multiple strategies for extracting article content, images, and metadata from various sources, with robust fallback mechanisms to ensure maximum content availability even when extraction fails.

## Core Components

### 1. Article Extractor (`lib/article-extractor.ts`)

The main extraction service that orchestrates multiple extraction strategies:

- **HTML Extraction**: Direct parsing of web pages using JSDOM
- **RSS Fallback**: Uses RSS feed data when available
- **API Integration**: Placeholder for services like Mercury API
- **Structured Data**: Extracts from JSON-LD and microdata
- **Heuristic Extraction**: Fallback content extraction when no clear structure is found

**Key Features:**
- Multiple extraction strategies with confidence scoring
- Automatic retry logic with exponential backoff
- Content sanitization and normalization
- Support for various content sources

### 2. Enhanced Image Handler (`lib/enhanced-image-handler.ts`)

Comprehensive image extraction and processing:

- **Multi-source Extraction**: RSS, HTML, structured data
- **Image Validation**: URL validation and format checking
- **Quality Assessment**: Automatic quality scoring based on dimensions and URL patterns
- **Responsive Images**: Support for srcSet and responsive image sets
- **Fallback Images**: Category-based fallback images when extraction fails

**Key Features:**
- Multiple image extraction strategies
- Image quality assessment and sorting
- Responsive image set generation
- Comprehensive fallback system

### 3. Content Formatter (`lib/content-formatter.ts`)

Advanced content processing and formatting:

- **Content Cleaning**: Removes ads, social elements, and unwanted content
- **Text Normalization**: Proper whitespace handling and HTML entity decoding
- **Language Detection**: Automatic language detection for content
- **Reading Metrics**: Word count and reading time calculation
- **Content Analysis**: Detects embedded images and links

**Key Features:**
- Intelligent content cleaning
- Multiple formatting options
- Content analysis and metrics
- Language detection

### 4. Fallback System (`lib/fallback-system.ts`)

Comprehensive fallback mechanisms:

- **RSS Fallback**: Uses RSS data when HTML extraction fails
- **URL-based Fallback**: Extracts basic info from URL structure
- **Category-based Generation**: Generates content based on detected categories
- **Ultimate Fallback**: Generic content when all else fails

**Key Features:**
- Multiple fallback strategies
- Category-based content generation
- URL-based metadata extraction
- Graceful degradation

## API Integration

### Enhanced Article Content API (`app/api/article-content/route.ts`)

The main API endpoint that integrates all components:

```typescript
GET /api/article-content?url=<article_url>&rssData=<rss_json>
```

**Response Format:**
```json
{
  "success": true,
  "content": "Article content...",
  "title": "Article Title",
  "description": "Article description...",
  "author": "Author Name",
  "source": "Source Name",
  "publishedAt": "2024-01-01T00:00:00Z",
  "images": ["image1.jpg", "image2.jpg"],
  "confidence": 0.85,
  "extractionMethod": "html",
  "formatted": {
    "wordCount": 500,
    "readingTime": 3,
    "language": "en",
    "hasImages": true,
    "hasLinks": true
  }
}
```

## Usage Examples

### Basic Article Extraction

```typescript
import { extractArticleContent } from '@/lib/article-extractor'

const content = await extractArticleContent('https://example.com/article', {
  timeout: 15000,
  maxRetries: 3,
  includeImages: true,
  sanitizeContent: true
})
```

### Image Extraction

```typescript
import { extractImages } from '@/lib/enhanced-image-handler'

const images = await extractImages('https://example.com/article', htmlContent, rssItem, {
  maxImages: 5,
  minWidth: 200,
  minHeight: 150,
  preferHighQuality: true
})
```

### Content Formatting

```typescript
import { formatContent } from '@/lib/content-formatter'

const formatted = formatContent(rawContent, {
  maxLength: 10000,
  preserveFormatting: true,
  removeAds: true,
  removeSocial: true,
  addLineBreaks: true
})
```

### Fallback Content

```typescript
import { createFallbackContent } from '@/lib/fallback-system'

const fallback = await createFallbackContent('https://example.com/article', rssItem, {
  useRSSFallback: true,
  useCategoryDetection: true,
  usePlaceholderImages: true
})
```

## Configuration Options

### Extraction Options

```typescript
interface ExtractionOptions {
  timeout?: number          // Request timeout in ms (default: 15000)
  maxRetries?: number       // Maximum retry attempts (default: 3)
  includeImages?: boolean   // Include image extraction (default: true)
  sanitizeContent?: boolean // Sanitize HTML content (default: true)
  fallbackToRSS?: boolean   // Use RSS as fallback (default: true)
}
```

### Image Extraction Options

```typescript
interface ImageExtractionOptions {
  maxImages?: number        // Maximum images to extract (default: 5)
  minWidth?: number         // Minimum image width (default: 200)
  minHeight?: number        // Minimum image height (default: 150)
  preferHighQuality?: boolean // Prefer high-quality images (default: true)
  includeFallbacks?: boolean // Include fallback images (default: true)
  category?: string         // Category for fallback images
  title?: string           // Title for fallback images
}
```

### Formatting Options

```typescript
interface FormattingOptions {
  maxLength?: number        // Maximum content length (default: 10000)
  preserveFormatting?: boolean // Preserve HTML formatting (default: true)
  removeAds?: boolean       // Remove advertisement elements (default: true)
  removeSocial?: boolean    // Remove social media elements (default: true)
  removeComments?: boolean  // Remove comment sections (default: true)
  addLineBreaks?: boolean   // Add line breaks for readability (default: true)
  detectLanguage?: boolean  // Detect content language (default: true)
  extractLinks?: boolean    // Extract embedded links (default: true)
  extractImages?: boolean   // Extract embedded images (default: true)
}
```

## Error Handling

The system implements comprehensive error handling at multiple levels:

1. **Network Errors**: Retry logic with exponential backoff
2. **Parsing Errors**: Graceful fallback to simpler extraction methods
3. **Content Errors**: Fallback to generated content based on available data
4. **Image Errors**: Fallback to category-based placeholder images

## Performance Considerations

- **Caching**: Content is cached to avoid repeated extractions
- **Timeout Management**: Configurable timeouts prevent hanging requests
- **Parallel Processing**: Multiple extraction strategies run in parallel when possible
- **Resource Management**: Proper cleanup of DOM objects and resources

## Monitoring and Logging

The system includes comprehensive logging for:
- Extraction success/failure rates
- Confidence scores for different methods
- Fallback usage patterns
- Performance metrics
- Error tracking

## Future Enhancements

- **AI-powered Extraction**: Integration with AI services for better content understanding
- **Real-time Updates**: WebSocket support for live content updates
- **Advanced Caching**: Redis-based caching for better performance
- **Content Analysis**: Sentiment analysis and topic modeling
- **Multi-language Support**: Enhanced language detection and processing

## Troubleshooting

### Common Issues

1. **Low Confidence Scores**: Check if the source provides structured data or clean HTML
2. **Missing Images**: Verify image URLs are accessible and properly formatted
3. **Content Truncation**: Adjust `maxLength` option or check for content length limits
4. **Slow Extraction**: Increase timeout values or reduce retry attempts

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=article-extraction
```

This will provide detailed logs of the extraction process, including:
- Extraction strategy attempts
- Content parsing steps
- Image extraction results
- Fallback activations
- Performance metrics
