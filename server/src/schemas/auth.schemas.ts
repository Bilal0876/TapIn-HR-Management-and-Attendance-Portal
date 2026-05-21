import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().optional(), // optional for the force-reset flow
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const PushTokenSchema = z.object({
  pushToken: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type PushTokenInput = z.infer<typeof PushTokenSchema>;
