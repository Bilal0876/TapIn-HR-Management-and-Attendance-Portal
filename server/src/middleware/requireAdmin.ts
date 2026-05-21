import { Request, Response, NextFunction } from 'express';
import { createError } from '../lib/errors';
import { Role } from '@prisma/client';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const employee = (req as any).employee;
  if (!employee) {
    return next(createError.Unauthorized('Authentication required', 'UNAUTHORIZED'));
  }

  if (employee.role !== Role.ADMIN && employee.role !== Role.SUPER_ADMIN) {
    return next(createError.Forbidden('Admin access required', 'INSUFFICIENT_ROLE'));
  }

  next();
};
