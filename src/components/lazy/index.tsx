import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

// Dynamically import heavy sections to reduce TTI
export const ProgressPage = dynamic(() => import('./progress/page').then(m => m.default), {
  ssr: true,
  loading: () => <div style={{height: 240}} aria-busy>Loading progress…</div>,
});

export const DietPage = dynamic(() => import('./diet/page').then(m => m.default), {
  ssr: true,
  loading: () => <div style={{height: 240}} aria-busy>Loading diet…</div>,
});

export const LazySection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<div style={{height: 200}} aria-busy>Loading…</div>}>{children}</Suspense>
);
