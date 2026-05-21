import { Request, Response, NextFunction } from 'express';
import { createError } from '../lib/errors';

export const requirePasswordChanged = (req: Request, res: Response, next: NextFunction) => {
  const employee = (req as any).employee;
  if (!employee) {
    return next(createError.Unauthorized('Authentication required', 'UNAUTHORIZED'));
  }

  if (employee.mustChangePassword) {
    return next(createError.Forbidden('You must change your password before proceeding', 'MUST_CHANGE_PASSWORD'));
  }

  next();
};
