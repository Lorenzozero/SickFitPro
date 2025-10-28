'use client';

import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/lib/auth/guard';

export default function AppSectionLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
