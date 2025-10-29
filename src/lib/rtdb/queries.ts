import { rtdb } from '../firebase';
import { ref, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import type { DashboardData, Workout, WorkoutSession, ScheduledWorkout } from '../types';
import * as Sentry from '@sentry/nextjs';

import type { User } from 'firebase/auth';

export async function fetchWorkoutsRT(user: User): Promise<Workout[]> {
  const uid = user.uid;
  try {
    const q = query(ref(rtdb, 'workouts'), orderByChild('userId'), equalTo(uid), limitToLast(100));
    const snap = await get(q);
    const val = snap.val() || {};
    const items: Workout[] = Object.entries(val).map(([id, data]: any) => ({ id, ...(data as any) }));
    return items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  } catch (err) {
    Sentry.captureException(err);
    return [];
  }
}

export async function fetchDashboardRT(user: User): Promise<DashboardData> {
  const uid = user.uid;
  try {
    const sessionsQ = query(ref(rtdb, 'workout_sessions'), orderByChild('userId'), equalTo(uid), limitToLast(20));
    const sessionsSnap = await get(sessionsQ);
    const sessionsObj = sessionsSnap.val() || {};
    const sessions: WorkoutSession[] = Object.entries(sessionsObj).map(([id, data]: any) => ({ id, ...(data as any) }))
      .sort((a, b) => (b.completionDate || '').localeCompare(a.completionDate || ''));

    const schedQ = query(ref(rtdb, 'schedules'), orderByChild('userId'), equalTo(uid), limitToLast(1));
    const schedSnap = await get(schedQ);
    const schedObj = schedSnap.val() || {};
    const first = Object.values(schedObj)[0] as any | undefined;
    const upcoming: ScheduledWorkout[] = Array.isArray(first?.upcoming) ? first.upcoming.slice(0, 10) : [];
    const currentWeight: number | undefined = typeof first?.currentWeight === 'number' ? first.currentWeight : undefined;

    const weeklyStats = { completedWorkouts: sessions.length, totalScheduled: upcoming.length };
    return { sessions, upcomingWorkouts: upcoming, currentWeight, weeklyStats };
  } catch (err) {
    Sentry.captureException(err);
    return { sessions: [], upcomingWorkouts: [], currentWeight: undefined, weeklyStats: { completedWorkouts: 0, totalScheduled: 0 } };
  }
}
