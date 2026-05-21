import { Request, Response, NextFunction } from 'express';
import { createError } from '../lib/errors';
import { Role } from '@prisma/client';

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const employee = (req as any).employee;
  if (!employee) {
    return next(createError.Unauthorized('Authentication required', 'UNAUTHORIZED'));
  }

  if (employee.role !== Role.SUPER_ADMIN) {
    return next(createError.Forbidden('Super Admin access required', 'INSUFFICIENT_ROLE'));
  }

  next();
};
