import type { DataProvider } from './provider';
import type { DashboardData, Workout, WorkoutSession } from '../types';
import { fetchDashboard, fetchWorkouts } from '../firestore/queries';

export class FirebaseProvider implements DataProvider {
  async getDashboard(uid: string): Promise<DashboardData> {
    return fetchDashboard(uid);
  }
  async listWorkouts(uid: string): Promise<Workout[]> {
    return fetchWorkouts(uid);
  }
  async saveSession(_session: WorkoutSession): Promise<void> {
    // read-only placeholder; write path will be enabled after rules/indices
    throw new Error('Read-only mode: saving sessions not enabled yet');
  }
}
