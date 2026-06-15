import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { AnalyticsService } from '../services/analytics.service';

export class AttendanceController {
  static async getCompanyShiftSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await AttendanceService.getCompanyShiftSettings(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await AttendanceService.getCompanyProfile(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async updateCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const { name, timezone } = req.body;
      const result = await AttendanceService.updateCompanyProfile(companyId, name, timezone);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async updateCompanyShiftSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await AttendanceService.updateCompanyShiftSettings(companyId, req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async checkin(req: Request, res: Response, next: NextFunction) {
    try {
      const { time, lat, lng, accuracy } = req.body;
      const employeeId = (req as any).employee.id;
      const parsedTime = time ? new Date(time) : undefined;
      const result = await AttendanceService.checkin(employeeId, parsedTime, lat, lng, accuracy);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { time, lat, lng, accuracy } = req.body;
      const employeeId = (req as any).employee.id;
      const parsedTime = time ? new Date(time) : undefined;
      const result = await AttendanceService.checkout(employeeId, parsedTime, lat, lng, accuracy);
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

  static async getCompanyPulse(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await AnalyticsService.getCompanyPulse(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getDailyLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const result = await AnalyticsService.getDailyLogs(companyId, date);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async adminUpdateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const { id } = req.params;
      const { checkinTime, checkoutTime, status } = req.body;

      const result = await AttendanceService.adminUpdateRecord(companyId, id, {
        checkinTime: checkinTime ? new Date(checkinTime) : undefined,
        checkoutTime: checkoutTime ? new Date(checkoutTime) : undefined,
        status,
      });

      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
