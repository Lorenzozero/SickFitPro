import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '../data/factory';
import * as Sentry from '@sentry/nextjs';

export const useDashboardQuery = (uid: string = 'mock') => {
  return useQuery({
    queryKey: ['dashboard', uid],
    queryFn: () => dataProvider.getDashboard(uid),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
    onError: (err) => {
      Sentry.captureException(err);
    },
  });
};

export const useWorkoutsQuery = (uid: string = 'mock') => {
  return useQuery({
    queryKey: ['workouts', uid],
    queryFn: () => dataProvider.listWorkouts(uid),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (err) => {
      Sentry.captureException(err);
    },
  });
};
