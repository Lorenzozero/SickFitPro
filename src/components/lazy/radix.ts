'use client';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Radix components loaded on demand for non-critical UI
export const Dialog = dynamic<ComponentType<any>>(
  () => import('@radix-ui/react-dialog').then(m => m.Dialog),
  { ssr: false }
);

export const Menubar = dynamic<ComponentType<any>>(
  () => import('@radix-ui/react-menubar').then(m => m.Menubar),
  { ssr: false }
);

export const Popover = dynamic<ComponentType<any>>(
  () => import('@radix-ui/react-popover').then(m => m.Popover),
  { ssr: false }
);

export const Tooltip = dynamic<ComponentType<any>>(
  () => import('@radix-ui/react-tooltip').then(m => m.Tooltip),
  { ssr: false }
);
