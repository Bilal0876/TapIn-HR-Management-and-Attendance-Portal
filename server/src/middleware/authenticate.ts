import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/tokenService';
import { createError } from '../lib/errors';
import { prisma } from '../lib/prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError.Unauthorized('Missing or invalid token', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token) as any;
    } catch (e) {
      throw createError.Unauthorized('Invalid or expired token', 'UNAUTHORIZED');
    }

    const employee = await prisma.employee.findUnique({
      where: { id: payload.sub },
    });

    if (!employee || !employee.isActive) {
      throw createError.Unauthorized('Account disabled or not found', 'UNAUTHORIZED');
    }

    (req as any).employee = employee;
    next();
  } catch (e) {
    next(e);
  }
};
