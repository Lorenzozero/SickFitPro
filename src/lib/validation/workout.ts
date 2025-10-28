import { z } from 'zod';

export const WorkoutSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(2).max(80),
  duration: z.string().optional(),
});

export type WorkoutInput = z.infer<typeof WorkoutSchema>;

export function validateWorkout(input: unknown): WorkoutInput {
  return WorkoutSchema.parse(input);
}
