import { prisma } from '../../lib/prisma';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, eachDayOfInterval, format, formatDistanceToNow } from 'date-fns';
import { AttendanceStatus } from '@prisma/client';

export class AnalyticsService {
  /**
   * Get company-wide stats for admin dashboard
   */
  static async getCompanyStats(companyId: string) {
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);

    const [
      totalEmployees,
      todayRecords,
      weeklySummaries
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId, isActive: true } }),
      prisma.attendanceRecord.findMany({
        where: { 
          employee: { companyId },
          date: today
        }
      }),
      prisma.dailySummary.findMany({
        where: {
          attendanceRecord: { employee: { companyId } },
          date: { gte: sevenDaysAgo }
        }
      })
    ]);

    // Calculate status distribution for today
    const presentCount = todayRecords.length;
    const stats = {
      overallAttendance: totalEmployees > 0 ? (presentCount / totalEmployees) * 100 : 0,
      present: presentCount,
      total: totalEmployees,
      avgWorkHours: weeklySummaries.length > 0 
        ? (weeklySummaries.reduce((acc, s) => acc + s.totalWorkMinutes, 0) / (weeklySummaries.length * 60)).toFixed(1)
        : 0
    };

    return stats;
  }

  static async getCompanyTrend(companyId: string, days: number = 7) {
    const safeDays = Math.max(1, Math.min(days, 31));
    const today = startOfDay(new Date());
    const startDate = startOfDay(subDays(today, safeDays - 1));
    const endDate = endOfDay(today);

    const [totalEmployees, records, summaries] = await Promise.all([
      prisma.employee.count({ where: { companyId, isActive: true } }),
      prisma.attendanceRecord.findMany({
        where: {
          employee: { companyId },
          date: { gte: startDate, lte: endDate },
        },
        select: { date: true },
      }),
      prisma.dailySummary.findMany({
        where: {
          attendanceRecord: { employee: { companyId } },
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
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const [employees, records] = await Promise.all([
      prisma.employee.findMany({
        where: { companyId, isActive: true },
        select: { id: true, name: true, profile: { select: { designation: true } } }
      }),
      prisma.attendanceRecord.findMany({
        where: {
          employee: { companyId },
          date: dayStart
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
      let color = '#94A3B8';

      if (record) {
        checkin = record.checkinTime ? format(record.checkinTime, 'hh:mm a') : '--:--';
        checkout = record.checkoutTime ? format(record.checkoutTime, 'hh:mm a') : '--:--';
        
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
        color
      };
    });
  }

  /**
   * Get recent activity for admin pulse feed
   */
  static async getCompanyPulse(companyId: string) {
    const today = startOfDay(new Date());

    const records = await prisma.attendanceRecord.findMany({
      where: { 
        employee: { companyId },
        updatedAt: { gte: today }
      },
      include: { employee: true },
      orderBy: { updatedAt: 'desc' },
      take: 15
    });

    return records.map(r => {
      let action = 'Activity';
      let icon = 'eye-outline';
      let color = '#64748B';

      if (r.status === AttendanceStatus.PENDING) {
        action = 'Checked-in';
        icon = 'enter-outline';
        color = '#1DB8A0';
      } else if (r.status === AttendanceStatus.COMPLETE) {
        action = 'Checked-out';
        icon = 'exit-outline';
        color = '#6366F1';
      } else if (r.status === AttendanceStatus.FLAGGED) {
        action = 'System Flagged';
        icon = 'warning-outline';
        color = '#EF4444';
      }

      return {
        name: r.employee.name,
        action,
        time: format(r.updatedAt, 'hh:mm a'),
        icon,
        color
      };
    });
  }
}
