import { z } from 'zod';

export const CheckinSchema = z.object({
  time: z.string().datetime().optional(), 
});

export const CheckoutSchema = z.object({
  time: z.string().datetime().optional(),
});
