# Coin Feedly - Crypto News RSS Feed

A comprehensive cryptocurrency news aggregation platform built with Next.js, TypeScript, and PostgreSQL. Stay updated with the latest crypto news, real-time prices, and expert analysis.

## Features

- 📰 **RSS News Aggregation**: Automated collection from top crypto news sources
- 💰 **Real-time Crypto Prices**: Live price ticker with 24h changes
- 🔍 **Advanced Search & Filtering**: Find news by category, keywords, or source
- 📱 **Responsive Design**: Modern UI optimized for all devices
- ⚡ **Endless Scroll**: Smooth infinite scroll for seamless browsing
- 🎯 **SEO Optimized**: Built-in SEO with meta tags and structured data
- 📝 **Blog Section**: SEO-optimized blog for additional organic traffic
- 🚀 **High Performance**: Optimized for speed and user experience

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **RSS Parsing**: rss-parser
- **Crypto API**: CoinGecko API
- **Deployment**: Nixpacks for VPS deployment

## News Sources

- CoinDesk (Bitcoin)
- Cointelegraph (Altcoins)
- Bitcoinist (Bitcoin)
- Decrypt (Altcoins)
- The Block (Macro)
- Blockworks (DeFi)
- DL News (Macro)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coin-feedly
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/coin_feedly"
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
COINGECKO_API_KEY="your-api-key-here"
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## API Endpoints

- `GET /api/news` - Fetch news articles with optional filtering
- `GET /api/crypto-prices` - Get real-time crypto prices
- `GET /api/rss/parse` - Parse RSS feeds manually

## Database Schema

The application uses the following main entities:

- **NewsSource**: RSS feed sources and their metadata
- **Article**: Individual news articles with content and metadata
- **CryptoPrice**: Real-time cryptocurrency price data
- **BlogPost**: SEO-optimized blog posts

## Deployment

### Using Nixpacks (Recommended)

1. Ensure your VPS has Nixpacks installed
2. Deploy using the included `nixpacks.toml` configuration
3. Set up your environment variables on the server
4. Run database migrations

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## SEO Features

- Meta tags optimization
- Open Graph and Twitter Card support
- Structured data markup
- Sitemap generation
- Blog section for organic traffic
- Keyword-optimized content

## Performance Optimizations

- Image optimization with Next.js Image component
- Lazy loading for news articles
- Efficient database queries with Prisma
- Caching for crypto prices
- Rate limiting for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
