import { describe, it, expect, vi } from 'vitest';
import {
  resolveRoomCreate,
  resolveRoomPatch,
  createRoom,
  listRooms,
  RoomNameRequiredError,
} from '@/lib/usecases/rooms';
import type { RoomReader, RoomWriter } from '@/lib/usecases/rooms';
import type { HospitalRoom as RoomDTO } from '@/data/dashboardData';

const SAMPLE_ROOM: RoomDTO = {
  id: 'room-1',
  code: 'OR-1',
  nameAr: 'غرفة عمليات 1',
  nameEn: 'Operating Theater 1',
  type: 'operating_theater',
  status: 'ready_clean',
  sterilizationStatus: 'sterile_verified',
  airPressureHepa: 'positive_optimal',
  tempCelsius: 20,
  humidityPercent: 45,
  occupiedCount: 0,
  capacity: 1,
  floorAr: '',
  floorEn: null,
  currentDoctorAr: null,
  currentDoctorEn: null,
  currentPatientId: null,
  currentProcedureAr: null,
  currentProcedureEn: null,
  mainDeviceAssignedAr: '',
  mainDeviceAssignedEn: null,
} as unknown as RoomDTO;

function stubReader(rows: RoomDTO[]): RoomReader {
  return { list: vi.fn().mockResolvedValue(rows) };
}

function stubWriter(row: RoomDTO): RoomWriter {
  return {
    create: vi.fn().mockResolvedValue(row),
    update: vi.fn().mockResolvedValue(row),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe('resolveRoomCreate', () => {
  it('applies environment defaults: capacity 1, 20°C, 45%', () => {
    const resolved = resolveRoomCreate({
      code: 'OR-2',
      type: 'operating_theater',
      nameAr: 'غرفة 2',
    });
    expect(resolved.capacity).toBe(1);
    expect(resolved.tempCelsius).toBe(20);
    expect(resolved.humidityPercent).toBe(45);
    expect(resolved.floorAr).toBe('');
    expect(resolved.mainDeviceAssignedAr).toBe('');
  });

  it('falls back one language to the other', () => {
    const enOnly = resolveRoomCreate({
      code: 'X',
      type: 'laser_room',
      nameEn: 'Laser Room',
    });
    expect(enOnly.nameAr).toBe('Laser Room');
    expect(enOnly.nameEn).toBe('Laser Room');
  });

  it('throws RoomNameRequiredError when neither language has a name', () => {
    expect(() =>
      resolveRoomCreate({ code: 'X', type: 'laser_room' }),
    ).toThrow(RoomNameRequiredError);
  });
});

describe('resolveRoomPatch', () => {
  it('passes the patch through unchanged (no side-effect transitions today)', () => {
    const patch = { status: 'sterilizing' as const, tempCelsius: 22 };
    expect(resolveRoomPatch(patch)).toEqual(patch);
  });
});

describe('use cases', () => {
  it('listRooms delegates to reader', async () => {
    const reader = stubReader([SAMPLE_ROOM]);
    const result = await listRooms(reader);
    expect(reader.list).toHaveBeenCalledOnce();
    expect(result).toEqual([SAMPLE_ROOM]);
  });

  it('createRoom resolves then persists via writer', async () => {
    const writer = stubWriter(SAMPLE_ROOM);
    await createRoom(writer, {
      code: 'OR-1',
      type: 'operating_theater',
      nameAr: 'غرفة عمليات 1',
    });
    const resolved = vi.mocked(writer.create).mock.calls[0][0];
    expect(resolved.nameAr).toBe('غرفة عمليات 1');
    expect(resolved.tempCelsius).toBe(20);
  });
});
