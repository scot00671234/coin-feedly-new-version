import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      keywords: true,
      metaTitle: true,
      metaDescription: true,
      featuredImage: true,
      author: true,
      readingTime: true,
      viewCount: true,
      publishedAt: true,
      updatedAt: true,
      isPublished: true
    }
  })

  if (!post || !post.isPublished) {
    return null
  }

  // Get related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: post.id },
      keywords: { hasSome: post.keywords }
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      readingTime: true
    }
  })

  return { post, relatedPosts }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const data = await getBlogPost(params.slug)
  
  if (!data) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  const { post } = data
  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || 'Read the latest crypto news and Bitcoin updates.'

  return {
    title: `${title} | Coin Feedly Blog`,
    description,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: `${title} | Coin Feedly Blog`,
      description,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Coin Feedly Blog`,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const data = await getBlogPost(params.slug)
  
  if (!data) {
    notFound()
  }

  const { post, relatedPosts } = data

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coin Feedly',
      logo: {
        '@type': 'ImageObject',
        url: '/icon.svg'
      }
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coinfeedly.com/blog/${post.slug}`
    },
    keywords: post.keywords.join(', '),
    wordCount: post.content.split(' ').length,
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
              <li>/</li>
              <li><Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</Link></li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white">{post.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {post.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
                    {post.readingTime && (
                      <>
                        <span>•</span>
                        <span>{post.readingTime} min read</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{post.viewCount + 1} views</span>
                  </div>

                  {/* Content */}
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Related Posts
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {relatedPost.featuredImage && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(relatedPost.publishedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* SEO Content */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Stay Updated
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Get the latest crypto news and Bitcoin updates delivered to your RSS feed.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Posts
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}