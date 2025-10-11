import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newsSources = [
  { url: "https://www.coindesk.com/feed/", category: "bitcoin", source: "CoinDesk" },
  { url: "https://cointelegraph.com/rss", category: "altcoins", source: "Cointelegraph" },
  { url: "https://bitcoinist.com/feed/", category: "bitcoin", source: "Bitcoinist" },
  { url: "https://decrypt.co/feed", category: "altcoins", source: "Decrypt" },
  { url: "https://www.theblockcrypto.com/rss", category: "macro", source: "The Block" },
  { url: "https://www.blockworks.co/feed", category: "defi", source: "Blockworks" },
  { url: "https://www.dlnews.com/rss", category: "macro", source: "DL News" },
]

const blogPosts = [
  {
    title: "Bitcoin's Next Bull Run: What Technical Analysis Tells Us",
    slug: "bitcoin-next-bull-run-technical-analysis",
    content: `
      <h2>Understanding Bitcoin's Market Cycles</h2>
      <p>Bitcoin has historically followed four-year cycles, with each cycle consisting of accumulation, markup, distribution, and markdown phases. As we approach the next halving event, technical indicators suggest we may be entering a new accumulation phase.</p>
      
      <h3>Key Technical Indicators to Watch</h3>
      <ul>
        <li><strong>Moving Averages:</strong> The 200-day moving average has historically acted as strong support during bull markets</li>
        <li><strong>RSI Divergence:</strong> Look for bullish divergence on the RSI indicator</li>
        <li><strong>Volume Analysis:</strong> Increasing volume on price advances indicates institutional interest</li>
        <li><strong>Support Levels:</strong> Key support at $25,000 and $20,000 levels</li>
      </ul>
      
      <h3>Market Sentiment and Fundamentals</h3>
      <p>The current market environment shows several positive factors that could contribute to Bitcoin's next bull run:</p>
      <ul>
        <li>Institutional adoption continues to grow</li>
        <li>Regulatory clarity in major markets</li>
        <li>Limited supply due to halving events</li>
        <li>Growing use cases and utility</li>
      </ul>
      
      <h3>Risk Management Strategies</h3>
      <p>While the outlook appears bullish, it's crucial to implement proper risk management:</p>
      <ul>
        <li>Dollar-cost averaging into positions</li>
        <li>Setting stop-losses at key support levels</li>
        <li>Diversifying across different time horizons</li>
        <li>Keeping emotions in check during volatile periods</li>
      </ul>
    `,
    excerpt: "Technical analysis suggests Bitcoin may be entering a new accumulation phase ahead of the next halving. Here's what the charts are telling us about the potential for another bull run.",
    keywords: ["bitcoin", "technical analysis", "bull run", "cryptocurrency", "trading", "halving"],
    isPublished: true
  },
  {
    title: "DeFi Summer 2.0: The Next Generation of Decentralized Finance",
    slug: "defi-summer-2-next-generation-decentralized-finance",
    content: `
      <h2>The Evolution of DeFi</h2>
      <p>Decentralized Finance has evolved significantly since the original "DeFi Summer" of 2020. New protocols, improved user experiences, and enhanced security measures are paving the way for mainstream adoption.</p>
      
      <h3>Key Innovations Driving DeFi 2.0</h3>
      <ul>
        <li><strong>Layer 2 Solutions:</strong> Reduced gas fees and faster transactions</li>
        <li><strong>Cross-Chain Bridges:</strong> Seamless asset transfers between blockchains</li>
        <li><strong>Improved UX:</strong> More intuitive interfaces for non-technical users</li>
        <li><strong>Enhanced Security:</strong> Better auditing and risk management protocols</li>
      </ul>
      
      <h3>Top DeFi Protocols to Watch</h3>
      <p>Several protocols are leading the charge in DeFi innovation:</p>
      <ul>
        <li><strong>Uniswap V4:</strong> Next-generation AMM with hooks and customization</li>
        <li><strong>Compound V3:</strong> Isolated risk markets for better capital efficiency</li>
        <li><strong>Aave V3:</strong> Cross-chain lending and borrowing capabilities</li>
        <li><strong>Curve V2:</strong> Optimized for stablecoin trading</li>
      </ul>
      
      <h3>Investment Opportunities and Risks</h3>
      <p>While DeFi presents exciting opportunities, investors should be aware of the risks:</p>
      <ul>
        <li>Smart contract vulnerabilities</li>
        <li>Regulatory uncertainty</li>
        <li>Liquidity risks</li>
        <li>Market volatility</li>
      </ul>
    `,
    excerpt: "DeFi is evolving with new protocols, improved UX, and enhanced security. Discover the key innovations driving DeFi 2.0 and the opportunities they present.",
    keywords: ["defi", "decentralized finance", "cryptocurrency", "blockchain", "yield farming", "liquidity"],
    isPublished: true
  },
  {
    title: "Macro Economic Factors Impacting Crypto Markets in 2024",
    slug: "macro-economic-factors-crypto-markets-2024",
    content: `
      <h2>The Intersection of Traditional Finance and Crypto</h2>
      <p>Cryptocurrency markets are increasingly influenced by macro-economic factors as institutional adoption grows. Understanding these relationships is crucial for informed investment decisions.</p>
      
      <h3>Key Macro Factors to Monitor</h3>
      <ul>
        <li><strong>Interest Rates:</strong> Federal Reserve policy directly impacts risk assets</li>
        <li><strong>Inflation:</strong> Crypto as a hedge against currency debasement</li>
        <li><strong>Dollar Strength:</strong> DXY correlation with crypto markets</li>
        <li><strong>Geopolitical Events:</strong> Safe haven demand during uncertainty</li>
      </ul>
      
      <h3>Federal Reserve Policy Impact</h3>
      <p>The Fed's monetary policy has a significant impact on crypto markets:</p>
      <ul>
        <li>Rate hikes typically pressure risk assets</li>
        <li>Quantitative easing provides liquidity for speculation</li>
        <li>Forward guidance shapes market expectations</li>
        <li>Balance sheet changes affect market liquidity</li>
      </ul>
      
      <h3>Institutional Adoption Trends</h3>
      <p>Growing institutional interest is changing the crypto landscape:</p>
      <ul>
        <li>Corporate treasury allocations</li>
        <li>Pension fund investments</li>
        <li>ETF approvals and launches</li>
        <li>Central bank digital currencies (CBDCs)</li>
      </ul>
      
      <h3>Global Economic Outlook</h3>
      <p>Several global trends are shaping the crypto market:</p>
      <ul>
        <li>Emerging market adoption</li>
        <li>Regulatory developments</li>
        <li>Energy transition impacts</li>
        <li>Digital transformation acceleration</li>
      </ul>
    `,
    excerpt: "Understanding macro-economic factors is crucial for crypto investors. Learn how Fed policy, inflation, and institutional adoption are shaping the market in 2024.",
    keywords: ["macro", "economics", "federal reserve", "inflation", "institutional adoption", "cryptocurrency"],
    isPublished: true
  }
]

async function main() {
  console.log('Starting database seed...')

  // Create news sources
  for (const source of newsSources) {
    await prisma.newsSource.upsert({
      where: { url: source.url },
      update: {
        name: source.source,
        category: source.category
      },
      create: {
        name: source.source,
        url: source.url,
        category: source.category
      },
    })
  }

  // Create blog posts
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
