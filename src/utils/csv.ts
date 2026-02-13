import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WorkoutLogRow } from '../types';

const headers = ['DateTime', 'Exercise', 'Reps', 'WeightKg', 'DurationSec', 'DistanceM', 'Incline', 'Resistance', 'IsWarmup', 'Note', 'Multiplier'];

export function toCsv(rows: WorkoutLogRow[]): string {
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.dateTime,
      r.exercise,
      r.reps ?? '',
      r.weightKg ?? '',
      r.durationSec ?? '',
      r.distanceM ?? '',
      r.incline ?? '',
      r.resistance ?? '',
      r.isWarmup ? 'true' : 'false',
      (r.note ?? '').replaceAll(',', ';'),
      r.multiplier,
    ].join(','));
  }
  return lines.join('\n');
}

export function parseCsv(input: string): WorkoutLogRow[] {
  const [header, ...lines] = input.trim().split(/\r?\n/);
  if (header !== headers.join(',')) throw new Error('Invalid CSV header order.');
  return lines.filter(Boolean).map((line, idx) => {
    const [dateTime, exercise, reps, weightKg, durationSec, distanceM, incline, resistance, isWarmup, note, multiplier] = line.split(',');
    return {
      workoutId: `import-pending-${idx}`,
      dateTime,
      sessionType: 'A',
      exercise: exercise as WorkoutLogRow['exercise'],
      reps: reps ? Number(reps) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      durationSec: durationSec ? Number(durationSec) : undefined,
      distanceM: distanceM ? Number(distanceM) : undefined,
      incline: incline ? Number(incline) : undefined,
      resistance: resistance ? Number(resistance) : undefined,
      isWarmup: isWarmup === 'true',
      note: note || undefined,
      multiplier: Number(multiplier) || 0,
      setIndex: idx + 1,
      completed: true,
    };
  });
}

export async function exportCsv(rows: WorkoutLogRow[]) {
  const csv = toCsv(rows);
  const uri = FileSystem.documentDirectory + 'gymbuddy_logs.csv';
  await FileSystem.writeAsStringAsync(uri, csv);
  await Sharing.shareAsync(uri);
}
