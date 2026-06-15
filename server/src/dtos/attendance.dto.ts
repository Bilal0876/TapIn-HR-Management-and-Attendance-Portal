import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const CheckinSchema = z.object({
  time: z.string().datetime().optional(),
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
});

export const CheckoutSchema = z.object({
  time: z.string().datetime().optional(),
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
});

export const UpdateShiftSettingsSchema = z.object({
  shiftStart: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm format'),
  shiftEnd: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm format'),
  breakMinutesAllocated: z.number().min(0).optional(),
  gracePeriodMinutes: z.number().min(0).optional(),
});

export const AdminUpdateRecordSchema = z.object({
  checkinTime: z.string().datetime().optional(),
  checkoutTime: z.string().datetime().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
});

export const UpdateCompanyProfileSchema = z.object({
  name: z.string().min(2, 'Company name too short'),
  timezone: z.string().min(1, 'Timezone is required'),
});

export type UpdateShiftSettingsInput = z.infer<typeof UpdateShiftSettingsSchema>;
export type UpdateCompanyProfileInput = z.infer<typeof UpdateCompanyProfileSchema>;
