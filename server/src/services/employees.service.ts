import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { createError } from '../lib/errors';
import { CreateEmployeeInput } from '../dtos/employees.dto';

export class EmployeeService {
  private static normalizeSegment(input?: string, fallback: string = 'GEN') {
    const cleaned = (input || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return (cleaned.slice(0, 3) || fallback).padEnd(3, 'X');
  }

  private static async generateEmployeeCode(companyId: string, department?: string, designation?: string) {
    const dept = this.normalizeSegment(department, 'GEN');
    const role = this.normalizeSegment(designation, 'EMP');
    const base = `${dept}-${role}`;

    const existing = await prisma.employeeProfile.findMany({
      where: {
        employee: { companyId },
        employeeCode: { startsWith: `${base}-` },
      },
      select: { employeeCode: true },
      orderBy: { employeeCode: 'asc' },
    });

    let max = 0;
    for (const row of existing) {
      const parts = row.employeeCode.split('-');
      const last = parts[parts.length - 1];
      const seq = Number(last);
      if (!Number.isNaN(seq)) {
        max = Math.max(max, seq);
      }
    }

    return `${base}-${String(max + 1).padStart(3, '0')}`;
  }

  static async suggestEmployeeCode(adminId: string, department?: string, designation?: string) {
    const admin = await prisma.employee.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw createError.NotFound('Admin not found');
    }
    return this.generateEmployeeCode(admin.companyId, department, designation);
  }

  static async createEmployee(adminId: string, data: CreateEmployeeInput) {
    const admin = await prisma.employee.findUnique({ where: { id: adminId } });
    
    // Safety check
    if (admin?.role !== Role.ADMIN && admin?.role !== Role.SUPER_ADMIN) {
      throw createError.Forbidden('Insufficient permissions');
    }

    const existing = await prisma.employee.findUnique({ where: { email: data.email } });
    if (existing) {
      throw createError.Conflict('Email already in use');
    }

    let employeeCode = data.employeeCode;
    if (!employeeCode) {
      employeeCode = await this.generateEmployeeCode(admin.companyId, data.department, data.designation);
    } else {
      const existingCode = await prisma.employeeProfile.findUnique({ where: { employeeCode } });
      if (existingCode) {
        throw createError.Conflict('Employee code already in use');
      }
    }

    // Admin-set initial password
    const passwordHash = await bcrypt.hash(data.password || 'Password123!', 12);

    const employee = await prisma.employee.create({
      data: {
        companyId: admin.companyId,
        email: data.email,
        name: data.name,
        role: data.role === Role.SUPER_ADMIN ? Role.EMPLOYEE : data.role,
        shiftProfileId: data.shiftProfileId || null,
        passwordHash,
        mustChangePassword: true,
        profile: {
          create: {
            employeeCode,
            designation: data.designation,
            department: data.department,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          }
        }
      } as any,
      include: { profile: true }
    });

    // Broadcast update to all connected clients in the company
    const { emitToCompany } = require('../lib/socket');
    emitToCompany(admin.companyId, 'staff:updated', { 
      type: 'CREATED', 
      employee: { id: employee.id, name: employee.name } 
    });

    return employee;
  }

  static async getAllEmployees(companyId: string) {
    return prisma.employee.findMany({
      where: { companyId, isActive: true },
      include: { profile: true },
      orderBy: { name: 'asc' }
    });
  }

  static async getEmployeeById(companyId: string, id: string) {
    return prisma.employee.findFirst({
      where: { id, companyId },
      include: { profile: true, attendanceRecords: { take: 5, orderBy: { date: 'desc' } } }
    });
  }

  static async toggleEmployeeStatus(adminId: string, id: string) {
    const admin = await prisma.employee.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw createError.NotFound('Admin not found');
    }

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw createError.NotFound('Employee not found');
    }

    if (employee.role === 'SUPER_ADMIN') {
      throw createError.Forbidden('Super Admin status cannot be modified');
    }

    if (adminId === id) {
      throw createError.BadRequest('You cannot modify your own status');
    }

    return prisma.employee.update({
      where: { id },
      data: { isActive: !employee.isActive },
    });
  }

  static async deactivateEmployee(adminId: string, id: string) {
    return this.toggleEmployeeStatus(adminId, id);
  }
}
