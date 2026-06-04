import { prisma } from '../../lib/prisma';
import { createError } from '../../lib/errors';
import { CreateShiftProfileInput, UpdateShiftProfileInput } from './shifts.dto';

export class ShiftProfileService {
  static async getCompanyShifts(companyId: string) {
    return (prisma as any).shiftProfile.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async createShiftProfile(companyId: string, input: CreateShiftProfileInput) {
    // If this is set as default, unset other defaults for this company
    if (input.isDefault) {
      await (prisma as any).shiftProfile.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return (prisma as any).shiftProfile.create({
      data: {
        ...input,
        companyId,
      },
    });
  }

  static async updateShiftProfile(id: string, companyId: string, input: UpdateShiftProfileInput) {
    const shift = await (prisma as any).shiftProfile.findFirst({
      where: { id, companyId },
    });

    if (!shift) throw createError.NotFound('Shift profile not found');

    if (input.isDefault) {
      await (prisma as any).shiftProfile.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return (prisma as any).shiftProfile.update({
      where: { id },
      data: input,
    });
  }

  static async deleteShiftProfile(id: string, companyId: string) {
    const shift = await (prisma as any).shiftProfile.findFirst({
      where: { id, companyId },
      include: { _count: { select: { employees: true } } },
    });

    if (!shift) throw createError.NotFound('Shift profile not found');
    if (shift._count.employees > 0) {
      throw createError.BadRequest('Cannot delete shift profile assigned to employees');
    }

    return (prisma as any).shiftProfile.delete({
      where: { id },
    });
  }
}
