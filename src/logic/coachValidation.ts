import { z } from 'zod';
import { CoachOverride } from '../types';

const liftOverrideSchema = z.object({
  action: z.enum(['repeat', 'hold', 'reduce']),
  valueKg: z.number().nonnegative().optional(),
  formQuality: z.enum(['good', 'ok', 'poor']).optional(),
});

export const coachOverrideSchema = z
  .object({
    liftOverrides: z
      .object({
        squat: liftOverrideSchema.optional(),
        bench: liftOverrideSchema.optional(),
        deadlift: liftOverrideSchema.optional(),
        ohp: liftOverrideSchema.optional(),
      })
      .default({}),
    pullup: z
      .object({
        delta: z.union([z.literal(0), z.literal(1)]),
        assistanceNote: z.string().max(240).optional(),
      })
      .default({ delta: 0 }),
    accessoryAdjustments: z
      .object({
        incline_db_bench: z.object({ targetReps: z.number().int().min(8).max(10).optional(), weightKg: z.number().positive().optional() }).optional(),
        db_row: z.object({ targetReps: z.number().int().min(8).max(10).optional(), weightKg: z.number().positive().optional() }).optional(),
        lateral_raise: z.object({ targetReps: z.number().int().min(8).max(12).optional(), weightKg: z.number().positive().optional() }).optional(),
        barbell_curl: z.object({ targetReps: z.number().int().min(8).max(12).optional(), weightKg: z.number().positive().optional() }).optional(),
        skullcrusher: z.object({ targetReps: z.number().int().min(8).max(12).optional(), weightKg: z.number().positive().optional() }).optional(),
      })
      .default({}),
    swapLateralForArmsOnNextB: z.boolean().optional(),
    lungeMode: z.enum(['dumbbell', 'barbell']).optional(),
    lungeLoadAdjustment: z.enum(['lighter', 'same']).optional(),
    absReplacement: z.string().max(80).optional(),
  })
  .strict();

export function parseCoachOverride(input: string): { data?: CoachOverride; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const result = coachOverrideSchema.safeParse(parsed);
    if (!result.success) {
      return { error: result.error.issues.map((i) => i.message).join('; ') };
    }
    return { data: result.data as CoachOverride };
  } catch {
    return { error: 'Invalid JSON payload.' };
  }
}
