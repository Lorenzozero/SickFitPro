"use client";

import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

export default function ReadonlyBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const readonly = (process.env.NEXT_PUBLIC_ENABLE_WRITES || 'false') !== 'true';
    if (readonly) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div role="status" aria-live="polite" className="w-full bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-50 py-2 px-4 flex items-center gap-2 text-sm">
      <Info className="w-4 h-4" />
      <span>Read-only mode attivo: i salvataggi sul cloud sono disabilitati.</span>
    </div>
  );
}
