import { calculateDelta, CompanyConfig } from './deltaEngine';

const baseConfig: CompanyConfig = {
  timezone: 'Asia/Karachi',
  workMinutesPerDay: 480,
  breakMinutesAllocated: 60,
  gracePeriodMinutes: 10,
  expectedCheckinHour: 9,
  expectedCheckinMinute: 0,
};

const d = (h: number, m = 0) =>
  new Date(`2025-05-13T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:00`);

describe('calculateDelta', () => {
  test('perfect day — on time, full break, full hours', () => {
    const result = calculateDelta(d(9), d(18), [{ startTime: d(13), endTime: d(14) }], baseConfig);
    expect(result.lateMinutes).toBe(0);
    expect(result.totalWorkMinutes).toBe(480);
    expect(result.totalBreakMinutes).toBe(60);
    expect(result.netDeltaMinutes).toBe(0);
  });

  test('within grace period — not counted as late', () => {
    const result = calculateDelta(d(9, 8), d(18, 8), [{ startTime: d(13), endTime: d(14) }], baseConfig);
    expect(result.lateMinutes).toBe(0);
    expect(result.netDeltaMinutes).toBe(0);
  });

  test('just past grace period — late counted correctly', () => {
    const result = calculateDelta(d(9, 14), d(18), [{ startTime: d(13), endTime: d(14) }], baseConfig);
    expect(result.lateMinutes).toBe(4);
    expect(result.totalWorkMinutes).toBe(466);
    expect(result.netDeltaMinutes).toBe(-14);
  });

  test('early break return — credited', () => {
    const result = calculateDelta(d(9), d(18), [{ startTime: d(13), endTime: d(13, 45) }], baseConfig);
    expect(result.totalBreakMinutes).toBe(45);
    expect(result.breakDeltaMinutes).toBe(15);
    expect(result.netDeltaMinutes).toBe(+30);
  });

  test('overran break — deducted', () => {
    const result = calculateDelta(d(9), d(18), [{ startTime: d(13), endTime: d(14, 20) }], baseConfig);
    expect(result.totalBreakMinutes).toBe(80);
    expect(result.breakDeltaMinutes).toBe(-10);
    expect(result.netDeltaMinutes).toBe(-30);
  });

  test('stayed late — overtime credited', () => {
    const result = calculateDelta(d(9), d(18, 30), [{ startTime: d(13), endTime: d(14) }], baseConfig);
    expect(result.workDeltaMinutes).toBe(30);
    expect(result.netDeltaMinutes).toBe(+30);
  });

  test('no break taken — full break allocation credited', () => {
    const result = calculateDelta(d(9), d(18), [], baseConfig);
    expect(result.totalBreakMinutes).toBe(0);
    expect(result.breakDeltaMinutes).toBe(60);
    expect(result.netDeltaMinutes).toBe(+120);
  });

  test('multiple breaks — summed correctly', () => {
    const result = calculateDelta(d(9), d(18), [
      { startTime: d(11), endTime: d(11, 15) },
      { startTime: d(14), endTime: d(14, 30) },
    ], baseConfig);
    expect(result.totalBreakMinutes).toBe(45);
    expect(result.breakDeltaMinutes).toBe(15);
  });

  test('arrived late AND compensated with overtime — net correct', () => {
    const result = calculateDelta(d(9, 20), d(18, 20), [{ startTime: d(13), endTime: d(14) }], baseConfig);
    expect(result.lateMinutes).toBe(0);
    expect(result.totalWorkMinutes).toBe(480);
    expect(result.netDeltaMinutes).toBe(0);
  });
});
