import { redirect } from 'next/navigation';
import { useAuth } from './auth-context';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    }
  }, [loading, user]);

  if (loading) return null;
  return <>{children}</>;
}
