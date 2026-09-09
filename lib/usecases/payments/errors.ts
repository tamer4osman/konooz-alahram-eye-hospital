// Error vocabulary defined by the use-case layer. Route handlers translate
// these into bilingual HTTP responses (AR/EN), never leaking internals.

export class PaymentNotFoundError extends Error {
  constructor(message = 'Payment transaction not found') {
    super(message);
    this.name = 'PaymentNotFoundError';
  }
}

/** Invalid state transition (e.g. verifying an already-cancelled txn). */
export class PaymentStateError extends Error {
  constructor(message = 'Payment is not in a verifiable state') {
    super(message);
    this.name = 'PaymentStateError';
  }
}

/** Method-field or OTP validation failure (reason key for bilingual copy). */
export class PaymentFieldError extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`Invalid payment field: ${reason}`);
    this.name = 'PaymentFieldError';
    this.reason = reason;
  }
}

/** Amount validation failure (reason key for bilingual copy). */
export class PaymentAmountError extends Error {
  readonly reason: string;
  constructor(reason: string) {
    super(`Invalid payment amount: ${reason}`);
    this.name = 'PaymentAmountError';
    this.reason = reason;
  }
}

export class PaymentCollectionNotAllowedError extends Error {
  constructor(message = 'This invoice cannot receive online collections') {
    super(message);
    this.name = 'PaymentCollectionNotAllowedError';
  }
}
