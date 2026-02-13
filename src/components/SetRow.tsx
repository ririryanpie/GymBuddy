import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface Props {
  index: number;
  reps?: number;
  weightKg?: number;
  warmup: boolean;
  note?: string;
  onChange: (patch: { reps?: number; weightKg?: number; note?: string; warmup?: boolean }) => void;
  onComplete: () => void;
}

export function SetRow({ index, reps, weightKg, warmup, note, onChange, onComplete }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <Text style={{ width: 32 }}>#{index}</Text>
      <TextInput keyboardType="numeric" placeholder="reps" value={reps?.toString() ?? ''} onChangeText={(v) => onChange({ reps: Number(v) || undefined })} style={{ borderWidth: 1, borderColor: '#cbd5e1', width: 48, padding: 4, borderRadius: 6 }} />
      <TextInput keyboardType="numeric" placeholder="kg" value={weightKg?.toString() ?? ''} onChangeText={(v) => onChange({ weightKg: Number(v) || undefined })} style={{ borderWidth: 1, borderColor: '#cbd5e1', width: 56, padding: 4, borderRadius: 6 }} />
      <Pressable onPress={() => onChange({ warmup: !warmup })}><Text>{warmup ? 'Warmup' : 'Work'}</Text></Pressable>
      <TextInput placeholder="note" value={note ?? ''} onChangeText={(v) => onChange({ note: v })} style={{ borderWidth: 1, borderColor: '#cbd5e1', minWidth: 80, flex: 1, padding: 4, borderRadius: 6 }} />
      <Pressable onPress={onComplete} style={{ backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}><Text style={{ color: 'white' }}>Done</Text></Pressable>
    </View>
  );
}
