// Comprehensive fallback system for when article extraction fails
import { getRandomCryptoImage } from './crypto-images'
import { detectArticleCategories } from './category-detector'

export interface FallbackContent {
  title: string
  description: string
  content: string
  imageUrl: string
  author: string
  source: string
  publishedAt: Date
  category: string
  confidence: number
  fallbackReason: string
}

export interface FallbackOptions {
  useRSSFallback?: boolean
  useCategoryDetection?: boolean
  usePlaceholderImages?: boolean
  useGeneratedContent?: boolean
  maxRetries?: number
  timeout?: number
}

const DEFAULT_OPTIONS: FallbackOptions = {
  useRSSFallback: true,
  useCategoryDetection: true,
  usePlaceholderImages: true,
  useGeneratedContent: true,
  maxRetries: 3,
  timeout: 10000
}

// Main fallback system
export async function createFallbackContent(
  url: string,
  rssItem?: any,
  options: FallbackOptions = {}
): Promise<FallbackContent> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Try multiple fallback strategies
  const strategies = [
    () => tryRSSFallback(url, rssItem, opts),
    () => tryURLFallback(url, opts),
    () => tryCategoryBasedFallback(url, rssItem, opts),
    () => tryGeneratedFallback(url, opts)
  ]
  
  for (const strategy of strategies) {
    try {
      const result = await strategy()
      if (result && result.confidence > 0.3) {
        return result
      }
    } catch (error) {
      console.warn(`Fallback strategy failed:`, error)
    }
  }
  
  // Ultimate fallback
  return createUltimateFallback(url, rssItem)
}

// Try to extract content from RSS item
async function tryRSSFallback(
  url: string,
  rssItem: any,
  options: FallbackOptions
): Promise<FallbackContent | null> {
  if (!rssItem || !options.useRSSFallback) {
    return null
  }
  
  try {
    const title = rssItem.title || extractTitleFromURL(url)
    const description = rssItem.description || rssItem.summary || ''
    const content = rssItem.content || rssItem.contentEncoded || description
    const author = rssItem.creator || rssItem.author || extractAuthorFromURL(url)
    const source = rssItem.source || extractSourceFromURL(url)
    const publishedAt = rssItem.pubDate ? new Date(rssItem.pubDate) : new Date()
    
    // Detect category
    const category = options.useCategoryDetection ? 
      detectArticleCategories(title, description, content).primary : 'default'
    
    // Get image
    const imageUrl = await getFallbackImage(url, title, category, options)
    
    return {
      title,
      description: cleanDescription(description),
      content: cleanContent(content),
      imageUrl,
      author,
      source,
      publishedAt,
      category,
      confidence: 0.7,
      fallbackReason: 'RSS content extraction'
    }
    
  } catch (error) {
    console.error('RSS fallback failed:', error)
    return null
  }
}

// Try to extract content from URL
async function tryURLFallback(
  url: string,
  options: FallbackOptions
): Promise<FallbackContent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoinFeedly/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(options.timeout || 10000)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    const title = extractTitleFromHTML(html) || extractTitleFromURL(url)
    const description = extractDescriptionFromHTML(html) || extractDescriptionFromURL(url)
    const content = extractContentFromHTML(html) || description
    const author = extractAuthorFromHTML(html) || extractAuthorFromURL(url)
    const source = extractSourceFromURL(url)
    const publishedAt = extractPublishedDateFromHTML(html) || new Date()
    
    // Detect category
    const category = options.useCategoryDetection ? 
      detectArticleCategories(title, description, content).primary : 'default'
    
    // Get image
    const imageUrl = await getFallbackImage(url, title, category, options)
    
    return {
      title,
      description: cleanDescription(description),
      content: cleanContent(content),
      imageUrl,
      author,
      source,
      publishedAt,
      category,
      confidence: 0.6,
      fallbackReason: 'URL content extraction'
    }
    
  } catch (error) {
    console.error('URL fallback failed:', error)
    return null
  }
}

// Try category-based fallback
async function tryCategoryBasedFallback(
  url: string,
  rssItem: any,
  options: FallbackOptions
): Promise<FallbackContent | null> {
  if (!options.useCategoryDetection) {
    return null
  }
  
  try {
    const title = rssItem?.title || extractTitleFromURL(url)
    const description = rssItem?.description || extractDescriptionFromURL(url)
    const content = rssItem?.content || description
    
    // Detect category
    const categoryResult = detectArticleCategories(title, description, content)
    const category = categoryResult.primary
    
    // Generate content based on category
    const generatedContent = generateCategoryBasedContent(category, title, description)
    
    // Get image
    const imageUrl = await getFallbackImage(url, title, category, options)
    
    return {
      title,
      description: cleanDescription(description),
      content: generatedContent,
      imageUrl,
      author: extractAuthorFromURL(url),
      source: extractSourceFromURL(url),
      publishedAt: new Date(),
      category,
      confidence: 0.5,
      fallbackReason: 'Category-based content generation'
    }
    
  } catch (error) {
    console.error('Category-based fallback failed:', error)
    return null
  }
}

// Try generated fallback
async function tryGeneratedFallback(
  url: string,
  options: FallbackOptions
): Promise<FallbackContent | null> {
  if (!options.useGeneratedContent) {
    return null
  }
  
  try {
    const title = extractTitleFromURL(url)
    const description = extractDescriptionFromURL(url)
    const content = generateGenericContent(title, description)
    const category = 'default'
    
    // Get image
    const imageUrl = await getFallbackImage(url, title, category, options)
    
    return {
      title,
      description: cleanDescription(description),
      content,
      imageUrl,
      author: extractAuthorFromURL(url),
      source: extractSourceFromURL(url),
      publishedAt: new Date(),
      category,
      confidence: 0.4,
      fallbackReason: 'Generated content'
    }
    
  } catch (error) {
    console.error('Generated fallback failed:', error)
    return null
  }
}

// Ultimate fallback when all else fails
function createUltimateFallback(url: string, rssItem?: any): FallbackContent {
  const title = rssItem?.title || extractTitleFromURL(url) || 'Crypto News Article'
  const description = rssItem?.description || 'Stay updated with the latest cryptocurrency news and market insights.'
  const content = rssItem?.content || rssItem?.description || generateGenericContent(title, description)
  const category = 'default'
  
  return {
    title,
    description: cleanDescription(description),
    content,
    imageUrl: getRandomCryptoImage(category, title),
    author: 'CoinFeedly',
    source: extractSourceFromURL(url),
    publishedAt: new Date(),
    category,
    confidence: 0.2,
    fallbackReason: 'Ultimate fallback'
  }
}

// Helper functions for content extraction

function extractTitleFromURL(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Extract from path segments
    const segments = pathname.split('/').filter(segment => segment.length > 0)
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1]
      return lastSegment
        .replace(/[-_]/g, ' ')
        .replace(/\.(html|php|asp|aspx)$/i, '')
        .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    return 'Crypto News Article'
  } catch {
    return 'Crypto News Article'
  }
}

function extractDescriptionFromURL(url: string): string {
  const source = extractSourceFromURL(url)
  return `Latest news and updates from ${source}. Stay informed about cryptocurrency markets, blockchain technology, and digital assets.`
}

function extractAuthorFromURL(url: string): string {
  const source = extractSourceFromURL(url)
  return source
}

function extractSourceFromURL(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // Extract source from hostname
    if (hostname.includes('cointelegraph')) return 'CoinTelegraph'
    if (hostname.includes('coindesk')) return 'CoinDesk'
    if (hostname.includes('decrypt')) return 'Decrypt'
    if (hostname.includes('bitcoinist')) return 'Bitcoinist'
    if (hostname.includes('cryptonews')) return 'CryptoNews'
    if (hostname.includes('cryptoslate')) return 'CryptoSlate'
    if (hostname.includes('theblock')) return 'The Block'
    if (hostname.includes('coindesk')) return 'CoinDesk'
    if (hostname.includes('bloomberg')) return 'Bloomberg'
    if (hostname.includes('reuters')) return 'Reuters'
    if (hostname.includes('cnbc')) return 'CNBC'
    if (hostname.includes('forbes')) return 'Forbes'
    if (hostname.includes('wsj')) return 'Wall Street Journal'
    if (hostname.includes('ft')) return 'Financial Times'
    
    // Generic fallback
    return hostname.replace('www.', '').split('.')[0]
      .replace(/\b\w/g, l => l.toUpperCase())
  } catch {
    return 'News Source'
  }
}

function extractTitleFromHTML(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    return cleanText(titleMatch[1])
  }
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match && h1Match[1]) {
    return cleanText(h1Match[1])
  }
  
  return null
}

function extractDescriptionFromHTML(html: string): string | null {
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (metaMatch && metaMatch[1]) {
    return cleanText(metaMatch[1])
  }
  
  const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  if (ogMatch && ogMatch[1]) {
    return cleanText(ogMatch[1])
  }
  
  return null
}

function extractContentFromHTML(html: string): string | null {
  // Try to find main content area
  const contentSelectors = [
    'article', '[role="main"]', '.article-content', '.post-content',
    '.entry-content', '.content', '.story-body', '.article-body'
  ]
  
  for (const selector of contentSelectors) {
    const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i')
    const match = html.match(regex)
    if (match && match[1]) {
      return cleanText(match[1])
    }
  }
  
  return null
}

function extractAuthorFromHTML(html: string): string | null {
  const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i)
  if (authorMatch && authorMatch[1]) {
    return cleanText(authorMatch[1])
  }
  
  return null
}

function extractPublishedDateFromHTML(html: string): Date | null {
  const dateMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i)
  if (dateMatch && dateMatch[1]) {
    const date = new Date(dateMatch[1])
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  return null
}

// Content generation functions

function generateCategoryBasedContent(category: string, title: string, description: string): string {
  const categoryTemplates = {
    bitcoin: `Bitcoin continues to be a major topic in the cryptocurrency space. ${title} highlights important developments in the Bitcoin ecosystem. ${description}

Bitcoin's role as digital gold and store of value remains a key focus for investors and analysts. The cryptocurrency market often follows Bitcoin's lead, making it crucial to stay informed about Bitcoin-related news and developments.

Key areas of interest include:
- Bitcoin price movements and market analysis
- Network upgrades and technical developments
- Adoption by institutions and governments
- Regulatory developments affecting Bitcoin
- Mining and energy consumption discussions

Stay updated with the latest Bitcoin news to make informed decisions in the cryptocurrency market.`,
    
    altcoins: `The altcoin market offers diverse opportunities beyond Bitcoin. ${title} explores the latest developments in alternative cryptocurrencies. ${description}

Altcoins represent a wide range of blockchain projects, each with unique features and use cases. From smart contract platforms to privacy coins, the altcoin ecosystem continues to evolve rapidly.

Important considerations for altcoin investors:
- Project fundamentals and team credibility
- Market capitalization and trading volume
- Technological innovation and adoption
- Regulatory compliance and legal status
- Community support and development activity

Diversification across different altcoins can help manage risk while potentially capturing growth opportunities.`,
    
    defi: `Decentralized Finance (DeFi) is revolutionizing traditional financial services. ${title} covers the latest DeFi developments and innovations. ${description}

DeFi protocols enable permissionless access to financial services like lending, borrowing, trading, and yield farming. The ecosystem continues to grow with new protocols and improved user experiences.

Key DeFi areas to watch:
- Lending and borrowing protocols
- Decentralized exchanges (DEXs)
- Yield farming and liquidity mining
- Cross-chain interoperability
- Regulatory developments

DeFi offers new opportunities for earning yield and accessing financial services, but also comes with smart contract risks and market volatility.`,
    
    macro: `Macroeconomic factors significantly impact cryptocurrency markets. ${title} analyzes the broader economic context affecting digital assets. ${description}

Cryptocurrency markets are increasingly influenced by traditional financial markets, central bank policies, and global economic conditions. Understanding these macro factors is crucial for informed investment decisions.

Key macro factors to consider:
- Federal Reserve interest rate decisions
- Inflation and economic growth data
- Geopolitical events and market sentiment
- Traditional asset performance
- Regulatory and policy developments

Cryptocurrency investors should stay informed about macro trends to better understand market movements and potential opportunities.`,
    
    default: `Stay informed about the latest developments in cryptocurrency and blockchain technology. ${title} provides valuable insights into the digital asset space. ${description}

The cryptocurrency market continues to evolve with new technologies, regulations, and adoption patterns. Keeping up with the latest news and analysis is essential for making informed decisions.

Key areas to monitor:
- Market trends and price movements
- Regulatory developments
- Technological innovations
- Institutional adoption
- Market sentiment and analysis

Whether you're a seasoned investor or new to cryptocurrency, staying informed about the latest developments is crucial for success in this dynamic market.`
  }
  
  return categoryTemplates[category as keyof typeof categoryTemplates] || categoryTemplates.default
}

function generateGenericContent(title: string, description: string): string {
  return `Stay updated with the latest cryptocurrency news and market insights. ${title} provides important information about the digital asset space.

${description}

The cryptocurrency market continues to evolve rapidly, with new developments in technology, regulation, and adoption. Keeping informed about these changes is crucial for anyone interested in digital assets.

Key areas of focus include:
- Market analysis and price movements
- Regulatory developments and compliance
- Technological innovations and upgrades
- Institutional adoption and investment
- Security and risk management

Whether you're an experienced trader or new to cryptocurrency, staying informed about the latest news and developments is essential for making informed decisions in this dynamic market.`
}

// Image fallback system

async function getFallbackImage(
  url: string,
  title: string,
  category: string,
  options: FallbackOptions
): Promise<string> {
  if (!options.usePlaceholderImages) {
    return ''
  }
  
  try {
    // Try to extract image from URL first
    const extractedImage = await extractImageFromURL(url)
    if (extractedImage) {
      return extractedImage
    }
  } catch (error) {
    console.warn('Failed to extract image from URL:', error)
  }
  
  // Fallback to category-based image
  return getRandomCryptoImage(category, title)
}

async function extractImageFromURL(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoinFeedly/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      return null
    }
    
    const html = await response.text()
    
    // Look for Open Graph image
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    if (ogMatch && ogMatch[1]) {
      return ogMatch[1]
    }
    
    // Look for Twitter card image
    const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
    if (twitterMatch && twitterMatch[1]) {
      return twitterMatch[1]
    }
    
    // Look for first image in content
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
    
    return null
  } catch (error) {
    console.warn('Failed to extract image from URL:', error)
    return null
  }
}

// Utility functions

function cleanDescription(description: string): string {
  return description
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500)
}

function cleanContent(content: string): string {
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
}
