// Smart caching system for real-time crypto pricing
import { CryptoPrice } from './crypto-api'
import { cryptoAPI } from './crypto-api'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  lastFetch: number
  fetchCount: number
}

interface SmartCacheConfig {
  maxSize: number
  defaultTTL: number
  refreshThreshold: number // Refresh when data is X% through its TTL
  maxConcurrentFetches: number
  rateLimitDelay: number
}

class SmartCache {
  private cache = new Map<string, CacheEntry<any>>()
  private config: SmartCacheConfig
  private activeFetches = new Set<string>()
  private refreshQueue: string[] = []
  private isRefreshing = false
  private refreshInterval: NodeJS.Timeout | null = null

  constructor(config: SmartCacheConfig) {
    this.config = config
    this.startBackgroundRefresh()
  }

  // Get data from cache or fetch if needed
  async get<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const entry = this.cache.get(key)
    const now = Date.now()
    const effectiveTTL = ttl || this.config.defaultTTL

    // If data exists and is fresh, return it
    if (entry && (now - entry.timestamp) < effectiveTTL) {
      console.log(`Cache HIT for ${key}`)
      return entry.data
    }

    // If data is stale but we're already fetching it, wait for the fetch
    if (this.activeFetches.has(key)) {
      console.log(`Waiting for active fetch for ${key}`)
      return this.waitForFetch(key)
    }

    // If data is stale and needs refresh, fetch it
    if (entry && this.shouldRefresh(entry, effectiveTTL)) {
      console.log(`Cache STALE for ${key}, refreshing in background`)
      this.queueRefresh(key, fetcher, effectiveTTL)
      return entry.data // Return stale data immediately
    }

    // If no data exists, fetch it
    console.log(`Cache MISS for ${key}, fetching`)
    return this.fetchAndCache(key, fetcher, effectiveTTL)
  }

  // Force refresh data
  async refresh<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    console.log(`Force refresh for ${key}`)
    return this.fetchAndCache(key, fetcher, ttl || this.config.defaultTTL)
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      lastFetch: now,
      fetchCount: 0
    })
  }

  // Check if data should be refreshed
  private shouldRefresh(entry: CacheEntry<any>, ttl: number): boolean {
    const now = Date.now()
    const age = now - entry.timestamp
    const refreshThreshold = ttl * this.config.refreshThreshold
    return age > refreshThreshold
  }

  // Queue a refresh for background processing
  private queueRefresh<T>(key: string, fetcher: () => Promise<T>, ttl: number): void {
    if (!this.refreshQueue.includes(key)) {
      this.refreshQueue.push(key)
    }
  }

  // Fetch data and cache it
  private async fetchAndCache<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
    this.activeFetches.add(key)
    
    try {
      // Add rate limiting delay
      await this.rateLimitDelay()
      
      const data = await fetcher()
      const now = Date.now()
      
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl,
        lastFetch: now,
        fetchCount: (this.cache.get(key)?.fetchCount || 0) + 1
      })
      
      console.log(`Cache UPDATED for ${key}`)
      return data
    } catch (error) {
      console.error(`Cache FETCH ERROR for ${key}:`, error)
      throw error
    } finally {
      this.activeFetches.delete(key)
    }
  }

  // Wait for an active fetch to complete
  private async waitForFetch<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.activeFetches.has(key)) {
          clearInterval(checkInterval)
          const entry = this.cache.get(key)
          if (entry) {
            resolve(entry.data)
          } else {
            reject(new Error(`Fetch failed for ${key}`))
          }
        }
      }, 100)
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error(`Timeout waiting for ${key}`))
      }, 30000)
    })
  }

  // Rate limiting delay
  private async rateLimitDelay(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, this.config.rateLimitDelay)
    })
  }

  // Background refresh system
  private startBackgroundRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.processRefreshQueue()
    }, 5000) // Check every 5 seconds
  }

  // Process the refresh queue
  private async processRefreshQueue(): Promise<void> {
    if (this.isRefreshing || this.refreshQueue.length === 0) return
    
    this.isRefreshing = true
    const batchSize = Math.min(this.config.maxConcurrentFetches, this.refreshQueue.length)
    const batch = this.refreshQueue.splice(0, batchSize)
    
    console.log(`Processing refresh queue: ${batch.length} items`)
    
    const promises = batch.map(key => this.refreshKey(key))
    await Promise.allSettled(promises)
    
    this.isRefreshing = false
  }

  // Refresh a specific key
  private async refreshKey(key: string): Promise<void> {
    try {
      // Determine what type of data to fetch based on key
      if (key.startsWith('crypto-list')) {
        const [, page, perPage] = key.split(':')
        const data = await cryptoAPI.getCryptoList(parseInt(page), parseInt(perPage), true)
        this.set(key, data, 60000) // 1 minute TTL
      } else if (key.startsWith('crypto-detail')) {
        const [, id] = key.split(':')
        const data = await cryptoAPI.getCryptoById(id)
        this.set(key, data, 120000) // 2 minutes TTL
      } else if (key.startsWith('crypto-chart')) {
        const [, id, days] = key.split(':')
        const data = await cryptoAPI.getCryptoChartData(id, parseInt(days))
        this.set(key, data, 300000) // 5 minutes TTL
      }
    } catch (error) {
      console.error(`Background refresh failed for ${key}:`, error)
    }
  }

  // Get cache statistics
  getStats(): any {
    const entries = Array.from(this.cache.values())
    const now = Date.now()
    
    return {
      totalEntries: this.cache.size,
      activeFetches: this.activeFetches.size,
      refreshQueue: this.refreshQueue.length,
      isRefreshing: this.isRefreshing,
      entries: entries.map(entry => ({
        age: now - entry.timestamp,
        ttl: entry.ttl,
        fetchCount: entry.fetchCount,
        isStale: (now - entry.timestamp) > entry.ttl,
        shouldRefresh: this.shouldRefresh(entry, entry.ttl)
      }))
    }
  }

  // Cleanup
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    this.cache.clear()
    this.activeFetches.clear()
    this.refreshQueue = []
  }
}

// Create smart cache instances for different data types
export const smartCache = new SmartCache({
  maxSize: 1000,
  defaultTTL: 60000, // 1 minute default
  refreshThreshold: 0.8, // Refresh when 80% through TTL
  maxConcurrentFetches: 2, // Max 2 concurrent fetches
  rateLimitDelay: 1000 // 1 second delay between API calls
})

// Cache key generators
export function getCryptoListKey(page: number = 1, perPage: number = 50): string {
  return `crypto-list:${page}:${perPage}`
}

export function getCryptoDetailKey(id: string): string {
  return `crypto-detail:${id}`
}

export function getCryptoChartKey(id: string, days: number): string {
  return `crypto-chart:${id}:${days}`
}

export function getTickerKey(): string {
  return 'crypto-ticker'
}
