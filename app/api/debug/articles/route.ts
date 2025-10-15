import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        url: true,
        primaryCategory: true,
        publishedAt: true,
        categories: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    return NextResponse.json({
      count: articles.length,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        url: article.url,
        primaryCategory: article.primaryCategory,
        categories: article.categories.map(ac => ac.category.name),
        publishedAt: article.publishedAt
      }))
    })
  } catch (error) {
    console.error('Debug articles error:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
