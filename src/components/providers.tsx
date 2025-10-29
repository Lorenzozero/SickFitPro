"use client";
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

// Lazy load providers to reduce initial bundle
const ThemeProvider = dynamic(() => import('@/components/theme-provider').then(mod => ({ default: mod.ThemeProvider })), { ssr: false });
const LanguageProvider = dynamic(() => import('@/context/language-context').then(mod => ({ default: mod.LanguageProvider })), { ssr: false });
const ActiveWorkoutProvider = dynamic(() => import('@/context/active-workout-context').then(mod => ({ default: mod.ActiveWorkoutProvider })), { ssr: false });
const WeeklyScheduleProvider = dynamic(() => import('@/context/weekly-schedule-context').then(mod => ({ default: mod.WeeklyScheduleProvider })), { ssr: false });
const AuthProvider = dynamic(() => import('@/lib/auth/auth-context').then(mod => ({ default: mod.AuthProvider })), { ssr: false });

// Create QueryClient outside component to prevent recreation
let queryClient: QueryClient | null = null;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        },
      },
    });
  }
  return queryClient;
}

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const [isClient, setIsClient] = useState(false);
  const client = getQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return minimal shell during SSR
    return (
      <QueryClientProvider client={client}>
        <main id="main-content">
          {children}
        </main>
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <LanguageProvider>
        <ActiveWorkoutProvider>
          <WeeklyScheduleProvider>
            <QueryClientProvider client={client}>
              <AuthProvider>
                <main id="main-content">{children}</main>
                <Toaster />
              </AuthProvider>
            </QueryClientProvider>
          </WeeklyScheduleProvider>
        </ActiveWorkoutProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export { Providers };
