import { prisma } from '../../lib/prisma';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, eachDayOfInterval, format, formatDistanceToNow } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { AttendanceStatus } from '@prisma/client';

export class AnalyticsService {
  static async getCompanyStats(companyId: string) {
    const company = await prisma.company.findUnique({
       where: { id: companyId },
       select: { timezone: true }
    });
    
    if (!company) return { overallAttendance: 0, present: 0, total: 0, absent: 0, late: 0, avgWorkHours: 0 };

    const now = new Date();
    const tz = company.timezone || 'Asia/Karachi';
    let todayStr: string;
    try {
      todayStr = formatInTimeZone(now, tz, 'yyyy-MM-dd');
    } catch (e) {
      todayStr = now.toISOString().split('T')[0];
    }
    // Build an exact Date object by parsing the local date string (no time component)
    // This avoids any UTC/local shift that would cause Prisma to match wrong rows
    const todayDate = new Date(todayStr);
    const sevenDaysAgo = subDays(todayDate, 7);

    const [
      totalEmployees,
      todayRecords,
      weeklySummaries
    ] = await Promise.all([
      prisma.employee.count({ 
        where: { 
          companyId, 
          isActive: true,
          role: { not: 'SUPER_ADMIN' }
        } 
      }),
      prisma.attendanceRecord.findMany({
        where: { 
          employee: { 
            companyId,
            role: { not: 'SUPER_ADMIN' }
          },
          // Use explicit string comparison to bypass any Prisma date interpretation issue
          date: { equals: todayDate }
        },
        include: { dailySummary: true }
      }),
      prisma.dailySummary.findMany({
        where: {
          attendanceRecord: { 
            employee: { 
              companyId,
              role: { not: 'SUPER_ADMIN' }
            } 
          },
          date: { gte: sevenDaysAgo }
        }
      })
    ]);

    // Calculate status distribution for today
    const presentCount = todayRecords.length;
    const lateCount = todayRecords.filter(r => r.dailySummary && r.dailySummary.lateMinutes > 0).length;
    
    const stats = {
      overallAttendance: totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0,
      present: presentCount,
      total: totalEmployees,
      absent: Math.max(0, totalEmployees - presentCount),
      late: lateCount,
      avgWorkHours: weeklySummaries.length > 0 
        ? (weeklySummaries.reduce((acc, s) => acc + s.totalWorkMinutes, 0) / (weeklySummaries.length * 60)).toFixed(1)
        : 0
    };

    return stats;
  }

  static async getCompanyTrend(companyId: string, days: number = 7) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { timezone: true } });
    if (!company) return { trend: [], latestOnTimeRate: 0, onTimeDelta: 0 };

    const safeDays = Math.max(1, Math.min(days, 31));
    const now = new Date();
    const tz = company.timezone || 'Asia/Karachi';
    let today: Date;
    try {
      const localDateStr = formatInTimeZone(now, tz, 'yyyy-MM-dd');
      today = new Date(`${localDateStr}T00:00:00Z`);
    } catch (e) {
      today = startOfDay(now);
    }
    const startDate = startOfDay(subDays(today, safeDays - 1));
    const endDate = endOfDay(today);

    const [totalEmployees, records, summaries] = await Promise.all([
      prisma.employee.count({ 
        where: { 
          companyId, 
          isActive: true,
          role: { not: 'SUPER_ADMIN' }
        } 
      }),
      prisma.attendanceRecord.findMany({
        where: {
          employee: { 
            companyId,
            role: { not: 'SUPER_ADMIN' }
          },
          date: { gte: startDate, lte: endDate },
        },
        select: { date: true },
      }),
      prisma.dailySummary.findMany({
        where: {
          attendanceRecord: { 
            employee: { 
              companyId,
              role: { not: 'SUPER_ADMIN' }
            } 
          },
          date: { gte: startDate, lte: endDate },
        },
        select: { date: true, lateMinutes: true, totalWorkMinutes: true },
      }),
    ]);

    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    const recordsByDate = new Map<string, number>();
    const onTimeByDate = new Map<string, { onTime: number; total: number; workMinutes: number }>();

    for (const record of records) {
      const key = format(record.date, 'yyyy-MM-dd');
      recordsByDate.set(key, (recordsByDate.get(key) || 0) + 1);
    }

    for (const summary of summaries) {
      const key = format(summary.date, 'yyyy-MM-dd');
      const current = onTimeByDate.get(key) || { onTime: 0, total: 0, workMinutes: 0 };
      current.total += 1;
      current.workMinutes += summary.totalWorkMinutes;
      if (summary.lateMinutes === 0) current.onTime += 1;
      onTimeByDate.set(key, current);
    }

    const trend = dateRange.map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const present = recordsByDate.get(key) || 0;
      const summary = onTimeByDate.get(key) || { onTime: 0, total: 0, workMinutes: 0 };
      const attendanceRate = totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;
      const onTimeRate = summary.total > 0 ? Math.round((summary.onTime / summary.total) * 100) : 0;
      const avgWorkHours = summary.total > 0 ? Number((summary.workMinutes / summary.total / 60).toFixed(1)) : 0;

      return {
        date: key,
        dayLabel: format(date, 'EEE'),
        attendanceRate,
        onTimeRate,
        present,
        total: totalEmployees,
        avgWorkHours,
      };
    });

    const latest = trend[trend.length - 1];
    const previous = trend.length > 1 ? trend[trend.length - 2] : latest;

    return {
      trend,
      latestOnTimeRate: latest?.onTimeRate || 0,
      onTimeDelta: (latest?.onTimeRate || 0) - (previous?.onTimeRate || 0),
    };
  }

  /**
   * Get personalized stats for employee
   */
  static async getPersonalStats(employeeId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [summaries, allRecords] = await Promise.all([
      prisma.dailySummary.findMany({
        where: { employeeId, date: { gte: monthStart, lte: monthEnd } }
      }),
      prisma.attendanceRecord.findMany({
        where: { employeeId },
        orderBy: { date: 'desc' },
        take: 30
      })
    ]);

    const totalMinutes = summaries.reduce((acc, s) => acc + s.totalWorkMinutes, 0);
    const lateDays = summaries.filter(s => s.lateMinutes > 0).length;
    const totalDays = summaries.length;

    const leavesTaken = await prisma.leaveRequest.count({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { gte: monthStart, lte: monthEnd }
      }
    });

    // Simple streak calculation
    let streak = 0;
    for (const record of allRecords) {
      if (record.status === AttendanceStatus.COMPLETE) streak++;
      else break;
    }

    return {
       onTimeRate: totalDays > 0 ? Math.round(((totalDays - lateDays) / totalDays) * 100) : 0,
       avgWorkHours: totalDays > 0 ? (totalMinutes / 60 / totalDays).toFixed(1) : '0.0',
       leavesTaken,
       streak,
       totalHours: (totalMinutes / 60).toFixed(1),
       daysPresent: totalDays,
    };
  }

  /**
   * Get detailed daily logs for specific date
   */
  static async getDailyLogs(companyId: string, date: Date) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { timezone: true } });
    const tz = company?.timezone || 'Asia/Karachi';
    
    // Exact date matching: match only the DATE part
    const dateStr = formatInTimeZone(date, tz, 'yyyy-MM-dd');
    const startOfTargetDay = new Date(dateStr);

    const [employees, records] = await Promise.all([
      prisma.employee.findMany({
        where: { 
          companyId, 
          isActive: true,
          role: { not: 'SUPER_ADMIN' }
        },
        select: { id: true, name: true, profile: { select: { designation: true } } }
      }),
      prisma.attendanceRecord.findMany({
        where: {
          employee: { 
            companyId,
            role: { not: 'SUPER_ADMIN' }
          },
          date: startOfTargetDay
        },
        include: {
          dailySummary: true
        }
      })
    ]);

    return employees.map(emp => {
      const record = records.find(r => r.employeeId === emp.id);
      let status = 'ABSENT';
      let checkin = '--:--';
      let checkout = '--:--';
      let checkinAt = '';
      let checkoutAt = '';
      let color = '#94A3B8';

      if (record) {
        checkin = record.checkinTime ? format(record.checkinTime, 'hh:mm a') : '--:--';
        checkout = record.checkoutTime ? format(record.checkoutTime, 'hh:mm a') : '--:--';
        checkinAt = record.checkinTime?.toISOString() || '';
        checkoutAt = record.checkoutTime?.toISOString() || '';
        
        if (record.status === 'PENDING') {
          status = 'PRESENT';
          color = '#1DB8A0';
        } else if (record.dailySummary && record.dailySummary.lateMinutes > 0) {
          status = 'LATE';
          color = '#F59E0B';
        } else if (record.status === 'COMPLETE') {
          status = 'ON-TIME';
          color = '#10B981';
        }
      }

      return {
        id: emp.id,
        name: emp.name,
        designation: emp.profile?.designation || 'Staff',
        status,
        checkin,
        checkout,
        checkinAt,
        checkoutAt,
        checkinLat: (record as any)?.checkinLat ?? null,
        checkinLng: (record as any)?.checkinLng ?? null,
        checkinAccuracy: (record as any)?.checkinAccuracy ?? null,
        checkoutLat: (record as any)?.checkoutLat ?? null,
        checkoutLng: (record as any)?.checkoutLng ?? null,
        checkoutAccuracy: (record as any)?.checkoutAccuracy ?? null,
        color
      };
    });
  }

  /**
   * Get recent activity for admin pulse feed
   */
  static async getCompanyPulse(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { timezone: true } });
    if (!company) return [];

    const now = new Date();
    let today: Date;
    try {
      const localDateStr = formatInTimeZone(now, company.timezone || 'Asia/Karachi', 'yyyy-MM-dd');
      today = new Date(`${localDateStr}T00:00:00Z`);
    } catch (e) {
      today = startOfDay(now);
    }

    const logs = await prisma.activityLog.findMany({
      where: { 
        companyId,
        createdAt: { gte: today }
      },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return logs.map(l => ({
      name: l.employee.name,
      action: l.action,
      time: format(l.createdAt, 'hh:mm a'),
      icon: l.icon || 'eye-outline',
      color: l.color || '#64748B',
      lat: l.lat,
      lng: l.lng,
      accuracy: (l as any).accuracy,
      companyId: l.companyId
    }));
  }
}
