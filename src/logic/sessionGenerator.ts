import { ARMS_SUPERSET, SESSION_TEMPLATES } from '../config/program';
import { ExerciseTemplate, SessionType } from '../types';

export interface SessionState {
  nextSession: SessionType;
  bCount: number;
  lungeDirection: 'forward' | 'reverse';
}

export function generateSession(state: SessionState): { exercises: ExerciseTemplate[]; showArmsQuickAdd: boolean; lungeDirection?: string } {
  const base = [...SESSION_TEMPLATES[state.nextSession]];
  if (state.nextSession === 'A') {
    return { exercises: base, showArmsQuickAdd: true };
  }

  const shouldSwap = state.bCount > 0 && (state.bCount + 1) % 2 === 0;
  if (shouldSwap) {
    const idx = base.findIndex((e) => e.exercise === 'lateral_raise');
    if (idx >= 0) {
      base.splice(idx, 1, ...ARMS_SUPERSET);
    }
  }
  const lunge = base.find((e) => e.exercise === 'lunges');
  if (lunge) {
    lunge.title = `${lunge.title} (${state.lungeDirection})`;
  }
  return { exercises: base, showArmsQuickAdd: false, lungeDirection: state.lungeDirection };
}

export function toggleLungeDirection(current: 'forward' | 'reverse'): 'forward' | 'reverse' {
  return current === 'forward' ? 'reverse' : 'forward';
}
