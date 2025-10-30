import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

// Dynamically import heavy sections to reduce TTI
// ... existing code ...

export const DietPage = dynamic(() => import('../diet').then(m => m.default), {
  ssr: false,
  loading: () => <div style={{height: 240}} aria-busy>Loading diet…</div>,
});

export const LazySection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<div style={{height: 200}} aria-busy>Loading…</div>}>{children}</Suspense>
);
