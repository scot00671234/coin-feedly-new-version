import { NextResponse } from 'next/server'
import { getHealthCheckData } from '@/lib/analytics'
import { chartDataCache, cryptoListCache, cryptoDetailCache } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const healthData = getHealthCheckData()
    const cacheStats = {
      chartData: chartDataCache.getStats(),
      cryptoList: cryptoListCache.getStats(),
      cryptoDetail: cryptoDetailCache.getStats()
    }

    const systemHealth = {
      ...healthData,
      cache: {
        totalEntries: cacheStats.chartData.size + cacheStats.cryptoList.size + cacheStats.cryptoDetail.size,
        chartData: cacheStats.chartData,
        cryptoList: cacheStats.cryptoList,
        cryptoDetail: cacheStats.cryptoDetail
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      uptime: process.uptime()
    }

    return NextResponse.json(systemHealth, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    )
  }
}
