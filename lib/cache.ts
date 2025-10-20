// Advanced caching system for high-traffic scenarios
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
}

export class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  }
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize
    // Cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 120000)
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    const now = Date.now()

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      this.stats.size--
      return null
    }

    // Update access stats
    entry.hits++
    entry.lastAccessed = now
    this.stats.hits++
    return entry.data
  }

  set(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    const now = Date.now()

    // If cache is full, evict least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      hits: 0,
      lastAccessed: now
    })

    this.stats.size = this.cache.size
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
      this.stats.size--
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    // Use forEach instead of for...of to ensure compatibility
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      this.stats.evictions++
    })

    this.stats.size = this.cache.size
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Specialized caches for different data types
export const chartDataCache = new AdvancedCache<any[]>(5000) // 5k chart entries
export const cryptoListCache = new AdvancedCache<any[]>(1000) // 1k crypto list entries
export const cryptoDetailCache = new AdvancedCache<any>(2000) // 2k crypto detail entries
export const priceTickerCache = new AdvancedCache<any[]>(100) // 100 ticker price entries (very small, frequent updates)

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  CHART_DATA: 900000, // 15 minutes for chart data (longer to reduce API calls)
  CRYPTO_LIST: 120000, // 2 minutes for crypto list (reduced for more frequent updates)
  CRYPTO_DETAIL: 300000, // 5 minutes for crypto detail (reduced for more frequent updates)
  TRENDING: 600000, // 10 minutes for trending data
  SEARCH: 600000, // 10 minutes for search results
  FEAR_GREED: 3600000, // 1 hour for fear & greed data
  PRICE_TICKER: 60000, // 1 minute for ticker prices (very frequent updates)
} as const

// Cache key generators
export function getChartCacheKey(id: string, days: number): string {
  return `chart:${id}:${days}`
}

export function getCryptoListCacheKey(page: number, perPage: number, sortBy?: string): string {
  return `crypto_list:${page}:${perPage}:${sortBy || 'default'}`
}

export function getCryptoDetailCacheKey(id: string): string {
  return `crypto_detail:${id}`
}

export function getSearchCacheKey(query: string): string {
  return `search:${query.toLowerCase()}`
}

export function getTrendingCacheKey(): string {
  return 'trending'
}

export function getPriceTickerCacheKey(): string {
  return 'price_ticker'
}
