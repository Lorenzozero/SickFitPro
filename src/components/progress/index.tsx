"use client";
import dynamic from 'next/dynamic';

export const ProgressPanel = dynamic(
  () => import('./panel').catch(() => ({ default: () => <div className="text-sm text-muted-foreground">Progress panel unavailable</div> })),
  { ssr: false, loading: () => <div className="h-32 rounded bg-muted/40 animate-pulse" /> }
);
