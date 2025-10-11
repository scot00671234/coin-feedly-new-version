import axios from 'axios'

const COINGECKO_API_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3'

export interface CoinGeckoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  market_cap: number
  last_updated: string
}

export interface CryptoPriceData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  updatedAt: string
}

const CRYPTO_IDS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'cardano',
  'solana',
  'polkadot',
  'dogecoin',
  'avalanche-2',
  'chainlink',
  'polygon',
  'litecoin',
  'uniswap',
  'bitcoin-cash',
  'stellar',
  'monero'
]

export async function fetchCryptoPrices(): Promise<CryptoPriceData[]> {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: CRYPTO_IDS.join(','),
        order: 'market_cap_desc',
        per_page: 15,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    return response.data.map((coin: CoinGeckoPrice) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      updatedAt: coin.last_updated
    }))
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    throw error
  }
}

export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else {
    return `$${price.toFixed(6)}`
  }
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(1)}B`
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(1)}M`
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(1)}K`
  } else {
    return `$${volume.toFixed(0)}`
  }
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(1)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(1)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(1)}M`
  } else {
    return `$${marketCap.toFixed(0)}`
  }
}
