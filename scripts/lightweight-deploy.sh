#!/bin/bash

# Lightweight deployment script for VPS with limited space
echo "🚀 Starting lightweight deployment..."

# Clean up any existing node_modules to save space
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Install only production dependencies
echo "📦 Installing production dependencies only..."
npm ci --omit=dev --no-audit --no-fund --prefer-offline

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Clean up build cache
echo "🧹 Cleaning build cache..."
npm cache clean --force

echo "✅ Lightweight deployment completed!"
