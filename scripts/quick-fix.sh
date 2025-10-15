#!/bin/bash

echo "🚀 Running quick database fix..."

# Run the migration script
npx tsx scripts/run-migration-now.ts

echo "✅ Migration completed!"
