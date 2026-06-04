import { Request, Response, NextFunction } from 'express';
import { ShiftProfileService } from './shifts.service';

export class ShiftProfileController {
  static async getCompanyShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await ShiftProfileService.getCompanyShifts(companyId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async createShiftProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = (req as any).employee;
      const result = await ShiftProfileService.createShiftProfile(companyId, req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async updateShiftProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { companyId } = (req as any).employee;
      const result = await ShiftProfileService.updateShiftProfile(id, companyId, req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async deleteShiftProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { companyId } = (req as any).employee;
      await ShiftProfileService.deleteShiftProfile(id, companyId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
