import { AttendanceStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createError } from '../../lib/errors';
import { calculateDelta, resolveConfig } from '../../services/deltaEngine';
import { toZonedTime } from 'date-fns-tz';
import { emitToCompany } from '../../lib/socket';
import { UpdateShiftSettingsInput } from './attendance.dto';

export class AttendanceService {
  /**
   * Get formatted company shift settings
   */
  static async getCompanyShiftSettings(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw createError.NotFound('Company not found');

    const shiftStart = `${String(company.expectedCheckinHour).padStart(2, '0')}:${String(
      company.expectedCheckinMinute
    ).padStart(2, '0')}`;
    const totalShiftMinutes = company.workMinutesPerDay + company.breakMinutesAllocated;
    const endMinutes = company.expectedCheckinHour * 60 + company.expectedCheckinMinute + totalShiftMinutes;
    const endHour = Math.floor((endMinutes % (24 * 60)) / 60);
    const endMinute = endMinutes % 60;
    const shiftEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    return {
      shiftStart,
      shiftEnd,
      breakMinutesAllocated: company.breakMinutesAllocated,
      gracePeriodMinutes: company.gracePeriodMinutes,
      workMinutesPerDay: company.workMinutesPerDay,
    };
  }

  /**
   * Update company shift settings
   */
  static async updateCompanyShiftSettings(companyId: string, input: UpdateShiftSettingsInput) {
    const parseTime = (value: string) => {
      const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value || '');
      if (!match) return null;
      return { hour: Number(match[1]), minute: Number(match[2]) };
    };

    const start = parseTime(input.shiftStart);
    const end = parseTime(input.shiftEnd);
    if (!start || !end) {
      throw createError.BadRequest('Shift start/end must be in HH:mm format');
    }

    const breakMins = Math.max(0, Number(input.breakMinutesAllocated ?? 60));
    const graceMins = Math.max(0, Number(input.gracePeriodMinutes ?? 10));

    const startTotal = start.hour * 60 + start.minute;
    let endTotal = end.hour * 60 + end.minute;
    if (endTotal <= startTotal) endTotal += 24 * 60;
    const totalShiftMinutes = endTotal - startTotal;
    const workMinutesPerDay = totalShiftMinutes - breakMins;
    if (workMinutesPerDay <= 0) {
      throw createError.BadRequest('Shift duration must be greater than break minutes');
    }

    return prisma.company.update({
      where: { id: companyId },
      data: {
        expectedCheckinHour: start.hour,
        expectedCheckinMinute: start.minute,
        workMinutesPerDay,
        breakMinutesAllocated: breakMins,
        gracePeriodMinutes: graceMins,
      },
    });
  }

  /**
   * Get public company profile
   */
  static async getCompanyProfile(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        timezone: true,
        createdAt: true,
      }
    });
    if (!company) throw createError.NotFound('Company not found');
    return company;
  }

  /**
   * Update core company profile info
   */
  static async updateCompanyProfile(companyId: string, name: string, timezone: string) {
    return prisma.company.update({
      where: { id: companyId },
      data: { name, timezone }
    });
  }

  static async checkin(employeeId: string, time?: Date) {
    const checkinTime = time || new Date();
    
    // Make sure we get the correct "date" context by checking the timezone logic. Wait, simple check: date is today.
    // For simplicity we create the date based on UTC today for the Prisma DB Date.
    const dateStr = checkinTime.toISOString().split('T')[0];
    const date = new Date(dateStr);

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw createError.NotFound('Employee not found');
    if (employee.role === 'SUPER_ADMIN') {
      throw createError.Forbidden('Super Admins do not participate in attendance tracking');
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });

    if (existing) {
      throw createError.Conflict('Already checked in today', 'ALREADY_CHECKED_IN');
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId,
        date,
        checkinTime,
        status: AttendanceStatus.PENDING,
      },
      include: { employee: true }
    });

    await prisma.activityLog.create({
      data: {
        companyId: record.employee.companyId,
        employeeId: record.employeeId,
        action: 'Checked-in',
        icon: 'enter-outline',
        color: '#1DB8A0',
      }
    });

    emitToCompany(record.employee.companyId, 'activity:pulse', {
      name: record.employee.name,
      action: 'Checked-in',
      time: 'Just now',
      icon: 'enter-outline',
      color: '#1DB8A0',
      companyId: record.employee.companyId,
    });

    emitToCompany(record.employee.companyId, 'stats:update', {});

    return record;
  }

  static async checkout(employeeId: string, time?: Date) {
    const checkoutTime = time || new Date();
    const dateStr = checkoutTime.toISOString().split('T')[0];
    const date = new Date(dateStr);

    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
      include: {
        breakSessions: true,
        employee: {
          include: {
            company: true,
            profile: true,
            shiftProfile: true,
          },
        },
      } as any,
    });

    if (!record) {
      throw createError.NotFound('No check-in record found for today', 'NOT_CHECKED_IN');
    }

    if (record.status !== AttendanceStatus.PENDING && record.status !== AttendanceStatus.FLAGGED) {
      throw createError.Conflict('Already checked out today', 'ALREADY_CHECKED_OUT');
    }

    const openBreak = (record as any).breakSessions.find((b: any) => b.endTime === null);
    if (openBreak) {
      throw createError.Conflict('You have an active break. End it before checking out.', 'BREAK_STILL_ACTIVE');
    }

    const companyConfig = {
      timezone: (record as any).employee.company.timezone,
      workMinutesPerDay: (record as any).employee.company.workMinutesPerDay ?? undefined,
      breakMinutesAllocated: (record as any).employee.company.breakMinutesAllocated ?? undefined,
      gracePeriodMinutes: (record as any).employee.company.gracePeriodMinutes ?? undefined,
      expectedCheckinHour: (record as any).employee.company.expectedCheckinHour ?? undefined,
      expectedCheckinMinute: (record as any).employee.company.expectedCheckinMinute ?? undefined,
    };

    const finalConfig = resolveConfig(companyConfig, ((record as any).employee.shiftProfile as any) || {});

    const breaks = (record as any).breakSessions.map((b: any) => ({
      startTime: b.startTime,
      endTime: b.endTime!,
    }));

    const delta = calculateDelta(record.checkinTime, checkoutTime, breaks, finalConfig);

    return prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.attendanceRecord.update({
        where: { id: record.id },
        data: {
          checkoutTime,
          status: AttendanceStatus.COMPLETE,
        },
      });

      const dailySummary = await tx.dailySummary.create({
        data: {
          attendanceRecord: { connect: { id: record.id } },
          employeeId,
          date,
          checkinTime: record.checkinTime,
          checkoutTime,
          ...delta,
          // Guard against NaN values from deltaEngine
          lateMinutes: isNaN(delta.lateMinutes) ? 0 : delta.lateMinutes,
          workDeltaMinutes: isNaN(delta.workDeltaMinutes) ? 0 : delta.workDeltaMinutes,
          breakDeltaMinutes: isNaN(delta.breakDeltaMinutes) ? 0 : delta.breakDeltaMinutes,
          netDeltaMinutes: isNaN(delta.netDeltaMinutes) ? 0 : delta.netDeltaMinutes,
        },
      });

      const result = { record: updatedRecord, summary: dailySummary };

      await tx.activityLog.create({
        data: {
          companyId: (record as any).employee.companyId,
          employeeId: record.employeeId,
          action: 'Checked-out',
          icon: 'exit-outline',
          color: '#6366F1',
        }
      });

      emitToCompany((record as any).employee.companyId, 'activity:pulse', {
        name: (record as any).employee.name,
        action: 'Checked-out',
        time: 'Just now',
        icon: 'exit-outline',
        color: '#6366F1',
        companyId: (record as any).employee.companyId,
      });

      emitToCompany((record as any).employee.companyId, 'stats:update', {});

      return result;
    });
  }

  static async getToday(employeeId: string) {
    const dateStr = new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
      include: {
        breakSessions: true,
        dailySummary: true,
        employee: {
          include: { company: true, profile: true }
        }
      },
    });

    if (!record) {
      // Find employee to get company schedule even if not checked in
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { company: true, profile: true }
      });
      if (!employee) return null;
      
      const config = resolveConfig(employee.company as any, (employee.profile as any) || {});
      return { 
        status: 'IDLE' as any,
        config: {
          expectedCheckin: `${config.expectedCheckinHour.toString().padStart(2, '0')}:${config.expectedCheckinMinute.toString().padStart(2, '0')}`,
          expectedWorkMinutes: config.workMinutesPerDay,
          timezone: config.timezone
        }
      };
    }

    const config = resolveConfig(record.employee.company as any, (record.employee.profile as any) || {});
    
    return {
      ...record,
      config: {
        expectedCheckin: `${config.expectedCheckinHour.toString().padStart(2, '0')}:${config.expectedCheckinMinute.toString().padStart(2, '0')}`,
        expectedWorkMinutes: config.workMinutesPerDay,
        timezone: config.timezone
      }
    };
  }

  static async getStats(employeeId: string) {
    const summaries = await prisma.dailySummary.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
      take: 30
    });

    const leaves = await prisma.leaveRequest.count({
      where: { 
        employeeId, 
        status: 'APPROVED',
        startDate: { gte: new Date(new Date().getFullYear(), 0, 1) }
      }
    });

    if (summaries.length === 0) {
      return {
        onTimeRate: 100,
        avgWorkMinutes: 0,
        leavesTaken: leaves,
        totalDays: 0
      };
    }

    const onTimeCount = summaries.filter(s => s.lateMinutes === 0).length;
    const totalWorkMinutes = summaries.reduce((sum, s) => sum + s.totalWorkMinutes, 0);

    return {
      onTimeRate: Math.round((onTimeCount / summaries.length) * 100),
      avgWorkMinutes: Math.round(totalWorkMinutes / summaries.length),
      leavesTaken: leaves,
      totalDays: summaries.length
    };
  }

  static async startBreak(employeeId: string) {
    const dateStr = new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
      include: { breakSessions: true },
    });

    if (!record) {
      throw createError.BadRequest('Must check in before starting a break', 'NOT_CHECKED_IN');
    }

    if (record.checkoutTime) {
      throw createError.BadRequest('Cannot start a break after check-out', 'ALREADY_CHECKED_OUT');
    }

    const activeBreak = record.breakSessions.find((b) => !b.endTime);
    if (activeBreak) {
      throw createError.Conflict('You already have an active break', 'BREAK_STILL_ACTIVE');
    }

    const breakSess = await prisma.breakSession.create({
      data: {
        attendanceRecordId: record.id,
        employeeId: employeeId,
        startTime: new Date(),
      },
      include: { employee: true }
    });

    await prisma.activityLog.create({
      data: {
        companyId: breakSess.employee.companyId,
        employeeId: breakSess.employeeId,
        action: 'Took a break',
        icon: 'cafe-outline',
        color: '#F59E0B',
      }
    });

    emitToCompany(breakSess.employee.companyId, 'activity:pulse', {
      name: breakSess.employee.name,
      action: 'Took a break',
      time: 'Just now',
      icon: 'cafe-outline',
      color: '#F59E0B',
      companyId: breakSess.employee.companyId,
    });

    emitToCompany(breakSess.employee.companyId, 'stats:update', {});

    return breakSess;
  }

  static async endBreak(employeeId: string) {
    const dateStr = new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
      include: { breakSessions: true },
    });

    if (!record) {
      throw createError.BadRequest('No check-in record found for today', 'NOT_CHECKED_IN');
    }

    const activeBreak = record.breakSessions.find((b) => !b.endTime);
    if (!activeBreak) {
      throw createError.NotFound('No active break found to end', 'NO_ACTIVE_BREAK');
    }

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - activeBreak.startTime.getTime()) / (1000 * 60)
    );

    const updatedBreak = await prisma.breakSession.update({
      where: { id: activeBreak.id },
      data: {
        endTime,
        durationMinutes,
      },
      include: { employee: true }
    });

    await prisma.activityLog.create({
      data: {
        companyId: updatedBreak.employee.companyId,
        employeeId: updatedBreak.employeeId,
        action: 'Back from break',
        icon: 'walk-outline',
        color: '#10B981',
      }
    });

    emitToCompany(updatedBreak.employee.companyId, 'activity:pulse', {
      name: updatedBreak.employee.name,
      action: 'Back from break',
      time: 'Just now',
      icon: 'walk-outline',
      color: '#10B981',
      companyId: updatedBreak.employee.companyId,
    });

    emitToCompany(updatedBreak.employee.companyId, 'stats:update', {});

    return updatedBreak;
  }

  static async getHistory(employeeId: string, limit: number = 30) {
    return prisma.attendanceRecord.findMany({
      where: { employeeId },
      include: {
        dailySummary: true,
        breakSessions: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  static async adminUpdateRecord(companyId: string, recordId: string, data: { checkinTime?: Date, checkoutTime?: Date, status?: AttendanceStatus }) {
    const record = await prisma.attendanceRecord.findFirst({
      where: { id: recordId, employee: { companyId } },
      include: {
        breakSessions: true,
        employee: {
          include: {
            company: true,
            shiftProfile: true,
          },
        },
      } as any,
    });

    if (!record) throw createError.NotFound('Attendance record not found');

    const updateData: any = { ...data };
    
    // If times are changing, we need to recalculate metrics
    const newCheckin = data.checkinTime || record.checkinTime;
    const newCheckout = data.checkoutTime || record.checkoutTime;

    return prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.attendanceRecord.update({
        where: { id: recordId },
        data: updateData,
      });

      if (newCheckin && newCheckout) {
        const companyConfig = {
          timezone: (record as any).employee.company.timezone,
          workMinutesPerDay: (record as any).employee.company.workMinutesPerDay ?? undefined,
          breakMinutesAllocated: (record as any).employee.company.breakMinutesAllocated ?? undefined,
          gracePeriodMinutes: (record as any).employee.company.gracePeriodMinutes ?? undefined,
          expectedCheckinHour: (record as any).employee.company.expectedCheckinHour ?? undefined,
          expectedCheckinMinute: (record as any).employee.company.expectedCheckinMinute ?? undefined,
        };

        const finalConfig = resolveConfig(companyConfig, ((record as any).employee.shiftProfile as any) || {});
        
        const breaks = (record as any).breakSessions.map((b: any) => ({
          startTime: b.startTime,
          endTime: b.endTime || new Date(),
        }));

        const delta = calculateDelta(newCheckin, newCheckout, breaks, finalConfig);

        await tx.dailySummary.upsert({
          where: { attendanceRecordId: recordId },
          create: {
            attendanceRecordId: recordId,
            employeeId: record.employeeId,
            date: record.date,
            checkinTime: newCheckin,
            checkoutTime: newCheckout,
            ...delta,
          },
          update: {
            checkinTime: newCheckin,
            checkoutTime: newCheckout,
            ...delta,
          },
        });
      }

      emitToCompany(companyId, 'stats:update', {});
      return updatedRecord;
    });
  }
}
