import { AppConfig, ExerciseTemplate, SessionType } from '../types';

export const APP_CONFIG: AppConfig = {
  increments: {
    squat: 2.5,
    bench: 2.5,
    deadlift: 5,
    ohp: 2.5,
    accessory: 2.5,
  },
  accessoriesRepRange: [8, 10],
  restDefaultsSec: {
    rowing: { warmup: 30, working: 30 },
    treadmill: { warmup: 30, working: 30 },
    squat: { warmup: 90, working: 150 },
    bench: { warmup: 90, working: 150 },
    pullups: { warmup: 90, working: 120 },
    incline_db_bench: { warmup: 60, working: 90 },
    db_row: { warmup: 60, working: 90 },
    deadlift: { warmup: 120, working: 180 },
    ohp: { warmup: 90, working: 150 },
    lunges: { warmup: 60, working: 90 },
    lateral_raise: { warmup: 45, working: 75 },
    barbell_curl: { warmup: 45, working: 75 },
    skullcrusher: { warmup: 45, working: 75 },
    plank: { warmup: 30, working: 45 },
    alt_abs: { warmup: 30, working: 45 },
  },
};

export const SESSION_TEMPLATES: Record<SessionType, ExerciseTemplate[]> = {
  A: [
    { exercise: 'rowing', title: 'Warmup Rowing', sets: 1, defaultDurationSec: 300, restSec: APP_CONFIG.restDefaultsSec.rowing },
    { exercise: 'squat', title: 'Back Squat', sets: 3, repsTarget: '3×5', warmupsAllowed: true, restSec: APP_CONFIG.restDefaultsSec.squat },
    { exercise: 'bench', title: 'Barbell Bench Press', sets: 3, repsTarget: '3×5', warmupsAllowed: true, supersetGroup: 'ss1', restSec: APP_CONFIG.restDefaultsSec.bench },
    { exercise: 'pullups', title: 'Pull Ups', sets: 3, repsTarget: '3 sets', supersetGroup: 'ss1', restSec: APP_CONFIG.restDefaultsSec.pullups },
    { exercise: 'incline_db_bench', title: 'DB Incline Bench', sets: 3, repsTarget: '8-10', repRange: [8, 10], supersetGroup: 'ss2', restSec: APP_CONFIG.restDefaultsSec.incline_db_bench },
    { exercise: 'db_row', title: 'DB Row', sets: 3, repsTarget: '8-10', repRange: [8, 10], supersetGroup: 'ss2', restSec: APP_CONFIG.restDefaultsSec.db_row },
    { exercise: 'plank', title: 'Plank', sets: 2, defaultDurationSec: 60, optional: true, repsTarget: '2×60s', restSec: APP_CONFIG.restDefaultsSec.plank },
  ],
  B: [
    { exercise: 'treadmill', title: 'Warmup Treadmill', sets: 1, defaultDurationSec: 480, restSec: APP_CONFIG.restDefaultsSec.treadmill },
    { exercise: 'deadlift', title: 'Deadlift', sets: 3, repsTarget: '3×3', warmupsAllowed: true, restSec: APP_CONFIG.restDefaultsSec.deadlift },
    { exercise: 'ohp', title: 'Barbell Shoulder Press', sets: 3, repsTarget: '3×5', warmupsAllowed: true, supersetGroup: 'ss1', restSec: APP_CONFIG.restDefaultsSec.ohp },
    { exercise: 'pullups', title: 'Pull Ups', sets: 3, repsTarget: '3 sets', supersetGroup: 'ss1', restSec: APP_CONFIG.restDefaultsSec.pullups },
    { exercise: 'lunges', title: 'Lunges', sets: 3, repsTarget: '3 sets', supersetGroup: 'ss2', restSec: APP_CONFIG.restDefaultsSec.lunges },
    { exercise: 'lateral_raise', title: 'DB Lateral Raise', sets: 3, repsTarget: '8-12', repRange: [8, 12], supersetGroup: 'ss2', restSec: APP_CONFIG.restDefaultsSec.lateral_raise },
    { exercise: 'plank', title: 'Plank', sets: 2, defaultDurationSec: 60, optional: true, repsTarget: '2×60s', restSec: APP_CONFIG.restDefaultsSec.plank },
  ],
};

export const ARMS_SUPERSET: ExerciseTemplate[] = [
  { exercise: 'barbell_curl', title: 'Barbell Curl', sets: 2, repsTarget: '8-12', repRange: [8, 12], supersetGroup: 'arms', restSec: APP_CONFIG.restDefaultsSec.barbell_curl },
  { exercise: 'skullcrusher', title: 'Lying Triceps Extension', sets: 2, repsTarget: '8-12', repRange: [8, 12], supersetGroup: 'arms', restSec: APP_CONFIG.restDefaultsSec.skullcrusher },
];
