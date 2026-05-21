import { Request, Response } from 'express';
import { correctionService } from './correction.service';

export const correctionController = {
  async requestCorrection(req: Request, res: Response) {
    try {
      const { recordId, requestedCheckin, requestedCheckout, reason } = req.body;
      const result = await correctionService.createRequest(
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
      res.status(400).json({ message: e.message });
    }
  },

  async getMyRequests(req: Request, res: Response) {
    try {
      const results = await correctionService.listUserRequests((req as any).employee.id);
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  },

  async getPendingRequests(req: Request, res: Response) {
    try {
      const results = await correctionService.listPendingRequests();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  },

  async reviewRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, reviewNote } = req.body;
      const result = await correctionService.reviewRequest(id, (req as any).employee.id, status, reviewNote);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }
};
