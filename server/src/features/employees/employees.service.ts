import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { createError } from '../../lib/errors';
import { CreateEmployeeInput } from '../../schemas/employee.schemas';

export class EmployeeService {
  static async createEmployee(adminId: string, data: CreateEmployeeInput) {
    const admin = await prisma.employee.findUnique({ where: { id: adminId } });
    
    // Safety check (middleware should handle this, but let's be sure)
    if (admin?.role !== Role.ADMIN && admin?.role !== Role.SUPER_ADMIN) {
      throw createError.Forbidden('Insufficient permissions');
    }

    const existing = await prisma.employee.findUnique({ where: { email: data.email } });
    if (existing) {
      throw createError.Conflict('Email already in use');
    }

    const existingCode = await prisma.employeeProfile.findUnique({ where: { employeeCode: data.employeeCode } });
    if (existingCode) {
      throw createError.Conflict('Employee code already in use');
    }

    // Default password is 'Password123!' (must change on first login)
    const passwordHash = await bcrypt.hash('Password123!', 12);

    return prisma.employee.create({
      data: {
        companyId: admin.companyId,
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        mustChangePassword: true,
        profile: {
          create: {
            employeeCode: data.employeeCode,
            designation: data.designation,
            department: data.department,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          }
        }
      },
      include: { profile: true }
    });
  }

  static async getAllEmployees(companyId: string) {
    return prisma.employee.findMany({
      where: { companyId },
      include: { profile: true },
      orderBy: { name: 'asc' }
    });
  }

  static async getEmployeeById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: { profile: true, attendanceRecords: { take: 5, orderBy: { date: 'desc' } } }
    });
  }

  static async deactivateEmployee(id: string) {
    return prisma.employee.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
