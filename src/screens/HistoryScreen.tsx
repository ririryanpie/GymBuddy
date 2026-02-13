import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getRowsSince, listWorkouts, saveLogRow, saveWorkout, updateLogRow } from '../db/database';
import { exportCsv, parseCsv } from '../utils/csv';

export function HistoryScreen() {
  const [importText, setImportText] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editKg, setEditKg] = useState('');

  const workouts = useMemo(() => listWorkouts(), [refresh]);
  const rows = getRowsSince(800);

  const doImport = () => {
    try {
      const parsed = parseCsv(importText);
      if (!parsed.length) {
        Alert.alert('Import failed', 'No rows found.');
        return;
      }

      let currentSession: 'A' | 'B' = 'A';
      let workoutId = `import-${Date.now()}-0`;
      let dateBucket = parsed[0].dateTime.slice(0, 10);
      saveWorkout({ id: workoutId, sessionType: currentSession, startedAt: parsed[0].dateTime, completedAt: parsed[0].dateTime, notes: 'CSV import' });

      parsed.forEach((row, idx) => {
        const bucket = row.dateTime.slice(0, 10);
        if (bucket !== dateBucket) {
          currentSession = currentSession === 'A' ? 'B' : 'A';
          workoutId = `import-${Date.now()}-${idx}`;
          dateBucket = bucket;
          saveWorkout({ id: workoutId, sessionType: currentSession, startedAt: row.dateTime, completedAt: row.dateTime, notes: 'CSV import' });
        }
        saveLogRow({ ...row, workoutId, sessionType: currentSession });
      });
      Alert.alert('Imported', `${parsed.length} rows imported`);
      setRefresh((v) => v + 1);
    } catch (e) {
      Alert.alert('Import failed', (e as Error).message);
    }
  };

  const startEdit = (id: number, reps?: number, kg?: number) => {
    setEditRowId(id);
    setEditReps(reps?.toString() ?? '');
    setEditKg(kg?.toString() ?? '');
  };

  const commitEdit = () => {
    if (!editRowId) return;
    updateLogRow(editRowId, {
      reps: editReps ? Number(editReps) : undefined,
      weightKg: editKg ? Number(editKg) : undefined,
    });
    setEditRowId(null);
    setRefresh((v) => v + 1);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>History</Text>
      <Text>{workouts.length} workouts • {rows.length} log rows</Text>
      <Pressable onPress={() => exportCsv(rows)} style={{ marginTop: 8, backgroundColor: '#0f766e', padding: 10, borderRadius: 8 }}><Text style={{ color: 'white' }}>Export CSV</Text></Pressable>
      <TextInput multiline placeholder="Paste CSV to import" value={importText} onChangeText={setImportText} style={{ borderWidth: 1, minHeight: 120, marginTop: 8, borderRadius: 8, padding: 8 }} />
      <Pressable onPress={doImport} style={{ marginTop: 8, backgroundColor: '#2563eb', padding: 10, borderRadius: 8 }}><Text style={{ color: 'white' }}>Import CSV</Text></Pressable>

      {workouts.map((w) => (
        <View key={w.id} style={{ backgroundColor: '#f8fafc', marginTop: 10, padding: 10, borderRadius: 8 }}>
          <Text style={{ fontWeight: '600' }}>Session {w.session_type}</Text>
          <Text>{w.started_at}</Text>
          {rows.filter((r) => r.workoutId === w.id).slice(0, 8).map((r) => (
            <View key={`${r.id}`} style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderColor: '#e2e8f0' }}>
              <Text>{r.exercise}: {r.reps ?? '-'} reps @ {r.weightKg ?? '-'}kg</Text>
              {editRowId === r.id ? (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <TextInput value={editReps} onChangeText={setEditReps} keyboardType="numeric" style={{ borderWidth: 1, width: 48, padding: 4, borderRadius: 6 }} />
                  <TextInput value={editKg} onChangeText={setEditKg} keyboardType="numeric" style={{ borderWidth: 1, width: 56, padding: 4, borderRadius: 6 }} />
                  <Pressable onPress={commitEdit} style={{ backgroundColor: '#15803d', padding: 6, borderRadius: 6 }}><Text style={{ color: 'white' }}>Save</Text></Pressable>
                </View>
              ) : (
                <Pressable onPress={() => r.id && startEdit(r.id, r.reps, r.weightKg)} style={{ alignSelf: 'flex-start', backgroundColor: '#334155', padding: 6, borderRadius: 6, marginTop: 2 }}>
                  <Text style={{ color: 'white' }}>Edit</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
