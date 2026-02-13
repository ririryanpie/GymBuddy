import { endOfMonth, endOfWeek, isWithinInterval, startOfMonth, startOfWeek } from 'date-fns';
import { WorkoutLogRow } from '../types';

export const epley = (weight: number, reps: number) => weight * (1 + reps / 30);

export function computeWeeklySummary(rows: WorkoutLogRow[], now = new Date()) {
  const interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  const inWeek = rows.filter((r) => isWithinInterval(new Date(r.dateTime), interval));
  const sessionCount = new Set(inWeek.map((r) => r.workoutId)).size;
  const tonnage = inWeek.reduce((sum, r) => sum + (r.weightKg ?? 0) * (r.reps ?? 0) * r.multiplier, 0);
  const main = inWeek.filter((r) => ['squat', 'bench', 'deadlift', 'ohp'].includes(r.exercise) && !r.isWarmup);
  const e1rm = main.reduce<Record<string, number>>((acc, r) => {
    if (r.weightKg && r.reps) {
      acc[r.exercise] = Math.max(acc[r.exercise] ?? 0, epley(r.weightKg, r.reps));
    }
    return acc;
  }, {});
  const pullTotal = inWeek.filter((r) => r.exercise === 'pullups' && !r.isWarmup).reduce((a, r) => a + (r.reps ?? 0), 0);
  const painFlags = inWeek.filter((r) => r.note?.toLowerCase().includes('pain') || r.note?.toLowerCase().includes('tight')).length;
  return { sessionCount, tonnage, e1rm, pullTotal, painFlags };
}

export function computeMonthlySummary(rows: WorkoutLogRow[], now = new Date()) {
  const interval = { start: startOfMonth(now), end: endOfMonth(now) };
  const inMonth = rows.filter((r) => isWithinInterval(new Date(r.dateTime), interval));
  const prs = inMonth.reduce<Record<string, number>>((acc, r) => {
    if (r.weightKg) acc[r.exercise] = Math.max(acc[r.exercise] ?? 0, r.weightKg);
    return acc;
  }, {});
  const days = new Set(inMonth.map((r) => r.dateTime.slice(0, 10))).size;
  const adherence = Math.min(100, Math.round((days / 12) * 100));
  return { prs, consistencyDays: days, adherence };
}
