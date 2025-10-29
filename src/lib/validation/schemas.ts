import { z } from 'zod';

// Common helpers
export const ISODate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD')
  .refine((d) => {
    const dt = new Date(`${d}T00:00:00Z`);
    return !Number.isNaN(dt.getTime()) && d === dt.toISOString().slice(0, 10);
  }, 'Invalid calendar date');

export const UID = z.string().min(1, 'userId is required');
export const ID = z.string().min(1, 'id is required');

// Schemas
export const WorkoutSchema = z.object({
  id: ID,
  userId: UID,
  name: z.string().min(1),
  duration: z.string().min(1).optional(),
});

export const WorkoutSessionSchema = z.object({
  id: ID,
  userId: UID,
  workoutId: z.string().min(1),
  planName: z.string().min(1),
  completionDate: ISODate,
  duration: z.string().min(1),
});

export const ScheduledWorkoutSchema = z.object({
  id: ID,
  planId: z.string().min(1),
  planName: z.string().min(1),
  dateISO: ISODate.optional(),
});

export const DashboardStatsSchema = z.object({
  completedWorkouts: z.number().int().min(0),
  totalScheduled: z.number().int().min(0),
});

export const DashboardDataSchema = z.object({
  sessions: z.array(WorkoutSessionSchema),
  upcomingWorkouts: z.array(ScheduledWorkoutSchema),
  currentWeight: z.number().positive().optional(),
  weeklyStats: DashboardStatsSchema,
});

export type WorkoutInput = z.input<typeof WorkoutSchema>;
export type WorkoutSessionInput = z.input<typeof WorkoutSessionSchema>;
export type ScheduledWorkoutInput = z.input<typeof ScheduledWorkoutSchema>;
export type DashboardDataInput = z.input<typeof DashboardDataSchema>;
