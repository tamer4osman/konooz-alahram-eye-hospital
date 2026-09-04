'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { InsuranceProviderInfo, HospitalBillingInvoice, DiagnosticPacsOrder } from '@/data/dashboardData';
import { Receipt, ShieldCheck, CreditCard, Printer, Plus, CheckCircle2, Hourglass } from 'lucide-react';
import type { ArAgingReport } from '@/lib/usecases/invoices';

export default function BillingInsuranceTab() {
  const { lang, t, } = useLanguage();

  const [invoices, setInvoices] = useState<HospitalBillingInvoice[]>([]);
  const [insurers, setInsurers] = useState<InsuranceProviderInfo[]>([]);
  const [pacsOrders, _setPacsOrders] = useState<DiagnosticPacsOrder[]>([]);
  const [aging, setAging] = useState<ArAgingReport | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'insurance' | 'pacs'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<HospitalBillingInvoice | null>(null);
  const [isInvoicePrintSuccess, setIsInvoicePrintSuccess] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/staff/invoices')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) {
          const list = json.data as HospitalBillingInvoice[];
          setInvoices(list);
          if (list.length > 0) setSelectedInvoice(list[0]);
        }
      })
      .catch(() => {});
    fetch('/api/staff/invoices/aging')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data?.buckets) setAging(json.data as ArAgingReport);
      })
      .catch(() => {});
    fetch('/api/staff/billing')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data) {
          setInsurers((json.data.insurances ?? []) as InsuranceProviderInfo[]);
          _setPacsOrders((json.data.pacsOrders ?? []) as DiagnosticPacsOrder[]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // New Invoice form state
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    ticketNumber: 'KZ-8950', patientNameAr: '', patientNameEn: '', procedureAr: 'جراحة الفاكو وإزالة المياه البيضاء وزراعة عدسة', procedureEn: 'Phacoemulsification & IOL Implantation', insuranceProvider: 'ins-wahda', surgeonFeeLYD: 2000, orFacilityFeeLYD: 1200, anesthesiaFeeLYD: 400, lensOrDeviceFeeLYD: 1000, consumablesFeeLYD: 400
  });

  const totalRevenueGross = invoices.reduce((acc, inv) => acc + inv.totalGrossLYD, 0);
  const totalInsuranceCovered = invoices.reduce((acc, inv) => acc + inv.insuranceCoveredLYD, 0);
  const totalPatientCoPay = invoices.reduce((acc, inv) => acc + inv.patientCoPayLYD, 0);

  const AGING_LABELS: Record<string, { ar: string; en: string }> = {
    '0_30': { ar: '٠–٣٠ يوماً', en: '0–30 days' },
    '31_60': { ar: '٣١–٦٠ يوماً', en: '31–60 days' },
    '61_90': { ar: '٦١–٩٠ يوماً', en: '61–90 days' },
    '90_plus': { ar: 'أكثر من ٩٠ يوماً', en: '90+ days' },
  };

  const handlePrintReceipt = () => {
    setIsInvoicePrintSuccess(true);
    setTimeout(() => setIsInvoicePrintSuccess(false), 3000); };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const provider = insurers.find((i) => i.id === newInvoiceForm.insuranceProvider);
    const totalGross =
      Number(newInvoiceForm.surgeonFeeLYD) +
      Number(newInvoiceForm.orFacilityFeeLYD) +
      Number(newInvoiceForm.anesthesiaFeeLYD) +
      Number(newInvoiceForm.lensOrDeviceFeeLYD) +
      Number(newInvoiceForm.consumablesFeeLYD);

    const isSelfPay = newInvoiceForm.insuranceProvider === 'self_pay';
    const coverage = isSelfPay ? 0 : (provider?.coveragePercentage ?? 0);
    const covered = isSelfPay ? 0 : Math.round((totalGross * coverage) / 100);
    const coPay = totalGross - covered;

    const payload = {
      invoiceNumber: 'INV-2026-08' + Math.floor(10 + Math.random() * 90),
      ticketNumber: newInvoiceForm.ticketNumber,
      patientNameAr: newInvoiceForm.patientNameAr || 'مريض جديد',
      patientNameEn: newInvoiceForm.patientNameEn || newInvoiceForm.patientNameAr || 'New Patient',
      procedureAr: newInvoiceForm.procedureAr,
      procedureEn: newInvoiceForm.procedureEn,
      insuranceNameAr: isSelfPay ? 'دفع خاص نقدي' : (provider?.nameAr ?? ''),
      insuranceNameEn: isSelfPay ? 'Private Cash' : (provider?.nameEn ?? ''),
      surgeonFeeLYD: Number(newInvoiceForm.surgeonFeeLYD),
      orFacilityFeeLYD: Number(newInvoiceForm.orFacilityFeeLYD),
      anesthesiaFeeLYD: Number(newInvoiceForm.anesthesiaFeeLYD),
      lensOrDeviceFeeLYD: Number(newInvoiceForm.lensOrDeviceFeeLYD),
      consumablesFeeLYD: Number(newInvoiceForm.consumablesFeeLYD),
      totalGrossLYD: totalGross,
      insuranceCoveredLYD: covered,
      patientCoPayLYD: coPay,
      status: isSelfPay ? 'paid' : 'pre_auth_approved'
    };

    fetch('/api/staff/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) {
          const created = json.data as HospitalBillingInvoice;
          setInvoices((prev) => [created, ...prev]);
          setSelectedInvoice(created);
        }
      })
      .catch(() => {});

    setIsCreateInvoiceOpen(false); };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pine-950  to-ink-900 rounded-2xl p-5 sm:p-6 text-white border border-pine-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pine-500/20 text-pine-300 border border-brass-400/30 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              <span>{t('نظام الفوترة، التأمين الصحي وطلبات الأشعة (Bahmni Odoo & PACS)', 'Billing, Insurance Pre-Auth & PACS Orders')}</span>
            </span>
            <span className="text-xs text-ink-400 font-mono">
              LYD Currency • Direct Claim Processing
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {t('تسعير الباقات الجراحية، الموافقات المسبقة، وفحوصات OCT والقرنية', 'Surgical Packages, Insurance Coverage & Diagnostic Scans') }
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="px-4 py-2.5 bg-pine-800 hover:bg-pine-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-pine-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إصدار فاتورة / تسعيرة جديدة', 'Generate Invoice / Quote')}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('إجمالي مطالبات اليوم', "Today's Gross Billing") }</span>
            <Receipt className="w-4 h-4 text-ink-700" />
          </div>
          <div className="text-2xl font-extrabold text-pine-900">
            {totalRevenueGross.toLocaleString()} <span className="text-xs font-mono font-normal">LYD</span>
          </div>
          <span className="text-[10px] text-ink-500">{invoices.length} {t('فواتير مسجلة اليوم', 'invoices generated today')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('تغطية شركات التأمين والنفط', 'Insurance & NOC Covered')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {totalInsuranceCovered.toLocaleString()} <span className="text-xs font-mono font-normal">LYD</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">{t('معتمد ومغطى بموجب الموافقات', 'Direct settlement approved')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('المسدد نقداً من المرضى (Co-Pay)', 'Patient Co-Pay Collected') }</span>
            <CreditCard className="w-4 h-4 text-pine-700" />
          </div>
          <div className="text-2xl font-extrabold text-pine-800">
            {totalPatientCoPay.toLocaleString()} <span className="text-xs font-mono font-normal">LYD</span>
          </div>
          <span className="text-[10px] text-pine-700 font-semibold">{t('سداد عبر البطاقة المصرفية والنقد', 'POS / Cash processed')}</span>
        </div>
      </div>

      {/* AR Aging Report */}
      <div className="bg-white rounded-2xl border border-pine-200 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5">
            <Hourglass className="w-4 h-4 text-brass-600" />
            <span>{t('أعمار الذمم المدينة (المبالغ غير المسددة)', 'Accounts Receivable Aging')}</span>
          </h3>
          {aging && (
            <span className="text-[10px] font-bold text-ink-500">
              {aging.outstandingCount} {t('فاتورة قائمة', 'outstanding invoices')} •{' '}
              <span className="font-mono">{aging.grandTotalLYD.toLocaleString()}</span> LYD
            </span>
          )}
        </div>
        {aging ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aging.buckets.map((bucket) => {
              const label = AGING_LABELS[bucket.key];
              const isOldest = bucket.key === '90_plus';
              return (
                <div
                  key={bucket.key}
                  className={`rounded-xl border p-3 ${
                    isOldest && bucket.count > 0
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-bone-50 border-pine-200'
                  }`}
                >
                  <p className="text-[10px] font-bold text-ink-500">{lang === 'ar' ? label.ar : label.en}</p>
                  <p className="text-base font-extrabold text-pine-900 mt-0.5 font-mono">
                    {bucket.totalLYD.toLocaleString()} <span className="text-[10px] font-normal">LYD</span>
                  </p>
                  <p className="text-[10px] text-ink-500">
                    {bucket.count} {t('فاتورة', 'invoices')}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-ink-500">{t('جارٍ تحميل تقرير الأعمار...', 'Loading aging report...')}</p>
        )}
        <p className="text-[10px] text-ink-500 mt-3">
          {t(
            'يُحسب المبلغ المستحق كامل قيمة الفاتورة — لا تُتابع الدفعات الجزئية في النظام حالياً. الفواتير المسددة والملغاة والمسودات غير مدرجة.',
            'Outstanding amounts reflect the full invoice value — partial payments are not tracked yet. Paid, cancelled and draft invoices are excluded.',
          )}
        </p>
      </div>

      {/* Sub-Tabs: Invoices vs Insurances vs PACS */}
      <div className="flex items-center gap-2 border-b border-pine-200 pb-2">
        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'invoices'
              ? 'bg-[#0B3D33] text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }` }
        >
          {t('سجل الفواتير وعروض الأسعار الجراحية', 'Surgical Invoices & Quotations')}
        </button>
        <button
          onClick={() => setActiveSubTab('insurance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'insurance'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }`}
        >
          {t('شركات التأمين الصحي المعتمدة', 'Approved Insurance Providers')}
        </button>
        <button
          onClick={() => setActiveSubTab('pacs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'pacs'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }` }
        >
          {t('طلبات الأشعة والتشخيص البصري (PACS)', 'Diagnostic PACS Orders')}
        </button>
      </div>

      {/* SubTab 1: Invoices Split View */}
      {activeSubTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Invoices (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-pine-200 shadow-sm flex flex-col h-[650px] overflow-y-auto space-y-3">
            <h3 className="text-xs font-extrabold text-pine-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{t('الفواتير المعتمدة اليوم', 'Active Billing Queue') }</span>
            </h3>

            {invoices.map((inv) => {
              const isSelected = inv.id === selectedInvoice?.id;
              return (
                <button
                  type="button"
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-start ${
                    isSelected
                      ? 'bg-pine-50/70 border-pine-500 shadow-xs'
                      : 'bg-bone-50 border-pine-200 hover:border-pine-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#0B3D33] text-white">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-pine-100 text-pine-800'
                          : 'bg-pine-100 text-pine-800'
                      }`}
                    >
                      {inv.status === 'paid' ? t('مسدد بالكامل', 'Paid') : t('موافقة مسبقة', 'Pre-Auth Approved')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-ink-900">
                    {lang === 'ar' ? inv.patientNameAr : inv.patientNameEn}
                  </h4>
                  <p className="text-[11px] text-ink-500 truncate mt-0.5">
                    {lang === 'ar' ? inv.procedureAr : inv.procedureEn}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-pine-200/80">
                    <span className="text-[10px] text-ink-500 truncate max-w-[150px]">
                      {lang === 'ar' ? inv.insuranceNameAr : inv.insuranceNameEn}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-pine-800">
                      {inv.totalGrossLYD.toLocaleString()} LYD
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Invoice Receipt Sheet (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-pine-200 shadow-sm flex flex-col justify-between h-[650px] overflow-y-auto">
            {selectedInvoice ? (
              <div className="space-y-5">
                {/* Official Receipt Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pine-200 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-pine-800 uppercase tracking-wider block">
                      {t('مستشفى قورينا التخصصي للعيون والجراحة', 'Cyrene Specialized Eye Hospital')}
                    </span>
                    <h3 className="text-base font-extrabold text-pine-900 mt-0.5">
                      {t('فاتورة تفصيلية وسند اعتماد مالي', 'Official Itemized Surgical Invoice')}
                    </h3>
                    <span className="font-mono text-xs text-ink-500 font-bold">
                      {selectedInvoice.invoiceNumber} • {selectedInvoice.dateIssued}
                    </span>
                  </div>

                  <button
                    onClick={handlePrintReceipt}
                    className="px-3.5 py-2 bg-bone-100 hover:bg-pine-200 text-ink-700 text-xs font-bold rounded-xl border border-ink-300 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Printer className="w-3.5 h-3.5 text-pine-800" />
                    <span>{isInvoicePrintSuccess ? t('تم تجهيز السند ✓', 'Printed ✓') : t('طباعة السند الضريبي', 'Print Receipt')}</span>
                  </button>
                </div>

                {/* Patient & Insurance Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-bone-50 rounded-xl border border-pine-200 text-xs">
                  <div>
                    <span className="text-[10px] text-ink-500 block">{t('بيانات المريض:', 'Patient:')}</span>
                    <span className="font-bold text-ink-900">{lang === 'ar' ? selectedInvoice.patientNameAr : selectedInvoice.patientNameEn}</span>
                    <span className="text-[10px] font-mono text-ink-500 block mt-0.5">{t('تذكرة: ', 'Ticket: ')}{selectedInvoice.ticketNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-500 block">{t('جهة التغطية أو الدفع:', 'Coverage / Insurer:')}</span>
                    <span className="font-bold text-pine-900">{lang === 'ar' ? selectedInvoice.insuranceNameAr : selectedInvoice.insuranceNameEn}</span>
                  </div>
                </div>

                {/* Itemized Cost Breakdown Table */}
                <div className="border border-pine-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-bone-100 px-3 py-2 font-bold text-ink-700 flex justify-between border-b border-pine-200">
                    <span>{t('البيان / الخدمة الطبية الجراحية', 'Item / Clinical Service')}</span>
                    <span>{t('القيمة (د.ل)', 'Amount (LYD)')}</span>
                  </div>

                  <div className="divide-y divide-bone-100">
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-ink-700">{t('أتعاب الجراح الاستشاري والعملية', 'Surgeon Clinical & Procedure Fee')}</span>
                      <span className="font-mono font-bold">{selectedInvoice.surgeonFeeLYD.toLocaleString()}</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-ink-700">{t('رسوم جناح العمليات والتعقيم المتقدم', 'Sterile OR Suite & Facility Fee')}</span>
                      <span className="font-mono font-bold">{selectedInvoice.orFacilityFeeLYD.toLocaleString()}</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-ink-700">{t('أتعاب استشاري التخدير والمراقبة', 'Anesthesia & Post-Op Recovery')}</span>
                      <span className="font-mono font-bold">{selectedInvoice.anesthesiaFeeLYD.toLocaleString()}</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-ink-700">{t('العدسة المزروعة / المواد الطبية الخاصة', 'Implantable Lens / Device Consumable')}</span>
                      <span className="font-mono font-bold">{selectedInvoice.lensOrDeviceFeeLYD.toLocaleString()}</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-ink-700">{t('المستهلكات الجراحية وأدوية التعقيم', 'Surgical Packs & Sterilization')}</span>
                      <span className="font-mono font-bold">{selectedInvoice.consumablesFeeLYD.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="bg-bone-50 p-3 border-t border-pine-200 space-y-1.5">
                    <div className="flex justify-between font-bold text-ink-700">
                      <span>{t('الإجمالي الكلي (Gross Total):', 'Gross Total:')}</span>
                      <span className="font-mono text-sm font-extrabold">{selectedInvoice.totalGrossLYD.toLocaleString()} LYD</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{t('تغطية التأمين / الجهة الضامنة:', 'Insurance Coverage:')}</span>
                      <span className="font-mono">-{selectedInvoice.insuranceCoveredLYD.toLocaleString()} LYD</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-pine-900 pt-1.5 border-t border-pine-200">
                      <span>{t('المبلغ المطلوب سداده من المريض (Co-Pay):', 'Patient Co-Pay Payable:')}</span>
                      <span className="font-mono text-base text-pine-800">{selectedInvoice.patientCoPayLYD.toLocaleString()} LYD</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-pine-50 rounded-xl border border-pine-200 text-[11px] text-pine-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    {t('تم تسجيل الفاتورة في السجل المالي للمستشفى ومطابقتها مع نظام الضرائب الوطني الليبي.', 'Audited and compliant with Libyan National Health Insurance financial regulations.')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-ink-400 text-xs">
                {t('اختر فاتورة لعرض التفاصيل', 'Select an invoice to view receipt')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 2: Insurance Providers */}
      {activeSubTab === 'insurance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insurers.map((ins) => (
            <div key={ins.id} className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ins.logo}</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-pine-900">{lang === 'ar' ? ins.nameAr : ins.nameEn}</h4>
                    <span className="text-[11px] text-ink-500">{ins.contactDesk}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-pine-100 text-pine-900">
                  {ins.coveragePercentage}% {t('تغطية', 'Cover')}
                </span>
              </div>

              <div className="pt-2 border-t border-bone-100 flex items-center justify-between text-xs">
                <span className="text-ink-500">
                  {t('الموافقة المسبقة: ', 'Pre-Auth: ')}
                  <strong className={ins.preAuthRequired ? 'text-brass-600' : 'text-emerald-700'}>
                    {ins.preAuthRequired ? t('إلكترونية عبر البوابة', 'Electronic Portal') : t('مباشرة بدون حجز', 'Direct Walk-in')}
                  </strong>
                </span>
                <span className="text-[10px] font-bold text-pine-800 bg-pine-50 px-2 py-0.5 rounded">
                  {t('عقد نشط 2026', 'Active Contract 2026')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubTab 3: PACS Orders */}
      {activeSubTab === 'pacs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pacsOrders.map((pacs) => (
            <div key={pacs.id} className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-pine-900 text-white">
                    {pacs.orderNumber}
                  </span>
                  <h4 className="text-xs font-bold text-pine-900 mt-1">
                    {lang === 'ar' ? pacs.patientNameAr : pacs.patientNameEn}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800">
                  {t('فحص مكتمل ✓', 'Scan Completed ✓')}
                </span>
              </div>

              <div className="p-3 bg-bone-50 rounded-xl border border-bone-100 text-xs space-y-1">
                <span className="font-bold text-ink-700 block">{lang === 'ar' ? pacs.scanTypeAr : pacs.scanTypeEn}</span>
                <span className="text-[11px] text-pine-800 font-mono block">{pacs.deviceUsed}</span>
                <p className="text-[11px] text-ink-500 mt-1">{lang === 'ar' ? pacs.findingsSummaryAr : pacs.findingsSummaryEn}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1">
                <span>{t('بطلب من: ', 'Ordered by: ')} {lang === 'ar' ? pacs.orderingDoctorAr : pacs.orderingDoctorEn}</span>
                <span>{pacs.timeCompleted}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATE NEW INVOICE */}
      {/* ========================================================================= */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
              <h3 className="text-base font-extrabold text-pine-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>{t('إصدار فاتورة جراحية وسند اعتماد مالي', 'Create Surgical Billing Invoice')}</span>
              </h3>
              <button
                onClick={() => setIsCreateInvoiceOpen(false)}
                className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('رقم التذكرة', 'Ticket Number')}</label>
                  <input
                    type="text"
                    value={newInvoiceForm.ticketNumber}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, ticketNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('جهة التأمين', 'Insurance Provider')}</label>
                  <select
                    value={newInvoiceForm.insuranceProvider}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, insuranceProvider: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 bg-white font-medium"
                  >
                    <option value="ins-wahda">شركة الوحدة للتأمين (85%)</option>
                    <option value="ins-sahara">شركة الصحراء للتأمين (90%)</option>
                    <option value="ins-libyan-co">شركة ليبيا للتأمين (80%)</option>
                    <option value="ins-noc-oil">المؤسسة الوطنية للنفط AGOCO (100%)</option>
                    <option value="self_pay">دفع نقدي خاص (100% المريض)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('اسم المريض *', 'Patient Name *')}</label>
                <input
                  type="text"
                  required
                  value={newInvoiceForm.patientNameAr}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, patientNameAr: e.target.value })}
                  placeholder="مثال: يوسف خالد الدرسي"
                  className="w-full p-2.5 rounded-xl border border-pine-200"
                />
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('العملية أو الإجراء الجراحي', 'Surgical Procedure')}</label>
                <input
                  type="text"
                  value={newInvoiceForm.procedureAr}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, procedureAr: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-pine-200 font-semibold"
                />
              </div>

              {/* Breakdown numbers */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('أتعاب الجراح', 'Surgeon')}</label>
                  <input
                    type="number"
                    value={newInvoiceForm.surgeonFeeLYD}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, surgeonFeeLYD: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('جناح العمليات', 'OR Suite')}</label>
                  <input
                    type="number"
                    value={newInvoiceForm.orFacilityFeeLYD}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, orFacilityFeeLYD: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('العدسة / الجهاز', 'Lens / Device')}</label>
                  <input
                    type="number"
                    value={newInvoiceForm.lensOrDeviceFeeLYD}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, lensOrDeviceFeeLYD: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-ink-500 hover:bg-bone-100 rounded-xl"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer"
                >
                  {t('اعتماد وإصدار الفاتورة', 'Approve & Issue Invoice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
