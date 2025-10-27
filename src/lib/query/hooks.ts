import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '../data/provider';
import type { DashboardData, Workout } from '../types';

// Dashboard data query with 5min stale time and background refetch
export const useDashboardQuery = (uid: string = 'mock') => {
  return useQuery({
    queryKey: ['dashboard', uid],
    queryFn: () => dataProvider.getDashboard(uid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Workouts list query with 10min stale time
export const useWorkoutsQuery = (uid: string = 'mock') => {
  return useQuery({
    queryKey: ['workouts', uid],
    queryFn: () => dataProvider.listWorkouts(uid),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
