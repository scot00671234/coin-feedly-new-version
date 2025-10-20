import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimiter, withRateLimit, getClientIdentifier } from '@/lib/rate-limiter'
import { AdvancedCache } from '@/lib/cache'

interface FearGreedData {
  value: string
  value_classification: string
  timestamp: string
  time_until_update?: string
}

interface FearGreedResponse {
  name: string
  data: FearGreedData[]
  metadata: {
    error?: string
  }
}

interface FearGreedApiResponse {
  success: boolean
  data?: {
    value: number
    classification: string
    timestamp: string
    timeUntilUpdate?: string
  }
  error?: string
  lastUpdated: string
}

// Cache for fear & greed data
const fearGreedCache = new AdvancedCache<any>(100) // Small cache for single data point
const FEAR_GREED_CACHE_KEY = 'fear_greed_index'

// Rate limiting wrapper
const rateLimitHandler = withRateLimit(
  apiRateLimiter,
  getClientIdentifier
)

export async function GET(request: NextRequest) {
  return rateLimitHandler(request, async () => {
    try {
      // Check cache first
      const cachedData = fearGreedCache.get(FEAR_GREED_CACHE_KEY)
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          lastUpdated: new Date().toISOString(),
          cached: true
        })
      }

      // Fetch from Alternative.me Fear & Greed Index API
      const response = await fetch('https://api.alternative.me/fng/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Coin-Feedly/1.0'
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`)
      }

      const data: FearGreedResponse = await response.json()

      if (data.metadata?.error) {
        throw new Error(data.metadata.error)
      }

      if (!data.data || data.data.length === 0) {
        throw new Error('No fear & greed data available')
      }

      // Get the latest data point
      const latestData = data.data[0]
      
      // Parse the value and classification
      const value = parseInt(latestData.value)
      const classification = latestData.value_classification
      const timestamp = new Date(parseInt(latestData.timestamp) * 1000).toISOString()
      
      // Calculate time until next update (usually updates every 24 hours)
      const timeUntilUpdate = latestData.time_until_update || '24h'

      const processedData = {
        value,
        classification,
        timestamp,
        timeUntilUpdate
      }

      // Cache the data for 1 hour (3600000 ms) since it updates daily
      fearGreedCache.set(FEAR_GREED_CACHE_KEY, processedData, 3600000)

      return NextResponse.json({
        success: true,
        data: processedData,
        lastUpdated: new Date().toISOString(),
        cached: false
      })

    } catch (error) {
      console.error('Fear & Greed Index API Error:', error)
      
      // Return a fallback response with neutral values
      const fallbackData = {
        value: 50,
        classification: 'Neutral',
        timestamp: new Date().toISOString(),
        timeUntilUpdate: '24h'
      }

      return NextResponse.json({
        success: false,
        data: fallbackData,
        error: error instanceof Error ? error.message : 'Failed to fetch fear & greed data',
        lastUpdated: new Date().toISOString(),
        fallback: true
      }, { status: 200 }) // Return 200 with fallback data instead of error
    }
  })
}

// Health check endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
