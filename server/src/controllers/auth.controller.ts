import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async registerCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerCompany(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (e) {
      next(e);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      const employeeId = (req as any).employee.id;
      await AuthService.changePassword(employeeId, newPassword, oldPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (e) {
      next(e);
    }
  }

  static async updatePushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { pushToken } = req.body;
      const employeeId = (req as any).employee.id;
      await AuthService.updatePushToken(employeeId, pushToken);
      res.json({ message: 'Token registered' });
    } catch (e) {
      next(e);
    }
  }
}
