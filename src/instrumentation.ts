// Sentry instrumentation for Next.js App Router
// Server + Client initialization moved into register() as recommended

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    return; // skip init locally if DSN not set
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    integrations: [],
  });
}
