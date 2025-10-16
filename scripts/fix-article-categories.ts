import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixArticleCategories() {
  console.log('🔧 Fixing article categories...')
  
  // First, ensure all categories exist
  const categories = [
    { name: "Bitcoin", slug: "bitcoin" },
    { name: "Altcoins", slug: "altcoins" },
    { name: "DeFi", slug: "defi" },
    { name: "Macro", slug: "macro" },
    { name: "Web3", slug: "web3" },
    { name: "NFT", slug: "nft" },
    { name: "Gaming", slug: "gaming" },
    { name: "Metaverse", slug: "metaverse" },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    console.log(`✅ Ensured category exists: ${category.name}`)
  }

  // Get all articles
  const articles = await prisma.article.findMany({
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })

  console.log(`📊 Found ${articles.length} articles to process`)

  let fixed = 0
  for (const article of articles) {
    // If article has no category relationships, create them based on primaryCategory
    if (article.categories.length === 0 && article.primaryCategory) {
      const categorySlug = article.primaryCategory.toLowerCase()
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
      })

      if (category) {
        await prisma.articleCategory.create({
          data: {
            articleId: article.id,
            categoryId: category.id
          }
        })
        console.log(`✅ Added category ${categorySlug} to article: ${article.title.substring(0, 50)}...`)
        fixed++
      }
    }
  }

  console.log(`🎉 Fixed ${fixed} articles`)
}

fixArticleCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
