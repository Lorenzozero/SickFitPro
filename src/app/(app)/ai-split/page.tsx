
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { AiSplitForm } from '@/components/forms/ai-split-form';
import { useLanguage } from '@/context/language-context';

export default function AISplitPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t('aiSplitPage.title')}
        description={t('aiSplitPage.description')}
      />
      <AiSplitForm />
    </>
  );
}
