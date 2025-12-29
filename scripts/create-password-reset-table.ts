import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPasswordResetTable() {
  try {
    console.log('Creating PasswordReset table...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PasswordReset" (
        "id" SERIAL NOT NULL,
        "email" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "userRole" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "isUsed" BOOLEAN NOT NULL DEFAULT false,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "PasswordReset_token_key" ON "PasswordReset"("token");
    `;

    console.log('✅ PasswordReset table created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPasswordResetTable();
