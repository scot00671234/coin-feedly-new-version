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

    // Fetch markets from Polymarket GraphQL API
    const query = `
      query GetMarkets($limit: Int!) {
        markets(limit: $limit, active: true, archived: false) {
          id
          question
          description
          end_date_iso
          volume
          volume_usd
          outcome_prices
          outcomes
          market_maker
          active
          archived
          created_at
          updated_at
        }
      }
    `

    const response = await fetch('https://gamma-api.polymarket.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CoinFeedly/1.0'
      },
      body: JSON.stringify({
        query,
        variables: { limit: 50 }
      })
    })

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('Polymarket GraphQL response:', {
      hasData: !!data.data,
      hasMarkets: !!data.data?.markets,
      marketsLength: data.data?.markets?.length,
      errors: data.errors,
      firstMarket: data.data?.markets?.[0]
    })

    // Handle GraphQL response structure
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      throw new Error(`GraphQL errors: ${data.errors.map(e => e.message).join(', ')}`)
    }

    const markets = data.data?.markets || []
    
    if (markets.length === 0) {
      console.log('No markets returned from Polymarket API')
      return NextResponse.json({
        success: true,
        markets: [],
        lastUpdated: new Date().toISOString(),
        message: 'No active markets found'
      })
    }

    // Filter and transform crypto, politics, and finance markets
    const relevantMarkets = markets
      .filter(market => {
        if (!market || typeof market !== 'object') return false
        
        const question = market.question || market.title || market.name || ''
        const description = market.description || market.desc || ''
        const text = `${question} ${description}`.toLowerCase()
        
        // Crypto keywords
        const cryptoKeywords = [
          'bitcoin', 'ethereum', 'crypto', 'btc', 'eth', 'defi', 'altcoin',
          'solana', 'cardano', 'polkadot', 'chainlink', 'avalanche', 'polygon',
          'binance', 'coinbase', 'crypto exchange', 'blockchain', 'nft',
          'web3', 'metaverse', 'dao', 'yield farming', 'liquidity', 'staking',
          'mining', 'hashrate', 'difficulty', 'halving', 'fork', 'upgrade'
        ]
        
        // Politics keywords
        const politicsKeywords = [
          'election', 'president', 'congress', 'senate', 'house', 'governor',
          'mayor', 'trump', 'biden', 'harris', 'desantis', 'newsom', 'abbott',
          'voting', 'ballot', 'primary', 'caucus', 'debate', 'poll', 'approval',
          'impeachment', 'resignation', 'nomination', 'confirmation', 'veto',
          'bill', 'law', 'policy', 'regulation', 'federal', 'state', 'local'
        ]
        
        // Finance keywords
        const financeKeywords = [
          'fed', 'federal reserve', 'interest rate', 'inflation', 'recession',
          'gdp', 'unemployment', 'jobs report', 'cpi', 'ppi', 'retail sales',
          'housing', 'mortgage', 'bond', 'treasury', 'yield curve', 'dollar',
          'euro', 'yen', 'yuan', 'pound', 'franc', 'currency', 'forex',
          'stock market', 's&p', 'nasdaq', 'dow', 'vix', 'volatility',
          'earnings', 'revenue', 'profit', 'loss', 'bank', 'banking',
          'credit', 'debt', 'default', 'bankruptcy', 'merger', 'acquisition'
        ]
        
        // Check if market contains any relevant keywords
        const hasCrypto = cryptoKeywords.some(keyword => text.includes(keyword))
        const hasPolitics = politicsKeywords.some(keyword => text.includes(keyword))
        const hasFinance = financeKeywords.some(keyword => text.includes(keyword))
        
        // Exclude sports and entertainment
        const excludeKeywords = [
          'nba', 'nfl', 'mlb', 'nhl', 'soccer', 'football', 'basketball',
          'baseball', 'hockey', 'tennis', 'golf', 'boxing', 'ufc', 'mma',
          'movie', 'film', 'oscar', 'emmy', 'grammy', 'award', 'celebrity',
          'actor', 'actress', 'singer', 'musician', 'entertainment', 'sports'
        ]
        
        const hasExcluded = excludeKeywords.some(keyword => text.includes(keyword))
        
        return (hasCrypto || hasPolitics || hasFinance) && !hasExcluded
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
      markets: relevantMarkets,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching Polymarket data:', error)
    
    // Try fallback REST API
    try {
      console.log('Trying fallback REST API...')
      const fallbackResponse = await fetch(
        'https://clob.polymarket.com/markets?limit=50&active=true&archived=false',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CoinFeedly/1.0'
          }
        }
      )
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log('Fallback API response:', fallbackData)
        
        // Process fallback data
        const markets = Array.isArray(fallbackData) ? fallbackData : (fallbackData.markets || [])
        
        if (markets.length > 0) {
          const relevantMarkets = markets
            .filter(market => {
              if (!market || typeof market !== 'object') return false
              
              const question = market.question || market.title || market.name || ''
              const description = market.description || market.desc || ''
              const text = `${question} ${description}`.toLowerCase()
              
              // Crypto keywords
              const cryptoKeywords = [
                'bitcoin', 'ethereum', 'crypto', 'btc', 'eth', 'defi', 'altcoin',
                'solana', 'cardano', 'polkadot', 'chainlink', 'avalanche', 'polygon',
                'binance', 'coinbase', 'crypto exchange', 'blockchain', 'nft',
                'web3', 'metaverse', 'dao', 'yield farming', 'liquidity', 'staking',
                'mining', 'hashrate', 'difficulty', 'halving', 'fork', 'upgrade'
              ]
              
              // Politics keywords
              const politicsKeywords = [
                'election', 'president', 'congress', 'senate', 'house', 'governor',
                'mayor', 'trump', 'biden', 'harris', 'desantis', 'newsom', 'abbott',
                'voting', 'ballot', 'primary', 'caucus', 'debate', 'poll', 'approval',
                'impeachment', 'resignation', 'nomination', 'confirmation', 'veto',
                'bill', 'law', 'policy', 'regulation', 'federal', 'state', 'local'
              ]
              
              // Finance keywords
              const financeKeywords = [
                'fed', 'federal reserve', 'interest rate', 'inflation', 'recession',
                'gdp', 'unemployment', 'jobs report', 'cpi', 'ppi', 'retail sales',
                'housing', 'mortgage', 'bond', 'treasury', 'yield curve', 'dollar',
                'euro', 'yen', 'yuan', 'pound', 'franc', 'currency', 'forex',
                'stock market', 's&p', 'nasdaq', 'dow', 'vix', 'volatility',
                'earnings', 'revenue', 'profit', 'loss', 'bank', 'banking',
                'credit', 'debt', 'default', 'bankruptcy', 'merger', 'acquisition'
              ]
              
              // Check if market contains any relevant keywords
              const hasCrypto = cryptoKeywords.some(keyword => text.includes(keyword))
              const hasPolitics = politicsKeywords.some(keyword => text.includes(keyword))
              const hasFinance = financeKeywords.some(keyword => text.includes(keyword))
              
              // Exclude sports and entertainment
              const excludeKeywords = [
                'nba', 'nfl', 'mlb', 'nhl', 'soccer', 'football', 'basketball',
                'baseball', 'hockey', 'tennis', 'golf', 'boxing', 'ufc', 'mma',
                'movie', 'film', 'oscar', 'emmy', 'grammy', 'award', 'celebrity',
                'actor', 'actress', 'singer', 'musician', 'entertainment', 'sports'
              ]
              
              const hasExcluded = excludeKeywords.some(keyword => text.includes(keyword))
              
              return (hasCrypto || hasPolitics || hasFinance) && !hasExcluded
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
            markets: relevantMarkets,
            lastUpdated: new Date().toISOString(),
            source: 'fallback'
          })
        }
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Polymarket data from all sources',
      markets: [],
      lastUpdated: new Date().toISOString()
    }, { status: 500 })
  }
}
