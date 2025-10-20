// Advanced rate limiting system for high-traffic scenarios
interface RateLimitConfig {
  requests: number
  window: number // in milliseconds
  requestsPerSecond: number
  burstLimit: number // maximum burst requests
}

interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
  burstCount: number
  burstResetTime: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

class AdvancedRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig
  private cleanupInterval: NodeJS.Timeout

  constructor(config: RateLimitConfig) {
    this.config = config
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 300000)
  }

  getConfig(): RateLimitConfig {
    return this.config
  }

  checkLimit(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = this.store.get(identifier) || {
      count: 0,
      resetTime: now + this.config.window,
      lastRequest: 0,
      burstCount: 0,
      burstResetTime: now + 1000 // 1 second burst window
    }

    // Check if window has reset
    if (now > entry.resetTime) {
      entry.count = 0
      entry.resetTime = now + this.config.window
    }

    // Check if burst window has reset
    if (now > entry.burstResetTime) {
      entry.burstCount = 0
      entry.burstResetTime = now + 1000
    }

    // Check burst limit (requests per second)
    if (entry.burstCount >= this.config.burstLimit) {
      return {
        allowed: false,
        remaining: Math.max(0, this.config.requests - entry.count),
        resetTime: entry.resetTime,
        retryAfter: entry.burstResetTime - now
      }
    }

    // Check main rate limit
    if (entry.count >= this.config.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: entry.resetTime - now
      }
    }

    // Allow request
    entry.count++
    entry.burstCount++
    entry.lastRequest = now
    this.store.set(identifier, entry)

    return {
      allowed: true,
      remaining: this.config.requests - entry.count,
      resetTime: entry.resetTime
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.store.entries()) {
      // Remove entries that haven't been used in the last hour
      if (now - entry.lastRequest > 3600000) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.store.delete(key))
  }

  getStats(identifier: string): RateLimitEntry | null {
    return this.store.get(identifier) || null
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Different rate limiters for different types of requests
export const apiRateLimiter = new AdvancedRateLimiter({
  requests: 50, // 50 requests per minute
  window: 60000, // 1 minute
  requestsPerSecond: 3, // 3 requests per second
  burstLimit: 5 // 5 burst requests
})

export const chartDataRateLimiter = new AdvancedRateLimiter({
  requests: 30, // 30 chart requests per minute (more conservative)
  window: 60000, // 1 minute
  requestsPerSecond: 2, // 2 requests per second (more conservative)
  burstLimit: 5 // 5 burst requests (more conservative)
})

export const searchRateLimiter = new AdvancedRateLimiter({
  requests: 200, // 200 search requests per minute
  window: 60000, // 1 minute
  requestsPerSecond: 10, // 10 requests per second
  burstLimit: 20 // 20 burst requests
})

// Rate limiting middleware
export function withRateLimit(
  rateLimiter: AdvancedRateLimiter,
  getIdentifier: (req: Request) => string
) {
  return async (req: Request, handler: () => Promise<Response>): Promise<Response> => {
    const identifier = getIdentifier(req)
    const result = rateLimiter.checkLimit(identifier)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.retryAfter || 0) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.retryAfter || 0) / 1000).toString(),
            'X-RateLimit-Limit': rateLimiter.getConfig().requests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
          }
        }
      )
    }

    const response = await handler()
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimiter.getConfig().requests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())

    return response
  }
}

// Get client identifier from request
export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers (for production with reverse proxy)
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const cfConnectingIp = req.headers.get('cf-connecting-ip')
  
  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // For development, use a more permissive identifier
  if (process.env.NODE_ENV === 'development') {
    return 'dev-client'
  }
  
  return ip
}
