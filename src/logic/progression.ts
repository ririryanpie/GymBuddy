import { APP_CONFIG } from '../config/program';
import { CoachOverride, ExerciseKey, ExerciseSuggestion, FormQuality, SessionType, WorkoutLogRow } from '../types';

type LiftKey = 'squat' | 'bench' | 'deadlift' | 'ohp';

const mainLifts: LiftKey[] = ['squat', 'bench', 'deadlift', 'ohp'];

const workingCriteria: Record<LiftKey, { sets: number; reps: number; increment: number }> = {
  squat: { sets: 3, reps: 5, increment: APP_CONFIG.increments.squat },
  bench: { sets: 3, reps: 5, increment: APP_CONFIG.increments.bench },
  deadlift: { sets: 3, reps: 3, increment: APP_CONFIG.increments.deadlift },
  ohp: { sets: 3, reps: 5, increment: APP_CONFIG.increments.ohp },
};

const accessoryRanges: Partial<Record<ExerciseKey, [number, number]>> = {
  incline_db_bench: [8, 10],
  db_row: [8, 10],
  lateral_raise: [8, 12],
  barbell_curl: [8, 12],
  skullcrusher: [8, 12],
};

export const getNextSessionType = (last?: SessionType): SessionType => (last === 'A' ? 'B' : 'A');

function lastWorkingSets(rows: WorkoutLogRow[], exercise: ExerciseKey, count: number) {
  return rows.filter((r) => r.exercise === exercise && !r.isWarmup && r.completed).slice(0, count).reverse();
}

export function evaluateMainLift(rows: WorkoutLogRow[], lift: LiftKey, form: FormQuality = 'ok'): number | undefined {
  const liftRows = lastWorkingSets(rows, lift, 3);
  if (!liftRows.length) return undefined;
  const lastWeight = liftRows[liftRows.length - 1].weightKg;
  if (lastWeight == null) return undefined;
  const { sets, reps, increment } = workingCriteria[lift];
  const complete = liftRows.length >= sets && liftRows.every((r) => (r.reps ?? 0) >= reps);
  if (!complete) return lastWeight;
  if (form === 'good') return Number((lastWeight + increment).toFixed(2));
  return lastWeight;
}

export function getPullupTarget(rows: WorkoutLogRow[], controlled = false): number {
  const pullRows = lastWorkingSets(rows, 'pullups', 3);
  if (!pullRows.length) return 15;
  const total = pullRows.reduce((acc, r) => acc + (r.reps ?? 0), 0);
  return controlled ? total + 1 : total;
}

export function getAccessorySuggestion(rows: WorkoutLogRow[], exercise: ExerciseKey): { weightKg?: number; targetReps?: number } {
  const range = accessoryRanges[exercise];
  if (!range) return {};
  const [min, max] = range;
  const exerciseRows = lastWorkingSets(rows, exercise, 3);
  if (!exerciseRows.length) return { targetReps: min };
  const lastWeight = exerciseRows[exerciseRows.length - 1].weightKg;
  if (lastWeight == null) return { targetReps: min };
  const maxed = exerciseRows.length === 3 && exerciseRows.every((r) => (r.reps ?? 0) >= max);
  return { weightKg: maxed ? lastWeight + APP_CONFIG.increments.accessory : lastWeight, targetReps: maxed ? min : max };
}

export function buildSuggestions(
  rows: WorkoutLogRow[],
  formFlags: Partial<Record<LiftKey, FormQuality>>,
  pullupsControlled: boolean,
  override?: CoachOverride,
): ExerciseSuggestion[] {
  const liftSuggestions = mainLifts.map((lift) => {
    const ruleWeight = evaluateMainLift(rows, lift, formFlags[lift] ?? 'ok');
    let source: 'rule' | 'coach' = 'rule';
    let final = ruleWeight;
    const lOverride = override?.liftOverrides[lift];
    if (lOverride) {
      source = 'coach';
      if (lOverride.action === 'reduce') final = Math.max(0, (ruleWeight ?? 0) - (lOverride.valueKg ?? APP_CONFIG.increments[lift]));
      if (lOverride.action === 'hold' || lOverride.action === 'repeat') final = ruleWeight;
    }
    return { exercise: lift, suggestedWeightKg: final, source } as ExerciseSuggestion;
  });

  const accessorySuggestions = (Object.keys(accessoryRanges) as ExerciseKey[]).map((exercise) => {
    const base = getAccessorySuggestion(rows, exercise);
    const coach = override?.accessoryAdjustments?.[exercise as keyof typeof override.accessoryAdjustments];
    if (coach) {
      return {
        exercise,
        suggestedWeightKg: coach.weightKg ?? base.weightKg,
        targetReps: coach.targetReps ?? base.targetReps,
        source: 'coach' as const,
      };
    }
    return { exercise, suggestedWeightKg: base.weightKg, targetReps: base.targetReps, source: 'rule' as const };
  });

  const pullupRule = getPullupTarget(rows, pullupsControlled);
  const pullupTarget = pullupRule + (override?.pullup?.delta ?? 0);

  return [
    ...liftSuggestions,
    ...accessorySuggestions,
    { exercise: 'pullups', targetTotalReps: pullupTarget, source: override?.pullup ? 'coach' : 'rule', notes: override?.pullup?.assistanceNote },
  ];
}
