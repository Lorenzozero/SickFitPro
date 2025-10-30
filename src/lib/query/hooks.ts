import { useQuery } from '@tanstack/react-query';
import { dataProvider } from '../data/factory';
import * as Sentry from '@sentry/nextjs';
import { useAuth } from '@/context/auth-context';

export const useDashboardQuery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['dashboard', user?.uid],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return dataProvider.getDashboard(user);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
    enabled: !!user,
    onError: (err) => {
      Sentry.captureException(err);
    },
  });
};

export const useWorkoutsQuery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['workouts', user?.uid],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return dataProvider.listWorkouts(user);
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!user,
    onError: (err) => {
      Sentry.captureException(err);
    },
  });
};
