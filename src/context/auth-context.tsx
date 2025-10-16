"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { watchAuth, signInWithGoogle, signOutApp } from '@/lib/firebase/config';

interface AuthContextValue {
  user: User|null;
  loading: boolean;
  signIn: ()=>Promise<void>;
  signOut: ()=>Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, signIn: async ()=>{}, signOut: async ()=>{} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuth(u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signIn: async () => { await signInWithGoogle(); },
    signOut: async () => { await signOutApp(); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthCtx() { return useContext(AuthContext); }
