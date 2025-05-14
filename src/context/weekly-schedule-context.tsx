// src/context/weekly-schedule-context.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MuscleGroup } from '@/components/shared/muscle-group-icons';
import { useLanguage } from './language-context';

export interface ScheduledWorkout {
  id: string;
  planId: string;
  planName: string; 
}

export interface WorkoutPlanOption {
  id: string;
  nameKey: string;
  defaultName: string;
  muscleGroups: MuscleGroup[];
}

export const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const defaultAvailableWorkoutPlans: WorkoutPlanOption[] = [
  { id: '1', nameKey: 'calendarPage.samplePlan1', defaultName: 'Full Body Blast', muscleGroups: ['Full Body'] },
  { id: '2', nameKey: 'calendarPage.samplePlan2', defaultName: 'Upper Body Power', muscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
  { id: '3', nameKey: 'calendarPage.samplePlan3', defaultName: 'Leg Day Domination', muscleGroups: ['Legs', 'Abs'] },
  { id: '4', nameKey: 'calendarPage.samplePlan4', defaultName: 'Cardio Session', muscleGroups: ['Cardio'] },
];

interface WeeklyScheduleContextType {
  weeklySchedule: Record<string, ScheduledWorkout[]>;
  availableWorkoutPlans: WorkoutPlanOption[];
  addWorkoutToDay: (dayKey: string, planId: string) => void;
  deleteWorkoutFromDay: (dayKey: string, workoutId: string) => void;
  getWorkoutsForDay: (dayKey: string) => ScheduledWorkout[];
  isClient: boolean;
}

const WeeklyScheduleContext = createContext<WeeklyScheduleContextType | undefined>(undefined);

const WEEKLY_SCHEDULE_STORAGE_KEY = 'sickfit-pro-weeklySchedule';

export function WeeklyScheduleProvider({ children }: { children: ReactNode }) {
  const { t, isClient: languageContextIsClient } = useLanguage();
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, ScheduledWorkout[]>>(
    dayKeys.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );
  const [availableWorkoutPlans] = useState<WorkoutPlanOption[]>(defaultAvailableWorkoutPlans);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedSchedule = localStorage.getItem(WEEKLY_SCHEDULE_STORAGE_KEY);
      if (storedSchedule) {
        try {
          const parsedSchedule = JSON.parse(storedSchedule);
          const fullSchedule = dayKeys.reduce((acc, day) => ({
            ...acc,
            [day]: parsedSchedule[day] || []
          }), {});
          setWeeklySchedule(fullSchedule);
        } catch (e) {
          console.error("Error parsing weekly schedule from localStorage", e);
          setWeeklySchedule(dayKeys.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
        }
      } else {
        setWeeklySchedule(dayKeys.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(WEEKLY_SCHEDULE_STORAGE_KEY, JSON.stringify(weeklySchedule));
    }
  }, [weeklySchedule, isClient]);

  const addWorkoutToDay = useCallback((dayKey: string, planId: string) => {
    const plan = availableWorkoutPlans.find(p => p.id === planId);
    if (!plan) return;

    const newWorkout: ScheduledWorkout = {
      id: String(Date.now()),
      planId: planId,
      planName: languageContextIsClient ? t(plan.nameKey, { default: plan.defaultName }) : plan.defaultName,
    };
    
    setWeeklySchedule(prev => {
      const updatedWorkoutsForDay = [...(prev[dayKey] || []), newWorkout];
      return { ...prev, [dayKey]: updatedWorkoutsForDay };
    });
  }, [availableWorkoutPlans, t, languageContextIsClient]);

  const deleteWorkoutFromDay = useCallback((dayKey: string, workoutId: string) => {
    setWeeklySchedule(prev => {
        const updatedWorkoutsForDay = (prev[dayKey] || []).filter(w => w.id !== workoutId);
        return {...prev, [dayKey]: updatedWorkoutsForDay};
    });
  }, []);
  
  const getWorkoutsForDay = useCallback((dayKey: string): ScheduledWorkout[] => {
    return weeklySchedule[dayKey] || [];
  }, [weeklySchedule]);

  return (
    <WeeklyScheduleContext.Provider value={{ weeklySchedule, availableWorkoutPlans, addWorkoutToDay, deleteWorkoutFromDay, getWorkoutsForDay, isClient }}>
      {children}
    </WeeklyScheduleContext.Provider>
  );
}

export function useWeeklySchedule() {
  const context = useContext(WeeklyScheduleContext);
  if (context === undefined) {
    throw new Error('useWeeklySchedule must be used within a WeeklyScheduleProvider');
  }
  return context;
}
