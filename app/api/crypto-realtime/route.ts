import { NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Real-time crypto prices requested - bypassing all caches')
    
    // Always fetch fresh prices from API - no caching at all
    const freshPrices = await cryptoAPI.getCryptoList(1, 10, true)
    
    return NextResponse.json(freshPrices, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Status': 'REAL-TIME',
        'X-Data-Freshness': 'LIVE',
        'X-API-Version': 'realtime-v1'
      }
    })
  } catch (error) {
    console.error('Error fetching real-time crypto prices:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch real-time crypto prices' }, 
      { status: 500 }
    )
  }
}
