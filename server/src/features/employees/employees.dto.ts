import { z } from 'zod';
import { Role } from '@prisma/client';

export const CreateEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
  designation: z.string().optional(),
  department: z.string().optional(),
  password: z.string().min(6).optional(),
  employeeCode: z.string().min(2).optional(),
  joiningDate: z.string().datetime().optional(), // Or string date
  shiftProfileId: z.string().optional(),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
