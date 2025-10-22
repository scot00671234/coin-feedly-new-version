import { NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cacheBust = searchParams.get('t')
    
    console.log('Real-time crypto prices requested - bypassing all caches', { cacheBust })
    
    // Always fetch fresh prices from API - no caching at all
    const freshPrices = await cryptoAPI.getCryptoList(1, 10, true)
    
    return NextResponse.json(freshPrices, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Status': 'REAL-TIME',
        'X-Data-Freshness': 'LIVE',
        'X-API-Version': 'realtime-v1',
        'X-Timestamp': new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching real-time crypto prices:', error)
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('Rate limit')) {
      console.log('Rate limit hit, returning cached data as fallback')
      
      // Try to get cached data as fallback
      try {
        const { priceTickerCache, getPriceTickerCacheKey } = await import('@/lib/cache')
        const cacheKey = getPriceTickerCacheKey()
        const cachedPrices = priceTickerCache.get(cacheKey)
        
        if (cachedPrices) {
          return NextResponse.json(cachedPrices, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'X-Cache-Status': 'FALLBACK-CACHED',
              'X-Data-Freshness': 'STALE',
              'X-Rate-Limited': 'true'
            }
          })
        }
      } catch (cacheError) {
        console.error('Failed to get cached data:', cacheError)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch real-time crypto prices' }, 
      { status: 500 }
    )
  }
}
