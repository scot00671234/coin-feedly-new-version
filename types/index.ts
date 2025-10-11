export interface Article {
  id: string
  title: string
  description?: string | null
  content?: string | null
  url: string
  publishedAt: string | Date
  imageUrl?: string | null
  category: string
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
  price: number
  change24h: number
  volume24h?: number
  marketCap?: number
  updatedAt: string
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
