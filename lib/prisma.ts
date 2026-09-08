import { PrismaClient } from '@prisma/client'

// Lazy singleton: the client (and its DATABASE_URL check) initializes on first
// property access, so importing routes never breaks env-less builds (Docker,
// CI). Fail-fast semantics are preserved at first use.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function requireClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Copy .env.example to .env.local and configure the PostgreSQL connection string.'
      )
    }
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(requireClient(), prop, receiver)
  },
})
