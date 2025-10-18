import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Essential data is now managed via database migrations and API endpoints

// Blog posts are now managed via API endpoint: /api/admin/seed-blog-posts

async function main() {
  console.log('Starting database seed...')

  // Categories are managed via the database schema

  // News sources are managed via the database schema

  // Blog posts are managed via API endpoint

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
