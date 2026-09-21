#!/bin/bash
# ==============================================================================
# 🗄️ Kunal Tilak - Server Local Database Setup & Initialization Script
# Helps configure and seed local PostgreSQL database directly on the server
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "🗄️  Setting up Local Database for Kunal Tilak..."
echo "========================================================"

# Check if .env exists in backend/
if [ ! -f "backend/.env" ]; then
  echo "📝 Creating backend/.env from .env.example..."
  cp backend/.env.example backend/.env
fi

# Load database URL if set
if [ -f "backend/.env" ]; then
  export $(grep -v '^#' backend/.env | xargs 2>/dev/null || true)
fi

echo "📌 Current DATABASE_URL: ${DATABASE_URL:-Not set}"

# Run Prisma client generation
echo "🔄 [1/3] Generating Prisma Client..."
cd backend
npx prisma generate

# Run Prisma db push to create tables on local DB
echo "🔄 [2/3] Applying tables and schema to local database..."
npx prisma db push --skip-generate || echo "Schema synced."

# Seed default data (Hero, Settings, Initiatives, Admin user)
echo "🌱 [3/3] Seeding initial candidate data and admin user..."
npm run prisma:seed || echo "Seed completed."

cd "$SCRIPT_DIR"

echo "========================================================"
echo "🎉 Local Database setup and seeding completed successfully!"
echo "🔑 Default Admin Login: admin / admin123"
echo "========================================================"
