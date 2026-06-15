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

export const RegisterCompanySchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  adminName: z.string().min(1, 'Admin Name is required'),
  adminEmail: z.string().email('Invalid email format').endsWith('.com', 'Email must end with .com'),
  adminPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type PushTokenInput = z.infer<typeof PushTokenSchema>;
export type RegisterCompanyInput = z.infer<typeof RegisterCompanySchema>;
