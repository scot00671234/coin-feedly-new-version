import { execSync } from 'child_process'
import { prisma } from '../lib/db'

async function migrateAndSeed() {
  try {
    console.log('🔄 Starting database migration and seeding...')
    
    // Run Prisma migration
    console.log('📊 Running Prisma migration...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Check if blog posts already exist
    const existingPosts = await prisma.blogPost.count()
    
    if (existingPosts === 0) {
      console.log('🌱 Seeding blog posts...')
      
      const sampleBlogPosts = [
        {
          title: "The Ultimate Guide to Crypto News RSS Feeds: Stay Updated with Bitcoin and Altcoin Updates",
          slug: "ultimate-guide-crypto-news-rss-feeds-bitcoin-altcoin-updates",
          content: `
            <h2>Why Crypto News RSS Feeds Are Essential for Traders</h2>
            <p>In the fast-paced world of cryptocurrency trading, staying informed is crucial for success. A reliable crypto news RSS feed can be your secret weapon, delivering real-time updates on Bitcoin, Ethereum, and thousands of altcoins directly to your feed reader.</p>
            
            <h3>What Makes a Great Crypto RSS Feed?</h3>
            <p>The best cryptocurrency RSS feeds aggregate news from multiple trusted sources, ensuring you never miss important market-moving events. Our crypto news site provides comprehensive coverage of:</p>
            <ul>
              <li>Bitcoin updates and price analysis</li>
              <li>Ethereum network developments</li>
              <li>DeFi protocol announcements</li>
              <li>Regulatory news and compliance updates</li>
              <li>Exchange listings and delistings</li>
              <li>Blockchain technology innovations</li>
            </ul>
            
            <h3>How to Set Up Your Crypto News RSS Feed</h3>
            <p>Setting up a crypto RSS feed is simple. Most modern RSS readers support cryptocurrency news feeds, and you can customize your feed to focus on specific coins or topics that interest you most.</p>
            
            <h3>Top Crypto News Sources for Your RSS Feed</h3>
            <p>When building your crypto news RSS feed, it's important to include sources that provide accurate, timely information. Look for sites that have a proven track record of breaking important crypto news and providing insightful analysis.</p>
          `,
          excerpt: "Discover how to set up the perfect crypto news RSS feed to stay updated with Bitcoin updates, altcoin news, and blockchain developments. Your complete guide to cryptocurrency news aggregation.",
          keywords: ["crypto news RSS feed", "bitcoin updates", "cryptocurrency news", "altcoin news", "crypto trading news", "blockchain news"],
          metaTitle: "Crypto News RSS Feed: Bitcoin Updates & Altcoin News | Coin Feedly",
          metaDescription: "Get the latest crypto news with our comprehensive RSS feed. Stay updated with Bitcoin updates, altcoin news, and blockchain developments. Perfect for crypto traders and enthusiasts.",
          author: "Coin Feedly Team",
          readingTime: 8,
          priority: 10,
          isPublished: true
        },
        {
          title: "Bitcoin Updates: Latest Price Analysis and Market Trends for 2024",
          slug: "bitcoin-updates-latest-price-analysis-market-trends-2024",
          content: `
            <h2>Current Bitcoin Market Analysis</h2>
            <p>Bitcoin continues to dominate the cryptocurrency market, with recent updates showing significant developments in adoption and technology. As the leading digital asset, Bitcoin updates are crucial for understanding the broader crypto market trends.</p>
            
            <h3>Recent Bitcoin Price Movements</h3>
            <p>The Bitcoin price has shown remarkable resilience in 2024, with institutional adoption driving significant price movements. Our analysis of recent Bitcoin updates reveals several key factors influencing the current market:</p>
            <ul>
              <li>Institutional Bitcoin ETF approvals</li>
              <li>Increased corporate Bitcoin holdings</li>
              <li>Regulatory clarity in major markets</li>
              <li>Network upgrades and improvements</li>
            </ul>
            
            <h3>What Bitcoin Updates Mean for Investors</h3>
            <p>Staying informed about Bitcoin updates is essential for making informed investment decisions. Whether you're a day trader or long-term holder, understanding the latest Bitcoin developments can help you navigate market volatility.</p>
            
            <h3>Future Outlook for Bitcoin</h3>
            <p>Based on current Bitcoin updates and market analysis, the future looks promising for the world's first cryptocurrency. Continued adoption and technological improvements suggest Bitcoin will remain a cornerstone of the digital asset ecosystem.</p>
          `,
          excerpt: "Stay updated with the latest Bitcoin updates, price analysis, and market trends. Comprehensive coverage of Bitcoin news, developments, and investment insights for 2024.",
          keywords: ["bitcoin updates", "bitcoin price", "bitcoin news", "bitcoin analysis", "cryptocurrency market", "bitcoin trading"],
          metaTitle: "Bitcoin Updates 2024: Latest Price Analysis & Market Trends | Coin Feedly",
          metaDescription: "Get the latest Bitcoin updates, price analysis, and market trends. Stay informed with comprehensive Bitcoin news coverage and expert analysis for 2024.",
          author: "Coin Feedly Team",
          readingTime: 6,
          priority: 9,
          isPublished: true
        },
        {
          title: "Cryptocurrency RSS Feed: Your Complete Guide to Crypto News Aggregation",
          slug: "cryptocurrency-rss-feed-complete-guide-crypto-news-aggregation",
          content: `
            <h2>Why You Need a Cryptocurrency RSS Feed</h2>
            <p>A well-curated cryptocurrency RSS feed is essential for anyone serious about crypto trading or investing. With hundreds of crypto news sites publishing daily, an RSS feed helps you stay informed without being overwhelmed by information overload.</p>
            
            <h3>Best Cryptocurrency News Sources for RSS</h3>
            <p>When building your cryptocurrency RSS feed, focus on sources that provide:</p>
            <ul>
              <li>Accurate and timely information</li>
              <li>Expert analysis and insights</li>
              <li>Breaking news coverage</li>
              <li>Market analysis and trends</li>
              <li>Regulatory updates</li>
            </ul>
            
            <h3>How to Optimize Your Crypto RSS Feed</h3>
            <p>To get the most out of your cryptocurrency RSS feed, consider these optimization strategies:</p>
            <ul>
              <li>Filter by specific cryptocurrencies you're interested in</li>
              <li>Set up keyword alerts for important terms</li>
              <li>Use multiple RSS readers for different purposes</li>
              <li>Regularly review and update your feed sources</li>
            </ul>
            
            <h3>Mobile RSS Readers for Crypto News</h3>
            <p>With crypto markets operating 24/7, having a mobile RSS reader is crucial for staying updated on the go. Look for readers that offer push notifications for breaking news and customizable filtering options.</p>
          `,
          excerpt: "Learn how to create the perfect cryptocurrency RSS feed for staying updated with crypto news. Complete guide to crypto news aggregation and RSS optimization.",
          keywords: ["cryptocurrency RSS feed", "crypto news aggregation", "cryptocurrency news", "RSS feed crypto", "crypto news reader", "cryptocurrency updates"],
          metaTitle: "Cryptocurrency RSS Feed: Complete Guide to Crypto News Aggregation",
          metaDescription: "Create the perfect cryptocurrency RSS feed for crypto news. Learn how to aggregate cryptocurrency news, optimize your RSS feed, and stay updated with the latest crypto developments.",
          author: "Coin Feedly Team",
          readingTime: 7,
          priority: 8,
          isPublished: true
        },
        {
          title: "DeFi News: Latest Decentralized Finance Updates and Protocol Developments",
          slug: "defi-news-latest-decentralized-finance-updates-protocol-developments",
          content: `
            <h2>DeFi Market Overview</h2>
            <p>Decentralized Finance (DeFi) continues to revolutionize the cryptocurrency space, with new protocols and updates emerging regularly. Our DeFi news coverage keeps you informed about the latest developments in this rapidly evolving sector.</p>
            
            <h3>Recent DeFi Protocol Updates</h3>
            <p>Several major DeFi protocols have announced significant updates recently, including:</p>
            <ul>
              <li>Uniswap V4 launch and new features</li>
              <li>Ethereum 2.0 staking improvements</li>
              <li>New yield farming opportunities</li>
              <li>Cross-chain DeFi integrations</li>
              <li>Enhanced security measures</li>
            </ul>
            
            <h3>DeFi Yield Farming Opportunities</h3>
            <p>Yield farming remains one of the most popular DeFi activities, with new opportunities emerging regularly. Our DeFi news section covers the latest farming strategies and risk assessments.</p>
            
            <h3>Regulatory Updates for DeFi</h3>
            <p>As DeFi protocols gain mainstream attention, regulatory clarity becomes increasingly important. Stay updated with the latest regulatory developments affecting decentralized finance.</p>
          `,
          excerpt: "Stay updated with the latest DeFi news, protocol developments, and decentralized finance updates. Comprehensive coverage of DeFi protocols, yield farming, and regulatory news.",
          keywords: ["DeFi news", "decentralized finance", "DeFi protocols", "yield farming", "DeFi updates", "DeFi trading"],
          metaTitle: "DeFi News: Latest Decentralized Finance Updates & Protocol Developments",
          metaDescription: "Get the latest DeFi news and updates on decentralized finance protocols. Stay informed about DeFi developments, yield farming opportunities, and regulatory updates.",
          author: "Coin Feedly Team",
          readingTime: 5,
          priority: 7,
          isPublished: true
        },
        {
          title: "Crypto Trading News: Market Analysis and Trading Strategies for 2024",
          slug: "crypto-trading-news-market-analysis-trading-strategies-2024",
          content: `
            <h2>Current Crypto Trading Market Conditions</h2>
            <p>The cryptocurrency trading landscape continues to evolve, with new opportunities and challenges emerging regularly. Our crypto trading news provides comprehensive market analysis and trading insights for both beginners and experienced traders.</p>
            
            <h3>Key Trading Indicators to Watch</h3>
            <p>Successful crypto trading requires understanding key market indicators. Our analysis covers:</p>
            <ul>
              <li>Technical analysis patterns</li>
              <li>Volume and liquidity metrics</li>
              <li>Market sentiment indicators</li>
              <li>On-chain analytics</li>
              <li>Institutional activity</li>
            </ul>
            
            <h3>Popular Trading Strategies for 2024</h3>
            <p>Different trading strategies work better in different market conditions. Our crypto trading news covers various approaches including day trading, swing trading, and long-term holding strategies.</p>
            
            <h3>Risk Management in Crypto Trading</h3>
            <p>Proper risk management is crucial for successful crypto trading. Learn about position sizing, stop-loss strategies, and portfolio diversification techniques.</p>
          `,
          excerpt: "Get the latest crypto trading news, market analysis, and trading strategies. Stay informed about cryptocurrency trading opportunities, market trends, and risk management techniques.",
          keywords: ["crypto trading news", "cryptocurrency trading", "crypto market analysis", "trading strategies", "crypto trading tips", "cryptocurrency market"],
          metaTitle: "Crypto Trading News: Market Analysis & Trading Strategies 2024",
          metaDescription: "Stay updated with crypto trading news and market analysis. Get expert trading strategies, market insights, and risk management tips for cryptocurrency trading in 2024.",
          author: "Coin Feedly Team",
          readingTime: 6,
          priority: 6,
          isPublished: true
        },
        {
          title: "Blockchain Technology News: Latest Developments and Innovations",
          slug: "blockchain-technology-news-latest-developments-innovations",
          content: `
            <h2>Blockchain Innovation Trends</h2>
            <p>Blockchain technology continues to advance at a rapid pace, with new innovations and developments emerging regularly. Our blockchain technology news covers the latest breakthroughs and their potential impact on various industries.</p>
            
            <h3>Recent Blockchain Upgrades</h3>
            <p>Major blockchain networks have implemented significant upgrades recently, including:</p>
            <ul>
              <li>Ethereum's latest network improvements</li>
              <li>Bitcoin's Lightning Network developments</li>
              <li>Layer 2 scaling solutions</li>
              <li>Interoperability protocols</li>
              <li>Privacy enhancements</li>
            </ul>
            
            <h3>Enterprise Blockchain Adoption</h3>
            <p>More enterprises are adopting blockchain technology for various use cases. Our coverage includes real-world implementations and their business impact.</p>
            
            <h3>Future of Blockchain Technology</h3>
            <p>Looking ahead, blockchain technology is expected to play an increasingly important role in digital transformation across multiple industries.</p>
          `,
          excerpt: "Stay updated with the latest blockchain technology news, developments, and innovations. Comprehensive coverage of blockchain upgrades, enterprise adoption, and future trends.",
          keywords: ["blockchain technology news", "blockchain developments", "blockchain innovation", "blockchain updates", "blockchain technology", "distributed ledger"],
          metaTitle: "Blockchain Technology News: Latest Developments & Innovations",
          metaDescription: "Get the latest blockchain technology news and developments. Stay informed about blockchain innovations, upgrades, and enterprise adoption trends.",
          author: "Coin Feedly Team",
          readingTime: 5,
          priority: 5,
          isPublished: true
        }
      ]

      for (const post of sampleBlogPosts) {
        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          update: post,
          create: post
        })
        console.log(`✅ Created/Updated blog post: ${post.title}`)
      }
      
      console.log('🎉 Blog posts seeded successfully!')
    } else {
      console.log(`ℹ️  Blog posts already exist (${existingPosts} posts found), skipping seed.`)
    }
    
    console.log('✅ Database migration and seeding completed!')
  } catch (error) {
    console.error('❌ Error during migration and seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateAndSeed()
