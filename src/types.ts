export type SessionType = 'A' | 'B';

export type ExerciseKey =
  | 'rowing'
  | 'treadmill'
  | 'squat'
  | 'bench'
  | 'pullups'
  | 'incline_db_bench'
  | 'db_row'
  | 'deadlift'
  | 'ohp'
  | 'lunges'
  | 'lateral_raise'
  | 'barbell_curl'
  | 'skullcrusher'
  | 'plank'
  | 'alt_abs';

export type FormQuality = 'good' | 'ok' | 'poor';

export type LungeMode = 'dumbbell' | 'barbell';

export interface WorkoutLogRow {
  id?: number;
  workoutId: string;
  dateTime: string;
  sessionType: SessionType;
  exercise: ExerciseKey;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  distanceM?: number;
  incline?: number;
  resistance?: number;
  isWarmup: boolean;
  note?: string;
  multiplier: number;
  setIndex: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  sessionType: SessionType;
  startedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface CoachCheckIn {
  workoutId: string;
  overallRpe: number;
  sleepQuality: number;
  soreness: number;
  painTightness: boolean;
  painText?: string;
  stressFatigue?: string;
  gripLimited: boolean;
  questions?: string;
  createdAt: string;
}

export interface ExerciseTemplate {
  exercise: ExerciseKey;
  title: string;
  sets: number;
  repsTarget?: string;
  defaultDurationSec?: number;
  warmupsAllowed?: boolean;
  restSec: { warmup: number; working: number };
  repRange?: [number, number];
  optional?: boolean;
  supersetGroup?: string;
}

export interface ExerciseSuggestion {
  exercise: ExerciseKey;
  suggestedWeightKg?: number;
  targetReps?: number;
  targetTotalReps?: number;
  source: 'rule' | 'coach';
  notes?: string;
}

export interface AppConfig {
  increments: {
    squat: number;
    bench: number;
    deadlift: number;
    ohp: number;
    accessory: number;
  };
  accessoriesRepRange: [number, number];
  restDefaultsSec: Record<ExerciseKey, { warmup: number; working: number }>;
}

export interface CoachOverride {
  liftOverrides: Partial<Record<'squat' | 'bench' | 'deadlift' | 'ohp', { action: 'repeat' | 'hold' | 'reduce'; valueKg?: number; formQuality?: FormQuality }>>;
  pullup: { delta: 0 | 1; assistanceNote?: string };
  accessoryAdjustments: Partial<Record<'incline_db_bench' | 'db_row' | 'lateral_raise' | 'barbell_curl' | 'skullcrusher', { targetReps?: number; weightKg?: number }>>;
  swapLateralForArmsOnNextB?: boolean;
  lungeMode?: LungeMode;
  lungeLoadAdjustment?: 'lighter' | 'same';
  absReplacement?: string;
}
