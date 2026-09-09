import { prisma } from '@/lib/prisma';
import type { PaymentTransaction } from '@prisma/client';
import {
  PaymentNotFoundError,
} from '@/lib/usecases/payments/errors';
import type {
  InvoicePaymentFacts,
  InvoicePaymentReader,
  NewPaymentTxn,
  PaymentTxnRecord,
  PaymentTxnWriter,
} from '@/lib/usecases/payments/ports';

// Prisma adapter implementing the payment use-case ports. The only place the
// payment flow touches the driver: Prisma error codes are translated to typed
// use-case errors here, and rows are mapped to records via the pure mapper
// below so Prisma types never cross the use-case boundary.

export function toPaymentTxnRecord(row: PaymentTransaction): PaymentTxnRecord {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    dpaySessionId: row.dpaySessionId,
    payMethod: row.payMethod,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    txId: row.txId,
    receiptUrl: row.receiptUrl,
    payerAccount: row.payerAccount,
    failureReason: row.failureReason,
    confirmedBy: row.confirmedBy,
    lastWebhookEvent: row.lastWebhookEvent,
    lastWebhookAt: row.lastWebhookAt,
    lastPollAt: row.lastPollAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const prismaPaymentTxnWriter: PaymentTxnWriter = {
  async create(input: NewPaymentTxn): Promise<PaymentTxnRecord> {
    const row = await prisma.paymentTransaction.create({
      data: {
        invoiceId: input.invoiceId,
        dpaySessionId: input.dpaySessionId,
        payMethod: input.payMethod,
        status: input.status,
        amount: input.amount,
        currency: input.currency,
        txId: input.txId,
        receiptUrl: input.receiptUrl,
        payerAccount: input.payerAccount,
        failureReason: input.failureReason,
        confirmedBy: input.confirmedBy,
        lastWebhookEvent: input.lastWebhookEvent,
        lastWebhookAt: input.lastWebhookAt,
        lastPollAt: input.lastPollAt,
      },
    });
    return toPaymentTxnRecord(row);
  },

  async updateStatus(id, patch): Promise<PaymentTxnRecord> {
    try {
      const row = await prisma.paymentTransaction.update({
        where: { id },
        data: {
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.txId !== undefined ? { txId: patch.txId } : {}),
          ...(patch.receiptUrl !== undefined ? { receiptUrl: patch.receiptUrl } : {}),
          ...(patch.payerAccount !== undefined ? { payerAccount: patch.payerAccount } : {}),
          ...(patch.failureReason !== undefined ? { failureReason: patch.failureReason } : {}),
          ...(patch.confirmedBy !== undefined ? { confirmedBy: patch.confirmedBy } : {}),
          ...(patch.lastWebhookEvent !== undefined ? { lastWebhookEvent: patch.lastWebhookEvent } : {}),
          ...(patch.lastWebhookAt !== undefined ? { lastWebhookAt: patch.lastWebhookAt } : {}),
          ...(patch.lastPollAt !== undefined ? { lastPollAt: patch.lastPollAt } : {}),
        },
      });
      return toPaymentTxnRecord(row);
    } catch (err) {
      if ((err as { code?: string } | null)?.code === 'P2025') {
        throw new PaymentNotFoundError();
      }
      throw err;
    }
  },

  async findBySessionId(dpaySessionId: number): Promise<PaymentTxnRecord | null> {
    const row = await prisma.paymentTransaction.findUnique({
      where: { dpaySessionId },
    });
    return row ? toPaymentTxnRecord(row) : null;
  },

  async findById(id: string): Promise<PaymentTxnRecord | null> {
    const row = await prisma.paymentTransaction.findUnique({ where: { id } });
    return row ? toPaymentTxnRecord(row) : null;
  },

  async listByInvoiceId(invoiceId: string): Promise<PaymentTxnRecord[]> {
    const rows = await prisma.paymentTransaction.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toPaymentTxnRecord);
  },
};

export const prismaInvoicePaymentReader: InvoicePaymentReader = {
  async getForPayment(invoiceId: string): Promise<InvoicePaymentFacts | null> {
    const row = await prisma.hospitalBillingInvoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        amount: true,
        status: true,
        currency: true,
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      amount: Number(row.amount),
      status: row.status,
      currency: row.currency,
    };
  },
};
