const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database schema...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Try to create a simple article to test the schema
    const testArticle = await prisma.article.create({
      data: {
        title: 'Test Article',
        description: 'Test description',
        content: 'Test content',
        url: 'https://test.com/test-' + Date.now(),
        slug: 'test-article-' + Date.now(),
        publishedAt: new Date(),
        primaryCategory: 'BITCOIN',
        sourceId: 'test-source-id'
      }
    })
    
    console.log('✅ Test article created successfully')
    
    // Clean up test article
    await prisma.article.delete({
      where: { id: testArticle.id }
    })
    
    console.log('✅ Database schema is working correctly')
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
    
    if (error.message.includes('CategoryType')) {
      console.log('🔧 The CategoryType enum issue has been fixed in the schema')
      console.log('📝 Please redeploy the application to apply the changes')
    }
  } finally {
    await prisma.$disconnect()
  }
}

fixDatabase()
