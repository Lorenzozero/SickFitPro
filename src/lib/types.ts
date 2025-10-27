// Minimal shared types to support data layer and dashboard migration
export interface Workout { id: string; userId: string; name: string; duration?: string }
export interface WorkoutSession { id: string; userId: string; workoutId: string; planName: string; completionDate: string; duration: string }
export interface ScheduledWorkout { id: string; planId: string; planName: string; dateISO?: string }
export interface DashboardData {
  sessions: WorkoutSession[];
  upcomingWorkouts: ScheduledWorkout[];
  currentWeight?: number;
  weeklyStats: { completedWorkouts: number; totalScheduled: number };
}
