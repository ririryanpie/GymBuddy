import { describe, expect, it } from 'vitest';
import { buildSuggestions, evaluateMainLift, getAccessorySuggestion, getPullupTarget } from '../src/logic/progression';
import { WorkoutLogRow } from '../src/types';

const makeRow = (exercise: any, reps: number, weightKg: number, note?: string): WorkoutLogRow => ({
  workoutId: 'w1',
  dateTime: new Date().toISOString(),
  sessionType: 'A',
  exercise,
  reps,
  weightKg,
  isWarmup: false,
  multiplier: 1,
  setIndex: 1,
  completed: true,
  note,
});

describe('progression rules', () => {
  it('increments squat only when complete and good form', () => {
    const rows = [makeRow('squat', 5, 100), makeRow('squat', 5, 100), makeRow('squat', 5, 100)];
    expect(evaluateMainLift(rows, 'squat', 'good')).toBe(102.5);
    expect(evaluateMainLift(rows, 'squat', 'ok')).toBe(100);
  });

  it('pullups increase by +1 only when controlled', () => {
    const rows = [makeRow('pullups', 6, 0), makeRow('pullups', 5, 0), makeRow('pullups', 4, 0)];
    expect(getPullupTarget(rows, false)).toBe(15);
    expect(getPullupTarget(rows, true)).toBe(16);
  });

  it('accessory double progression bumps load and resets reps to range min', () => {
    const rows = [makeRow('incline_db_bench', 10, 30), makeRow('incline_db_bench', 10, 30), makeRow('incline_db_bench', 10, 30)];
    const next = getAccessorySuggestion(rows, 'incline_db_bench');
    expect(next.weightKg).toBe(32.5);
    expect(next.targetReps).toBe(8);
  });

  it('coach override can reduce lift and add pullup delta', () => {
    const rows = [makeRow('deadlift', 3, 120), makeRow('deadlift', 3, 120), makeRow('deadlift', 3, 120)];
    const s = buildSuggestions(rows, { deadlift: 'good' }, true, { liftOverrides: { deadlift: { action: 'reduce', valueKg: 5 } }, pullup: { delta: 1 }, accessoryAdjustments: {} });
    expect(s.find((x) => x.exercise === 'deadlift')?.suggestedWeightKg).toBe(120);
    expect(s.find((x) => x.exercise === 'pullups')?.targetTotalReps).toBe(16);
  });
});
