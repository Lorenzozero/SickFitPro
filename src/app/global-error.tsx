'use client';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  // Report to Sentry on mount
  if (typeof window !== 'undefined' && error) {
    Sentry.captureException(error, { tags: { area: 'global-error' } });
  }

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-md border bg-background shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              An unexpected error occurred. The issue has been reported.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
              aria-label="Go back to home"
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
