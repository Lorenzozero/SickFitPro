"use client";
import dynamic from 'next/dynamic';

// Import panel directly to avoid missing module errors and nested dynamics
export const ProgressPanel = dynamic(
  () => import('./panel').catch(() => ({ default: () => <div className="text-sm text-muted-foreground">Progress panel unavailable</div> })),
  {
  ssr: false,
  loading: () => <div className="h-32 rounded bg-muted/40 animate-pulse" />,
});

export default ProgressPanel;
