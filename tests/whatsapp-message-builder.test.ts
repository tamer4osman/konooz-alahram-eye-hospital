import { describe, expect, it } from 'vitest';
import {
  buildHeroBookingMessage,
  buildBookingModalMessage,
  buildWhatsAppUrl,
  buildGreetingMessage,
  type HeroBookingParams,
  type BookingModalParams,
} from '@/lib/whatsapp-message-builder';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const BASE_HERO: HeroBookingParams = {
  lang: 'en',
  patientName: 'Ahmed Ali',
  phone: '0912345678',
  email: 'ahmed@test.ly',
  genderTitle: 'Male',
  ageTitle: 'Adult',
  eyeTitle: 'Right',
  conditionTitle: 'Cataract',
  durationTitle: 'Recent',
  specialtyTitle: 'Ophthalmology',
  doctorTitle: 'Dr. Mohamed Al-Kilani',
  preferredDate: '2026-09-15',
  consultationType: 'consultant',
};

const BASE_MODAL: BookingModalParams = {
  lang: 'en',
  bookingRef: 'BK-123456',
  queueTicket: 'Q-284',
  patientName: 'Ahmed Ali',
  phone: '0912345678',
  email: 'ahmed@test.ly',
  genderTitle: 'Male',
  ageTitle: 'Adult',
  eyeTitle: 'Right',
  conditionTitle: 'Cataract',
  durationTitle: 'Recent',
  specialtyTitle: 'Ophthalmology',
  doctorTitle: 'Dr. Mohamed Al-Kilani',
  preferredDate: '2026-09-15',
  preferredSlot: 'morning',
  slotText: 'Morning Slot (9:00 AM - 2:00 PM)',
};

// ---------------------------------------------------------------------------
// buildHeroBookingMessage
// ---------------------------------------------------------------------------
describe('buildHeroBookingMessage', () => {
  it('produces a non-empty English message with all required fields', () => {
    const msg = buildHeroBookingMessage(BASE_HERO);
    expect(msg).toContain('Patient Name');
    expect(msg).toContain('Ahmed Ali');
    expect(msg).toContain('Phone Number');
    expect(msg).toContain('0912345678');
    expect(msg).toContain('Email');
    expect(msg).toContain('ahmed@test.ly');
    expect(msg).toContain('Gender');
    expect(msg).toContain('Male');
    expect(msg).toContain('Affected Eye');
    expect(msg).toContain('Right');
    expect(msg).toContain('Reason for Visit');
    expect(msg).toContain('Cataract');
    expect(msg).toContain('Department / Specialty');
    expect(msg).toContain('Ophthalmology');
    expect(msg).toContain('Preferred Doctor');
    expect(msg).toContain('Dr. Mohamed Al-Kilani');
    expect(msg).toContain('Preferred Date');
    expect(msg).toContain('2026-09-15');
  });

  it('produces a non-empty Arabic message with all required fields', () => {
    const params: HeroBookingParams = {
      ...BASE_HERO,
      lang: 'ar',
      patientName: 'أحمد علي',
      conditionTitle: 'المياه البيضاء',
      specialtyTitle: 'طب العيون',
      doctorTitle: 'د. محمد الكيلاني',
    };
    const msg = buildHeroBookingMessage(params);
    expect(msg).toContain('اسم المريض');
    expect(msg).toContain('أحمد علي');
    expect(msg).toContain('سبب الزيارة');
    expect(msg).toContain('المياه البيضاء');
    expect(msg).toContain('القسم / التخصص');
    expect(msg).toContain('طب العيون');
    expect(msg).toContain('الطبيب المفضل');
    expect(msg).toContain('د. محمد الكيلاني');
  });

  it('includes symptomDetails when provided', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      symptomDetails: 'Blurred vision for 3 days',
    });
    expect(msg).toContain('Additional Notes');
    expect(msg).toContain('Blurred vision for 3 days');
  });

  it('omits symptomDetails line when empty', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      symptomDetails: '',
    });
    expect(msg).not.toContain('Additional Notes');
  });

  it('omits symptomDetails line when whitespace only', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      symptomDetails: '   ',
    });
    expect(msg).not.toContain('Additional Notes');
  });

  it('uses "As soon as possible" fallback when preferredDate is empty', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      preferredDate: '',
    });
    expect(msg).toContain('As soon as possible');
  });

  it('uses Arabic fallback when preferredDate is empty and lang is ar', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      lang: 'ar',
      preferredDate: '',
    });
    expect(msg).toContain('أقرب موعد ممكن');
  });

  it('renders "Visiting Consultant" for consultant consultation type', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      consultationType: 'consultant',
    });
    expect(msg).toContain('Visiting Consultant');
  });

  it('renders "General Clinic" for clinic consultation type', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      consultationType: 'clinic',
    });
    expect(msg).toContain('General Clinic');
  });

  it('uses General fallback when doctorTitle is empty', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      doctorTitle: '',
    });
    expect(msg).toContain('Next Available Consultant');
  });

  it('uses Arabic General fallback when doctorTitle is empty and lang is ar', () => {
    const msg = buildHeroBookingMessage({
      ...BASE_HERO,
      lang: 'ar',
      doctorTitle: '',
    });
    expect(msg).toContain('أقرب استشاري متاح');
  });
});

// ---------------------------------------------------------------------------
// buildBookingModalMessage
// ---------------------------------------------------------------------------
describe('buildBookingModalMessage', () => {
  it('produces a non-empty English message with all required fields', () => {
    const msg = buildBookingModalMessage(BASE_MODAL);
    expect(msg).toContain('Booking Ref');
    expect(msg).toContain('#BK-123456');
    expect(msg).toContain('Clinic Queue Ticket');
    expect(msg).toContain('Q-284');
    expect(msg).toContain('Patient Name');
    expect(msg).toContain('Ahmed Ali');
    expect(msg).toContain('Phone Number');
    expect(msg).toContain('0912345678');
    expect(msg).toContain('Email');
    expect(msg).toContain('ahmed@test.ly');
    expect(msg).toContain('Preferred Time Slot');
    expect(msg).toContain('Morning Slot (9:00 AM - 2:00 PM)');
  });

  it('produces a non-empty Arabic message with all required fields', () => {
    const params: BookingModalParams = {
      ...BASE_MODAL,
      lang: 'ar',
      patientName: 'أحمد علي',
      conditionTitle: 'المياه البيضاء',
      specialtyTitle: 'طب العيون',
      doctorTitle: 'د. محمد الكيلاني',
      slotText: 'الفترة الصباحية (9:00 ص - 2:00 ظ)',
    };
    const msg = buildBookingModalMessage(params);
    expect(msg).toContain('رقم الحجز المرجعي');
    expect(msg).toContain('رقم التذكرة بالعيادة');
    expect(msg).toContain('اسم المريض');
    expect(msg).toContain('أحمد علي');
    expect(msg).toContain('الفترة المفضلة');
    expect(msg).toContain('الفترة الصباحية (9:00 ص - 2:00 ظ)');
  });

  it('includes notes when provided', () => {
    const msg = buildBookingModalMessage({
      ...BASE_MODAL,
      notes: 'Patient prefers afternoon',
    });
    expect(msg).toContain('Additional Notes');
    expect(msg).toContain('Patient prefers afternoon');
  });

  it('omits notes line when empty', () => {
    const msg = buildBookingModalMessage({
      ...BASE_MODAL,
      notes: '',
    });
    expect(msg).not.toContain('Additional Notes');
  });

  it('omits notes line when whitespace only', () => {
    const msg = buildBookingModalMessage({
      ...BASE_MODAL,
      notes: '   ',
    });
    expect(msg).not.toContain('Additional Notes');
  });

  it('uses "Earliest available" fallback when preferredDate is empty', () => {
    const msg = buildBookingModalMessage({
      ...BASE_MODAL,
      preferredDate: '',
    });
    expect(msg).toContain('Earliest available');
  });

  it('uses Arabic fallback when preferredDate is empty and lang is ar', () => {
    const msg = buildBookingModalMessage({
      ...BASE_MODAL,
      lang: 'ar',
      preferredDate: '',
    });
    expect(msg).toContain('أقرب موعد ممكن');
  });

  it('prepends # to bookingRef', () => {
    const msg = buildBookingModalMessage({
      ...BASE_MODAL,
      bookingRef: 'BK-999',
    });
    expect(msg).toContain('#BK-999');
  });
});

// ---------------------------------------------------------------------------
// buildWhatsAppUrl
// ---------------------------------------------------------------------------
describe('buildWhatsAppUrl', () => {
  it('returns a wa.me URL with encoded message', () => {
    const url = buildWhatsAppUrl('+218912345678', 'Hello World');
    expect(url).toContain('wa.me/218912345678?text=');
    expect(url).toContain(encodeURIComponent('Hello World'));
  });

  it('strips the leading + from the phone number', () => {
    const url = buildWhatsAppUrl('+218912345678', 'test');
    expect(url).not.toContain('+');
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  });

  it('handles phone number without leading +', () => {
    const url = buildWhatsAppUrl('218912345678', 'test');
    expect(url).toMatch(/^https:\/\/wa\.me\/218912345678\?text=/);
  });
});

// ---------------------------------------------------------------------------
// buildGreetingMessage
// ---------------------------------------------------------------------------
describe('buildGreetingMessage', () => {
  it('returns English greeting by default', () => {
    const msg = buildGreetingMessage('en');
    expect(msg).toContain('Hello');
    expect(msg).toContain('Konooz Al-Ahram');
  });

  it('returns Arabic greeting when lang is ar', () => {
    const msg = buildGreetingMessage('ar');
    expect(msg).toContain('السلام عليكم');
    expect(msg).toContain('كنوز الأهرام');
  });
});
