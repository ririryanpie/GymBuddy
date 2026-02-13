import * as Clipboard from 'expo-clipboard';
import { CoachCheckIn, CoachOverride, WorkoutLogRow } from '../types';

export function buildCoachPacket(rows: WorkoutLogRow[], checkin: CoachCheckIn, config: unknown) {
  return {
    checkin,
    config,
    recentRows: rows.slice(-120),
    trends: {
      mainLifts: ['squat', 'bench', 'deadlift', 'ohp'].reduce<Record<string, WorkoutLogRow[]>>((acc, key) => {
        acc[key] = rows.filter((r) => r.exercise === key && !r.isWarmup).slice(-9);
        return acc;
      }, {}),
      pullups: rows.filter((r) => r.exercise === 'pullups' && !r.isWarmup).slice(-9),
    },
    requiredJsonSchema: {
      liftOverrides: 'record(main lifts => action repeat|hold|reduce)',
      pullup: { delta: '0|1', assistanceNote: 'optional string' },
    },
  };
}

export async function copyPacket(packet: unknown) {
  await Clipboard.setStringAsync(JSON.stringify(packet, null, 2));
}

export function buildCoachPrompt(packet: unknown): string {
  return `You are strength coach. Return JSON only for overrides matching schema, then plain explanation.\nPacket:\n${JSON.stringify(packet)}`;
}

export function applyOverrides(base: unknown, override: CoachOverride) {
  return { base, overrideApplied: true, override };
}
