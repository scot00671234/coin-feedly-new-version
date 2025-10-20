'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import InAppBrowserViewer from './InAppBrowserViewer'

interface ArticlePageClientProps {
  article: any
  externalContent: string | null
}

export default function ArticlePageClient({ article, externalContent }: ArticlePageClientProps) {
  const [showBrowserView, setShowBrowserView] = useState(false)

  return (
    <>
      {/* Embedded Content */}
      <div className="p-8">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Full Article Content
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Embedded from {article.source.name}
              </div>
              {article.url && (
                <button
                  onClick={() => setShowBrowserView(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Browser View
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
          {externalContent ? (
            <div dangerouslySetInnerHTML={{ __html: externalContent }} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8">
                <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Article Content Unavailable
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We couldn't load the full article content. This might be due to the source website's restrictions or network issues.
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Full Article on {article.source.name}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Browser Viewer Modal */}
      {showBrowserView && article.url && (
        <InAppBrowserViewer
          articleUrl={article.url}
          isOpen={showBrowserView}
          onClose={() => setShowBrowserView(false)}
        />
      )}
    </>
  )
}
