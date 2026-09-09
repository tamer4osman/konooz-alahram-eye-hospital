import type {
  DpayOpenSessionInput,
  DpayOpenSessionResult,
  DpaySessionResult,
  DpayVerifyResult,
} from '@/lib/adapters/dpay/client';
import type { PaymentTxnStatus, InvoiceStatusLite } from './rules';

// Per-use-case minimal ports (ISP): one narrow interface per collaborator.
// The Prisma adapter (lib/adapters/prisma/payment-adapter.ts) implements the
// writer/reader; the DPay client (lib/adapters/dpay/client.ts) implements the
// gateway. Use cases receive them as first arguments — no framework types.

export interface DpayGateway {
  openSession(input: DpayOpenSessionInput): Promise<DpayOpenSessionResult>;
  verifyOtp(sessionId: number, otp: string): Promise<DpayVerifyResult>;
  getSession(sessionId: number): Promise<DpaySessionResult>;
}

/** Frontend-facing payment transaction record (Prisma row already mapped). */
export interface PaymentTxnRecord {
  id: string;
  invoiceId: string;
  dpaySessionId: number;
  payMethod: string;
  status: PaymentTxnStatus;
  amount: number;
  currency: string;
  txId: string | null;
  receiptUrl: string | null;
  payerAccount: string | null;
  failureReason: string | null;
  confirmedBy: string | null;
  lastWebhookEvent: string | null;
  lastWebhookAt: Date | null;
  lastPollAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NewPaymentTxn = Omit<
  PaymentTxnRecord,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface PaymentTxnWriter {
  create(input: NewPaymentTxn): Promise<PaymentTxnRecord>;
  updateStatus(
    id: string,
    patch: Partial<
      Pick<
        PaymentTxnRecord,
        | 'status'
        | 'txId'
        | 'receiptUrl'
        | 'payerAccount'
        | 'failureReason'
        | 'confirmedBy'
        | 'lastWebhookEvent'
        | 'lastWebhookAt'
        | 'lastPollAt'
      >
    >,
  ): Promise<PaymentTxnRecord>;
  findBySessionId(dpaySessionId: number): Promise<PaymentTxnRecord | null>;
  findById(id: string): Promise<PaymentTxnRecord | null>;
  listByInvoiceId(invoiceId: string): Promise<PaymentTxnRecord[]>;
}

/** Minimal invoice facts the payment use cases need (ISP slice). */
export interface InvoicePaymentFacts {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  currency: string;
}

export interface InvoicePaymentReader {
  getForPayment(invoiceId: string): Promise<InvoicePaymentFacts | null>;
}

export interface PaymentDeps {
  gateway: DpayGateway;
  invoiceReader: InvoicePaymentReader;
  txnWriter: PaymentTxnWriter;
  invoiceStatusUpdater: InvoiceStatusUpdaterPort;
}

/** Shape-compatible slice of lib/usecases/invoices' InvoiceStatusUpdater. */
export interface InvoiceStatusUpdaterPort {
  updateStatus(
    id: string,
    patch: { status?: InvoiceStatusLite; paidDate?: Date | null },
  ): Promise<unknown>;
}
