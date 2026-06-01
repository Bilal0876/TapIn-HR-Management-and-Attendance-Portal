import { prisma } from '../../lib/prisma';
import { CorrectionStatus, LeaveType } from '@prisma/client';

export class LeaveService {
  static async createRequest(employeeId: string, data: { type: string, startDate: Date, endDate: Date, reason: string }) {
    return prisma.leaveRequest.create({
      data: {
        employeeId,
        type: data.type as LeaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      },
    });
  }

  static async getEmployeeLeaves(employeeId: string) {
    return prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPendingLeaves(companyId: string) {
    return prisma.leaveRequest.findMany({
      where: {
        status: CorrectionStatus.PENDING,
        employee: { companyId },
      },
      include: {
        employee: {
          select: { name: true, profile: { select: { employeeCode: true, department: true } } }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async reviewRequest(adminId: string, requestId: string, data: { status: string, reviewNote?: string }) {
    return prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: data.status as CorrectionStatus,
        reviewNote: data.reviewNote,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }
}
