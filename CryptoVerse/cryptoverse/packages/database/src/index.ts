// Database package exports
// This file exports the Prisma client for use across the monorepo

import { PrismaClient } from '@prisma/client';

// Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export Prisma types
export * from '@prisma/client';

// Export Prisma client as default
export default prisma;
