
'use client';

import { PageHeader } from '@/components/shared/page-header';
import WaterIntakeCard from '@/components/dashboard/water-intake-card';
import MacroTrackingCard from '@/components/dashboard/macro-tracking-card';
import AiHealthAdvisorForm from '@/components/forms/nutritional-analysis-form';
import { useLanguage } from '@/context/language-context';
import SupplementTrackerCard from '@/components/diet/supplement-tracker-card'; // Importa il nuovo componente

export default function DietPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title={t('dietPage.title')}
      />
      <div className="space-y-6">
        <WaterIntakeCard />
        <MacroTrackingCard />
        <SupplementTrackerCard /> {/* Aggiungi il nuovo componente qui */}
        <AiHealthAdvisorForm />
      </div>
    </>
  );
}
