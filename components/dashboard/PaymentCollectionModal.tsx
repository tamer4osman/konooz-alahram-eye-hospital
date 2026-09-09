'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';
import {
  CreditCard,
  Smartphone,
  Copy,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Wallet,
  Loader2,
  ExternalLink,
  Landmark,
} from 'lucide-react';

// Payment collection flow (staff, DPay gateway):
//  - Moamalat: staff opens a session, patient pays on DPay's hosted LightBox
//    page (card data never touches our servers), webhook auto-confirms.
//  - EDFali / Sadad: reception-assisted OTP — the OTP arrives on the
//    PATIENT's phone; the patient relays it. We never store it.
// Honest-copy rule: the UI never claims automatic patient notification.

interface PaymentTxnView {
  id: string;
  dpaySessionId: number;
  payMethod: string;
  status: string;
  amount: number;
  txId: string | null;
  receiptUrl: string | null;
  failureReason: string | null;
  confirmedBy: string | null;
  lastWebhookEvent: string | null;
  createdAt: string;
}

export interface PaymentInvoiceView {
  id: string;
  invoiceNumber: string;
  totalGrossLYD: number;
  patientCoPayLYD: number;
  status: string;
}

interface PaymentsSummary {
  transactions: PaymentTxnView[];
  amountPaid: number;
  outstanding: number;
}

type Method = 'moamalat' | 'edfali' | 'sadad';

const METHOD_META: Record<
  Method,
  { labelAr: string; labelEn: string; needsMobile: boolean; needsBirthYear: boolean }
> = {
  moamalat: { labelAr: 'بطاقة مصرفية (موامالات — Visa/Mastercard/نمو)', labelEn: 'Bank card (Moamalat — Visa/MC/NUMO)', needsMobile: false, needsBirthYear: false },
  edfali: { labelAr: 'محفظة إدفعلي (OTP)', labelEn: 'EDFali wallet (OTP)', needsMobile: true, needsBirthYear: false },
  sadad: { labelAr: 'محفظة سداد — المدار (OTP)', labelEn: 'Sadad wallet — Almadar (OTP)', needsMobile: true, needsBirthYear: true },
};

const STATUS_STYLE: Record<string, { ar: string; en: string; cls: string }> = {
  pending: { ar: 'بانتظار الدفع', en: 'Awaiting payment', cls: 'bg-brass-100 text-brass-800' },
  paid: { ar: 'مدفوع', en: 'Paid', cls: 'bg-emerald-100 text-emerald-800' },
  failed: { ar: 'فشل', en: 'Failed', cls: 'bg-rose-100 text-rose-700' },
  expired: { ar: 'انتهت صلاحيته', en: 'Expired', cls: 'bg-ink-100 text-ink-600' },
  refunded: { ar: 'مُسترد', en: 'Refunded', cls: 'bg-rose-100 text-rose-700' },
  voided: { ar: 'ملغى من البنك', en: 'Voided', cls: 'bg-ink-100 text-ink-600' },
  cancelled: { ar: 'ملغى', en: 'Cancelled', cls: 'bg-ink-100 text-ink-600' },
};

type Phase = 'form' | 'otp' | 'link';

interface ActiveSession {
  txnId: string;
  method: Method;
  gatewayTotal: number;
  paymentLink: string | null;
}

export default function PaymentCollectionModal({
  isOpen,
  invoice,
  onClose,
  onPaymentConfirmed,
}: {
  isOpen: boolean;
  invoice: PaymentInvoiceView;
  onClose: () => void;
  onPaymentConfirmed: () => void;
}) {
  const { t, lang } = useLanguage();

  const [summary, setSummary] = useState<PaymentsSummary | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  const [method, setMethod] = useState<Method>('moamalat');
  const [amount, setAmount] = useState('');
  const [mobile, setMobile] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [otp, setOtp] = useState('');

  const [phase, setPhase] = useState<Phase>('form');
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ ar: string; en: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const meta = METHOD_META[method];

  const loadSummary = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`/api/staff/invoices/${invoice.id}/payments`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setSummary(json.data as PaymentsSummary);
          // Prefill the amount state (not just the display) so the form
          // submits the outstanding balance — display-only fallbacks would
          // submit an empty value when the operator doesn't retype it.
          setAmount((prev) => {
            if (prev !== '') return prev;
            const outstanding = (json.data as PaymentsSummary).outstanding;
            return outstanding > 0 ? String(outstanding) : prev;
          });
        }
      }
    } catch {
      /* offline — the list simply stays stale */
    } finally {
      setLoadingList(false);
    }
  }, [invoice.id]);

  useEffect(() => {
    if (!isOpen) return;
    setPhase('form');
    setSession(null);
    setError(null);
    setOtp('');
    setMobile('');
    setBirthYear('');
    setCopied(false);
    loadSummary();
  }, [isOpen, loadSummary]);

  const showError = (res: { status: number; json: { error?: { messageAr?: string; messageEn?: string } } }) => {
    const err = res.json?.error;
    setError({
      ar: err?.messageAr ?? `تعذر إتمام العملية (${res.status})`,
      en: err?.messageEn ?? `Operation failed (${res.status})`,
    });
  };

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          amount: Number(amount),
          ...(meta.needsMobile ? { customerMobile: mobile } : {}),
          ...(meta.needsBirthYear ? { birthYear } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError({ status: res.status, json });
        return;
      }
      const data = json.data as { transaction: PaymentTxnView; paymentLink: string | null; gatewayTotal: number };
      setSession({
        txnId: data.transaction.id,
        method,
        gatewayTotal: data.gatewayTotal,
        paymentLink: data.paymentLink,
      });
      setPhase(data.paymentLink ? 'link' : 'otp');
      loadSummary();
    } catch {
      setError({ ar: 'تعذر الاتصال بالخادم', en: 'Could not reach the server' });
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/staff/invoices/${invoice.id}/payments/${session.txnId}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError({ status: res.status, json });
        return;
      }
      setSession(null);
      setPhase('form');
      setOtp('');
      onPaymentConfirmed();
      loadSummary();
    } catch {
      setError({ ar: 'تعذر الاتصال بالخادم', en: 'Could not reach the server' });
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async (txnId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/payments/${txnId}/sync`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showError({ status: res.status, json });
        return;
      }
      onPaymentConfirmed();
      loadSummary();
    } catch {
      setError({ ar: 'تعذر الاتصال بالخادم', en: 'Could not reach the server' });
    } finally {
      setBusy(false);
    }
  };

  const handleCancelTxn = async (txnId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/payments/${txnId}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showError({ status: res.status, json });
        return;
      }
      loadSummary();
    } catch {
      setError({ ar: 'تعذر الاتصال بالخادم', en: 'Could not reach the server' });
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!session?.paymentLink) return;
    try {
      await navigator.clipboard.writeText(session.paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable — staff can select the text manually */
    }
  };

  const outstanding = summary?.outstanding;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledById="payment-modal-title" panelClassName="max-w-lg w-full p-6 my-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
        <h3 id="payment-modal-title" className="text-base font-extrabold text-pine-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span>{t('تحصيل إلكتروني عبر DPAY', 'Collect payment via DPAY')}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('إغلاق', 'Close')}
          className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700 cursor-pointer"
        >
          <XCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <p className="text-[11px] text-ink-600 font-mono mb-4">
        {invoice.invoiceNumber} •{' '}
        {t('المتبقي:', 'Outstanding:')}{' '}
        <strong className="text-pine-900">
          {outstanding !== undefined ? outstanding.toLocaleString() : '…'} LYD
        </strong>
      </p>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
          {lang === 'ar' ? error.ar : error.en}
        </div>
      )}

      {/* ── Step 1: open session ─────────────────────────────────────────── */}
      {phase === 'form' && (
        <form onSubmit={handleOpenSession} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="pay-method" className="font-bold text-ink-700 block mb-1">
              {t('وسيلة الدفع', 'Payment method')}
            </label>
            <select
              id="pay-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="w-full p-2.5 rounded-xl border border-pine-200 bg-white font-medium cursor-pointer"
            >
              {(Object.keys(METHOD_META) as Method[]).map((key) => (
                <option key={key} value={key}>
                  {lang === 'ar' ? METHOD_META[key].labelAr : METHOD_META[key].labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pay-amount" className="font-bold text-ink-700 block mb-1">
              {t('المبلغ (د.ل)', 'Amount (LYD)')}
            </label>
            <input
              id="pay-amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
            />
            {meta.needsMobile && (
              <p className="text-[10px] text-ink-500 mt-1">
                {t('جوال المريض — يصله رمز التحقق على هاتفه هو', 'Patient mobile — the OTP goes to their own phone')}
              </p>
            )}
          </div>

          {meta.needsMobile && (
            <div>
              <label htmlFor="pay-mobile" className="font-bold text-ink-700 block mb-1">
                {t('جوال المريض (09XXXXXXXX)', 'Patient mobile (09XXXXXXXX)')}
              </label>
              <input
                id="pay-mobile"
                type="tel"
                inputMode="numeric"
                required
                pattern="09[0-9]{8}"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0912345678"
                className="w-full p-2.5 rounded-xl border border-pine-200 font-mono"
              />
            </div>
          )}

          {meta.needsBirthYear && (
            <div>
              <label htmlFor="pay-birth-year" className="font-bold text-ink-700 block mb-1">
                {t('سنة ميلاد المريض (لتطابق سداد)', 'Patient birth year (Sadad check)')}
              </label>
              <input
                id="pay-birth-year"
                type="text"
                inputMode="numeric"
                required
                pattern="[0-9]{4}"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="1994"
                className="w-full p-2.5 rounded-xl border border-pine-200 font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <CreditCard className="w-4 h-4" aria-hidden="true" />}
            <span>{t('فتح عملية الدفع', 'Open payment session')}</span>
          </button>

          <p className="text-[10px] text-ink-500 leading-relaxed">
            {method === 'moamalat'
              ? t('سيصلك رابط دفع آمن على صفحة DPAY — أرسله للمريض عبر واتساب أو رسالة.', 'A secure payment link on DPAY will be generated — send it to the patient via WhatsApp or SMS.')
              : t('يرسل البنك رمز التحقق إلى جوال المريض؛ أدخله هنا بعد أن يخبرك به المريض.', 'The bank sends the OTP to the patient\'s phone; enter it here once the patient tells you.')}
          </p>
        </form>
      )}

      {/* ── Moamalat: hosted payment link ────────────────────────────────── */}
      {phase === 'link' && session?.paymentLink && (
        <div className="space-y-3.5 text-xs">
          <div className="p-3.5 bg-bone-50 rounded-xl border border-pine-200 flex items-start gap-2">
            <Landmark className="w-4 h-4 text-pine-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-[11px] text-ink-700">
              {t(
                'افتح الرابط وأرسله للمريض. عند إتمام الدفع تؤكده بوابة DPAY تلقائياً وتُحدَّث الفاتورة هنا.',
                'Send this link to the patient. When they pay, DPAY confirms automatically and this invoice updates.',
              )}
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-pine-200 break-all font-mono text-[10px] text-pine-800">
            {session.paymentLink}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 px-4 py-2.5 bg-pine-800 hover:bg-pine-700 text-white text-xs font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              <span>{copied ? t('تم النسخ ✓', 'Copied ✓') : t('نسخ رابط الدفع', 'Copy payment link')}</span>
            </button>
            <a
              href={session.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-bone-100 hover:bg-pine-200 text-ink-700 text-xs font-bold rounded-xl border border-ink-300 cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('فتح', 'Open')}</span>
            </a>
          </div>

          <p className="text-[10px] text-ink-500">
            {t('الإجمالي المطلوب من المريض (شامل رسوم البوابة):', 'Patient total (gateway fee included):')}{' '}
            <strong className="font-mono">{session.gatewayTotal.toLocaleString()} LYD</strong>
          </p>

          <button
            type="button"
            onClick={() => handleSync(session.txnId)}
            disabled={busy}
            className="w-full px-4 py-2 text-xs font-bold text-pine-800 bg-bone-100 hover:bg-pine-200 rounded-xl border border-pine-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{t('تحقق من حالة الدفع الآن', 'Check payment status now')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setPhase('form'); setSession(null); }}
            className="w-full px-4 py-2 text-xs font-bold text-ink-500 hover:bg-bone-100 rounded-xl cursor-pointer"
          >
            {t('رجوع', 'Back')}
          </button>
        </div>
      )}

      {/* ── EDFali/Sadad: OTP relay ──────────────────────────────────────── */}
      {phase === 'otp' && session && (
        <form onSubmit={handleVerify} className="space-y-3.5 text-xs">
          <div className="p-3.5 bg-bone-50 rounded-xl border border-pine-200 flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-pine-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-[11px] text-ink-700">
              {t(
                'وصل رمز التحقق إلى جوال المريض. أدخله بعد أن يخبرك به المريض — لا يُحفظ رمز التحقق في النظام.',
                'The OTP reached the patient\'s phone. Enter it once they tell you — the code is never stored.',
              )}
            </p>
          </div>

          <div>
            <label htmlFor="pay-otp" className="font-bold text-ink-700 block mb-1">
              {t('رمز التحقق (OTP)', 'OTP code')}
            </label>
            <input
              id="pay-otp"
              type="text"
              inputMode="numeric"
              required
              pattern={session.method === 'sadad' ? '[0-9]{6}' : '[0-9]{4,6}'}
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder={session.method === 'sadad' ? '٩٨٥٤٣٦ / 985436' : '1111'}
              autoComplete="one-time-code"
              className="w-full p-2.5 rounded-xl border border-pine-200 font-mono text-base tracking-widest text-center"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
            <span>{t('تأكيد الدفع', 'Confirm payment')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setPhase('form'); setSession(null); }}
            className="w-full px-4 py-2 text-xs font-bold text-ink-500 hover:bg-bone-100 rounded-xl cursor-pointer"
          >
            {t('إلغاء المحاولة', 'Abandon attempt')}
          </button>
        </form>
      )}

      {/* ── Transactions ledger ──────────────────────────────────────────── */}
      <div className="mt-6 pt-4 border-t border-bone-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-extrabold text-pine-900 uppercase tracking-wider">
            {t('سجل محاولات الدفع', 'Payment attempts')}
          </h4>
          <button
            type="button"
            onClick={loadSummary}
            aria-label={t('تحديث', 'Refresh')}
            className="p-1.5 rounded-lg hover:bg-bone-100 text-ink-400 hover:text-ink-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {summary && summary.transactions.length > 0 ? (
          <ul className="space-y-2 max-h-52 overflow-y-auto">
            {summary.transactions.map((txn) => {
              const status = STATUS_STYLE[txn.status] ?? STATUS_STYLE.pending;
              return (
                <li key={txn.id} className="p-2.5 rounded-xl border border-bone-100 bg-white text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-ink-700">
                      {txn.amount.toLocaleString()} LYD
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${status.cls}`}>
                      {lang === 'ar' ? status.ar : status.en}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-ink-500">
                    <span className="font-mono">
                      {txn.payMethod} • #{txn.dpaySessionId}
                      {txn.txId ? ` • ${txn.txId.slice(0, 16)}…` : ''}
                    </span>
                    {txn.status === 'pending' && (
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSync(txn.id)}
                          disabled={busy}
                          className="px-2 py-0.5 rounded-md bg-pine-50 text-pine-800 font-bold hover:bg-pine-100 cursor-pointer disabled:opacity-50"
                        >
                          {t('استعلام', 'Sync')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelTxn(txn.id)}
                          disabled={busy}
                          className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 cursor-pointer disabled:opacity-50"
                        >
                          {t('إلغاء', 'Cancel')}
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[10px] text-ink-400">
            {t('لا توجد محاولات دفع بعد.', 'No payment attempts yet.')}
          </p>
        )}

        {summary && (
          <p className="text-[10px] text-ink-500 mt-2">
            {t('المحصَّل:', 'Collected:')}{' '}
            <strong className="font-mono text-emerald-700">{summary.amountPaid.toLocaleString()} LYD</strong>
            {' • '}{t('المتبقي:', 'Outstanding:')}{' '}
            <strong className="font-mono">{summary.outstanding.toLocaleString()} LYD</strong>
          </p>
        )}
      </div>
    </Modal>
  );
}
