import { NextRequest, NextResponse } from 'next/server'

interface PolymarketMarket {
  id: string
  question: string
  description: string
  end_date_iso: string
  volume: number
  volume_usd: number
  outcome_prices: number[]
  outcomes: string[]
  market_maker: string
  active: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

interface PolymarketResponse {
  markets: PolymarketMarket[]
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || 'crypto'

    // Fetch markets from Polymarket API
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=${limit}&category=${category}&active=true&archived=false`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CoinFeedly/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const data: PolymarketResponse = await response.json()

    // Filter and transform crypto-related markets
    const cryptoMarkets = data.markets
      .filter(market => 
        market.question.toLowerCase().includes('bitcoin') ||
        market.question.toLowerCase().includes('ethereum') ||
        market.question.toLowerCase().includes('crypto') ||
        market.question.toLowerCase().includes('btc') ||
        market.question.toLowerCase().includes('eth') ||
        market.question.toLowerCase().includes('defi') ||
        market.question.toLowerCase().includes('altcoin')
      )
      .slice(0, 5)
      .map(market => ({
        id: market.id,
        title: market.question,
        description: market.description,
        probability: Math.round((market.outcome_prices[0] || 0) * 100),
        volume: market.volume_usd,
        resolutionDate: new Date(market.end_date_iso).toLocaleDateString(),
        resolutionDateISO: market.end_date_iso,
        outcomes: market.outcomes,
        outcomePrices: market.outcome_prices,
        polymarketUrl: `https://polymarket.com/market/${market.id}`,
        createdAt: market.created_at,
        updatedAt: market.updated_at
      }))

    return NextResponse.json({
      success: true,
      markets: cryptoMarkets,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching Polymarket data:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Polymarket data',
      markets: [],
      lastUpdated: new Date().toISOString()
    }, { status: 500 })
  }
}
