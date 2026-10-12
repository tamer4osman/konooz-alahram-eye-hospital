// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    lang: 'en',
    isRTL: false,
    t: (_ar: string, en: string) => en,
  }),
}));

import AddStaffModal from '@/components/dashboard/modals/AddStaffModal';
import AddRoomModal from '@/components/dashboard/modals/AddRoomModal';
import AddEquipmentModal from '@/components/dashboard/modals/AddEquipmentModal';
import ScheduleSurgeryModal from '@/components/dashboard/modals/ScheduleSurgeryModal';
import MaintenanceModal from '@/components/dashboard/modals/MaintenanceModal';
import type { HospitalEquipment, HospitalRoom } from '@/data/dashboardData';

/** Every write the modals perform goes through this. */
const failingFetch = (status = 500, body: unknown = {}) =>
  vi.fn().mockResolvedValue({ ok: false, status, json: async () => body });

const okFetch = (data: unknown) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data }) });

beforeEach(() => {
  globalThis.fetch = failingFetch();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('modal save flows - failure must not dismiss the dialog or destroy input', () => {
  it('AddStaffModal: stays open, shows an error, and keeps typed input', async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();
    render(
      React.createElement(AddStaffModal, { open: true, onClose, onCreated })
    );

    // roleAr is `required` and starts empty, so a real operator must fill it.
    fireEvent.change(screen.getByPlaceholderText('د. محمد الساعدي'), {
      target: { value: 'د. سارة المجبري' },
    });
    fireEvent.change(screen.getByPlaceholderText('أخصائي جراحة عيون ومياه بيضاء'), {
      target: { value: 'أخصائي قرنية' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Add Staff/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());

    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(
      (screen.getByPlaceholderText('د. محمد الساعدي') as HTMLInputElement).value
    ).toBe('د. سارة المجبري');
  });

  it('AddRoomModal: stays open on a rejected save', async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();
    render(React.createElement(AddRoomModal, { open: true, onClose, onCreated }));

    fireEvent.change(screen.getByPlaceholderText('OR-104'), { target: { value: 'OR-104' } });
    fireEvent.click(screen.getByRole('button', { name: /Register Room/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('AddEquipmentModal: stays open on a rejected save', async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();
    render(
      React.createElement(AddEquipmentModal, {
        open: true,
        rooms: [] as HospitalRoom[],
        onClose,
        onCreated,
      })
    );

    // serialNumber is `required` and starts empty, so it must be filled.
    fireEvent.change(screen.getByPlaceholderText('CZ-VM-800-4491'), {
      target: { value: 'CZ-VM-800-4491' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Register Equipment/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('ScheduleSurgeryModal: stays open on a rejected save', async () => {
    const onClose = vi.fn();
    const onScheduled = vi.fn();
    render(
      React.createElement(ScheduleSurgeryModal, { open: true, onClose, onScheduled })
    );

    fireEvent.change(screen.getByPlaceholderText('سليمان عبد القادر'), {
      target: { value: 'سليمان عبد القادر' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Schedule Surgery Case/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(onClose).not.toHaveBeenCalled();
    expect(onScheduled).not.toHaveBeenCalled();
  });

  it('MaintenanceModal: does NOT report a device certified when the server rejects it', async () => {
    const onClose = vi.fn();
    const onCertified = vi.fn();
    const device = {
      id: 'dev-1',
      brand: 'Carl Zeiss',
      model: 'CIRRUS',
      serialNumber: 'SN-1',
      nameAr: 'جهاز',
      nameEn: 'Device',
      roomCode: 'DIAG-1',
      technicianInChargeAr: 'م. سالم',
      technicianInChargeEn: 'Eng. Salem',
    } as unknown as HospitalEquipment;

    render(
      React.createElement(MaintenanceModal, { device, open: true, onClose, onCertified })
    );

    fireEvent.click(screen.getByRole('button', { name: /Certify & Set Operational/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());

    // The hospital must never be told a device was certified when it was not.
    expect(onCertified).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('modal save flows - confirmed saves still complete', () => {
  it('AddStaffModal: closes and hands back the persisted record', async () => {
    const created = { id: 'staff-1', nameAr: 'د. سارة', nameEn: 'Dr. Sara' };
    globalThis.fetch = okFetch(created) as unknown as typeof fetch;
    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(React.createElement(AddStaffModal, { open: true, onClose, onCreated }));

    fireEvent.change(screen.getByPlaceholderText('د. محمد الساعدي'), {
      target: { value: 'د. سارة' },
    });
    fireEvent.change(screen.getByPlaceholderText('أخصائي جراحة عيون ومياه بيضاء'), {
      target: { value: 'أخصائي قرنية' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Add Staff/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('AddStaffModal: a 2xx with no data is not treated as success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(React.createElement(AddStaffModal, { open: true, onClose, onCreated }));

    fireEvent.change(screen.getByPlaceholderText('د. محمد الساعدي'), {
      target: { value: 'د. سارة' },
    });
    fireEvent.change(screen.getByPlaceholderText('أخصائي جراحة عيون ومياه بيضاء'), {
      target: { value: 'أخصائي قرنية' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Add Staff/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(onCreated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('MaintenanceModal: certifies only after the server confirms', async () => {
    const updated = { id: 'dev-1', healthScore: 100 };
    globalThis.fetch = okFetch(updated) as unknown as typeof fetch;
    const onClose = vi.fn();
    const onCertified = vi.fn();
    const device = {
      id: 'dev-1',
      brand: 'Carl Zeiss',
      model: 'CIRRUS',
      serialNumber: 'SN-1',
      nameAr: 'جهاز',
      nameEn: 'Device',
      roomCode: 'DIAG-1',
      technicianInChargeAr: 'م. سالم',
      technicianInChargeEn: 'Eng. Salem',
    } as unknown as HospitalEquipment;

    render(
      React.createElement(MaintenanceModal, { device, open: true, onClose, onCertified })
    );

    fireEvent.click(screen.getByRole('button', { name: /Certify & Set Operational/i }));

    await waitFor(() => expect(onCertified).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
