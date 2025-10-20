// Single source of truth for all crypto pricing data
import { CryptoPrice } from './crypto-api'

class PriceManager {
  private static instance: PriceManager
  private currentPrices: Map<string, CryptoPrice> = new Map()
  private lastUpdate: Date = new Date()
  private updateCallbacks: Set<() => void> = new Set()

  private constructor() {}

  static getInstance(): PriceManager {
    if (!PriceManager.instance) {
      PriceManager.instance = new PriceManager()
    }
    return PriceManager.instance
  }

  // Get current price for a specific crypto
  getPrice(cryptoId: string): CryptoPrice | null {
    return this.currentPrices.get(cryptoId) || null
  }

  // Get all current prices
  getAllPrices(): CryptoPrice[] {
    return Array.from(this.currentPrices.values())
  }

  // Update prices (single source of truth)
  updatePrices(prices: CryptoPrice[]): void {
    console.log('PriceManager: Updating prices for', prices.length, 'cryptocurrencies')
    
    // Update the map with new prices
    prices.forEach(price => {
      this.currentPrices.set(price.id, price)
    })
    
    this.lastUpdate = new Date()
    
    // Notify all subscribers
    this.updateCallbacks.forEach(callback => callback())
    
    console.log('PriceManager: Prices updated at', this.lastUpdate.toISOString())
  }

  // Get last update time
  getLastUpdate(): Date {
    return this.lastUpdate
  }

  // Subscribe to price updates
  subscribe(callback: () => void): () => void {
    this.updateCallbacks.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback)
    }
  }

  // Get price for display (formatted)
  getFormattedPrice(cryptoId: string): string {
    const price = this.getPrice(cryptoId)
    if (!price || price.current_price === null) return 'N/A'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price.current_price)
  }

  // Get price change percentage
  getPriceChange(cryptoId: string): number {
    const price = this.getPrice(cryptoId)
    return price?.price_change_percentage_24h || 0
  }

  // Get formatted price change
  getFormattedPriceChange(cryptoId: string): string {
    const change = this.getPriceChange(cryptoId)
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  // Check if data is fresh (less than 5 minutes old)
  isDataFresh(): boolean {
    const now = new Date()
    const diffMs = now.getTime() - this.lastUpdate.getTime()
    return diffMs < 5 * 60 * 1000 // 5 minutes
  }

  // Get data age in seconds
  getDataAge(): number {
    const now = new Date()
    const diffMs = now.getTime() - this.lastUpdate.getTime()
    return Math.floor(diffMs / 1000)
  }
}

export const priceManager = PriceManager.getInstance()
