// Analytics and monitoring system for API usage tracking
interface APIUsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  cacheMisses: number
  averageResponseTime: number
  rateLimitHits: number
  errorsByType: Record<string, number>
  requestsByEndpoint: Record<string, number>
  requestsByTime: Array<{ timestamp: number; count: number }>
}

interface PerformanceMetrics {
  responseTime: number
  cacheHit: boolean
  endpoint: string
  timestamp: number
  success: boolean
  errorType?: string
}

class AnalyticsCollector {
  private stats: APIUsageStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    rateLimitHits: 0,
    errorsByType: {},
    requestsByEndpoint: {},
    requestsByTime: []
  }

  private responseTimes: number[] = []
  private timeWindow = 60000 // 1 minute
  private maxTimeWindowEntries = 60 // Keep last 60 minutes

  recordRequest(endpoint: string, responseTime: number, success: boolean, cacheHit: boolean, errorType?: string) {
    this.stats.totalRequests++
    
    if (success) {
      this.stats.successfulRequests++
    } else {
      this.stats.failedRequests++
      if (errorType) {
        this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1
      }
    }

    if (cacheHit) {
      this.stats.cacheHits++
    } else {
      this.stats.cacheMisses++
    }

    // Track response times
    this.responseTimes.push(responseTime)
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000) // Keep last 1000 entries
    }

    // Update average response time
    this.stats.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length

    // Track requests by endpoint
    this.stats.requestsByEndpoint[endpoint] = (this.stats.requestsByEndpoint[endpoint] || 0) + 1

    // Track requests by time (for rate analysis)
    const now = Date.now()
    const timeSlot = Math.floor(now / this.timeWindow) * this.timeWindow
    
    const existingSlot = this.stats.requestsByTime.find(slot => slot.timestamp === timeSlot)
    if (existingSlot) {
      existingSlot.count++
    } else {
      this.stats.requestsByTime.push({ timestamp: timeSlot, count: 1 })
    }

    // Clean up old time slots
    const cutoff = now - (this.maxTimeWindowEntries * this.timeWindow)
    this.stats.requestsByTime = this.stats.requestsByTime.filter(slot => slot.timestamp > cutoff)
  }

  recordRateLimitHit() {
    this.stats.rateLimitHits++
  }

  getStats(): APIUsageStats {
    return { ...this.stats }
  }

  getCacheHitRate(): number {
    const total = this.stats.cacheHits + this.stats.cacheMisses
    return total > 0 ? (this.stats.cacheHits / total) * 100 : 0
  }

  getSuccessRate(): number {
    return this.stats.totalRequests > 0 ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 : 0
  }

  getRequestsPerMinute(): number {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    return this.stats.requestsByTime
      .filter(slot => slot.timestamp > oneMinuteAgo)
      .reduce((sum, slot) => sum + slot.count, 0)
  }

  getTopEndpoints(limit: number = 5): Array<{ endpoint: string; count: number }> {
    return Object.entries(this.stats.requestsByEndpoint)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  getErrorBreakdown(): Array<{ errorType: string; count: number; percentage: number }> {
    const totalErrors = this.stats.failedRequests
    return Object.entries(this.stats.errorsByType)
      .map(([errorType, count]) => ({
        errorType,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  reset() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      rateLimitHits: 0,
      errorsByType: {},
      requestsByEndpoint: {},
      requestsByTime: []
    }
    this.responseTimes = []
  }
}

export const analytics = new AnalyticsCollector()

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    let success = true
    let errorType: string | undefined

    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      success = false
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          errorType = 'rate_limit'
          analytics.recordRateLimitHit()
        } else if (error.message.includes('timeout')) {
          errorType = 'timeout'
        } else if (error.message.includes('not found')) {
          errorType = 'not_found'
        } else {
          errorType = 'unknown'
        }
      }
      throw error
    } finally {
      const responseTime = Date.now() - startTime
      analytics.recordRequest(endpoint, responseTime, success, false, errorType)
    }
  }
}

// Health check endpoint data
export function getHealthCheckData() {
  const stats = analytics.getStats()
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: stats.totalRequests,
      successRate: analytics.getSuccessRate(),
      cacheHitRate: analytics.getCacheHitRate(),
      averageResponseTime: Math.round(stats.averageResponseTime),
      requestsPerMinute: analytics.getRequestsPerMinute(),
      rateLimitHits: stats.rateLimitHits
    },
    topEndpoints: analytics.getTopEndpoints(3),
    errorBreakdown: analytics.getErrorBreakdown().slice(0, 3)
  }
}
