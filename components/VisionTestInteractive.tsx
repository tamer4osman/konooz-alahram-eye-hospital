'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, CheckCircle2, AlertTriangle, RotateCcw, Sparkles, Calendar, HelpCircle } from 'lucide-react';

export default function VisionTestInteractive() {
  const { lang, t, openBookingModal } = useLanguage();

  const [activeTab, setActiveTab] = useState<'acuity' | 'amsler' | 'symptoms'>('acuity');

  // Tumbling E Test State
  const [eStage, setEStage] = useState(0);
  const [eScore, setEScore] = useState(0);
  const [eFinished, setEFinished] = useState(false);

  const eQuestions = [
    { size: 'text-6xl', direction: 'up', correct: 'up' },
    { size: 'text-5xl', direction: 'left', correct: 'left' },
    { size: 'text-4xl', direction: 'right', correct: 'right' },
    { size: 'text-3xl', direction: 'down', correct: 'down' },
    { size: 'text-2xl', direction: 'left', correct: 'left' },
    { size: 'text-xl', direction: 'up', correct: 'up' },
  ];

  const handleEAnswer = (selectedDir: string) => {
    if (selectedDir === eQuestions[eStage].correct) {
      setEScore((prev) => prev + 1);
    }
    if (eStage < eQuestions.length - 1) {
      setEStage((prev) => prev + 1);
    } else {
      setEFinished(true);
    }
  };

  const resetETest = () => {
    setEStage(0);
    setEScore(0);
    setEFinished(false);
  };

  // Amsler Grid Questionnaire State
  const [amslerDistortion, setAmslerDistortion] = useState<boolean | null>(null);

  // Symptoms Quick Checker
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const symptomList = [
    { id: 'blur_far', labelAr: 'ضبابية في رؤية الأشياء البعيدة أو القيادة ليلاً', labelEn: 'Blurry distance vision / nighttime glare' },
    { id: 'cloudy_lens', labelAr: 'رؤية معتمة أو باهتة تشبه النظر عبر زجاج متسخ (مياه بيضاء)', labelEn: 'Clouded vision / faded colors (Cataract signs)' },
    { id: 'floaters', labelAr: 'ظهور ذبابة طائرة مفاجئة أو وميض ضوء في الظلام (شبكية)', labelEn: 'Sudden floaters or flashes of light (Retina signs)' },
    { id: 'reading_strain', labelAr: 'صداع وإجهاد سريع عند القراءة أو استخدام الهاتف', labelEn: 'Eye strain & headaches during reading or screen use' },
    { id: 'watery_eyes', labelAr: 'دمعان مستمر أو حكة وإفرازات بالجفن', labelEn: 'Excessive tearing / eyelid irritation' },
    { id: 'child_squint', labelAr: 'انحراف أو ميل بإحدى عيني الطفل عند التركيز', labelEn: 'Squinting / misaligned eyes in child' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <section id="vision-screener" className="py-16 sm:py-24 bg-slate-100/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">
            <Eye className="w-4 h-4 text-teal-700" />
            <span>{t('أداة الفحص والتوجيه الذاتي', 'Interactive Vision Screener')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C2340]">
            {t('افحص حدة بصرك وصحة عينيك من المنزل', 'Check Your Visual Health & Symptoms')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t(
              'أداة تفاعلية سريعة لاختبار حدة الإبصار واكتشاف علامات اعتلال الشبكية والمياه البيضاء. (ملاحظة: هذا الاختبار استرشادي ولا يغني عن الفحص المجهري للعين).',
              'Quick interactive screening to evaluate visual acuity and screen for retinal or cataract warning signs. (Note: For screening only, not a clinical diagnosis).'
            )}
          </p>
        </div>

        {/* Screener Module Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
          
          {/* Module Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('acuity')}
              className={`py-3.5 px-3 text-center transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'acuity'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t('فحص حدة البصر (E-Chart)', 'Visual Acuity')}</span>
            </button>

            <button
              onClick={() => setActiveTab('amsler')}
              className={`py-3.5 px-3 text-center transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'amsler'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('شبكة أمزلر (فحص الشبكية)', 'Amsler Retinal Grid')}</span>
            </button>

            <button
              onClick={() => setActiveTab('symptoms')}
              className={`py-3.5 px-3 text-center transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'symptoms'
                  ? 'bg-white text-teal-700 border-b-2 border-teal-600'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              <span>{t('محدد الأعراض والتوجيه', 'Symptom Guide')}</span>
            </button>
          </div>

          {/* Tab 1: Visual Acuity (Tumbling E Test) */}
          {activeTab === 'acuity' && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {t(
                    'تعليمات: اجلس على بعد ذراع واحد من الشاشة، قم بتغطية عين واحدة، وحدد اتجاه فتحة حرف E.',
                    'Instructions: Sit at arm’s length, cover one eye, and identify the opening direction of the letter E.'
                  )}
                </span>
              </div>

              {!eFinished ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-8">
                  <div className="text-xs font-bold text-slate-400">
                    {t(`المستوى ${eStage + 1} من ${eQuestions.length}`, `Level ${eStage + 1} of ${eQuestions.length}`)}
                  </div>

                  {/* Visual E Target */}
                  <div className="w-32 h-32 flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner">
                    <div
                      className={`font-black text-slate-900 select-none ${eQuestions[eStage].size} ${
                        eQuestions[eStage].direction === 'up'
                          ? '-rotate-90'
                          : eQuestions[eStage].direction === 'down'
                          ? 'rotate-90'
                          : eQuestions[eStage].direction === 'left'
                          ? 'rotate-180'
                          : ''
                      }`}
                    >
                      E
                    </div>
                  </div>

                  {/* Directional Buttons */}
                  <div className="space-y-2 text-center">
                    <p className="text-xs font-bold text-slate-700">
                      {t('إلى أي اتجاه تشير فتحة الحرف؟', 'Which direction is the letter opening facing?')}
                    </p>
                    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                      <button
                        onClick={() => handleEAnswer('up')}
                        className="p-3 bg-slate-100 hover:bg-[#0C2340] hover:text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        {t('للأعلى ⬆️', 'Up ⬆️')}
                      </button>
                      <button
                        onClick={() => handleEAnswer('down')}
                        className="p-3 bg-slate-100 hover:bg-[#0C2340] hover:text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        {t('للأسفل ⬇️', 'Down ⬇️')}
                      </button>
                      <button
                        onClick={() => handleEAnswer('left')}
                        className="p-3 bg-slate-100 hover:bg-[#0C2340] hover:text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        {t('لليسار ⬅️', 'Left ⬅️')}
                      </button>
                      <button
                        onClick={() => handleEAnswer('right')}
                        className="p-3 bg-slate-100 hover:bg-[#0C2340] hover:text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        {t('لليمين ➡️', 'Right ➡️')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-[#0C2340]">
                    {t(
                      `نتيجتك: ${eScore} من أصل ${eQuestions.length}`,
                      `Your Score: ${eScore} / ${eQuestions.length}`
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    {eScore >= 5
                      ? t(
                          'حدة إبصار ممتازة! ننصح بإجراء فحص قاع عين دوري سنوياً للتأكد من سلامة القرنية والشبكية.',
                          'Excellent visual acuity! We recommend an annual checkup to maintain corneal & retinal health.'
                        )
                      : t(
                          'قد تعاني من درجة انكسار أو استجماتيزم تحتاج لتصحيح. يمكنك الاستفادة من الفيمتو ليزك أو زراعة العدسات للتخلص من النظارة.',
                          'You may have refractive errors or astigmatism. Consider Femto-LASIK or ICL evaluation to achieve 20/20 clarity.'
                        )}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={resetETest}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('إعادة الاختبار للعين الأخرى', 'Test Other Eye')}</span>
                    </button>
                    <button
                      onClick={() => openBookingModal('refractive-lasik')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0C2340] hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Calendar className="w-4 h-4 text-teal-300" />
                      <span>{t('حجز فحص ليزك شامل بالبنتاكام', 'Book Full LASIK Assessment')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Amsler Grid */}
          {activeTab === 'amsler' && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Amsler Grid Graphic */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-64 h-64 bg-white border-4 border-slate-900 rounded-lg p-2 flex items-center justify-center shadow-lg relative">
                    {/* SVG Grid */}
                    <svg viewBox="0 0 200 200" className="w-full h-full stroke-slate-900" strokeWidth="1">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <React.Fragment key={i}>
                          <line x1="0" y1={i * 20} x2="200" y2={i * 20} />
                          <line x1={i * 20} y1="0" x2={i * 20} y2="200" />
                        </React.Fragment>
                      ))}
                      {/* Center Fixation Point */}
                      <circle cx="100" cy="100" r="5" fill="#0C2340" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 font-medium">
                    {t('ركز ببصرك على النقطة السوداء المركزية', 'Focus directly on the center black dot')}
                  </span>
                </div>

                {/* Questions & Instructions */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-[#0C2340]">
                    {t('فحص مركز الإبصار والشبكية (شبكة أمزلر)', 'Macular & Retinal Integrity Check')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t(
                      'أثناء تركيزك على النقطة السوداء في المنتصف، هل ترى أياً من الخطوط المربعة متموجة، منحنية، مكسورة، أو بها بقعة مظلمة معتمة؟',
                      'While looking directly at the central dot, do any lines appear wavy, distorted, broken, or obscured by blind spots?'
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setAmslerDistortion(false)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        amslerDistortion === false
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t('كلا، الخطوط مستقيمة وواضحة تماماً', 'No, all lines are straight')}
                    </button>

                    <button
                      onClick={() => setAmslerDistortion(true)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        amslerDistortion === true
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t('نعم، أرى تموجاً أو فراغات في الخطوط', 'Yes, I see wavy or blurred lines')}
                    </button>
                  </div>

                  {amslerDistortion === true && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2 animate-fadeIn">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>{t('تنبيه هام لصحة الشبكية:', 'Urgent Retinal Alert:')}</span>
                      </p>
                      <p className="leading-snug">
                        {t(
                          'رؤية الخطوط متموجة قد تشير لارتشاح في مركز الإبصار أو علامات اعتلال سكري / تنكس بقعي. نوصيك بحجز فحص فوري بقسم الشبكية وجهاز OCT عالي الدقة.',
                          'Wavy lines can indicate macular edema or retinal distress. We strongly recommend scheduling an OCT scan with our retinal consultants.'
                        )}
                      </p>
                      <button
                        onClick={() => openBookingModal('retina-vitreous')}
                        className="w-full py-2 bg-[#0C2340] text-white rounded-lg font-bold text-xs hover:bg-teal-700 transition-colors"
                      >
                        {t('حجز كشف عاجل مع استشاري الشبكية', 'Book Urgent Retinal Consultation')}
                      </button>
                    </div>
                  )}

                  {amslerDistortion === false && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-fadeIn">
                      <p className="font-bold">
                        {t('نتيجة مطمئنة! مركز الإبصار يبدو سليماً.', 'Great result! Macular structure appears regular.')}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: Symptoms Checker */}
          {activeTab === 'symptoms' && (
            <div className="p-6 sm:p-10 space-y-6">
              <h3 className="text-base font-extrabold text-[#0C2340]">
                {t('حدد ما تشعر به لتوجيهك للقسم والاستشاري الأنسب لحالتك:', 'Select symptoms you are experiencing for tailored guidance:')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptomList.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3.5 rounded-xl border text-start text-xs font-semibold transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-teal-50 border-teal-500 text-teal-950 ring-1 ring-teal-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          isChecked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="leading-snug">
                        {lang === 'ar' ? symptom.labelAr : symptom.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                  <div className="text-xs text-teal-950 space-y-1 text-center sm:text-start">
                    <p className="font-extrabold">
                      {t('تم تحديد احتياجك الطبي بدقة!', 'Guidance Ready!')}
                    </p>
                    <p className="text-slate-600">
                      {t(
                        'فريقنا الطبي جاهز لمناظرة الأعراض وتقديم الحل الجراحي أو الدوائي الأمثل.',
                        'Our specialized team is ready to evaluate your case and provide the optimal surgical or medical plan.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => openBookingModal()}
                    className="px-5 py-2.5 bg-[#0C2340] hover:bg-teal-800 text-white text-xs font-extrabold rounded-xl transition-all whitespace-nowrap shadow-md"
                  >
                    {t('متابعة الحجز مع الاستشاري المختص', 'Proceed with Appointment')}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
