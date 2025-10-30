"use client";
import { AuthProvider } from '@/lib/auth/auth-context';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { Providers } from '@/components/providers';
import ReadonlyBanner from '@/components/shared/readonly-banner';
import { AuthLayoutClient } from '@/components/shared/auth-layout-client';

const geistSans = Geist({ 
  variable: '--font-geist-sans', 
  subsets: ['latin'],
  display: 'swap'
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono', 
  subsets: ['latin'],
  display: 'swap'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background px-3 py-2">
          Skip to content
        </a>
        <ReadonlyBanner />

        <ErrorBoundary>
          <Providers>
            <AuthProvider>
              <AuthLayoutClient>
                {children}
              </AuthLayoutClient>
            </AuthProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
