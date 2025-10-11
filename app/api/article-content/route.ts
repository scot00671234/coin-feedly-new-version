import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // For now, we'll return a placeholder since we can't directly fetch external content
    // In a real implementation, you might want to use a service like Mercury API or similar
    // to extract article content from external URLs
    
    return NextResponse.json({
      content: null,
      message: 'Article content extraction not implemented yet. Using fallback content.'
    })

  } catch (error) {
    console.error('Error fetching article content:', error)
    return NextResponse.json({ error: 'Failed to fetch article content' }, { status: 500 })
  }
}
