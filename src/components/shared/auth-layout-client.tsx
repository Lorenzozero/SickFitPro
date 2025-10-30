'use client';

import { GlobalHeader } from './global-header';
import { ReactNode } from 'react';

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  return (
      <div className="flex min-h-screen flex-col"> 
        <GlobalHeader />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
  );
}

