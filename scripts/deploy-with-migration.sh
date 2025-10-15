#!/bin/bash

echo "🚀 Starting deployment with database migration..."

# Step 1: Generate Prisma client
echo "📝 Step 1: Generating Prisma client..."
npx prisma generate

# Step 2: Run database migration
echo "📝 Step 2: Running database migration..."
npx tsx scripts/run-long-term-migration.ts

# Step 3: Run Prisma migrations (if any)
echo "📝 Step 3: Running Prisma migrations..."
npx prisma migrate deploy || echo "⚠️  Prisma migrations failed, but continuing..."

# Step 4: Build the application
echo "📝 Step 4: Building application..."
npm run build

# Step 5: Start the application
echo "📝 Step 5: Starting application..."
npm start

echo "🎉 Deployment with migration completed!"
