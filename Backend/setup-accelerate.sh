#!/bin/bash

echo "🚀 Setting up Prisma Accelerate..."

# 1. Install dependencies
echo "📦 Installing Prisma Accelerate extension..."
npm install @prisma/extension-accelerate --save

# 2. Remove old Prisma Client
echo "🧹 Removing old Prisma Client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# 3. Generate Prisma Client with Accelerate support
echo "⚡ Generating Prisma Client with Accelerate..."
npx prisma generate --accelerate

# 4. Verify DATABASE_URL
if grep -q "prisma+postgres://" .env; then
  echo "✅ DATABASE_URL looks correct for Accelerate."
else
  echo "⚠️ Warning: DATABASE_URL is not using prisma+postgres:// format. Please update it."
fi

echo "✅ Prisma Accelerate setup complete!"
echo "Now update your Prisma client initialization in code:"
echo "
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());
"
