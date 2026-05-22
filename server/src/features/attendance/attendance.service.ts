import { AttendanceStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createError } from '../../lib/errors';
import { calculateDelta, resolveConfig } from '../../services/deltaEngine';
import { toZonedTime } from 'date-fns-tz';

export class AttendanceService {
  static async checkin(employeeId: string, time?: Date) {
    const checkinTime = time || new Date();
    
    // Make sure we get the correct "date" context by checking the timezone logic. Wait, simple check: date is today.
    // For simplicity we create the date based on UTC today for the Prisma DB Date.
    const dateStr = checkinTime.toISOString().split('T')[0];
    const date = new Date(dateStr);

    const existing = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });

    if (existing) {
      throw createError.Conflict('Already checked in today', 'ALREADY_CHECKED_IN');
    }

    return prisma.attendanceRecord.create({
      data: {
        employeeId,
        date,
        checkinTime,
        status: AttendanceStatus.PENDING,
      },
    });
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
          },
        },
      },
    });

    if (!record) {
      throw createError.NotFound('No check-in record found for today', 'NOT_CHECKED_IN');
    }

    if (record.status !== AttendanceStatus.PENDING && record.status !== AttendanceStatus.FLAGGED) {
      throw createError.Conflict('Already checked out today', 'ALREADY_CHECKED_OUT');
    }

    const openBreak = record.breakSessions.find((b) => b.endTime === null);
    if (openBreak) {
      throw createError.Conflict('You have an active break. End it before checking out.', 'BREAK_STILL_ACTIVE');
    }

    const companyConfig = {
      timezone: record.employee.company.timezone,
      workMinutesPerDay: record.employee.company.workMinutesPerDay ?? undefined,
      breakMinutesAllocated: record.employee.company.breakMinutesAllocated ?? undefined,
      gracePeriodMinutes: record.employee.company.gracePeriodMinutes ?? undefined,
      expectedCheckinHour: record.employee.company.expectedCheckinHour ?? undefined,
      expectedCheckinMinute: record.employee.company.expectedCheckinMinute ?? undefined,
    };

    const finalConfig = resolveConfig(companyConfig, (record.employee.profile as any) || {});

    const breaks = record.breakSessions.map((b) => ({
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
          attendanceRecordId: record.id,
          employeeId,
          date,
          checkinTime: record.checkinTime,
          checkoutTime,
          ...delta,
        },
      });

      return { record: updatedRecord, summary: dailySummary };
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
      },
    });

    return record;
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

    return prisma.breakSession.create({
      data: {
        attendanceRecordId: record.id,
        employeeId: employeeId,
        startTime: new Date(),
      },
    });
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

    return prisma.breakSession.update({
      where: { id: activeBreak.id },
      data: {
        endTime,
        durationMinutes,
      },
    });
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
}
