// lib/prisma.ts
// Singleton Prisma client — avoids creating a new connection on every
// hot-reload in development (Next.js fast-refresh would exhaust connections).
// In production each serverless invocation gets one client instance.

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
