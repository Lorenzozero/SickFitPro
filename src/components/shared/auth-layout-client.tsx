'use client';

import { GlobalHeader } from './global-header';
import { ReactNode } from 'react';
// import { Sidebar, SidebarProvider } from '@/components/ui/sidebar'; // Rimuovi Sidebar e SidebarProvider
// import { navItems } from '@/config/nav'; // Rimuovi navItems

export function AuthLayoutClient({ children }: { children: ReactNode }) {
  return (
    // <SidebarProvider> // Rimuovi SidebarProvider
      <div className="flex min-h-screen flex-col"> {/* Modifica la classe per adattarsi all'assenza della sidebar */}
        {/* <Sidebar navItems={navItems} /> */} {/* Rimuovi Sidebar */}
        <GlobalHeader />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    // </SidebarProvider> // Rimuovi SidebarProvider
  );
}

