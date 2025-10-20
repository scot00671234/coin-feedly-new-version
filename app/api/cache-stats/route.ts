import { NextResponse } from 'next/server'
import { smartCache } from '@/lib/smart-cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = smartCache.getStats()
    
    return NextResponse.json({
      ...stats,
      timestamp: new Date().toISOString(),
      status: 'healthy'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Cache-Status': 'STATS'
      }
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get cache stats' }, 
      { status: 500 }
    )
  }
}
