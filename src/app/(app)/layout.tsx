'use client';

import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/lib/auth/guard';
import { AuthProvider } from '@/context/auth-context';

export default function AppSectionLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
}
