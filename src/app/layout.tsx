import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { ActiveWorkoutProvider } from '@/context/active-workout-context';
import { WeeklyScheduleProvider } from '@/context/weekly-schedule-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/lib/auth';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SickFit Pro',
  description: 'Il tuo compagno di fitness definitivo per allenamenti personalizzati e monitoraggio dei progressi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background px-3 py-2">Skip to content</a>
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          <LanguageProvider>
            <ActiveWorkoutProvider>
              <WeeklyScheduleProvider>
                <QueryClientProvider client={queryClient}>
                  <AuthProvider>
                    <main id="main-content">{children}</main>
                    <Toaster />
                  </AuthProvider>
                </QueryClientProvider>
              </WeeklyScheduleProvider>
            </ActiveWorkoutProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
