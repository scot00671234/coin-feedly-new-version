// Utility functions for handling images and thumbnails
import { getRandomCryptoImage } from './crypto-images'

export function getImageUrl(imageUrl?: string | null, title?: string, category?: string): string | null {
  if (imageUrl) {
    // Validate the image URL
    try {
      const url = new URL(imageUrl)
      // Check if it's a valid image URL
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return imageUrl
      }
    } catch {
      // Invalid URL, continue to fallback
    }
  }

  // Use crypto-relevant fallback images
  if (category) {
    return getRandomCryptoImage(category, title)
  }

  // Generate a placeholder image based on the title
  if (title) {
    const encodedTitle = encodeURIComponent(title.substring(0, 50))
    return `https://via.placeholder.com/400x225/1e293b/94a3b8?text=${encodedTitle}`
  }

  return getRandomCryptoImage('default')
}

export function getCryptoPlaceholderImage(category: string, title?: string): string {
  return getRandomCryptoImage(category, title)
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}
