'use client'

interface SortFilterProps {
  sortBy: 'newest' | 'oldest' | 'relevant'
  setSortBy: (sort: 'newest' | 'oldest' | 'relevant') => void
}

export default function SortFilter({ sortBy, setSortBy }: SortFilterProps) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'relevant', label: 'Most Relevant' }
  ] as const

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Sort by:</span>
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-sm">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              sortBy === option.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
