import { z } from 'zod';

export const RequestCorrectionSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  requestedCheckin: z.string().datetime().optional(),
  requestedCheckout: z.string().datetime().optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const ReviewCorrectionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().optional(),
});

export type RequestCorrectionInput = z.infer<typeof RequestCorrectionSchema>;
export type ReviewCorrectionInput = z.infer<typeof ReviewCorrectionSchema>;
