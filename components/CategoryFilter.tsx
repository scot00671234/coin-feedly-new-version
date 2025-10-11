'use client'

interface Category {
  id: string
  name: string
  count: number
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            selectedCategory === category.id
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
