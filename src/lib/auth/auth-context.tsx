import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'sonner';
import { z } from 'zod';

const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password should be at least 6 characters long.'),
});

type SignInInput = z.infer<typeof SignInSchema>;

interface AuthError {
  code: string;
  message: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoading(false);
        setError(null);
        Sentry.setUser(u ? { id: u.uid, email: u.email || undefined } : null);
      },
      (authError) => {
        setLoading(false);
        const code = authError?.code || 'auth/unknown';
        const message = getErrorMessage(code);
        setError({ code, message });
        toast.error(message);
        Sentry.captureException(authError, { tags: { area: 'auth', op: 'state_change' } });
      }
    );
    return () => unsub();
  }, []);

  const signIn = async (input: SignInInput) => {
    try {
      const parsed = SignInSchema.safeParse(input);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message || 'Invalid credentials.';
        setError({ code: 'auth/invalid-input', message: msg });
        toast.error(msg);
        return;
      }
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
      toast.success('Signed in successfully');
    } catch (err: any) {
      const code = err?.code || 'auth/unknown';
      const message = getErrorMessage(code);
      setError({ code, message });
      toast.error(message);
      Sentry.captureException(err, { tags: { area: 'auth', op: 'sign_in' }, extra: { email: input.email } });
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      toast.success('Signed out');
    } catch (err: any) {
      const code = err?.code || 'auth/unknown';
      const message = getErrorMessage(code);
      setError({ code, message });
      toast.error(message);
      Sentry.captureException(err, { tags: { area: 'auth', op: 'sign_out' } });
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOutUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
