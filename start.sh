#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "Database is ready!"
    break
  fi
  
  echo "Database not ready, waiting... (attempt $((attempt + 1))/$max_attempts)"
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo "Database connection timeout after $max_attempts attempts"
  exit 1
fi

echo "Running database migrations..."
if npx prisma migrate deploy; then
  echo "Migrations applied successfully"
else
  echo "Migration failed, trying db push as fallback..."
  npx prisma db push
fi

echo "Starting application..."
npm start
