#!/bin/bash

# Coin Feedly Deployment Script
echo "🚀 Starting Coin Feedly deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the application
echo "✅ Starting Coin Feedly..."
npm start
