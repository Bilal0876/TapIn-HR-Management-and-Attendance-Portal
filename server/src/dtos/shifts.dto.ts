export interface CreateShiftProfileInput {
  name: string;
  workMinutesPerDay: number;
  breakMinutesAllocated: number;
  gracePeriodMinutes: number;
  expectedCheckinHour: number;
  expectedCheckinMinute: number;
  isDefault?: boolean;
}

export interface UpdateShiftProfileInput {
  name?: string;
  workMinutesPerDay?: number;
  breakMinutesAllocated?: number;
  gracePeriodMinutes?: number;
  expectedCheckinHour?: number;
  expectedCheckinMinute?: number;
  isDefault?: boolean;
}
