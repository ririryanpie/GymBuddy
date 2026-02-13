import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput } from 'react-native';
import { APP_CONFIG } from '../config/program';
import { getRowsSince, saveCheckin, saveOverride } from '../db/database';
import { parseCoachOverride } from '../logic/coachValidation';
import { buildCoachPacket, buildCoachPrompt, copyPacket } from '../services/coach';
import { requestCoachOverride, setApiKey } from '../services/openaiCoach';

export function CoachScreen() {
  const [workoutId, setWorkoutId] = useState('manual-session');
  const [apiKey, setApiKeyText] = useState('');
  const [rpe, setRpe] = useState('7');
  const [sleep, setSleep] = useState('3');
  const [soreness, setSoreness] = useState('2');
  const [pain, setPain] = useState('');
  const [fatigue, setFatigue] = useState('');
  const [questions, setQuestions] = useState('');
  const [jsonText, setJsonText] = useState('{\n  "liftOverrides": {},\n  "pullup": { "delta": 0 },\n  "accessoryAdjustments": {}\n}');

  const makeCheckin = () => ({
    workoutId,
    overallRpe: Number(rpe),
    sleepQuality: Number(sleep),
    soreness: Number(soreness),
    painTightness: !!pain,
    painText: pain,
    stressFatigue: fatigue,
    gripLimited: fatigue.toLowerCase().includes('grip'),
    questions,
    createdAt: new Date().toISOString(),
  });

  const submitCheckin = async () => {
    const checkin = makeCheckin();
    saveCheckin(checkin);
    const packet = buildCoachPacket(getRowsSince(200), checkin, APP_CONFIG);
    await copyPacket(packet);
    Alert.alert('Coach packet copied', 'Paste into coach and import JSON response.');
  };

  const sendInApp = async () => {
    const checkin = makeCheckin();
    const packet = buildCoachPacket(getRowsSince(200), checkin, APP_CONFIG);
    const result = await requestCoachOverride(buildCoachPrompt(packet));
    if (result.error || !result.override) {
      Alert.alert('Coach error', result.error ?? 'No override returned');
      return;
    }
    saveOverride(workoutId, result.override, 'in_app_api');
    setJsonText(JSON.stringify(result.override, null, 2));
    Alert.alert('Coach override applied', result.explanation ?? 'Override applied from API');
  };

  const importOverride = () => {
    const parsed = parseCoachOverride(jsonText);
    if (parsed.error || !parsed.data) {
      Alert.alert('Invalid override', parsed.error ?? 'Unknown validation error');
      return;
    }
    saveOverride(workoutId, parsed.data, 'copy_paste');
    Alert.alert('Override applied', 'Applied and audited.');
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Coach Loop</Text>
      <TextInput value={apiKey} onChangeText={setApiKeyText} placeholder="OpenAI API Key (optional)" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} secureTextEntry />
      <Pressable onPress={() => setApiKey(apiKey)} style={{ backgroundColor: '#334155', padding: 8, borderRadius: 8, marginTop: 6 }}><Text style={{ color: 'white' }}>Save API Key</Text></Pressable>
      <TextInput value={workoutId} onChangeText={setWorkoutId} placeholder="Workout ID" style={{ borderWidth: 1, padding: 8, marginTop: 10, borderRadius: 8 }} />
      <TextInput value={rpe} onChangeText={setRpe} keyboardType="numeric" placeholder="Overall RPE" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} />
      <TextInput value={sleep} onChangeText={setSleep} keyboardType="numeric" placeholder="Sleep quality" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} />
      <TextInput value={soreness} onChangeText={setSoreness} keyboardType="numeric" placeholder="Soreness" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} />
      <TextInput value={pain} onChangeText={setPain} placeholder="Pain/tightness" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} />
      <TextInput value={fatigue} onChangeText={setFatigue} placeholder="Stress/fatigue" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} />
      <TextInput value={questions} onChangeText={setQuestions} placeholder="Questions for coach" style={{ borderWidth: 1, padding: 8, marginTop: 8, borderRadius: 8 }} />
      <Pressable onPress={sendInApp} style={{ backgroundColor: '#7c3aed', padding: 10, marginTop: 10, borderRadius: 8 }}><Text style={{ color: 'white' }}>Send to Coach (in-app)</Text></Pressable>
      <Pressable onPress={submitCheckin} style={{ backgroundColor: '#0f766e', padding: 10, marginTop: 8, borderRadius: 8 }}><Text style={{ color: 'white' }}>Copy Coach Packet</Text></Pressable>
      <Text style={{ marginTop: 16, fontWeight: '600' }}>Import Coach JSON / Manual Adjustments</Text>
      <TextInput multiline value={jsonText} onChangeText={setJsonText} style={{ borderWidth: 1, minHeight: 180, marginTop: 8, padding: 8, borderRadius: 8 }} />
      <Pressable onPress={importOverride} style={{ backgroundColor: '#2563eb', padding: 10, marginTop: 10, borderRadius: 8 }}><Text style={{ color: 'white' }}>Validate + Apply</Text></Pressable>
    </ScrollView>
  );
}
