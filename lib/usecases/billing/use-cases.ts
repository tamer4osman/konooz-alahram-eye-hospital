import type { BillingBoard, BillingReader } from './ports';

// Use case: orchestration only. The reader port returns the DTO board;
// row→DTO mapping lives in the Prisma adapter.

export async function loadBillingBoard(reader: BillingReader): Promise<BillingBoard> {
  return reader.listBoard();
}
