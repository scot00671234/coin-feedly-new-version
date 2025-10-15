import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        source: true,
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Get related articles based on shared categories
    const relatedArticles = await prisma.article.findMany({
      where: {
        id: { not: article.id },
        categories: {
          some: {
            categoryId: {
              in: article.categories.map(ac => ac.categoryId)
            }
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        publishedAt: true,
        readingTime: true,
        primaryCategory: true,
        source: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      article,
      relatedArticles
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    const article = await prisma.article.update({
      where: { slug },
      data: body
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}
