import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { AnalyticsService } from './analytics.service';
import { prisma } from '../../lib/prisma';
import { createError } from '../../lib/errors';

export class AttendanceController {
  static async getCompanyShiftSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
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

      res.json({
        shiftStart,
        shiftEnd,
        breakMinutesAllocated: company.breakMinutesAllocated,
        gracePeriodMinutes: company.gracePeriodMinutes,
        workMinutesPerDay: company.workMinutesPerDay,
      });
    } catch (e) {
      next(e);
    }
  }

  static async updateCompanyShiftSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const { shiftStart, shiftEnd, breakMinutesAllocated, gracePeriodMinutes } = req.body as {
        shiftStart: string;
        shiftEnd: string;
        breakMinutesAllocated?: number;
        gracePeriodMinutes?: number;
      };

      const parseTime = (value: string) => {
        const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value || '');
        if (!match) return null;
        return { hour: Number(match[1]), minute: Number(match[2]) };
      };

      const start = parseTime(shiftStart);
      const end = parseTime(shiftEnd);
      if (!start || !end) {
        throw createError.BadRequest('Shift start/end must be in HH:mm format');
      }

      const breakMins = Math.max(0, Number(breakMinutesAllocated ?? 60));
      const graceMins = Math.max(0, Number(gracePeriodMinutes ?? 10));

      const startTotal = start.hour * 60 + start.minute;
      let endTotal = end.hour * 60 + end.minute;
      if (endTotal <= startTotal) endTotal += 24 * 60;
      const totalShiftMinutes = endTotal - startTotal;
      const workMinutesPerDay = totalShiftMinutes - breakMins;
      if (workMinutesPerDay <= 0) {
        throw createError.BadRequest('Shift duration must be greater than break minutes');
      }

      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          expectedCheckinHour: start.hour,
          expectedCheckinMinute: start.minute,
          workMinutesPerDay,
          breakMinutesAllocated: breakMins,
          gracePeriodMinutes: graceMins,
        },
      });

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  static async checkin(req: Request, res: Response, next: NextFunction) {
    try {
      const { time } = req.body;
      const employeeId = (req as any).employee.id;
      const parsedTime = time ? new Date(time) : undefined;
      const result = await AttendanceService.checkin(employeeId, parsedTime);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { time } = req.body;
      const employeeId = (req as any).employee.id;
      const parsedTime = time ? new Date(time) : undefined;
      const result = await AttendanceService.checkout(employeeId, parsedTime);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getToday(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const result = await AttendanceService.getToday(employeeId);
      res.json({ record: result || null });
    } catch (e) {
      next(e);
    }
  }

  static async startBreak(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const result = await AttendanceService.startBreak(employeeId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async endBreak(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const result = await AttendanceService.endBreak(employeeId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const result = await AttendanceService.getHistory(employeeId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getPersonalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const result = await AnalyticsService.getPersonalStats(employeeId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getCompanyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await AnalyticsService.getCompanyStats(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getCompanyTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const days = Number(req.query.days || 7);
      const result = await AnalyticsService.getCompanyTrend(companyId, days);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
