import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cryptoAPI } from '@/lib/crypto-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if database is available and has tables
    let databaseAvailable = false
    try {
      await prisma.$connect()
      // Try to query a simple table to check if it exists
      await prisma.cryptoPrice.findFirst()
      databaseAvailable = true
    } catch (dbError) {
      console.log('Database not available or tables missing, fetching fresh prices from API')
      databaseAvailable = false
    }

    if (!databaseAvailable) {
      const freshPrices = await cryptoAPI.getCryptoList(1, 10)
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
      // Transform database format to full CryptoPrice format
      const transformedRecent = recentPrices.map(price => ({
        id: price.id,
        symbol: price.symbol,
        name: price.name,
        current_price: price.price,
        market_cap: price.marketCap,
        market_cap_rank: 0, // Not stored in database
        total_volume: price.volume24h || 0,
        price_change_percentage_1h_in_currency: 0, // Not stored in database
        price_change_percentage_24h: price.change24h,
        price_change_percentage_7d_in_currency: 0, // Not stored in database
        price_change_24h: 0, // Not stored in database
        circulating_supply: 0, // Not stored in database
        total_supply: 0, // Not stored in database
        max_supply: 0, // Not stored in database
        fully_diluted_valuation: 0, // Not stored in database
        high_24h: 0, // Not stored in database
        low_24h: 0, // Not stored in database
        image: '', // Not stored in database
        sparkline_in_7d: undefined
      }))
      
      return NextResponse.json(transformedRecent, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      })
    }

    // Fetch fresh prices from API
    const freshPrices = await cryptoAPI.getCryptoList(1, 10)
    
    // Transform to match database format for storage
    const transformedPrices = freshPrices.map(price => ({
      id: price.id,
      symbol: price.symbol,
      name: price.name,
      price: price.current_price,
      change24h: price.price_change_percentage_24h,
      volume24h: price.total_volume,
      marketCap: price.market_cap,
      updatedAt: new Date().toISOString()
    }))

    // Update database with fresh prices
    for (const price of transformedPrices) {
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

    // Return the full CryptoPrice objects for the frontend
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
        // Transform database format back to full CryptoPrice format
        const transformedFallback = fallbackPrices.map(price => ({
          id: price.id,
          symbol: price.symbol,
          name: price.name,
          current_price: price.price,
          market_cap: price.marketCap,
          market_cap_rank: 0, // Not stored in database
          total_volume: price.volume24h || 0,
          price_change_percentage_1h_in_currency: 0, // Not stored in database
          price_change_percentage_24h: price.change24h,
          price_change_percentage_7d_in_currency: 0, // Not stored in database
          price_change_24h: 0, // Not stored in database
          circulating_supply: 0, // Not stored in database
          total_supply: 0, // Not stored in database
          max_supply: 0, // Not stored in database
          fully_diluted_valuation: 0, // Not stored in database
          high_24h: 0, // Not stored in database
          low_24h: 0, // Not stored in database
          image: '', // Not stored in database
          sparkline_in_7d: undefined
        }))
        
        return NextResponse.json(transformedFallback, {
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

