import { NextResponse } from 'next/server'
import { smartCache, getCryptoListKey, getCryptoDetailKey, getCryptoChartKey, getTickerKey } from '@/lib/smart-cache'
import { cryptoAPI } from '@/lib/crypto-api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'all'
    const cryptoId = searchParams.get('id')
    const timeframe = searchParams.get('timeframe') || '7d'
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '50')
    
    console.log('Smart crypto API request:', { action, cryptoId, timeframe, page, perPage })
    
    let result: any = {}
    let cacheKey = ''
    
    switch (action) {
      case 'all':
        cacheKey = getCryptoListKey(page, perPage)
        result.cryptoList = await smartCache.get(
          cacheKey,
          () => cryptoAPI.getCryptoList(page, perPage, true),
          60000 // 1 minute TTL
        )
        break
        
      case 'detail':
        if (!cryptoId) {
          return NextResponse.json({ error: 'Crypto ID required' }, { status: 400 })
        }
        cacheKey = getCryptoDetailKey(cryptoId)
        result.cryptoDetail = await smartCache.get(
          cacheKey,
          () => cryptoAPI.getCryptoById(cryptoId),
          120000 // 2 minutes TTL
        )
        break
        
      case 'chart':
        if (!cryptoId) {
          return NextResponse.json({ error: 'Crypto ID required' }, { status: 400 })
        }
        const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
        cacheKey = getCryptoChartKey(cryptoId, days)
        result.chartData = await smartCache.get(
          cacheKey,
          () => cryptoAPI.getCryptoChartData(cryptoId, days),
          300000 // 5 minutes TTL
        )
        break
        
      case 'ticker':
        cacheKey = getTickerKey()
        result.tickerData = await smartCache.get(
          cacheKey,
          () => cryptoAPI.getCryptoList(1, 10, true),
          30000 // 30 seconds TTL for ticker
        )
        break
        
      case 'refresh':
        // Force refresh all data
        if (cryptoId) {
          const detailKey = getCryptoDetailKey(cryptoId)
          const chartKey = getCryptoChartKey(cryptoId, 7)
          await Promise.all([
            smartCache.refresh(detailKey, () => cryptoAPI.getCryptoById(cryptoId)),
            smartCache.refresh(chartKey, () => cryptoAPI.getCryptoChartData(cryptoId, 7))
          ])
          result.message = 'Data refreshed successfully'
        } else {
          const tickerKey = getTickerKey()
          await smartCache.refresh(tickerKey, () => cryptoAPI.getCryptoList(1, 10, true))
          result.message = 'Ticker data refreshed successfully'
        }
        break
        
      case 'stats':
        result.stats = smartCache.getStats()
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    // Add cache metadata
    result.cacheKey = cacheKey
    result.timestamp = new Date().toISOString()
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache-Status': 'SMART-CACHE',
        'X-Cache-Key': cacheKey,
        'X-Timestamp': result.timestamp
      }
    })
    
  } catch (error) {
    console.error('Smart crypto API error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch crypto data', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
