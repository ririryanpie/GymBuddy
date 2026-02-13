import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getRowsSince } from '../db/database';
import { computeMonthlySummary, computeWeeklySummary } from '../utils/metrics';

export function SummariesScreen() {
  const rows = getRowsSince(2000);
  const weekly = computeWeeklySummary(rows);
  const monthly = computeMonthlySummary(rows);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Summaries</Text>
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: '600' }}>Weekly</Text>
        <Text>Sessions: {weekly.sessionCount}</Text>
        <Text>Tonnage: {weekly.tonnage.toFixed(1)} kg</Text>
        <Text>Pull-up total: {weekly.pullTotal}</Text>
        <Text>Pain flags: {weekly.painFlags}</Text>
        <Text>Best e1RM: {Object.entries(weekly.e1rm).map(([k, v]) => `${k}:${v.toFixed(1)}`).join(', ') || 'n/a'}</Text>
      </View>
      <View style={{ marginTop: 14 }}>
        <Text style={{ fontWeight: '600' }}>Monthly</Text>
        <Text>Consistency days: {monthly.consistencyDays}</Text>
        <Text>Adherence: {monthly.adherence}%</Text>
        <Text>PRs: {Object.entries(monthly.prs).map(([k, v]) => `${k}:${v}`).join(', ') || 'n/a'}</Text>
      </View>
    </ScrollView>
  );
}
