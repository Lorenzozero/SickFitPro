import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorBoundary } from '@/components/error-boundary';
import { SettingsPanel } from '@/components/settings';
import { useLanguage } from '@/context/language-context';

export default function SettingsPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader title={t('settingsPage.title', { default: 'Settings' })} description={t('settingsPage.subtitle', { default: 'Manage your account, preferences and security' })} />
      <ErrorBoundary fallback={<div className="text-sm text-muted-foreground">Settings unavailable</div>}>
        <Suspense fallback={<div className="h-48 rounded bg-muted/40 animate-pulse" />}> 
          <SettingsPanel />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
