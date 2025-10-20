import { NextRequest, NextResponse } from 'next/server'
import { cryptoAPI } from '@/lib/crypto-api'
import { withRateLimit, getClientIdentifier, apiRateLimiter, chartDataRateLimiter, searchRateLimiter } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

// Rate limiting middleware
const rateLimitMiddleware = withRateLimit(apiRateLimiter, getClientIdentifier)

export async function GET(request: NextRequest) {
  return rateLimitMiddleware(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const action = searchParams.get('action')
      const page = parseInt(searchParams.get('page') || '1')
      const perPage = parseInt(searchParams.get('perPage') || '50')
      const query = searchParams.get('query')
      const id = searchParams.get('id')
      const days = parseInt(searchParams.get('days') || '7')

      console.log('Crypto API request:', { action, page, perPage, query, id, days })

      let data
      let cacheHeaders = {}

      switch (action) {
        case 'list':
          data = await cryptoAPI.getCryptoList(page, perPage)
          cacheHeaders = {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-Cache-Status': 'HIT'
          }
          break
        case 'search':
          if (!query) {
            return NextResponse.json({ error: 'Query parameter is required for search' }, { status: 400 })
          }
          data = await cryptoAPI.searchCrypto(query)
          cacheHeaders = {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'HIT'
          }
          break
        case 'trending':
          data = await cryptoAPI.getTrendingCrypto()
          cacheHeaders = {
            'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
            'X-Cache-Status': 'HIT'
          }
          break
        case 'chart':
          if (!id) {
            return NextResponse.json({ error: 'ID parameter is required for chart data' }, { status: 400 })
          }
          data = await cryptoAPI.getCryptoChartData(id, days)
          cacheHeaders = {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'HIT'
          }
          break
        case 'detail':
          if (!id) {
            return NextResponse.json({ error: 'ID parameter is required for crypto detail' }, { status: 400 })
          }
          data = await cryptoAPI.getCryptoById(id)
          cacheHeaders = {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'HIT'
          }
          break
        default:
          // If no action is provided, default to list
          if (!action) {
            data = await cryptoAPI.getCryptoList(page, perPage)
            cacheHeaders = {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
              'X-Cache-Status': 'HIT'
            }
          } else {
            return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
          }
      }

      return NextResponse.json(data, {
        headers: {
          ...cacheHeaders,
          'X-API-Version': '2.0',
          'X-Response-Time': Date.now().toString()
        }
      })
    } catch (error) {
      console.error('Crypto API error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Rate limit exceeded')) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { 
              status: 429,
              headers: {
                'Retry-After': '60'
              }
            }
          )
        } else if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Cryptocurrency not found.' },
            { status: 404 }
          )
        } else if (error.message.includes('timeout')) {
          return NextResponse.json(
            { error: 'Request timeout. Please try again.' },
            { status: 408 }
          )
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch crypto data' },
        { status: 500 }
      )
    }
  })
}

