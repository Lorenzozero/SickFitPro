import { FirebaseProvider } from './firebase-provider';
import type { DashboardData, ScheduledWorkout, Workout, WorkoutSession } from '../types';
import type { User } from 'firebase/auth';

export interface DataProvider {
  getDashboard(user: User): Promise<DashboardData>;
  listWorkouts(user: User): Promise<Workout[]>;
  saveSession(session: WorkoutSession, user: User): Promise<void>;
}

export const dataProvider: DataProvider = new FirebaseProvider();
