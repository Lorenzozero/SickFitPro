import { rtdb } from '../firebase';
import { ref, get, query, orderByChild, equalTo, limitToLast, push, set } from 'firebase/database';
import type { DashboardData, Workout, WorkoutSession, ScheduledWorkout } from '../types';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { WorkoutSchema, WorkoutSessionSchema, ScheduledWorkoutSchema, DashboardDataSchema } from '../validation/schemas';
import type { User } from 'firebase/auth';

// Error mapping helper for RTDB
function mapRtdbError(err: unknown, fallback: string) {
  const msg = (err as any)?.message || '';
  const code = (err as any)?.code || '';
  if (/permission/i.test(msg) || /PERMISSION_DENIED/i.test(code)) return 'Permission denied';
  if (/network/i.test(msg) || /NETWORK/i.test(code)) return 'Network error, please retry later';
  return fallback;
}

export async function fetchWorkoutsRT(user: User): Promise<Workout[]> {
  const uid = user.uid;
  console.log('fetchDashboardRT: User UID:', uid);
  try {
    const q = query(ref(rtdb, 'workouts'), orderByChild('userId'), equalTo(uid), limitToLast(100));
    const snap = await get(q);
    const val: Record<string, Omit<Workout, 'id'>> = snap.val() || {};
    const items = Object.entries(val).map(([id, data]) => ({ id, ...(data as Omit<Workout, 'id'>) }));

    const valid: Workout[] = [];
    const errors: Array<{ id?: string; issues: unknown }> = [];

    for (const it of items) {
      const parsed = WorkoutSchema.safeParse(it);
      if (parsed.success) valid.push(parsed.data);
      else errors.push({ id: (it as any)?.id, issues: parsed.error.flatten() });
    }

    if (errors.length) {
      Sentry.captureMessage('Invalid workout documents', { level: 'warning', extra: { errors } });
    }

    return valid.sort((a, b) => (b.duration || '').localeCompare(a.duration || ''));
  } catch (err) {
    Sentry.captureException(err);
    throw new Error(mapRtdbError(err, 'Failed to fetch workouts'));
  }
}

export async function fetchDashboardRT(user: User): Promise<DashboardData> {
  const uid = user.uid;
    try {
      const sessionsQ = query(ref(rtdb, 'workout_sessions'), orderByChild('userId'), equalTo(uid), limitToLast(50));
      const sessionsSnap = await get(sessionsQ);
      const sessionsObj: Record<string, Omit<WorkoutSession, 'id'>> = sessionsSnap.val() || {};
      const sessionsRaw = Object.entries(sessionsObj).map(([id, data]) => ({ id, ...(data as Omit<WorkoutSession, 'id'>) }));

      const sessions: WorkoutSession[] = sessionsRaw
        .map((s) => WorkoutSessionSchema.safeParse(s))
        .filter((r): r is z.SafeParseSuccess<WorkoutSession> => r.success)
        .map((r) => r.data)
        .sort((a, b) => (b.completionDate || '').localeCompare(a.completionDate || ''));

      const schedQ = query(ref(rtdb, 'schedules'), orderByChild('userId'), equalTo(uid), limitToLast(1));
      const schedSnap = await get(schedQ);
      const schedObj: Record<string, any> = schedSnap.val() || {};
    const first = Object.values(schedObj)[0] as { upcoming?: unknown[]; currentWeight?: number } | undefined;

    const upcomingRaw: unknown[] = Array.isArray(first?.upcoming) ? first!.upcoming!.slice(0, 10) : [];
    const upcoming: ScheduledWorkout[] = upcomingRaw
      .map((u) => ScheduledWorkoutSchema.safeParse(u))
      .filter((r): r is z.SafeParseSuccess<ScheduledWorkout> => r.success)
      .map((r) => r.data);

    const currentWeight: number | undefined = typeof first?.currentWeight === 'number' ? first.currentWeight : undefined;

    const dashboardCandidate = { sessions, upcomingWorkouts: upcoming, currentWeight, weeklyStats: { completedWorkouts: sessions.length, totalScheduled: upcoming.length } };
    const parsed = DashboardDataSchema.safeParse(dashboardCandidate);
    if (!parsed.success) {
      Sentry.captureMessage('Invalid dashboard data constructed', { level: 'warning', extra: parsed.error.flatten() });
      return dashboardCandidate;
    }
    return parsed.data;
  } catch (err) {
    Sentry.captureException(err);
    throw new Error(mapRtdbError(err, 'Failed to fetch dashboard'));
  }
}

export async function saveSessionRT(session: Omit<WorkoutSession, 'id' | 'userId'>, user: User): Promise<void> {
  try {
    const payload = { ...session, userId: user.uid, id: 'temp' } as WorkoutSession;
    const parsed = WorkoutSessionSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || 'Invalid session');
    }
    const { id: _ignored, ...toSave } = parsed.data;
    const col = ref(rtdb, 'workout_sessions');
    const docRef = push(col);
    await set(docRef, toSave);
  } catch (err) {
    Sentry.captureException(err);
    throw new Error(mapRtdbError(err, 'Failed to save session'));
  }
}
