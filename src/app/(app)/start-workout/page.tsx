
'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

// Mock data - similar to initialWorkoutPlans in workouts/page.tsx for consistency
const availablePlans = [
  { id: '1', name: 'Full Body Blast', description: 'A comprehensive full-body workout.' },
  { id: '2', name: 'Upper Body Power', description: 'Focus on upper body strength.' },
  { id: '3', name: 'Leg Day Domination', description: 'Intense lower body workout.' },
];

export default function StartWorkoutPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title={t('startWorkoutPage.title')}
        description={t('startWorkoutPage.description')}
      />

      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('startWorkoutPage.selectPlanTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {availablePlans.length > 0 ? (
              <div className="space-y-4">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/workouts/${plan.id}/active`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {t('startWorkoutPage.startPlanButton')}
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('startWorkoutPage.noPlansAvailable')}</p>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for ad-hoc workout, can be expanded later */}
        {/* 
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('startWorkoutPage.startAdHocButton')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              {t('startWorkoutPage.startAdHocButton')} (Coming Soon)
            </Button>
          </CardContent>
        </Card>
        */}
      </div>
    </>
  );
}
