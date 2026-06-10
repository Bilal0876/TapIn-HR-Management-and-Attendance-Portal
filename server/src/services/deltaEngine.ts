import { differenceInMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export interface BreakSessionInput {
  startTime: Date;
  endTime: Date;
}

export interface CompanyConfig {
  timezone: string;
  workMinutesPerDay: number;
  breakMinutesAllocated: number;
  gracePeriodMinutes: number;
  expectedCheckinHour: number;
  expectedCheckinMinute: number;
}

export function resolveConfig(
  company: CompanyConfig,
  profileOverrides: Partial<
    Pick<
      CompanyConfig,
      | 'workMinutesPerDay'
      | 'breakMinutesAllocated'
      | 'expectedCheckinHour'
      | 'expectedCheckinMinute'
    >
  >
): CompanyConfig {
  return {
    ...company,
    ...Object.fromEntries(Object.entries(profileOverrides).filter(([, v]) => v != null)),
  };
}

export interface DeltaResult {
  totalOnSiteMinutes: number;
  totalBreakMinutes: number;
  totalWorkMinutes: number;
  expectedWorkMinutes: number;
  expectedBreakMinutes: number;
  lateMinutes: number;
  workDeltaMinutes: number;
  breakDeltaMinutes: number;
  netDeltaMinutes: number;
}

export function calculateDelta(
  checkinTime: Date,
  checkoutTime: Date,
  breakSessions: BreakSessionInput[],
  config: CompanyConfig
): DeltaResult {
  const {
    timezone,
    workMinutesPerDay,
    breakMinutesAllocated,
    gracePeriodMinutes,
    expectedCheckinHour,
    expectedCheckinMinute,
  } = config;

  const localCheckin = toZonedTime(checkinTime, timezone);

  // Build expectedCheckin as the same calendar date as localCheckin but at the expected time
  const expectedCheckin = toZonedTime(checkinTime, timezone);
  expectedCheckin.setHours(expectedCheckinHour, expectedCheckinMinute, 0, 0);

  const minutesPastExpected = differenceInMinutes(localCheckin, expectedCheckin);
  const rawLateMinutes = isNaN(minutesPastExpected)
    ? 0
    : Math.max(0, minutesPastExpected - gracePeriodMinutes);

  const totalOnSiteMinutes = differenceInMinutes(checkoutTime, checkinTime);

  const totalBreakMinutes = breakSessions.reduce(
    (sum, b) => sum + differenceInMinutes(b.endTime, b.startTime),
    0
  );

  // Goodwill Logic: Deduction is capped at allocated break minutes.
  // If they take an extra long break, we only deduct the allocated amount.
  // If they take a shorter break, they get the surplus work time.
  const actualDeduction = Math.min(totalBreakMinutes, breakMinutesAllocated);

  const totalWorkMinutes = totalOnSiteMinutes - actualDeduction;

  const workDeltaMinutes = totalWorkMinutes - workMinutesPerDay;

  const lateMinutes = rawLateMinutes;

  const breakDeltaMinutes = breakMinutesAllocated - totalBreakMinutes;

  const netDeltaMinutes = workDeltaMinutes;

  return {
    totalOnSiteMinutes,
    totalBreakMinutes,
    totalWorkMinutes,
    expectedWorkMinutes: workMinutesPerDay,
    expectedBreakMinutes: breakMinutesAllocated,
    lateMinutes,
    workDeltaMinutes,
    breakDeltaMinutes,
    netDeltaMinutes,
  };
}
