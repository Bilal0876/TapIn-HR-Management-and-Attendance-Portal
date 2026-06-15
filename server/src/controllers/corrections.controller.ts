import { Request, Response, NextFunction } from 'express';
import { CorrectionService } from '../services/corrections.service';

export class CorrectionController {
  static async requestCorrection(req: Request, res: Response, next: NextFunction) {
    try {
      const { recordId, requestedCheckin, requestedCheckout, reason } = req.body;
      const result = await CorrectionService.createRequest(
        (req as any).employee.id, 
        recordId, 
        { 
          requestedCheckin: requestedCheckin ? new Date(requestedCheckin) : undefined, 
          requestedCheckout: requestedCheckout ? new Date(requestedCheckout) : undefined, 
          reason 
        }
      );
      res.json(result);
    } catch (e: any) {
      next(e);
    }
  }

  static async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await CorrectionService.listUserRequests((req as any).employee.id);
      res.json(results);
    } catch (e: any) {
      next(e);
    }
  }

  static async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await CorrectionService.listPendingRequests();
      res.json(results);
    } catch (e: any) {
      next(e);
    }
  }

  static async reviewRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, reviewNote } = req.body;
      const result = await CorrectionService.reviewRequest(id, (req as any).employee.id, status, reviewNote);
      res.json(result);
    } catch (e: any) {
      next(e);
    }
  }
}
