import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchCryptoPrices } from '@/lib/crypto-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if database is available
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.log('Database not available, fetching fresh prices from API')
      const freshPrices = await fetchCryptoPrices()
      return NextResponse.json(freshPrices, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      })
    }

    // Check if we have recent prices in database (less than 5 minutes old)
    const recentPrices = await prisma.cryptoPrice.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      },
      orderBy: {
        marketCap: 'desc'
      }
    })

    if (recentPrices.length > 0) {
      return NextResponse.json(recentPrices, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      })
    }

    // Fetch fresh prices from API
    const freshPrices = await fetchCryptoPrices()

    // Update database with fresh prices
    for (const price of freshPrices) {
      await prisma.cryptoPrice.upsert({
        where: { symbol: price.symbol },
        update: {
          name: price.name,
          price: price.price,
          change24h: price.change24h,
          volume24h: price.volume24h,
          marketCap: price.marketCap,
          updatedAt: new Date(price.updatedAt)
        },
        create: {
          symbol: price.symbol,
          name: price.name,
          price: price.price,
          change24h: price.change24h,
          volume24h: price.volume24h,
          marketCap: price.marketCap,
          updatedAt: new Date(price.updatedAt)
        }
      })
    }

    return NextResponse.json(freshPrices, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    
    // Fallback to database prices if API fails
    try {
      const fallbackPrices = await prisma.cryptoPrice.findMany({
        orderBy: {
          marketCap: 'desc'
        }
      })
      
      if (fallbackPrices.length > 0) {
        return NextResponse.json(fallbackPrices, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        })
      }
    } catch (dbError) {
      console.error('Database fallback failed:', dbError)
    }

    // Return error response instead of mock data
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' }, 
      { status: 500 }
    )
  }
}

