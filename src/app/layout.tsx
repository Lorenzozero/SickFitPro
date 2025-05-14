
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { ActiveWorkoutProvider } from '@/context/active-workout-context';
import { WeeklyScheduleProvider } from '@/context/weekly-schedule-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Note: For fully dynamic metadata based on user language preference,
// a more complex setup with generateMetadata and potentially middleware/cookies is needed.
// Here, we are setting a default.
export const metadata: Metadata = {
  title: 'SickFit Pro', // Brand name, typically not translated or translated carefully
  description: 'Il tuo compagno di fitness definitivo per allenamenti personalizzati e monitoraggio dei progressi.', // Italian translation
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="app-theme"
        >
          <LanguageProvider>
            <ActiveWorkoutProvider>
              <WeeklyScheduleProvider>
                {children}
                <Toaster />
              </WeeklyScheduleProvider>
            </ActiveWorkoutProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
