import { useCallback } from 'react';
import { FirebaseProvider } from '@/lib/data/firebase-provider';
import { WorkoutSession } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { useRtdbWrite } from '@/hooks/use-rtdb-write';
import { useAuth } from '@/context/auth-context';

export function useSaveSession() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const saveSessionMutation = useCallback(async (session: WorkoutSession) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const provider = new FirebaseProvider();
    return await provider.saveSession(session, user);
  }, [user]);

  const { execute: saveSession, isLoading, error } = useRtdbWrite(saveSessionMutation);

  // Effect to show toasts based on the outcome of saveSession
  // This will be handled by the calling component (page.tsx) now
  // as per the previous changes, so we can remove the toast logic here.

  return { saveSession, isLoading, error };
}
