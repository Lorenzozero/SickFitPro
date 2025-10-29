'use client';
import dynamic from 'next/dynamic';

// Radix components loaded on demand for non-critical UI
export const Dialog = dynamic(() => import('@radix-ui/react-dialog'), { ssr: false });
export const Menubar = dynamic(() => import('@radix-ui/react-menubar'), { ssr: false });
export const Popover = dynamic(() => import('@radix-ui/react-popover'), { ssr: false });
export const Tooltip = dynamic(() => import('@radix-ui/react-tooltip'), { ssr: false });
