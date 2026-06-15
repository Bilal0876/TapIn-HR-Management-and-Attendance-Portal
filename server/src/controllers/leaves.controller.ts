import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leaves.service';

export class LeaveController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const { type, startDate, endDate, reason } = req.body;
      const result = await LeaveService.createRequest(employeeId, {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      });
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getMyLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = (req as any).employee.id;
      const result = await LeaveService.getEmployeeLeaves(employeeId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getAdminPending(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await LeaveService.getPendingLeaves(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async review(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = (req as any).employee.id;
      const result = await LeaveService.reviewRequest(adminId, id, req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
