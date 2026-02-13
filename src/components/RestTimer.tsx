import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let handle: ReturnType<typeof setInterval> | undefined;
    if (running && remaining > 0) {
      handle = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    }
    return () => handle && clearInterval(handle);
  }, [running, remaining]);

  const label = useMemo(() => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <Text>Rest {label}</Text>
      <Pressable onPress={() => setRunning((r) => !r)} style={{ backgroundColor: '#0f766e', padding: 6, borderRadius: 6 }}>
        <Text style={{ color: 'white' }}>{running ? 'Pause' : 'Start'}</Text>
      </Pressable>
      <Pressable onPress={() => { setRemaining(seconds); setRunning(false); }} style={{ backgroundColor: '#334155', padding: 6, borderRadius: 6 }}>
        <Text style={{ color: 'white' }}>Reset</Text>
      </Pressable>
    </View>
  );
}
