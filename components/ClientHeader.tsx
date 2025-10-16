'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UnifiedHeader from './UnifiedHeader'

export default function ClientHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Sync search query with URL params
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const handleSearch = () => {
    // Navigate to search results or trigger search
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('search', searchQuery.trim())
      router.push(`/?${params.toString()}`)
    } else {
      // Clear search
      const params = new URLSearchParams(searchParams.toString())
      params.delete('search')
      router.push(`/?${params.toString()}`)
    }
  }

  return (
    <UnifiedHeader
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSearch={handleSearch}
    />
  )
}
