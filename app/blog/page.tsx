import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Calendar, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Crypto Blog - Latest Insights & Analysis | Coin Feedly',
  description: 'Stay informed with expert crypto analysis, market insights, and trading strategies. Your go-to resource for cryptocurrency education and news.',
  keywords: 'crypto blog, bitcoin analysis, cryptocurrency insights, trading strategies, blockchain news, defi analysis',
  openGraph: {
    title: 'Crypto Blog - Latest Insights & Analysis | Coin Feedly',
    description: 'Stay informed with expert crypto analysis, market insights, and trading strategies.',
    type: 'website',
  },
}

export default async function BlogPage() {
  let blogPosts: any[] = []
  
  try {
    blogPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })
  } catch (error) {
    console.log('Database not available for blog posts, showing empty state')
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Crypto Insights & Analysis
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay ahead of the market with expert analysis, trading strategies, and in-depth insights 
            into the cryptocurrency ecosystem.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="w-5 h-5" />
                <span className="text-primary-100">Featured Article</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{blogPosts[0].title}</h2>
              <p className="text-primary-100 text-lg mb-6 line-clamp-3">
                {blogPosts[0].excerpt || blogPosts[0].content.substring(0, 200) + '...'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-primary-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(blogPosts[0].publishedAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span>{blogPosts[0].keywords.join(', ')}</span>
                  </div>
                </div>
                <Link 
                  href={`/blog/${blogPosts[0].slug}`}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 hover:border-dark-600 transition-colors">
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-400">{post.keywords[0]}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-gray-300 mb-4 line-clamp-3">
                {post.excerpt || post.content.substring(0, 150) + '...'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
                </div>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="flex items-center space-x-1 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <span>Read more</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-white mb-4">No Blog Posts Available</h3>
            <p className="text-gray-300 mb-6">Check back later for the latest crypto insights and analysis.</p>
            <Link 
              href="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Explore News Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Stay Updated with Market Insights
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get the latest crypto analysis and trading strategies delivered to your inbox. 
              Join thousands of traders who trust our insights.
            </p>
            <Link 
              href="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Explore News Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
