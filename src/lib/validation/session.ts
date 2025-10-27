import { z } from 'zod';

export const WorkoutSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  workoutId: z.string().min(1),
  planName: z.string().min(2).max(80),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.string().regex(/^\d+m$/).or(z.string().regex(/^\d+h\d*m?$/)),
});

export type WorkoutSessionInput = z.infer<typeof WorkoutSessionSchema>;

export function validateWorkoutSession(input: unknown): WorkoutSessionInput {
  return WorkoutSessionSchema.parse(input);
}
