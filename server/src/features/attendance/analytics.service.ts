import { prisma } from '../../lib/prisma';
import { startOfMonth, endOfMonth, subDays, startOfDay } from 'date-fns';
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
}
