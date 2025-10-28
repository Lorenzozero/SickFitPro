import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { DashboardData, Workout, WorkoutSession, ScheduledWorkout } from '../types';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

const WorkoutOut = z.object({ id: z.string(), userId: z.string(), name: z.string(), duration: z.string().optional() });
const SessionOut = z.object({ id: z.string(), userId: z.string(), workoutId: z.string(), planName: z.string(), completionDate: z.string(), duration: z.string() });
const UpcomingOut = z.object({ id: z.string(), planId: z.string(), planName: z.string(), dateISO: z.string().optional() });

export async function fetchWorkouts(uid: string): Promise<Workout[]> {
  try {
    const q = query(collection(db, 'workouts'), where('userId', '==', uid), orderBy('updatedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const raw = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const valid = raw.filter((r) => {
      const res = WorkoutOut.safeParse(r);
      if (!res.success) {
        Sentry.captureMessage('Invalid workout document', { level: 'warning', extra: { id: r?.id, issues: res.error.flatten() } });
      }
      return res.success;
    });
    return valid as Workout[];
  } catch (err) {
    Sentry.captureException(err);
    return [];
  }
}

export async function fetchDashboard(uid: string): Promise<DashboardData> {
  try {
    const sessionsQ = query(collection(db, 'workout_sessions'), where('userId', '==', uid), orderBy('completionDate', 'desc'), limit(20));
    const sessionsSnap = await getDocs(sessionsQ);
    const sessionsRaw = sessionsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const sessions = sessionsRaw.filter((s) => SessionOut.safeParse(s).success) as WorkoutSession[];

    const schedQ = query(collection(db, 'schedules'), where('userId', '==', uid), limit(1));
    const schedSnap = await getDocs(schedQ);
    const upcomingRaw: any[] = (schedSnap.docs[0]?.data()?.upcoming || []).slice(0, 10);
    const upcoming = upcomingRaw.filter((u) => UpcomingOut.safeParse(u).success) as ScheduledWorkout[];

    const currentWeight: number | undefined = schedSnap.docs[0]?.data()?.currentWeight;
    const weeklyStats = { completedWorkouts: sessions.length, totalScheduled: upcoming.length };
    return { sessions, upcomingWorkouts: upcoming, currentWeight, weeklyStats };
  } catch (err) {
    Sentry.captureException(err);
    return { sessions: [], upcomingWorkouts: [], currentWeight: undefined, weeklyStats: { completedWorkouts: 0, totalScheduled: 0 } };
  }
}
