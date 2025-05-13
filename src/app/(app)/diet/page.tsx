
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';
import WaterIntakeCard from '@/components/dashboard/water-intake-card';
import MacroTrackingCard from '@/components/dashboard/macro-tracking-card';

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
        {/* Placeholder for future diet-specific charts or features */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('dashboard.comingSoon', { default: 'More Features Coming Soon' })}</CardTitle>
            <CardDescription>{t('dashboard.dietFeaturesPlaceholder', { default: 'Detailed meal planning, recipe suggestions, and advanced nutritional analysis will be available here.'})}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
                {t('dashboard.checkBackLater', { default: 'Check back later for more updates!' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
