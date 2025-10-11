#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
until npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready, running migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm start
