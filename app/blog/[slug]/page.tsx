import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: params.slug,
      isPublished: true
    }
  })

  if (!post) {
    return {
      title: 'Post Not Found | Coin Feedly Blog',
    }
  }

  return {
    title: `${post.title} | Coin Feedly Blog`,
    description: post.excerpt || post.content.substring(0, 160),
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: ['Coin Feedly'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: params.slug,
      isPublished: true
    }
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/blog"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-5 h-5 text-primary-400" />
            <span className="text-primary-400 font-medium">{post.keywords[0]}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>{post.keywords.join(', ')}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg prose-invert max-w-none">
          <div 
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Related Articles CTA */}
        <div className="mt-16 bg-dark-800/50 border border-dark-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Stay Updated with More Insights
          </h3>
          <p className="text-gray-300 mb-6">
            Discover more crypto analysis and market insights to stay ahead of the curve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/blog"
              className="btn-primary text-center"
            >
              Explore More Articles
            </Link>
            <Link 
              href="/"
              className="btn-secondary text-center"
            >
              View Latest News
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
