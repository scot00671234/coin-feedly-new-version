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
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_1h_in_currency: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  price_change_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  fully_diluted_valuation: number
  high_24h: number
  low_24h: number
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
  private baseURL = 'https://api.coingecko.com/api/v3'

  private async makeRequest<T>(
    endpoint: string, 
    params?: Record<string, any>,
    rateLimiter = apiRateLimiter
  ): Promise<T> {
    // Check rate limit
    const rateLimitResult = rateLimiter.checkLimit('api-client')
    if (!rateLimitResult.allowed) {
      const waitTime = rateLimitResult.retryAfter || 1000
      console.log(`Rate limit exceeded. Waiting ${waitTime}ms`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          ...params,
          x_cg_demo_api_key: process.env.COINGECKO_API_KEY // Optional API key for higher limits
        },
        timeout: 15000, // Increased timeout for reliability
        headers: {
          'User-Agent': 'CoinFeedly/1.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        }
      })

      return response.data
    } catch (error) {
      console.error('Crypto API error:', error)
      
      // Handle specific error types
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else if (error.response?.status === 404) {
          throw new Error('Cryptocurrency not found.')
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.')
        }
      }
      
      throw new Error('Failed to fetch crypto data')
    }
  }

  getCryptoList = withPerformanceMonitoring(
    async (page: number = 1, perPage: number = 50): Promise<CryptoPrice[]> => {
      const cacheKey = getCryptoListCacheKey(page, perPage)
      const cached = cryptoListCache.get(cacheKey)
      
      if (cached) {
        return cached
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
        current_price: data.market_data.current_price.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        total_volume: data.market_data.total_volume.usd,
        price_change_percentage_1h_in_currency: data.market_data.price_change_percentage_1h_in_currency.usd,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        price_change_percentage_7d_in_currency: data.market_data.price_change_percentage_7d_in_currency.usd,
        price_change_24h: data.market_data.price_change_24h,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply,
        max_supply: data.market_data.max_supply,
        fully_diluted_valuation: data.market_data.fully_diluted_valuation?.usd || 0,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        image: data.image.small,
        sparkline_in_7d: data.market_data.sparkline_7d ? { price: data.market_data.sparkline_7d.price } : undefined
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
        return cached
      }

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

      chartDataCache.set(cacheKey, chartData, CACHE_TTL.CHART_DATA)
      return chartData
    },
    'crypto-chart'
  )

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
export function formatPrice(price: number): string {
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

export function formatMarketCap(marketCap: number): string {
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

export function formatVolume(volume: number): string {
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

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

// Legacy function for backward compatibility
export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  return cryptoAPI.getCryptoList(1, 10)
}