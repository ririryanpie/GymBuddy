import { describe, expect, it } from 'vitest';
import { parseCoachOverride } from '../src/logic/coachValidation';

describe('coach override validation', () => {
  it('accepts valid json', () => {
    const input = JSON.stringify({
      liftOverrides: { squat: { action: 'hold' } },
      pullup: { delta: 1 },
      accessoryAdjustments: { lateral_raise: { targetReps: 10 } },
      lungeMode: 'barbell',
    });
    const result = parseCoachOverride(input);
    expect(result.error).toBeUndefined();
    expect(result.data?.pullup.delta).toBe(1);
  });

  it('rejects disallowed fields', () => {
    const input = JSON.stringify({ pullup: { delta: 2 }, illegal: true });
    const result = parseCoachOverride(input);
    expect(result.error).toBeDefined();
  });
});
