import type { DataProvider } from './provider';
import type { DashboardData, Workout, WorkoutSession } from '../types';
import { fetchDashboardRT, fetchWorkoutsRT } from '../rtdb/queries';
import { auth, rtdb } from '../firebase';
import { ref, push, set } from 'firebase/database';
import * as Sentry from '@sentry/nextjs';
import { User } from 'firebase/auth';

const ENABLE_WRITES = (process.env.NEXT_PUBLIC_ENABLE_WRITES || 'false') === 'true';

function isISODate(d?: string) {
  return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function validateSession(s: Partial<WorkoutSession>) {
  if (!s) return 'Session missing';
  if (!s.workoutId) return 'workoutId required';
  if (!s.planName) return 'planName required';
  if (!s.duration) return 'duration required';
  if (!isISODate(s.completionDate)) return 'completionDate must be YYYY-MM-DD';
  return null;
}

export class FirebaseProvider implements DataProvider {
  async getDashboard(user: User): Promise<DashboardData> {
    if (!user) throw new Error('Not authenticated');
    return fetchDashboardRT(user.uid);
  }
  async listWorkouts(user: User): Promise<Workout[]> {
    if (!user) throw new Error('Not authenticated');
    return fetchWorkoutsRT(user.uid);
  }
  async saveSession(session: WorkoutSession, user: User): Promise<void> {
    if (!ENABLE_WRITES) throw new Error('Read-only mode: writes disabled');
    if (!user) throw new Error('Not authenticated');

    const err = validateSession(session);
    if (err) throw new Error(err);

    const payload = {
      userId: user.uid,
      workoutId: session.workoutId,
      planName: session.planName,
      completionDate: session.completionDate,
      duration: session.duration,
    };

    try {
      const col = ref(rtdb, 'workout_sessions');
      const docRef = push(col);
      await set(docRef, payload);
    } catch (e) {
      Sentry.captureException(e);
      throw new Error('Failed to save session');
    }
  }
}