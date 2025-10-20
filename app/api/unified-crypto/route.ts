import { NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'
import { priceManager } from '@/lib/price-manager'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'all'
    const cryptoId = searchParams.get('id')
    const timeframe = searchParams.get('timeframe') || '7d'
    
    console.log('Unified crypto API request:', { action, cryptoId, timeframe })
    
    let result: any = {}
    
    switch (action) {
      case 'all':
        // Get all crypto data
        const cryptoList = await cryptoAPI.getCryptoList(1, 50, true)
        result.cryptoList = cryptoList
        result.lastUpdate = new Date()
        
        // Update price manager with fresh data
        priceManager.updatePrices(cryptoList)
        break
        
      case 'detail':
        if (!cryptoId) {
          return NextResponse.json({ error: 'Crypto ID required' }, { status: 400 })
        }
        
        const cryptoDetail = await cryptoAPI.getCryptoById(cryptoId)
        result.cryptoDetail = cryptoDetail
        result.lastUpdate = new Date()
        
        // Update price manager
        priceManager.updatePrices([cryptoDetail])
        break
        
      case 'chart':
        if (!cryptoId) {
          return NextResponse.json({ error: 'Crypto ID required' }, { status: 400 })
        }
        
        const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
        const chartData = await cryptoAPI.getCryptoChartData(cryptoId, days)
        result.chartData = chartData
        result.lastUpdate = new Date()
        break
        
      case 'ticker':
        // Get ticker data (first 10 cryptos)
        const tickerData = await cryptoAPI.getCryptoList(1, 10, true)
        result.tickerData = tickerData
        result.lastUpdate = new Date()
        
        // Update price manager
        priceManager.updatePrices(tickerData)
        break
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Status': 'UNIFIED',
        'X-Data-Freshness': 'LIVE',
        'X-Last-Update': result.lastUpdate.toISOString()
      }
    })
    
  } catch (error) {
    console.error('Unified crypto API error:', error)
    
    // Try to return cached data as fallback
    try {
      const cachedPrices = priceManager.getAllPrices()
      if (cachedPrices.length > 0) {
        return NextResponse.json({
          cryptoList: cachedPrices,
          lastUpdate: priceManager.getLastUpdate(),
          fallback: true
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Cache-Status': 'FALLBACK',
            'X-Data-Freshness': 'STALE'
          }
        })
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError)
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch crypto data' }, 
      { status: 500 }
    )
  }
}
