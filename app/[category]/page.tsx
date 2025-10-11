import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import CategoryPage from '@/components/CategoryPage'
import { Article } from '@/types'

const categories = ['bitcoin', 'altcoins', 'defi', 'macro']

function getMockArticles(category: string): Article[] {
  const mockArticles: Article[] = [
    {
      id: '1',
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Market Analysis: Latest Trends and Insights`,
      description: `Comprehensive analysis of the current ${category} market conditions, including price movements, trading volumes, and future outlook.`,
      content: null,
      url: `https://example.com/${category}-analysis-1`,
      publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
      category: category,
      source: {
        id: '1',
        name: 'CryptoNews',
        url: 'https://cryptonews.com'
      }
    },
    {
      id: '2',
      title: `Breaking: Major ${category.charAt(0).toUpperCase() + category.slice(1)} Development Announced`,
      description: `Significant development in the ${category} space that could impact market dynamics and investor sentiment.`,
      content: null,
      url: `https://example.com/${category}-breaking-1`,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      imageUrl: 'https://images.unsplash.com/photo-1642790105077-9a1b762b8d2a?w=800&h=400&fit=crop',
      category: category,
      source: {
        id: '2',
        name: 'CoinDesk',
        url: 'https://coindesk.com'
      }
    },
    {
      id: '3',
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Trading Strategies for 2024`,
      description: `Expert insights and proven strategies for trading ${category} in the current market environment.`,
      content: null,
      url: `https://example.com/${category}-strategies-1`,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop',
      category: category,
      source: {
        id: '3',
        name: 'The Block',
        url: 'https://theblockcrypto.com'
      }
    }
  ]
  
  return mockArticles
}

interface CategoryPageProps {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category
  
  if (!categories.includes(category)) {
    return {
      title: 'Category Not Found | Coin Feedly',
    }
  }

  const categoryNames = {
    bitcoin: 'Bitcoin',
    altcoins: 'Altcoins',
    defi: 'DeFi',
    macro: 'Macro'
  }

  const categoryName = categoryNames[category as keyof typeof categoryNames]

  return {
    title: `${categoryName} News - Latest Updates | Coin Feedly`,
    description: `Stay updated with the latest ${categoryName.toLowerCase()} news, analysis, and market insights. Comprehensive coverage from top crypto news sources.`,
    keywords: `${categoryName.toLowerCase()}, cryptocurrency, crypto news, blockchain, trading, ${categoryName.toLowerCase()} analysis`,
    openGraph: {
      title: `${categoryName} News - Latest Updates | Coin Feedly`,
      description: `Stay updated with the latest ${categoryName.toLowerCase()} news, analysis, and market insights.`,
      type: 'website',
    },
  }
}

export default async function CategoryPageRoute({ params }: CategoryPageProps) {
  const category = params.category
  
  if (!categories.includes(category)) {
    notFound()
  }

  let articles: Article[] = []

  try {
    // Try to connect to database
    await prisma.$connect()
    
    articles = await prisma.article.findMany({
      where: {
        category: category
      },
      include: {
        source: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 50
    })
  } catch (error) {
    console.log('Database not available, using mock data for category:', category)
    articles = getMockArticles(category)
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Ignore disconnect errors
    }
  }

  return <CategoryPage category={category} articles={articles} />
}
