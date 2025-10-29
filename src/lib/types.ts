// Centralized types inferred from Zod schemas
import { z } from 'zod';
import { 
  WorkoutSchema, 
  WorkoutSessionSchema, 
  ScheduledWorkoutSchema, 
  DashboardDataSchema 
} from './validation/schemas';

export type Workout = z.infer<typeof WorkoutSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
export type ScheduledWorkout = z.infer<typeof ScheduledWorkoutSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
