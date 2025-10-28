import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { DashboardData, Workout, WorkoutSession, ScheduledWorkout } from '../types';

export async function fetchWorkouts(uid: string): Promise<Workout[]> {
  const q = query(collection(db, 'workouts'), where('userId', '==', uid), orderBy('updatedAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Workout[];
}

export async function fetchDashboard(uid: string): Promise<DashboardData> {
  const sessionsQ = query(collection(db, 'workout_sessions'), where('userId', '==', uid), orderBy('completionDate', 'desc'), limit(20));
  const sessionsSnap = await getDocs(sessionsQ);
  const sessions = sessionsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as WorkoutSession[];

  const schedQ = query(collection(db, 'schedules'), where('userId', '==', uid), limit(1));
  const schedSnap = await getDocs(schedQ);
  const upcoming: ScheduledWorkout[] = (schedSnap.docs[0]?.data()?.upcoming || []).slice(0, 10);

  const currentWeight: number | undefined = schedSnap.docs[0]?.data()?.currentWeight;

  const weeklyStats = { completedWorkouts: sessions.length, totalScheduled: upcoming.length };
  return { sessions, upcomingWorkouts: upcoming, currentWeight, weeklyStats };
}
