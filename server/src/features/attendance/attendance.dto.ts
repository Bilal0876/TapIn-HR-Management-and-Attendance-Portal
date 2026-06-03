import { z } from 'zod';

export const CheckinSchema = z.object({
  time: z.string().datetime().optional(),
});

export const CheckoutSchema = z.object({
  time: z.string().datetime().optional(),
});

export const UpdateShiftSettingsSchema = z.object({
  shiftStart: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm format'),
  shiftEnd: z.string().regex(/^([01]?\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm format'),
  breakMinutesAllocated: z.number().min(0).optional(),
  gracePeriodMinutes: z.number().min(0).optional(),
});

export type UpdateShiftSettingsInput = z.infer<typeof UpdateShiftSettingsSchema>;
