import React, { useEffect, useState } from 'react';
import { SafeAreaView, Pressable, Text, View } from 'react-native';
import { migrate } from './src/db/database';
import { TodayScreen } from './src/screens/TodayScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { CoachScreen } from './src/screens/CoachScreen';
import { SummariesScreen } from './src/screens/SummariesScreen';

type Tab = 'today' | 'history' | 'coach' | 'summaries';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');

  useEffect(() => {
    migrate();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        {tab === 'today' && <TodayScreen />}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'coach' && <CoachScreen />}
        {tab === 'summaries' && <SummariesScreen />}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderTopWidth: 1, borderColor: '#e2e8f0' }}>
        {(['today', 'history', 'coach', 'summaries'] as Tab[]).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)}>
            <Text style={{ fontWeight: tab === item ? '700' : '400', textTransform: 'capitalize' }}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
