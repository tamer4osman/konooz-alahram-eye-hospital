// Error vocabulary defined by the use-case layer; the Prisma adapter
// translates driver errors (P2025/P2002) into these, and route handlers
// translate them into HTTP responses.

export class InvoiceNotFoundError extends Error {
  constructor() {
    super('Invoice not found');
    this.name = 'InvoiceNotFoundError';
  }
}

export class InvoiceConflictError extends Error {
  constructor() {
    super('Invoice conflict');
    this.name = 'InvoiceConflictError';
  }
}
