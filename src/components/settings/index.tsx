"use client";
import dynamic from 'next/dynamic';

export const SettingsPanel = dynamic(
  () => import('./panel'),
  { ssr: false, loading: () => <div className="h-32 rounded bg-muted/40 animate-pulse" /> }
);

export default SettingsPanel;
