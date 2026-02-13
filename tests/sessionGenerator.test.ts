import { describe, expect, it } from 'vitest';
import { generateSession, toggleLungeDirection } from '../src/logic/sessionGenerator';

describe('session generation', () => {
  it('shows arms quick add on A', () => {
    const s = generateSession({ nextSession: 'A', bCount: 0, lungeDirection: 'forward' });
    expect(s.showArmsQuickAdd).toBe(true);
  });

  it('swaps lateral raises for arms every second B', () => {
    const s = generateSession({ nextSession: 'B', bCount: 1, lungeDirection: 'forward' });
    const names = s.exercises.map((e) => e.exercise);
    expect(names.includes('lateral_raise')).toBe(false);
    expect(names.includes('barbell_curl')).toBe(true);
    expect(names.includes('skullcrusher')).toBe(true);
  });

  it('toggles lunge direction', () => {
    expect(toggleLungeDirection('forward')).toBe('reverse');
  });
});
