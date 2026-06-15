import { prisma } from '../lib/prisma';
import { CorrectionStatus } from '@prisma/client';
import { NotificationService } from './notificationService';
import { format } from 'date-fns';

export class CorrectionService {
  static async createRequest(employeeId: string, recordId: string, data: { requestedCheckin?: Date, requestedCheckout?: Date, reason: string }) {
    // Basic check: Record must belong to employee
    const record = await prisma.attendanceRecord.findFirst({
      where: { id: recordId, employeeId }
    });

    if (!record) throw new Error('Attendance record not found');

    return prisma.correctionRequest.create({
      data: {
        employeeId,
        attendanceRecordId: recordId,
        originalCheckin: record.checkinTime,
        originalCheckout: record.checkoutTime,
        requestedCheckin: data.requestedCheckin,
        requestedCheckout: data.requestedCheckout,
        reason: data.reason,
        status: CorrectionStatus.PENDING
      }
    });
  }

  static async listUserRequests(employeeId: string) {
    return prisma.correctionRequest.findMany({
      where: { employeeId },
      include: { attendanceRecord: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async listPendingRequests() {
    return prisma.correctionRequest.findMany({
      where: { status: CorrectionStatus.PENDING },
      include: { 
        employee: { 
          select: { id: true, name: true, email: true, profile: true } 
        },
        attendanceRecord: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async reviewRequest(requestId: string, adminId: string, status: CorrectionStatus, reviewNote?: string) {
    const request = await prisma.correctionRequest.findUnique({
      where: { id: requestId },
      include: { attendanceRecord: true }
    });

    if (!request) throw new Error('Request not found');

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.correctionRequest.update({
        where: { id: requestId },
        data: {
          status,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          reviewNote
        }
      });

      if (status === CorrectionStatus.APPROVED) {
        await tx.attendanceRecord.update({
          where: { id: request.attendanceRecordId },
          data: {
            checkinTime: request.requestedCheckin || request.originalCheckin,
            checkoutTime: request.requestedCheckout || request.originalCheckout,
            status: 'COMPLETE' 
          }
        });
      }

      return updatedRequest;
    });

    const dateStr = format(request.attendanceRecord.date, 'MMM dd');
    if (status === 'APPROVED' || status === 'REJECTED') {
      NotificationService.notifyCorrectionReviewed(request.employeeId, status, dateStr).catch(() => {});
    }

    return result;
  }
}
