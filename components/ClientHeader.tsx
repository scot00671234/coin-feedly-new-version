'use client'

import { useState } from 'react'
import UnifiedHeader from './UnifiedHeader'

export default function ClientHeader() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    // Navigate to search results or trigger search
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`
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
