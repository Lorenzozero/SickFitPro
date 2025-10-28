// Data provider abstraction and mock implementation
import type { DashboardData, ScheduledWorkout, Workout, WorkoutSession } from '../types';

export interface DataProvider {
  getDashboard(uid: string): Promise<DashboardData>;
  listWorkouts(uid: string): Promise<Workout[]>;
  saveSession(session: WorkoutSession): Promise<void>;
}

// ---- Mock Provider ----
const NS = 'sickfit-pro';
const VERSION = 1;

type StoreShape = {
  version: number;
  currentWeight?: number;
  sessions: WorkoutSession[];
  upcoming: ScheduledWorkout[];
  workouts: Workout[];
};

const DEFAULT_STORE: StoreShape = {
  version: VERSION,
  currentWeight: 72,
  sessions: [
    { id: 's1', userId: 'mock', workoutId: 'w1', planName: 'Full Body', completionDate: '2025-10-20', duration: '45m' },
    { id: 's2', userId: 'mock', workoutId: 'w2', planName: 'Push Day',  completionDate: '2025-10-22', duration: '40m' },
  ],
  upcoming: [
    { id: 'u1', planId: 'w1', planName: 'Full Body', dateISO: '2025-10-28' },
    { id: 'u2', planId: 'w3', planName: 'Leg Day',   dateISO: '2025-10-29' },
  ],
  workouts: [
    { id: 'w1', userId: 'mock', name: 'Full Body', duration: '45m' },
    { id: 'w2', userId: 'mock', name: 'Push Day',  duration: '40m' },
    { id: 'w3', userId: 'mock', name: 'Leg Day',   duration: '50m' },
  ],
};

const KEY = `${NS}:store`;

function safeLoad(): StoreShape {
  if (typeof window === 'undefined') return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_STORE));
      return DEFAULT_STORE;
    }
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed.version || parsed.version !== VERSION) {
      const migrated = { ...DEFAULT_STORE, ...parsed, version: VERSION } as StoreShape;
      localStorage.setItem(KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_STORE));
    return DEFAULT_STORE;
  }
}

function safeSave(store: StoreShape) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {}
}

export class MockProvider implements DataProvider {
  async getDashboard(uid: string): Promise<DashboardData> {
    const s = safeLoad();
    const completedThisWeek = s.sessions.length; // semplice placeholder
    const totalScheduled = s.upcoming.length;    // semplice placeholder
    return {
      sessions: s.sessions,
      upcomingWorkouts: s.upcoming,
      currentWeight: s.currentWeight,
      weeklyStats: { completedWorkouts: completedThisWeek, totalScheduled },
    };
  }
  async listWorkouts(uid: string): Promise<Workout[]> {
    const s = safeLoad();
    return s.workouts;
  }
  async saveSession(session: WorkoutSession): Promise<void> {
    const s = safeLoad();
    const next: StoreShape = { ...s, sessions: [session, ...s.sessions] };
    safeSave(next);
  }
}

export const dataProvider: DataProvider = new MockProvider();
