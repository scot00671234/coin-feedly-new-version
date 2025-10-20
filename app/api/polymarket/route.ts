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
      `https://clob.polymarket.com/markets?limit=${limit}&active=true&archived=false`,
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

    const data = await response.json()
    
    console.log('Polymarket API response structure:', {
      hasMarkets: !!data.markets,
      hasData: !!data.data,
      isArray: Array.isArray(data),
      keys: Object.keys(data),
      marketsLength: data.markets?.length,
      dataLength: data.data?.length
    })

    // Handle different possible response structures
    const markets = data.markets || data.data || data || []
    
    if (!Array.isArray(markets)) {
      console.error('Invalid response structure from Polymarket API:', data)
      throw new Error('Invalid response structure from Polymarket API')
    }

    // Filter and transform crypto-related markets
    const cryptoMarkets = markets
      .filter(market => {
        if (!market || typeof market !== 'object') return false
        
        const question = market.question || market.title || market.name || ''
        const description = market.description || market.desc || ''
        const text = `${question} ${description}`.toLowerCase()
        
        return text.includes('bitcoin') ||
               text.includes('ethereum') ||
               text.includes('crypto') ||
               text.includes('btc') ||
               text.includes('eth') ||
               text.includes('defi') ||
               text.includes('altcoin') ||
               text.includes('solana') ||
               text.includes('cardano') ||
               text.includes('polkadot')
      })
      .slice(0, 5)
      .map(market => {
        const question = market.question || market.title || market.name || 'Unknown Market'
        const description = market.description || market.desc || ''
        const id = market.id || market.market_id || 'unknown'
        const outcomePrices = market.outcome_prices || market.prices || [0.5, 0.5]
        const volume = market.volume_usd || market.volume || market.total_volume || 0
        const endDate = market.end_date_iso || market.end_date || market.resolution_date || ''
        
        return {
          id,
          title: question,
          description,
          probability: Math.round((outcomePrices[0] || 0) * 100),
          volume,
          resolutionDate: endDate ? new Date(endDate).toLocaleDateString() : 'Unknown',
          resolutionDateISO: endDate,
          outcomes: market.outcomes || market.answers || ['Yes', 'No'],
          outcomePrices,
          polymarketUrl: `https://polymarket.com/market/${id}`,
          createdAt: market.created_at || market.created || new Date().toISOString(),
          updatedAt: market.updated_at || market.updated || new Date().toISOString()
        }
      })

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
