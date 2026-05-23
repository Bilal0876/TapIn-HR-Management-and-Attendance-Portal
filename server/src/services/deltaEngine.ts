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
  const expectedCheckin = new Date(localCheckin);
  expectedCheckin.setHours(expectedCheckinHour, expectedCheckinMinute, 0, 0);

  const minutesPastExpected = differenceInMinutes(localCheckin, expectedCheckin);
  const lateMinutes = Math.max(0, minutesPastExpected - gracePeriodMinutes);

  const totalOnSiteMinutes = differenceInMinutes(checkoutTime, checkinTime);

  const totalBreakMinutes = breakSessions.reduce(
    (sum, b) => sum + differenceInMinutes(b.endTime, b.startTime),
    0
  );

  const totalWorkMinutes = totalOnSiteMinutes - totalBreakMinutes;

  const workDeltaMinutes = totalWorkMinutes - workMinutesPerDay;

  let breakDeltaMinutes = breakMinutesAllocated - totalBreakMinutes;
  
  // Apply grace period: if they overran their break, forgive up to `gracePeriodMinutes`
  if (breakDeltaMinutes < 0) {
    const overrun = Math.abs(breakDeltaMinutes);
    const penalty = Math.max(0, overrun - gracePeriodMinutes);
    breakDeltaMinutes = -penalty;
  }

  const netDeltaMinutes = workDeltaMinutes + breakDeltaMinutes;

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
