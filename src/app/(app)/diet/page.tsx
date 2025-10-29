'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorBoundary } from '@/components/error-boundary';
import { DietPanel } from '@/components/diet';
import { useLanguage } from '@/context/language-context';

export default function DietPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title={t('dietPage.title', { default: 'Diet' })} description={t('dietPage.subtitle', { default: 'Set your daily macro targets and track meals' })} />
      <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Diet unavailable</div>}>
        <Suspense fallback={<div className="h-48 rounded bg-muted/40 animate-pulse" />}> 
          <DietPanel />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
