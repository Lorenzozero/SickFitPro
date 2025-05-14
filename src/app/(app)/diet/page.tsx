'use client';

import { PageHeader } from '@/components/shared/page-header';
import WaterIntakeCard from '@/components/dashboard/water-intake-card';
import MacroTrackingCard from '@/components/dashboard/macro-tracking-card';
import AiHealthAdvisorForm from '@/components/forms/nutritional-analysis-form'; // Renamed import
import { useLanguage } from '@/context/language-context';

export default function DietPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title={t('dietPage.title')}
        description={t('dietPage.description')}
      />
      <div className="space-y-6">
        <WaterIntakeCard />
        <MacroTrackingCard />
        <AiHealthAdvisorForm /> {/* Use renamed component */}
      </div>
    </>
  );
}
