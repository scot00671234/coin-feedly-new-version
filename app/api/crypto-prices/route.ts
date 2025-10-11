import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchCryptoPrices } from '@/lib/crypto-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if database is available
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.log('Database not available, returning mock crypto prices')
      return NextResponse.json(getMockCryptoPrices())
    }

    // Check if we have recent prices in database (less than 5 minutes old)
    const recentPrices = await prisma.cryptoPrice.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      },
      orderBy: {
        marketCap: 'desc'
      }
    })

    if (recentPrices.length > 0) {
      return NextResponse.json(recentPrices)
    }

    // Fetch fresh prices from API
    const freshPrices = await fetchCryptoPrices()

    // Update database with fresh prices
    for (const price of freshPrices) {
      await prisma.cryptoPrice.upsert({
        where: { symbol: price.symbol },
        update: {
          name: price.name,
          price: price.price,
          change24h: price.change24h,
          volume24h: price.volume24h,
          marketCap: price.marketCap,
          updatedAt: new Date(price.updatedAt)
        },
        create: {
          symbol: price.symbol,
          name: price.name,
          price: price.price,
          change24h: price.change24h,
          volume24h: price.volume24h,
          marketCap: price.marketCap,
          updatedAt: new Date(price.updatedAt)
        }
      })
    }

    return NextResponse.json(freshPrices)
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    
    // Fallback to database prices if API fails
    try {
      const fallbackPrices = await prisma.cryptoPrice.findMany({
        orderBy: {
          marketCap: 'desc'
        }
      })
      
      if (fallbackPrices.length > 0) {
        return NextResponse.json(fallbackPrices)
      }
    } catch (dbError) {
      console.error('Database fallback failed:', dbError)
    }

    // Return mock data on error
    return NextResponse.json(getMockCryptoPrices())
  }
}

function getMockCryptoPrices() {
  return [
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43250.50,
      change24h: 2.45,
      volume24h: 28500000000,
      marketCap: 850000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2650.75,
      change24h: 1.85,
      volume24h: 15200000000,
      marketCap: 320000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 315.20,
      change24h: -0.75,
      volume24h: 1200000000,
      marketCap: 48000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.485,
      change24h: 3.20,
      volume24h: 850000000,
      marketCap: 17000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      symbol: 'SOL',
      name: 'Solana',
      price: 98.45,
      change24h: 5.80,
      volume24h: 2100000000,
      marketCap: 42000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      symbol: 'DOT',
      name: 'Polkadot',
      price: 7.25,
      change24h: 1.15,
      volume24h: 320000000,
      marketCap: 9000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '7',
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.085,
      change24h: -2.30,
      volume24h: 650000000,
      marketCap: 12000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '8',
      symbol: 'AVAX',
      name: 'Avalanche',
      price: 28.90,
      change24h: 4.15,
      volume24h: 480000000,
      marketCap: 11000000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '9',
      symbol: 'LINK',
      name: 'Chainlink',
      price: 14.75,
      change24h: 0.95,
      volume24h: 280000000,
      marketCap: 8500000000,
      updatedAt: new Date().toISOString()
    },
    {
      id: '10',
      symbol: 'MATIC',
      name: 'Polygon',
      price: 0.925,
      change24h: 2.80,
      volume24h: 180000000,
      marketCap: 8500000000,
      updatedAt: new Date().toISOString()
    }
  ]
}
