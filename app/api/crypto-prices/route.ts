import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cryptoAPI } from '@/lib/crypto-api'
import { priceTickerCache, CACHE_TTL, getPriceTickerCacheKey } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cacheBust = searchParams.get('t')
    
    // For real-time pricing, always bypass cache when cache busting is requested
    if (cacheBust) {
      console.log('Real-time pricing requested - bypassing all caches')
      
      // Always fetch fresh prices from API for real-time data
      const freshPrices = await cryptoAPI.getCryptoList(1, 10, true)
      
      // Update database in background (don't wait for it)
      updateDatabaseInBackground(freshPrices)
      
      return NextResponse.json(freshPrices, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Status': 'REAL-TIME',
          'X-Data-Freshness': 'LIVE'
        }
      })
    }
    
    // Check cache only for non-real-time requests
    const cacheKey = getPriceTickerCacheKey()
    const cachedPrices = priceTickerCache.get(cacheKey)
    
    if (cachedPrices) {
      console.log('Ticker prices cache HIT - returning cached data')
      return NextResponse.json(cachedPrices, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache-Status': 'HIT',
          'X-Cache-TTL': '30'
        }
      })
    }

    console.log('Ticker prices cache MISS - fetching fresh data from API')
    
    // Fetch fresh prices from API
    const freshPrices = await cryptoAPI.getCryptoList(1, 10, false)
    
    // Cache the fresh prices with very short TTL for ticker
    priceTickerCache.set(cacheKey, freshPrices, 30000) // 30 seconds only
    
    // Update database in background (don't wait for it)
    updateDatabaseInBackground(freshPrices)
    
    return NextResponse.json(freshPrices, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache-Status': 'MISS',
        'X-Cache-TTL': '30'
      }
    })
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    
    // Fallback to database prices if API fails
    try {
      const fallbackPrices = await prisma.cryptoPrice.findMany({
        orderBy: {
          marketCap: 'desc'
        },
        take: 10
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
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            'X-Cache-Status': 'FALLBACK'
          }
        })
      }
    } catch (dbError) {
      console.error('Database fallback failed:', dbError)
    }

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' }, 
      { status: 500 }
    )
  }
}

// Background function to update database without blocking response
async function updateDatabaseInBackground(freshPrices: any[]) {
  try {
    // Transform to match database format for storage
    const transformedPrices = freshPrices.map(price => ({
      id: price.id,
      symbol: price.symbol,
      name: price.name,
      price: price.current_price || 0,
      change24h: price.price_change_percentage_24h || 0,
      volume24h: price.total_volume || 0,
      marketCap: price.market_cap || 0,
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
    console.log('Database updated with fresh prices in background')
  } catch (error) {
    console.error('Error updating database in background:', error)
  }
}

