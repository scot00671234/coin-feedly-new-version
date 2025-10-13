export interface Article {
  id: string
  title: string
  description?: string | null
  content?: string | null
  url: string
  slug?: string
  publishedAt: string | Date
  imageUrl?: string | null
  category: string
  author?: string | null
  readingTime?: number | null
  viewCount?: number
  seoTitle?: string | null
  seoDescription?: string | null
  keywords?: string[]
  featuredImage?: string | null
  source: {
    id: string
    name: string
    url: string
  }
}

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_1h_in_currency: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  price_change_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  fully_diluted_valuation: number
  high_24h: number
  low_24h: number
  image: string
  sparkline_in_7d?: {
    price: number[]
  }
}

export interface NewsSource {
  id: string
  name: string
  url: string
  category: string
  isActive: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  keywords: string[]
  publishedAt: string
  isPublished: boolean
}

export interface Category {
  id: string
  name: string
  count: number
}

export interface SearchFilters {
  category?: string
  query?: string
  dateFrom?: string
  dateTo?: string
  source?: string
}
