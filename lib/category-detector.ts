// Intelligent category detection based on article content
export interface CategoryScore {
  category: string
  score: number
  keywords: string[]
}

export interface DetectedCategories {
  primary: string
  secondary: string[]
  confidence: number
}

// Category keywords and their weights (matching database enum values)
const CATEGORY_KEYWORDS = {
  BITCOIN: {
    keywords: [
      'bitcoin', 'btc', 'satoshi', 'halving', 'mining', 'hash rate',
      'bitcoin price', 'bitcoin etf', 'bitcoin adoption', 'bitcoin wallet',
      'lightning network', 'bitcoin core', 'bitcoin cash', 'bitcoin sv'
    ],
    weight: 1.0
  },
  ALTCOINS: {
    keywords: [
      'ethereum', 'eth', 'ether', 'ethereum 2.0', 'eth2', 'merge',
      'altcoin', 'altcoins', 'cryptocurrency', 'crypto', 'digital currency',
      'binance coin', 'bnb', 'cardano', 'ada', 'solana', 'sol', 'polkadot',
      'dot', 'chainlink', 'link', 'litecoin', 'ltc', 'ripple', 'xrp',
      'dogecoin', 'doge', 'shiba inu', 'meme coin', 'token', 'coin'
    ],
    weight: 0.8
  },
  DEFI: {
    keywords: [
      'defi', 'decentralized finance', 'yield farming', 'liquidity pool',
      'uniswap', 'sushiswap', 'pancakeswap', 'aave', 'compound', 'makerdao',
      'curve', 'balancer', 'synthetix', 'yearn', 'harvest', 'lending',
      'borrowing', 'staking', 'governance token', 'dao', 'dex', 'amm'
    ],
    weight: 1.0
  },
  NFT: {
    keywords: [
      'nft', 'non-fungible token', 'nfts', 'opensea', 'rarible', 'foundation',
      'digital art', 'collectible', 'metaverse', 'virtual world', 'avatar',
      'pixel art', 'crypto art', 'blockchain art', 'mint', 'minting'
    ],
    weight: 1.0
  },
  MACRO: {
    keywords: [
      'regulation', 'regulatory', 'sec', 'cftc', 'federal reserve', 'fed',
      'inflation', 'interest rates', 'monetary policy', 'economic', 'economy',
      'institutional', 'adoption', 'corporate', 'treasury', 'government',
      'policy', 'legal', 'compliance', 'tax', 'taxation', 'audit'
    ],
    weight: 0.9
  },
  WEB3: {
    keywords: [
      'web3', 'web 3', 'dapp', 'dapps', 'blockchain', 'distributed',
      'peer-to-peer', 'p2p', 'consensus', 'node', 'validator', 'miner',
      'hash', 'cryptography', 'private key', 'public key', 'wallet',
      'transaction', 'block', 'chain', 'immutable', 'transparent'
    ],
    weight: 0.8
  },
  GAMING: {
    keywords: [
      'gaming', 'game', 'play-to-earn', 'p2e', 'nft game', 'crypto game',
      'blockchain game', 'axie infinity', 'sandbox', 'decentraland', 'gaming nft'
    ],
    weight: 1.0
  },
  METAVERSE: {
    keywords: [
      'metaverse', 'virtual reality', 'vr', 'augmented reality', 'ar',
      'virtual world', 'digital world', 'virtual land', 'virtual property'
    ],
    weight: 1.0
  }
}

// Special patterns that override category detection
const SPECIAL_PATTERNS = {
  regulation: {
    patterns: [
      /regulation/i, /regulatory/i, /sec/i, /cftc/i, /government/i,
      /policy/i, /legal/i, /compliance/i, /law/i, /bill/i, /act/i
    ],
    category: 'MACRO',
    weight: 2.0
  },
  ethereum_specific: {
    patterns: [
      /ethereum/i, /eth/i, /ether/i, /smart contract/i, /defi/i, /nft/i
    ],
    category: 'ALTCOINS',
    weight: 1.5
  },
  bitcoin_specific: {
    patterns: [
      /bitcoin/i, /btc/i, /satoshi/i, /halving/i, /mining/i
    ],
    category: 'BITCOIN',
    weight: 1.5
  }
}

export function detectArticleCategories(
  title: string,
  description: string,
  content?: string
): DetectedCategories {
  const text = `${title} ${description} ${content || ''}`.toLowerCase()
  
  // Calculate scores for each category
  const categoryScores: CategoryScore[] = []
  
  for (const [categoryName, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    const matchedKeywords: string[] = []
    
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi')
      const matches = text.match(regex)
      if (matches) {
        score += matches.length * config.weight
        matchedKeywords.push(keyword)
      }
    }
    
    if (score > 0) {
      categoryScores.push({
        category: categoryName,
        score,
        keywords: matchedKeywords
      })
    }
  }
  
  // Apply special pattern overrides
  for (const [patternName, config] of Object.entries(SPECIAL_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        const existingIndex = categoryScores.findIndex(cs => cs.category === config.category)
        if (existingIndex >= 0) {
          categoryScores[existingIndex].score *= config.weight
        } else {
          categoryScores.push({
            category: config.category,
            score: config.weight,
            keywords: [`${patternName} pattern`]
          })
        }
      }
    }
  }
  
  // Sort by score (highest first)
  categoryScores.sort((a, b) => b.score - a.score)
  
  // Determine primary and secondary categories
  const primary = categoryScores.length > 0 ? categoryScores[0].category : 'ALTCOINS'
  const secondary = categoryScores.slice(1, 3).map(cs => cs.category)
  
  // Calculate confidence based on score distribution
  const totalScore = categoryScores.reduce((sum, cs) => sum + cs.score, 0)
  const primaryScore = categoryScores[0]?.score || 0
  const confidence = totalScore > 0 ? Math.min(primaryScore / totalScore, 1) : 0.5
  
  return {
    primary,
    secondary,
    confidence: Math.round(confidence * 100) / 100
  }
}

// Helper function to get category display name
export function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    BITCOIN: 'Bitcoin',
    ALTCOINS: 'Altcoins',
    DEFI: 'DeFi',
    NFT: 'NFT',
    MACRO: 'Macro',
    WEB3: 'Web3',
    GAMING: 'Gaming',
    METAVERSE: 'Metaverse'
  }
  
  return displayNames[category.toUpperCase()] || category.toUpperCase()
}

// Helper function to get category color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    BITCOIN: 'bg-orange-500',
    ALTCOINS: 'bg-purple-500',
    DEFI: 'bg-green-500',
    NFT: 'bg-pink-500',
    MACRO: 'bg-gray-500',
    WEB3: 'bg-indigo-500',
    GAMING: 'bg-yellow-500',
    METAVERSE: 'bg-cyan-500'
  }
  
  return colors[category.toUpperCase()] || 'bg-gray-500'
}
