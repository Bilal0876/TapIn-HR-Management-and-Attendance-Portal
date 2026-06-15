import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { createError } from '../lib/errors';
import { issueAccessToken, issueRefreshToken, verifyRefreshToken } from './tokenService';
import { RegisterCompanyInput } from '../dtos/auth.dto';

export class AuthService {
  static async registerCompany(data: RegisterCompanyInput) {
    const existingEmployee = await prisma.employee.findUnique({ where: { email: data.adminEmail } });
    if (existingEmployee) {
      throw createError.Conflict('An account with this email already exists', 'EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 12);

    const { admin } = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          timezone: data.timezone,
          workMinutesPerDay: 480, // Default 8 hours
        },
      });

      const admin = await tx.employee.create({
        data: {
          companyId: company.id,
          name: data.adminName,
          email: data.adminEmail,
          passwordHash,
          role: 'SUPER_ADMIN', // The first user is always a Super Admin
          mustChangePassword: false,
        },
      });

      return { company, admin };
    });

    // Auto-login the newly created Super Admin
    return this.login(admin.email, data.adminPassword);
  }

  static async login(email: string, passwordPlain: string) {
    const employee = await prisma.employee.findUnique({ where: { email } });
    
    if (!employee || !employee.isActive) {
      throw createError.Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check for lockout
    const emp = employee as any;
    if (emp.lockoutUntil && emp.lockoutUntil > new Date()) {
      const waitMins = Math.ceil((emp.lockoutUntil.getTime() - Date.now()) / 60000);
      throw createError.Forbidden(`Account locked due to too many failed attempts. Try again in ${waitMins} minutes.`, 'ACCOUNT_LOCKED');
    }

    const isValid = await bcrypt.compare(passwordPlain, employee.passwordHash);
    
    if (!isValid) {
      const failedAttempts = (emp.failedLoginAttempts || 0) + 1;
      let lockoutUntil: Date | null = null;
      
      if (failedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes lockout
      }

      await prisma.employee.update({
        where: { id: employee.id },
        data: { failedLoginAttempts: failedAttempts, lockoutUntil } as any
      });

      throw createError.Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Success - Reset lockout fields
    await prisma.employee.update({
      where: { id: employee.id },
      data: { failedLoginAttempts: 0, lockoutUntil: null } as any
    });

    const tokenPayload = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenPayload).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        employeeId: employee.id,
        tokenHash,
        expiresAt,
      },
    });

    const accessToken = issueAccessToken(employee.id, employee.role);
    const refreshToken = issueRefreshToken(employee.id, tokenPayload);

    const refreshedEmployee = await prisma.employee.findUnique({
      where: { id: employee.id },
      include: { profile: true, company: true }
    });

    return {
      accessToken,
      refreshToken,
      employee: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        companyId: employee.companyId,
        mustChangePassword: employee.mustChangePassword,
        employeeCode: refreshedEmployee?.profile?.employeeCode,
        designation: refreshedEmployee?.profile?.designation,
        department: refreshedEmployee?.profile?.department,
        company: refreshedEmployee?.company ? {
          name: refreshedEmployee.company.name,
          timezone: refreshedEmployee.company.timezone
        } : undefined
      },
    };
  }
  
  static async refresh(refreshTokenRaw: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenRaw) as any;
    } catch (e) {
      throw createError.Unauthorized('Invalid refresh token', 'INVALID_TOKEN');
    }

    const { sub, hash } = payload;
    const tokenHash = crypto.createHash('sha256').update(hash).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw createError.Unauthorized('Refresh token expired or invalid', 'INVALID_TOKEN');
    }

    const employee = await prisma.employee.findUnique({ where: { id: sub } });
    if (!employee || !employee.isActive) {
      throw createError.Unauthorized('Account disabled', 'INVALID_CREDENTIALS');
    }

    // Rotate refresh token
    const newTokenPayload = crypto.randomBytes(32).toString('hex');
    const newTokenHash = crypto.createHash('sha256').update(newTokenPayload).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: { employeeId: sub, tokenHash: newTokenHash, expiresAt },
      }),
    ]);

    return {
      accessToken: issueAccessToken(sub, employee.role),
      refreshToken: issueRefreshToken(sub, newTokenPayload),
    };
  }

  static async logout(refreshTokenRaw: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenRaw) as any;
      const tokenHash = crypto.createHash('sha256').update(payload.hash).digest('hex');
      await prisma.refreshToken.deleteMany({ where: { tokenHash } });
    } catch (e) {
      // Ignored during logout
    }
  }

  static async changePassword(employeeId: string, newPasswordRaw: string, oldPasswordRaw?: string) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      throw createError.NotFound('Employee not found');
    }

    if (!employee.mustChangePassword) {
      if (!oldPasswordRaw) {
        throw createError.BadRequest('Old password is required', 'MISSING_OLD_PASSWORD');
      }
      const isValid = await bcrypt.compare(oldPasswordRaw, employee.passwordHash);
      if (!isValid) {
        throw createError.Unauthorized('Invalid old password', 'INVALID_CREDENTIALS');
      }
    }

    const newHash = await bcrypt.hash(newPasswordRaw, 12);
    await prisma.employee.update({
      where: { id: employeeId },
      data: { passwordHash: newHash, mustChangePassword: false },
    });
  }

  static async updatePushToken(employeeId: string, pushToken: string) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { pushToken },
    });
  }
}
