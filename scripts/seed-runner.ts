import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

// Shared plumbing for scripts/seed-*.ts entry points. Each seed declares its
// work as an async callback and receives its own PrismaClient; connection
// teardown and failure exit codes are handled here once.

export function loadSeedJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(__dirname, filename), 'utf8')) as T;
}

export async function runSeed(seed: (prisma: PrismaClient) => Promise<void>): Promise<void> {
  const prisma = new PrismaClient();
  try {
    await seed(prisma);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
