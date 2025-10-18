import { detectArticleCategories } from '../lib/category-detector'

// Test cases for category detection
const testCases = [
  {
    title: "Bitcoin Price Surges to New All-Time High",
    description: "Bitcoin reaches $100,000 as institutional adoption continues to grow",
    content: "The cryptocurrency market is experiencing unprecedented growth with Bitcoin leading the charge. Major corporations are adding BTC to their balance sheets.",
    expectedCategory: "BITCOIN"
  },
  {
    title: "Ethereum 2.0 Staking Rewards Hit 5% APY",
    description: "Ethereum validators are earning record rewards as the network transitions to Proof of Stake",
    content: "The Merge has been successful and ETH staking is now more profitable than ever. Smart contracts continue to drive DeFi innovation.",
    expectedCategory: "ALTCOINS"
  },
  {
    title: "Crypto In Ghana: Lawmakers Race To Write Rules Before December",
    description: "Ghana's central bank says it expects to have a law to regulate cryptocurrencies and other virtual assets in place by the end of December",
    content: "The regulatory framework will cover all digital assets and provide clarity for businesses operating in the crypto space.",
    expectedCategory: "MACRO"
  },
  {
    title: "Uniswap V4 Launches with Revolutionary Hook System",
    description: "The new version introduces customizable liquidity pools and advanced DeFi features",
    content: "DeFi protocols are evolving rapidly with Uniswap leading the charge. Yield farming opportunities are expanding across multiple chains.",
    expectedCategory: "DEFI"
  },
  {
    title: "Bored Ape NFT Collection Sells for $2.3 Million",
    description: "Digital art continues to command high prices in the NFT market",
    content: "The NFT space is seeing renewed interest with high-profile sales and new collections launching regularly.",
    expectedCategory: "NFT"
  },
  {
    title: "Technical Analysis: Bitcoin Shows Bullish Divergence",
    description: "RSI and MACD indicators suggest a potential price reversal",
    content: "Traders are watching key support levels as volume increases. The market structure looks promising for a breakout.",
    expectedCategory: "BITCOIN"
  }
]

console.log('🧪 Testing Category Detection System\n')

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase.title}"`)
  
  const result = detectArticleCategories(
    testCase.title,
    testCase.description,
    testCase.content
  )
  
  console.log(`  Expected: ${testCase.expectedCategory}`)
  console.log(`  Detected: ${result.primary}`)
  console.log(`  Secondary: ${result.secondary.join(', ')}`)
  console.log(`  Confidence: ${result.confidence}`)
  console.log(`  ✅ ${result.primary === testCase.expectedCategory ? 'CORRECT' : 'INCORRECT'}`)
  console.log('')
})

console.log('🎯 Category Detection Test Complete!')
