'use client';
import dynamic from 'next/dynamic';

export const DietPanel = dynamic(
  () => import('./panel').catch(() => ({ default: () => <div className="text-sm text-muted-foreground">Diet panel unavailable</div> })),
  { ssr: false, loading: () => <div className="h-32 rounded bg-muted/40 animate-pulse" /> }
);

// Default export for lazy dynamic import compatibility
export default DietPanel;
