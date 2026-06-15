import { z } from 'zod';

export const LeaveTypeSchema = z.enum(['SICK', 'CASUAL', 'VACATION', 'OTHER']);

export const CreateLeaveRequestSchema = z.object({
  type: LeaveTypeSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(5),
});

export const ReviewLeaveRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().optional(),
});
