import { describe, expect, it } from 'vitest';
import { normalizeProfile } from '@/lib/patient/profile-normalizer';

describe('normalizeProfile', () => {
  it('returns a fully-defaulted profile when the server row is null', () => {
    const profile = normalizeProfile(null, 'a@b.c');

    expect(profile.id).toBe('a@b.c');
    expect(profile.email).toBe('a@b.c');
    expect(profile.fullNameAr).toBe('a@b.c');
    expect(profile.fullNameEn).toBe('a@b.c');
    expect(profile.gender).toBe('male');
    expect(profile.cityAr).toBe('بنغازي');
    expect(profile.cityEn).toBe('Benghazi');
    expect(profile.appointments).toEqual([]);
    expect(profile.prescriptions).toEqual([]);
    expect(profile.notificationHistory).toEqual([]);
    expect(profile.communicationPreferences).toEqual({
      emailNotifications: true,
      whatsappAlerts: true,
      appointmentReminders: true,
      eyeDropScheduleAlerts: true,
      postOpCareGuides: true,
      newsletterSubscribed: false,
      newsletterTopics: [],
    });
  });

  it('maps server fields onto the DTO shape', () => {
    const profile = normalizeProfile(
      {
        id: 'acc-1',
        fullNameAr: 'سالم محمود',
        fullNameEn: 'Salem Mahmoud',
        email: 'salem@example.com',
        phone: '0912345678',
        whatsappNumber: '0912345678',
        gender: 'female',
        nationalId: '123456',
        cityAr: 'طبرق',
        cityEn: 'Tobruk',
        allergiesAr: ['حبوب اللقاح'],
        allergiesEn: ['Pollen'],
        emergencyContact: { name: 'أحمد', relationAr: 'أخ', relationEn: 'Brother', phone: '091' },
        refractiveData: { odSphere: '-1.0', lastChecked: '2026-08-01' },
        communicationPreferences: { newsletterSubscribed: true, newsletterTopics: ['lasik'] },
      },
      'salem@example.com'
    );

    expect(profile.id).toBe('acc-1');
    expect(profile.fullNameAr).toBe('سالم محمود');
    expect(profile.fullNameEn).toBe('Salem Mahmoud');
    expect(profile.gender).toBe('female');
    expect(profile.nationalId).toBe('123456');
    expect(profile.cityAr).toBe('طبرق');
    expect(profile.allergiesAr).toEqual(['حبوب اللقاح']);
    expect(profile.emergencyContact.relationEn).toBe('Brother');
    expect(profile.refractiveData.odSphere).toBe('-1.0');
    expect(profile.refractiveData.osSphere).toBe('');
    expect(profile.communicationPreferences.newsletterSubscribed).toBe(true);
    expect(profile.communicationPreferences.newsletterTopics).toEqual(['lasik']);
  });

  it('coerces wrong-typed fields to safe defaults without crashing', () => {
    const profile = normalizeProfile(
      {
        fullNameAr: 42,
        phone: null,
        whatsappNumber: 7,
        allergiesAr: 'not-an-array',
        allergiesEn: [1, 'ok', null],
        gender: 'other',
        emergencyContact: 'broken',
        refractiveData: null,
        communicationPreferences: 0,
      },
      'x@y.z'
    );

    expect(profile.fullNameAr).toBe('x@y.z');
    expect(profile.phone).toBe('');
    expect(profile.whatsappNumber).toBe('');
    expect(profile.gender).toBe('male');
    expect(profile.allergiesAr).toEqual([]);
    expect(profile.allergiesEn).toEqual(['ok']);
    expect(profile.emergencyContact).toEqual({ name: '', relationAr: '', relationEn: '', phone: '' });
    expect(profile.refractiveData.odSphere).toBe('');
    expect(profile.communicationPreferences.emailNotifications).toBe(true);
    expect(profile.communicationPreferences.newsletterSubscribed).toBe(false);
  });

  it('falls back to the session email when the row omits identifying fields', () => {
    const profile = normalizeProfile({ id: 'acc-9', phone: '0910000000' }, 'fallback@konooz.ly');

    expect(profile.id).toBe('acc-9');
    expect(profile.email).toBe('fallback@konooz.ly');
    expect(profile.fullNameAr).toBe('fallback@konooz.ly');
    expect(profile.whatsappNumber).toBe('0910000000');
  });
});
