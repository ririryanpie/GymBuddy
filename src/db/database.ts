import * as SQLite from 'expo-sqlite';
import { CoachCheckIn, CoachOverride, SessionType, Workout, WorkoutLogRow } from '../types';

const db = SQLite.openDatabaseSync('gymbuddy.db');

export function migrate() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      session_type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id TEXT NOT NULL,
      date_time TEXT NOT NULL,
      session_type TEXT NOT NULL,
      exercise TEXT NOT NULL,
      reps INTEGER,
      weight_kg REAL,
      duration_sec INTEGER,
      distance_m REAL,
      incline REAL,
      resistance REAL,
      is_warmup INTEGER NOT NULL,
      note TEXT,
      multiplier INTEGER NOT NULL,
      set_index INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS coach_checkins (
      workout_id TEXT PRIMARY KEY,
      overall_rpe INTEGER,
      sleep_quality INTEGER,
      soreness INTEGER,
      pain_tightness INTEGER,
      pain_text TEXT,
      stress_fatigue TEXT,
      grip_limited INTEGER,
      questions TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS coach_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id TEXT,
      mode TEXT,
      raw_json TEXT,
      explanation TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS coach_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id TEXT,
      payload TEXT,
      active INTEGER,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT,
      action TEXT,
      payload TEXT,
      created_at TEXT
    );
  `);
}

export function saveWorkout(workout: Workout) {
  db.runSync(
    `INSERT OR REPLACE INTO workouts (id, session_type, started_at, completed_at, notes) VALUES (?, ?, ?, ?, ?)`,
    [workout.id, workout.sessionType, workout.startedAt, workout.completedAt ?? null, workout.notes ?? null],
  );
}

export function completeWorkout(id: string, notes?: string) {
  db.runSync(`UPDATE workouts SET completed_at = ?, notes = COALESCE(?, notes) WHERE id = ?`, [new Date().toISOString(), notes ?? null, id]);
}

export function saveLogRow(row: WorkoutLogRow) {
  db.runSync(
    `INSERT INTO workout_logs (workout_id, date_time, session_type, exercise, reps, weight_kg, duration_sec, distance_m, incline, resistance, is_warmup, note, multiplier, set_index, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.workoutId,
      row.dateTime,
      row.sessionType,
      row.exercise,
      row.reps ?? null,
      row.weightKg ?? null,
      row.durationSec ?? null,
      row.distanceM ?? null,
      row.incline ?? null,
      row.resistance ?? null,
      row.isWarmup ? 1 : 0,
      row.note ?? null,
      row.multiplier,
      row.setIndex,
      row.completed ? 1 : 0,
    ],
  );
}

export function updateLogRow(id: number, patch: Partial<Pick<WorkoutLogRow, 'reps' | 'weightKg' | 'note'>>) {
  db.runSync(`UPDATE workout_logs SET reps = COALESCE(?, reps), weight_kg = COALESCE(?, weight_kg), note = COALESCE(?, note) WHERE id = ?`, [patch.reps ?? null, patch.weightKg ?? null, patch.note ?? null, id]);
}

export function getLastSessionType(): SessionType | undefined {
  const row = db.getFirstSync<{ session_type: SessionType }>(`SELECT session_type FROM workouts WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1`);
  return row?.session_type;
}

export function getRowsSince(limit = 300): WorkoutLogRow[] {
  const rows = db.getAllSync<any>(`SELECT * FROM workout_logs ORDER BY date_time DESC LIMIT ?`, [limit]);
  return rows.map((r) => ({
    id: r.id,
    workoutId: r.workout_id,
    dateTime: r.date_time,
    sessionType: r.session_type,
    exercise: r.exercise,
    reps: r.reps ?? undefined,
    weightKg: r.weight_kg ?? undefined,
    durationSec: r.duration_sec ?? undefined,
    distanceM: r.distance_m ?? undefined,
    incline: r.incline ?? undefined,
    resistance: r.resistance ?? undefined,
    isWarmup: !!r.is_warmup,
    note: r.note ?? undefined,
    multiplier: r.multiplier,
    setIndex: r.set_index,
    completed: !!r.completed,
  }));
}

export function getWorkoutRows(workoutId: string): WorkoutLogRow[] {
  const rows = db.getAllSync<any>(`SELECT * FROM workout_logs WHERE workout_id = ? ORDER BY set_index ASC`, [workoutId]);
  return rows.map((r) => ({
    id: r.id,
    workoutId: r.workout_id,
    dateTime: r.date_time,
    sessionType: r.session_type,
    exercise: r.exercise,
    reps: r.reps ?? undefined,
    weightKg: r.weight_kg ?? undefined,
    durationSec: r.duration_sec ?? undefined,
    distanceM: r.distance_m ?? undefined,
    incline: r.incline ?? undefined,
    resistance: r.resistance ?? undefined,
    isWarmup: !!r.is_warmup,
    note: r.note ?? undefined,
    multiplier: r.multiplier,
    setIndex: r.set_index,
    completed: !!r.completed,
  }));
}

export function listWorkouts() {
  return db.getAllSync<any>(`SELECT * FROM workouts ORDER BY started_at DESC`);
}

export function saveCheckin(input: CoachCheckIn) {
  db.runSync(
    `INSERT OR REPLACE INTO coach_checkins (workout_id, overall_rpe, sleep_quality, soreness, pain_tightness, pain_text, stress_fatigue, grip_limited, questions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.workoutId,
      input.overallRpe,
      input.sleepQuality,
      input.soreness,
      input.painTightness ? 1 : 0,
      input.painText ?? null,
      input.stressFatigue ?? null,
      input.gripLimited ? 1 : 0,
      input.questions ?? null,
      input.createdAt,
    ],
  );
}

export function saveOverride(workoutId: string, override: CoachOverride, mode = 'manual') {
  const now = new Date().toISOString();
  db.runSync(`UPDATE coach_overrides SET active = 0 WHERE active = 1`);
  db.runSync(`INSERT INTO coach_overrides (workout_id, payload, active, created_at) VALUES (?, ?, 1, ?)`, [workoutId, JSON.stringify(override), now]);
  db.runSync(`INSERT INTO coach_responses (workout_id, mode, raw_json, explanation, created_at) VALUES (?, ?, ?, ?, ?)`, [workoutId, mode, JSON.stringify(override), 'Applied override', now]);
  db.runSync(`INSERT INTO audit_log (actor, action, payload, created_at) VALUES (?, ?, ?, ?)`, ['coach', 'override_applied', JSON.stringify(override), now]);
}

export function clearActiveOverride(actor = 'user') {
  const now = new Date().toISOString();
  db.runSync(`UPDATE coach_overrides SET active = 0 WHERE active = 1`);
  db.runSync(`INSERT INTO audit_log (actor, action, payload, created_at) VALUES (?, ?, ?, ?)`, [actor, 'override_cleared', '{}', now]);
}

export function getActiveOverride(): CoachOverride | undefined {
  const row = db.getFirstSync<{ payload: string }>(`SELECT payload FROM coach_overrides WHERE active = 1 ORDER BY created_at DESC LIMIT 1`);
  return row ? (JSON.parse(row.payload) as CoachOverride) : undefined;
}

export function getState<T>(key: string, fallback: T): T {
  const row = db.getFirstSync<{ value: string }>(`SELECT value FROM app_state WHERE key = ?`, [key]);
  return row ? (JSON.parse(row.value) as T) : fallback;
}

export function setState<T>(key: string, value: T) {
  db.runSync(`INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)`, [key, JSON.stringify(value)]);
}

export function resetAll() {
  db.execSync(`DELETE FROM workouts; DELETE FROM workout_logs; DELETE FROM app_state; DELETE FROM coach_checkins; DELETE FROM coach_responses; DELETE FROM coach_overrides; DELETE FROM audit_log;`);
}
