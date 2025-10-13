import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const keyword = searchParams.get('keyword') || ''

    const skip = (page - 1) * limit

    const where = {
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(keyword && {
        keywords: { has: keyword }
      })
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          keywords: true,
          featuredImage: true,
          author: true,
          readingTime: true,
          viewCount: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true
        }
      }),
      prisma.blogPost.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      excerpt,
      keywords,
      metaTitle,
      metaDescription,
      featuredImage,
      author,
      readingTime,
      isPublished = false,
      priority = 0
    } = body

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        keywords: keywords || [],
        metaTitle: metaTitle || title,
        metaDescription,
        featuredImage,
        author: author || 'Coin Feedly Team',
        readingTime,
        isPublished,
        priority
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
