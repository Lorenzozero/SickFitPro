// src/context/active-workout-context.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ACTIVE_WORKOUT_PLAN_ID_KEY = 'sickfit-pro-activeWorkoutPlanId';
const ACTIVE_WORKOUT_NAME_KEY = 'sickfit-pro-activeWorkoutName';
const ACTIVE_WORKOUT_START_TIME_KEY = 'sickfit-pro-activeWorkoutStartTime';

interface ActiveWorkoutContextType {
  activePlanId: string | null;
  activePlanName: string | null;
  activeWorkoutStartTime: number | null;
  startActiveWorkout: (planId: string, planName: string) => void;
  clearActiveWorkout: () => void;
  resumeActiveWorkout: () => void;
  isClient: boolean;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextType | undefined>(undefined);

export function ActiveWorkoutProvider({ children }: { children: ReactNode }) {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);
  const [activeWorkoutStartTime, setActiveWorkoutStartTime] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedPlanId = localStorage.getItem(ACTIVE_WORKOUT_PLAN_ID_KEY);
      const storedPlanName = localStorage.getItem(ACTIVE_WORKOUT_NAME_KEY);
      const storedStartTime = localStorage.getItem(ACTIVE_WORKOUT_START_TIME_KEY);
      if (storedPlanId) {
        setActivePlanId(storedPlanId);
      }
      if (storedPlanName) {
        setActivePlanName(storedPlanName);
      }
      if (storedStartTime) {
        setActiveWorkoutStartTime(parseInt(storedStartTime, 10));
      }
    }
  }, []);

  const startActiveWorkout = useCallback((planId: string, planName: string) => {
    const startTime = Date.now();
    setActivePlanId(planId);
    setActivePlanName(planName);
    setActiveWorkoutStartTime(startTime);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_WORKOUT_PLAN_ID_KEY, planId);
      localStorage.setItem(ACTIVE_WORKOUT_NAME_KEY, planName);
      localStorage.setItem(ACTIVE_WORKOUT_START_TIME_KEY, startTime.toString());
    }
  }, []);

  const clearActiveWorkout = useCallback(() => {
    setActivePlanId(null);
    setActivePlanName(null);
    setActiveWorkoutStartTime(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_WORKOUT_PLAN_ID_KEY);
      localStorage.removeItem(ACTIVE_WORKOUT_NAME_KEY);
      localStorage.removeItem(ACTIVE_WORKOUT_START_TIME_KEY);
    }
  }, []);

  const resumeActiveWorkout = useCallback(() => {
    if (activePlanId && typeof window !== 'undefined') {
      router.push(`/workouts/${activePlanId}/active`);
    }
  }, [activePlanId, router]);

  return (
    <ActiveWorkoutContext.Provider value={{ activePlanId, activePlanName, activeWorkoutStartTime, startActiveWorkout, clearActiveWorkout, resumeActiveWorkout, isClient }}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext);
  if (context === undefined) {
    throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider');
  }
  return context;
}
