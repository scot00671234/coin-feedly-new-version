import axios from 'axios'
import { 
  chartDataCache, 
  cryptoListCache, 
  cryptoDetailCache, 
  CACHE_TTL,
  getChartCacheKey,
  getCryptoListCacheKey,
  getCryptoDetailCacheKey,
  getSearchCacheKey,
  getTrendingCacheKey
} from './cache'
import { apiRateLimiter, chartDataRateLimiter, searchRateLimiter } from './rate-limiter'
import { withPerformanceMonitoring } from './analytics'

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  price_change_percentage_1h_in_currency: number | null
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency: number | null
  price_change_24h: number | null
  circulating_supply: number | null
  total_supply: number | null
  max_supply: number | null
  fully_diluted_valuation: number | null
  high_24h: number | null
  low_24h: number | null
  image: string
  sparkline_in_7d?: {
    price: number[]
  }
}

export interface CryptoChartData {
  timestamp: number
  price: number
  volume?: number
}

// Rate limiting is now handled by the advanced rate limiter

// CoinGecko API client with advanced caching and rate limiting
class CryptoAPI {
  private baseURL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'
  private requestQueue = new Map<string, Promise<any>>() // Request deduplication

  private async makeRequest<T>(
    endpoint: string, 
    params?: Record<string, any>,
    rateLimiter = apiRateLimiter
  ): Promise<T> {
    // Check rate limit
    const rateLimitResult = rateLimiter.checkLimit('api-client')
    if (!rateLimitResult.allowed) {
      const waitTime = rateLimitResult.retryAfter || 2000
      console.log(`Rate limit exceeded. Waiting ${waitTime}ms`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Add a small delay between requests to be more conservative
    await new Promise(resolve => setTimeout(resolve, 100))

    const headers: any = {
      'Accept': 'application/json'
    }
    
    // Add API key to headers if available
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY
      console.log('Using CoinGecko API key for higher rate limits')
    } else {
      console.log('No CoinGecko API key found, using free tier with rate limits')
    }

    // Simple exponential backoff with Retry-After support
    const maxAttempts = 3
    let attempt = 0
    let lastError: any

    while (attempt < maxAttempts) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          params: {
            ...params
          },
          timeout: 15000,
          headers,
          validateStatus: (status) => status >= 200 && status < 500 // surface 429s for handling
        })

        if (response.status === 429) {
          // Respect Retry-After if present; otherwise backoff 1s, 2s, 4s
          const retryAfterHeader = response.headers?.['retry-after']
          const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : Math.pow(2, attempt) * 1000
          attempt++
          if (attempt >= maxAttempts) {
            throw new Error('Rate limit exceeded. Please try again later.')
          }
          await new Promise(r => setTimeout(r, isNaN(retryAfterMs) ? 1000 : retryAfterMs))
          continue
        }

        if (response.status >= 500) {
          // transient server error, backoff and retry
          attempt++
          lastError = new Error(`Upstream error ${response.status}`)
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
          continue
        }

        if (response.status === 404) {
          throw new Error('Cryptocurrency not found.')
        }

        return response.data as T
      } catch (error) {
        // Network/timeout errors
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            attempt++
            lastError = error
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
            continue
          }
        }
        lastError = error
        break
      }
    }

    console.error('Crypto API error:', lastError)
    if (axios.isAxiosError(lastError)) {
      if (lastError.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      if (lastError.response?.status === 404) {
        throw new Error('Cryptocurrency not found.')
      }
      if (lastError.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.')
      }
    }
    throw new Error('Failed to fetch crypto data')
  }

  getCryptoList = withPerformanceMonitoring(
    async (page: number = 1, perPage: number = 50, bypassCache: boolean = false): Promise<CryptoPrice[]> => {
      const cacheKey = getCryptoListCacheKey(page, perPage)
      
      if (!bypassCache) {
        const cached = cryptoListCache.get(cacheKey)
        if (cached) {
          return cached
        }
      }

      const data = await this.makeRequest<CryptoPrice[]>('/coins/markets', {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: true,
        price_change_percentage: '1h,24h,7d'
      })

      cryptoListCache.set(cacheKey, data, CACHE_TTL.CRYPTO_LIST)
      return data
    },
    'crypto-list'
  )

  getCryptoById = withPerformanceMonitoring(
    async (id: string): Promise<CryptoPrice> => {
      const cacheKey = getCryptoDetailCacheKey(id)
      const cached = cryptoDetailCache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      const data = await this.makeRequest<any>(`/coins/${id}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true
      })

      // Transform the response to match CryptoPrice interface
      const transformedData = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        current_price: data.market_data?.current_price?.usd || null,
        market_cap: data.market_data?.market_cap?.usd || null,
        market_cap_rank: data.market_cap_rank || null,
        total_volume: data.market_data?.total_volume?.usd || null,
        price_change_percentage_1h_in_currency: data.market_data?.price_change_percentage_1h_in_currency?.usd || null,
        price_change_percentage_24h: data.market_data?.price_change_percentage_24h || null,
        price_change_percentage_7d_in_currency: data.market_data?.price_change_percentage_7d_in_currency?.usd || null,
        price_change_24h: data.market_data?.price_change_24h || null,
        circulating_supply: data.market_data?.circulating_supply || null,
        total_supply: data.market_data?.total_supply || null,
        max_supply: data.market_data?.max_supply || null,
        fully_diluted_valuation: data.market_data?.fully_diluted_valuation?.usd || null,
        high_24h: data.market_data?.high_24h?.usd || null,
        low_24h: data.market_data?.low_24h?.usd || null,
        image: data.image?.small || '',
        sparkline_in_7d: data.market_data?.sparkline_7d ? { price: data.market_data.sparkline_7d.price } : undefined
      }

      cryptoDetailCache.set(cacheKey, transformedData, CACHE_TTL.CRYPTO_DETAIL)
      return transformedData
    },
    'crypto-detail'
  )

  getCryptoChartData = withPerformanceMonitoring(
    async (id: string, days: number = 7): Promise<CryptoChartData[]> => {
      const cacheKey = getChartCacheKey(id, days)
      const cached = chartDataCache.get(cacheKey)
      
      if (cached) {
        console.log(`Chart data cache HIT for ${id} (${days} days)`)
        return cached
      }

      // Check if there's already a request in progress for this chart
      const requestKey = `chart:${id}:${days}`
      if (this.requestQueue.has(requestKey)) {
        console.log(`Chart data request already in progress for ${id} (${days} days) - waiting`)
        return this.requestQueue.get(requestKey)!
      }

      console.log(`Chart data cache MISS for ${id} (${days} days) - fetching from API`)

      // Create the request promise and add to queue
      const requestPromise = this.fetchChartDataFromAPI(id, days, cacheKey)
      this.requestQueue.set(requestKey, requestPromise)

      try {
        const result = await requestPromise
        return result
      } finally {
        // Remove from queue when done
        this.requestQueue.delete(requestKey)
      }
    },
    'crypto-chart'
  )

  private async fetchChartDataFromAPI(id: string, days: number, cacheKey: string): Promise<CryptoChartData[]> {
    // Add delay to prevent rapid successive requests
    await new Promise(resolve => setTimeout(resolve, 200))

    const data = await this.makeRequest<{ prices: number[][] }>(
      `/coins/${id}/market_chart`, 
      {
        vs_currency: 'usd',
        days: days,
        interval: days <= 1 ? 'hourly' : 'daily'
      },
      chartDataRateLimiter
    )

    const chartData = data.prices.map(([timestamp, price]) => ({
      timestamp: timestamp,
      price: price
    }))

    // Cache for longer period to reduce API calls
    chartDataCache.set(cacheKey, chartData, CACHE_TTL.CHART_DATA)
    console.log(`Chart data cached for ${id} (${days} days) - ${chartData.length} points`)
    return chartData
  }

  searchCrypto = withPerformanceMonitoring(
    async (query: string): Promise<CryptoPrice[]> => {
      const cacheKey = getSearchCacheKey(query)
      const cached = cryptoListCache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      const searchResults = await this.makeRequest<{ coins: any[] }>(
        '/search', 
        { query: query },
        searchRateLimiter
      )

      if (searchResults.coins.length === 0) {
        cryptoListCache.set(cacheKey, [], CACHE_TTL.SEARCH)
        return []
      }

      const ids = searchResults.coins.slice(0, 10).map(coin => coin.id).join(',')
      const data = await this.makeRequest<CryptoPrice[]>('/coins/markets', {
        vs_currency: 'usd',
        ids: ids,
        order: 'market_cap_desc',
        per_page: 10,
        sparkline: true,
        price_change_percentage: '1h,24h,7d'
      })

      cryptoListCache.set(cacheKey, data, CACHE_TTL.SEARCH)
      return data
    },
    'crypto-search'
  )

  getTrendingCrypto = withPerformanceMonitoring(
    async (): Promise<CryptoPrice[]> => {
      const cacheKey = getTrendingCacheKey()
      const cached = cryptoListCache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      const trending = await this.makeRequest<{ coins: any[] }>('/search/trending')
      
      if (trending.coins.length === 0) {
        cryptoListCache.set(cacheKey, [], CACHE_TTL.TRENDING)
        return []
      }

      const ids = trending.coins.slice(0, 10).map(coin => coin.item.id).join(',')
      const data = await this.makeRequest<CryptoPrice[]>('/coins/markets', {
        vs_currency: 'usd',
        ids: ids,
        order: 'market_cap_desc',
        per_page: 10,
        sparkline: true,
        price_change_percentage: '1h,24h,7d'
      })

      cryptoListCache.set(cacheKey, data, CACHE_TTL.TRENDING)
      return data
    },
    'crypto-trending'
  )
}

export const cryptoAPI = new CryptoAPI()

// Utility functions
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0.00'
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  } else if (price < 1) {
    return `$${price.toFixed(4)}`
  } else if (price < 100) {
    return `$${price.toFixed(2)}`
  } else {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
}

export function formatMarketCap(marketCap: number | null | undefined): string {
  if (marketCap === null || marketCap === undefined || isNaN(marketCap)) {
    return '$0'
  }
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toLocaleString()}`
  }
}

export function formatVolume(volume: number | null | undefined): string {
  if (volume === null || volume === undefined || isNaN(volume)) {
    return '$0'
  }
  if (volume >= 1e12) {
    return `$${(volume / 1e12).toFixed(2)}T`
  } else if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`
  } else {
    return `$${volume.toLocaleString()}`
  }
}

export function formatPercentage(percentage: number | null | undefined): string {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '+0.00%'
  }
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

export function formatChange(change: number | null | undefined): string {
  if (change === null || change === undefined || isNaN(change)) {
    return '+0.00%'
  }
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

// Legacy function for backward compatibility
export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  return cryptoAPI.getCryptoList(1, 10)
}