'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import Modal from '@/components/ui/Modal';
import { Calculator, X, CheckCircle2, Phone, Zap } from 'lucide-react';

interface SurgicalCostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingModal?: () => void; }

export default function SurgicalCostCalculatorModal({
  isOpen, onClose, onOpenBookingModal
}: SurgicalCostCalculatorModalProps) {
  const { lang, t, } = useLanguage();

  const [selectedProcedure, setSelectedProcedure] = useState('femto_lasik');
  const [selectedLens, setSelectedLens] = useState('none');
  const [selectedInsurance, setSelectedInsurance] = useState('ins_wahda');
  const [isBothEyes, setIsBothEyes] = useState(true);

  if (!isOpen) return null;

  const procedures = [
    {
      id: 'femto_lasik', nameAr: 'فيمتو ليزك مخصص ببصمة العين (Custom-Q)', nameEn: 'Custom-Q Wavefront Femto-LASIK', basePriceOneEye: 2100, basePriceBothEyes: 3900, requiresLens: false, recommendedFor: 'تصحيح قصر وطول النظر والاستجماتيزم' },
    {
      id: 'phaco_cataract',
      nameAr: 'إزالة المياه البيضاء بالموجات فوق الصوتية (فاكو)',
      nameEn: 'Phacoemulsification Cataract Surgery',
      basePriceOneEye: 2600,
      basePriceBothEyes: 5000,
      requiresLens: true,
      recommendedFor: 'علاج عتامة عدسة العين والشيخوخة'
    },
    {
      id: 'vitrectomy',
      nameAr: 'جراحة استئصال زجاجية 25G لعلاج انفصال الشبكية',
      nameEn: '25G Micro-Incision Vitrectomy (VR)',
      basePriceOneEye: 5800,
      basePriceBothEyes: 11000,
      requiresLens: false,
      recommendedFor: 'انفصال الشبكية، نزيف السكري، الثقوب'
    },
    {
      id: 'cross_linking',
      nameAr: 'تثبيت القرنية المخروطية بالأشعة فوق البنفسجية (CXL)',
      nameEn: 'Corneal Collagen Cross-Linking (CXL)',
      basePriceOneEye: 1800,
      basePriceBothEyes: 3400,
      requiresLens: false,
      recommendedFor: 'إيقاف تدهور القرنية المخروطية'
    }
  ];

  const lenses = [
    {
      id: 'none',
      nameAr: 'بدون زراعة عدسة',
      nameEn: 'No Intraocular Lens Needed',
      extraPrice: 0
    },
    {
      id: 'monofocal_iq',
      nameAr: 'عدسة صفراء واقية أحادية البؤرة (Alcon AcrySof IQ)',
      nameEn: 'Alcon AcrySof IQ Aspheric Monofocal',
      extraPrice: 950
    },
    {
      id: 'toric_astigmatism',
      nameAr: 'عدسة توريك متطورة لتصحيح الاستجماتيزم (Alcon Toric)',
      nameEn: 'Alcon AcrySof Toric Premium',
      extraPrice: 1650
    },
    {
      id: 'trifocal_panoptix',
      nameAr: 'عدسة ثلاثية البؤر للرؤية القريبة والبعيدة (PanOptix Trifocal)',
      nameEn: 'Alcon AcrySof PanOptix Trifocal (Glasses-Free)',
      extraPrice: 2800
    }
  ];

  const insurances = [
    { id: 'self_pay', nameAr: 'دفع خاص نقدي مباشر (خصم باقة)', nameEn: 'Self Pay / Cash Package', coveragePercent: 0 },
    { id: 'ins_wahda', nameAr: 'شركة الوحدة للتأمين الطبي (تغطية 85%)', nameEn: 'Al-Wahda Health Insurance (85%)', coveragePercent: 85 },
    { id: 'ins_sahara', nameAr: 'شركة الصحراء للتأمين الطبي (تغطية 90%)', nameEn: 'Sahara Medical Insurance (90%)', coveragePercent: 90 },
    { id: 'ins_libyan_co', nameAr: 'شركة ليبيا للتأمين (تغطية 80%)', nameEn: 'Libya Insurance Company (80%)', coveragePercent: 80 },
    { id: 'ins_noc', nameAr: 'المؤسسة الوطنية للنفط وشركة الخليج (100%)', nameEn: 'NOC Oil Sector & AGOCO (100%)', coveragePercent: 100 }
  ];

  const activeProcedure = procedures.find((p) => p.id === selectedProcedure) || procedures[0];
  const activeLens = lenses.find((l) => l.id === selectedLens) || lenses[0];
  const activeInsurance = insurances.find((i) => i.id === selectedInsurance) || insurances[0];

  const procedureCost = isBothEyes ? activeProcedure.basePriceBothEyes : activeProcedure.basePriceOneEye;
  const lensCost = activeProcedure.requiresLens ? activeLens.extraPrice * (isBothEyes ? 2 : 1) : 0;
  const totalGross = procedureCost + lensCost;

  const insuranceCovered = Math.round((totalGross * activeInsurance.coveragePercent) / 100);
  const patientPay = totalGross - insuranceCovered;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledById="cost-calculator-title"
      panelClassName="rounded-3xl max-w-xl w-full p-6 animate-scaleUp"
    >
      
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pine-50 flex items-center justify-center text-pine-700 border border-pine-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 id="cost-calculator-title" className="text-base font-extrabold text-pine-950">
                {t('حاسبة تكاليف العمليات والتغطية التأمينية', 'Surgical Cost & Insurance Co-Pay Estimator')}
              </h3>
              <span className="text-[11px] text-ink-500 block">
                {t('تقدير شفاف وشامل لأتعاب الجراح، جناح العمليات والعدسات (بالدينار الليبي)', 'Transparent pricing for surgeon fees, OR suites & IOLs (LYD)')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('إغلاق', 'Close')}
            className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Procedure Selector */}
          <div>
            <label className="font-bold text-ink-700 block mb-1.5">{t('اختر العملية أو الإجراء المطلوب:', 'Select Ophthalmic Procedure:')}</label>
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pine-200 bg-bone-50 font-bold text-ink-900 focus:outline-none focus:border-pine-500"
            >
              {procedures.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === 'ar' ? p.nameAr : p.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Eye Selection Toggle */}
          <div className="flex items-center gap-3 p-3 bg-bone-50 rounded-xl border border-pine-200">
            <span className="font-bold text-ink-700">{t('نطاق الإجراء:', 'Scope:')}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBothEyes(false)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  !isBothEyes ? 'bg-[#0B3D33] text-white shadow-xs' : 'bg-white text-ink-500 border border-pine-200'
                }`}
              >
                {t('عين واحدة فقط', 'Single Eye')}
              </button>
              <button
                type="button"
                onClick={() => setIsBothEyes(true)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  isBothEyes ? 'bg-[#0B3D33] text-white shadow-xs' : 'bg-white text-ink-500 border border-pine-200'
                }`}
              >
                {t('كلتا العينين (باقة مخفضة)', 'Both Eyes (Package)')}
              </button>
            </div>
          </div>

          {/* Lens Selection (if applicable) */}
          {activeProcedure.requiresLens && (
            <div>
              <label className="font-bold text-ink-700 block mb-1.5">{t('نوع العدسة المطوية المزروعة:', 'Intraocular Lens Choice (IOL):')}</label>
              <select
                value={selectedLens}
                onChange={(e) => setSelectedLens(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-pine-200 bg-bone-50 font-semibold text-ink-900 focus:outline-none focus:border-pine-500"
              >
                {lenses.map((l) => (
                  <option key={l.id} value={l.id}>
                    {lang === 'ar' ? l.nameAr : l.nameEn} {l.extraPrice > 0 ? `(+${l.extraPrice} LYD)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Insurance Selector */}
          <div>
            <label className="font-bold text-ink-700 block mb-1.5">{t('جهة التأمين أو طريقة السداد:', 'Health Insurance / Payment Method:')}</label>
            <select
              value={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-pine-200 bg-bone-50 font-bold text-pine-900 focus:outline-none focus:border-pine-500"
            >
              {insurances.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {lang === 'ar' ? ins.nameAr : ins.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Calculation Breakdown Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-ink-900 to-[#0B3D33] text-white space-y-2.5 shadow-lg">
            <div className="flex justify-between items-center text-xs text-ink-300 pb-2 border-b border-ink-700">
              <span>{t('القيمة الإجمالية الشاملة للجراحة:', 'Gross Surgical Package:')}</span>
              <span className="font-mono font-bold text-white">{totalGross.toLocaleString()} LYD</span>
            </div>

            {insuranceCovered > 0 && (
              <div className="flex justify-between items-center text-xs text-pine-300">
                <span>{t('تغطية التأمين المعتمدة:', 'Insurance Approved Amount:')}</span>
                <span className="font-mono font-bold">-{insuranceCovered.toLocaleString()} LYD</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-ink-700">
              <span className="font-extrabold text-sm text-pine-200">{t('المبلغ النهائي المطلوب من المريض:', 'Estimated Patient Co-Pay:')}</span>
              <span className="font-mono text-xl font-extrabold text-white bg-pine-700/40 px-2.5 py-0.5 rounded-xl border border-brass-400/40">
                {patientPay.toLocaleString()} <small className="text-xs font-normal">LYD</small>
              </span>
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="flex items-start gap-2 p-3 bg-pine-50 rounded-xl border border-pine-200 text-pine-950 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-pine-700 flex-shrink-0 mt-0.5" />
            <p>
              {t(
                'الأسعار تشمل جميع الفحوصات القبلية، التخدير، مستهلكات التعقيم والمتابعة الأولى مجاناً. نقبل جميع البطاقات المصرفية والصكوك المصدقة.',
                'Includes pre-op scans, anesthesia, sterile surgical consumables and 1st post-op follow-up. Certified bank cheques & POS accepted.'
              )}
            </p>
          </div>

          {/* CTA Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenBookingModal) onOpenBookingModal();
              }}
              className="flex-1 py-2.5 bg-pine-700 hover:bg-pine-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{t('تأكيد وحجز موعد الكشف', 'Book Consultation Now')}</span>
            </button>

            <a
              href={`https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{t('واتساب', 'WhatsApp')}</span>
            </a>
          </div>

        </div>

    </Modal>
  );
}