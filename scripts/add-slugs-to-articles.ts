import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
}

async function addSlugsToArticles() {
  try {
    console.log('🔍 Finding articles without slugs...')
    
    // Find articles without slugs
    const articlesWithoutSlugs = await prisma.article.findMany({
      where: {
        slug: null
      },
      select: {
        id: true,
        title: true
      }
    })
    
    console.log(`📊 Found ${articlesWithoutSlugs.length} articles without slugs`)
    
    if (articlesWithoutSlugs.length === 0) {
      console.log('✅ All articles already have slugs!')
      return
    }
    
    // Update articles with slugs
    let updatedCount = 0
    for (const article of articlesWithoutSlugs) {
      const slug = generateSlug(article.title)
      
      // Check if slug already exists
      const existingArticle = await prisma.article.findFirst({
        where: { slug }
      })
      
      if (existingArticle) {
        // If slug exists, add a number suffix
        let counter = 1
        let uniqueSlug = `${slug}-${counter}`
        
        while (await prisma.article.findFirst({ where: { slug: uniqueSlug } })) {
          counter++
          uniqueSlug = `${slug}-${counter}`
        }
        
        await prisma.article.update({
          where: { id: article.id },
          data: { slug: uniqueSlug }
        })
        
        console.log(`✅ Updated article "${article.title}" with slug: ${uniqueSlug}`)
      } else {
        await prisma.article.update({
          where: { id: article.id },
          data: { slug }
        })
        
        console.log(`✅ Updated article "${article.title}" with slug: ${slug}`)
      }
      
      updatedCount++
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} articles with slugs!`)
    
  } catch (error) {
    console.error('❌ Error adding slugs to articles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addSlugsToArticles()
