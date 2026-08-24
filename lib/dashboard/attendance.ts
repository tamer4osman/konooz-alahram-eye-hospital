import type { StaffAttendanceRecord } from '@prisma/client';
import type { StaffAttendanceRecord as AttendanceDTO } from '@/data/dashboardData';

export function toAttendanceDTO(row: StaffAttendanceRecord): AttendanceDTO {
  return {
    id: row.id,
    staffId: row.staffId ?? '',
    staffNameAr: row.staffNameAr,
    staffNameEn: row.staffNameEn ?? '',
    roleAr: row.roleAr,
    roleEn: row.roleEn ?? '',
    avatar: row.avatar,
    category: row.category as AttendanceDTO['category'],
    departmentAr: row.departmentAr,
    departmentEn: row.departmentEn ?? '',
    shiftType: row.shiftType as AttendanceDTO['shiftType'],
    shiftNameAr: row.shiftNameAr,
    shiftNameEn: row.shiftNameEn ?? '',
    shiftTiming: row.shiftTiming,
    scheduledTime: row.scheduledTime,
    checkInTime: row.checkInTime,
    checkOutTime: row.checkOutTime,
    status: row.status as AttendanceDTO['status'],
    punctualityMinutes: row.punctualityMinutes,
    overtimeHours: row.overtimeHours,
    monthlyAttendanceRate: row.monthlyAttendanceRate,
    badgeCode: row.badgeCode,
    notesAr: row.notesAr ?? '',
    notesEn: row.notesEn ?? '',
  };
}
