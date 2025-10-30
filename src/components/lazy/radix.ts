'use client';
import dynamic from 'next/dynamic';

// Radix components loaded on demand for non-critical UI
export const Dialog = dynamic(() => import('@radix-ui/react-dialog').then(m => m.Dialog), { ssr: false });
export const Menubar = dynamic(() => import('@radix-ui/react-menubar').then(m => m.Menubar), { ssr: false });
export const Popover = dynamic(() => import('@radix-ui/react-popover').then(m => m.Popover), { ssr: false });
export const Tooltip = dynamic(() => import('@radix-ui/react-tooltip').then(m => m.Tooltip), { ssr: false });
