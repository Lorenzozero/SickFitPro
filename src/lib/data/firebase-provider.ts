import type { DataProvider } from './provider';
import type { DashboardData, Workout, WorkoutSession } from '../types';
import { fetchDashboardRT, fetchWorkoutsRT } from '../rtdb/queries';

export class FirebaseProvider implements DataProvider {
  async getDashboard(uid: string): Promise<DashboardData> {
    return fetchDashboardRT(uid);
  }
  async listWorkouts(uid: string): Promise<Workout[]> {
    return fetchWorkoutsRT(uid);
  }
  async saveSession(_session: WorkoutSession): Promise<void> {
    throw new Error('Read-only mode (RTDB): saving sessions not enabled yet');
  }
}
