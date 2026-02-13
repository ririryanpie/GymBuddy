import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ARMS_SUPERSET } from '../config/program';
import { clearActiveOverride, completeWorkout, getActiveOverride, getLastSessionType, getRowsSince, getState, saveLogRow, saveWorkout, setState } from '../db/database';
import { buildSuggestions, getNextSessionType } from '../logic/progression';
import { generateSession, toggleLungeDirection } from '../logic/sessionGenerator';
import { RestTimer } from '../components/RestTimer';
import { SetRow } from '../components/SetRow';
import { ExerciseTemplate, FormQuality, WorkoutLogRow } from '../types';

function getMultiplier(exercise: string) {
  if (['squat', 'bench', 'deadlift', 'ohp', 'pullups'].includes(exercise)) return 1;
  if (['incline_db_bench', 'db_row', 'lateral_raise', 'barbell_curl', 'skullcrusher'].includes(exercise)) return 2;
  if (exercise === 'lunges') return 4;
  return 0;
}

const mainLifts = ['squat', 'bench', 'deadlift', 'ohp'] as const;

export function TodayScreen() {
  const [refresh, setRefresh] = useState(0);
  const [includeArmsOnA, setIncludeArmsOnA] = useState(false);
  const [setDrafts, setSetDrafts] = useState<Record<string, Partial<WorkoutLogRow>>>({});
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);
  const [formFlags, setFormFlags] = useState<Partial<Record<'squat' | 'bench' | 'deadlift' | 'ohp', FormQuality>>>(getState('formFlags', {}));
  const [pullupControlled, setPullupControlled] = useState(false);

  const lastSession = getLastSessionType();
  const nextSession = getNextSessionType(lastSession);
  const bCount = getState<number>('bCount', 0);
  const lungeDirection = getState<'forward' | 'reverse'>('lungeDirection', 'forward');
  const generated = generateSession({ nextSession, bCount, lungeDirection });
  const rows = getRowsSince();
  const override = getActiveOverride();
  const suggestions = buildSuggestions(rows, formFlags, pullupControlled, override);

  const exercises = useMemo(() => {
    const base = [...generated.exercises];
    if (nextSession === 'A' && includeArmsOnA) base.push(...ARMS_SUPERSET);
    return base;
  }, [generated.exercises, includeArmsOnA, nextSession]);

  const ensureWorkout = () => {
    if (currentWorkoutId) return currentWorkoutId;
    const id = `${Date.now()}-${nextSession}`;
    saveWorkout({ id, sessionType: nextSession, startedAt: new Date().toISOString() });
    setCurrentWorkoutId(id);
    return id;
  };

  const completeSet = (exercise: ExerciseTemplate, setIndex: number) => {
    const workoutId = ensureWorkout();
    const key = `${exercise.exercise}-${setIndex}`;
    const data = setDrafts[key] ?? {};
    saveLogRow({
      workoutId,
      dateTime: new Date().toISOString(),
      sessionType: nextSession,
      exercise: exercise.exercise,
      reps: data.reps,
      weightKg: data.weightKg,
      durationSec: data.durationSec ?? exercise.defaultDurationSec,
      distanceM: data.distanceM,
      incline: data.incline,
      resistance: data.resistance,
      isWarmup: !!data.isWarmup,
      note: data.note,
      multiplier: getMultiplier(exercise.exercise),
      setIndex,
      completed: true,
    });
    setRefresh((x) => x + 1);
  };

  const finishWorkout = () => {
    if (!currentWorkoutId) {
      Alert.alert('No workout data', 'Log at least one set before finishing.');
      return;
    }
    completeWorkout(currentWorkoutId);
    if (nextSession === 'B') {
      setState('bCount', bCount + 1);
      setState('lungeDirection', toggleLungeDirection(lungeDirection));
    }
    setState('formFlags', formFlags);
    setCurrentWorkoutId(null);
    setSetDrafts({});
    setPullupControlled(false);
    setRefresh((x) => x + 1);
  };

  const pullupTotal = Object.entries(setDrafts)
    .filter(([k]) => k.startsWith('pullups-'))
    .reduce((acc, [, v]) => acc + (v.reps ?? 0), 0);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: '700' }}>Today: Session {nextSession}</Text>
      <Text style={{ color: '#64748b' }}>{override ? 'Suggestions include coach overrides.' : 'Rule-based suggestions only.'}</Text>
      {!!override && (
        <Pressable onPress={() => { clearActiveOverride(); setRefresh((x) => x + 1); }} style={{ backgroundColor: '#7c2d12', marginTop: 8, padding: 8, borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Clear Active Override</Text>
        </Pressable>
      )}
      {nextSession === 'A' && (
        <Pressable onPress={() => setIncludeArmsOnA((v) => !v)} style={{ backgroundColor: '#0f766e', marginVertical: 8, padding: 8, borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>{includeArmsOnA ? 'Remove Arms Quick Add' : 'Quick Add Arms Superset (2 sets)'}</Text>
        </Pressable>
      )}
      {exercises.map((exercise) => {
        const suggestion = suggestions.find((s) => s.exercise === exercise.exercise);
        return (
          <View key={exercise.exercise + exercise.title} style={{ marginVertical: 8, padding: 10, borderRadius: 10, backgroundColor: '#f8fafc' }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{exercise.title}</Text>
            <Text>{exercise.repsTarget ?? ''} {suggestion?.suggestedWeightKg != null ? `@ ${suggestion.suggestedWeightKg}kg` : ''}</Text>
            <Text style={{ color: '#64748b' }}>Source: {suggestion?.source ?? 'rule'}</Text>
            {exercise.exercise === 'pullups' && (
              <>
                <Text>Target total: {suggestion?.targetTotalReps ?? 15}</Text>
                <Text>Draft total: {pullupTotal}</Text>
                <Pressable onPress={() => setPullupControlled((v) => !v)} style={{ alignSelf: 'flex-start', backgroundColor: pullupControlled ? '#15803d' : '#475569', padding: 6, borderRadius: 6, marginTop: 4 }}>
                  <Text style={{ color: 'white' }}>{pullupControlled ? 'Controlled: Yes' : 'Controlled: No'}</Text>
                </Pressable>
              </>
            )}
            {mainLifts.includes(exercise.exercise as any) && (() => {
              const key = exercise.exercise as 'squat' | 'bench' | 'deadlift' | 'ohp';
              const formValue = formFlags[key] ?? 'ok';
              return (
                <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                  {(['good', 'ok', 'poor'] as FormQuality[]).map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setFormFlags((prev) => ({ ...prev, [key]: f }))}
                      style={{ backgroundColor: formValue === f ? '#2563eb' : '#cbd5e1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                    >
                      <Text style={{ color: formValue === f ? 'white' : '#0f172a' }}>{f}</Text>
                    </Pressable>
                  ))}
                </View>
              );
            })()}
            <RestTimer seconds={exercise.restSec.working} />
            {Array.from({ length: exercise.sets }).map((_, i) => {
              const key = `${exercise.exercise}-${i + 1}`;
              const value = setDrafts[key] ?? {};
              return (
                <SetRow
                  key={key}
                  index={i + 1}
                  reps={value.reps}
                  weightKg={value.weightKg}
                  warmup={!!value.isWarmup}
                  note={value.note}
                  onChange={(patch) => setSetDrafts((d) => ({ ...d, [key]: { ...d[key], ...patch, isWarmup: patch.warmup ?? d[key]?.isWarmup } }))}
                  onComplete={() => completeSet(exercise, i + 1)}
                />
              );
            })}
            {(exercise.exercise === 'rowing' || exercise.exercise === 'treadmill') && (
              <TextInput
                placeholder="Distance meters"
                keyboardType="numeric"
                onChangeText={(v) => setSetDrafts((d) => ({ ...d, [`${exercise.exercise}-1`]: { ...d[`${exercise.exercise}-1`], distanceM: Number(v) || undefined } }))}
                style={{ borderWidth: 1, borderColor: '#cbd5e1', marginTop: 8, padding: 6, borderRadius: 6 }}
              />
            )}
          </View>
        );
      })}
      <Pressable onPress={finishWorkout} style={{ marginVertical: 20, backgroundColor: '#16a34a', padding: 12, borderRadius: 10 }}><Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Finish Workout</Text></Pressable>
      <Text style={{ color: '#94a3b8' }}>refresh {refresh}</Text>
    </ScrollView>
  );
}
