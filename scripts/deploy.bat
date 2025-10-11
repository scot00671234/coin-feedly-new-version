@echo off
echo 🚀 Starting Coin Feedly deployment...

REM Check if required environment variables are set
if "%DATABASE_URL%"=="" (
    echo ❌ Error: DATABASE_URL environment variable is not set
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
call npx prisma generate

REM Run database migrations
echo 🔄 Running database migrations...
call npx prisma db push

REM Seed the database
echo 🌱 Seeding database...
call npx prisma db seed

REM Build the application
echo 🏗️ Building application...
call npm run build

REM Start the application
echo ✅ Starting Coin Feedly...
call npm start
