
'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Ban } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useActiveWorkout } from '@/context/active-workout-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - similar to initialWorkoutPlans in workouts/page.tsx for consistency
const availablePlans = [
  { id: '1', name: 'Full Body Blast', description: 'A comprehensive full-body workout.' },
  { id: '2', name: 'Upper Body Power', description: 'Focus on upper body strength.' },
  { id: '3', name: 'Leg Day Domination', description: 'Intense lower body workout.' },
];

export default function StartWorkoutPage() {
  const { t, isClient: languageContextIsClient } = useLanguage();
  const { activePlanId, isClient: activeWorkoutIsClient, startActiveWorkout: contextStartWorkout } = useActiveWorkout();
  const router = useRouter();

  const handleStartPlan = (planId: string, planName: string) => {
    if (activeWorkoutIsClient && activePlanId) {
      // Button should be disabled, but this is a safeguard
      return;
    }
    contextStartWorkout(planId, planName);
    router.push(`/workouts/${planId}/active`);
  };

  if (!languageContextIsClient || !activeWorkoutIsClient) {
    return (
      <>
        <PageHeader
          title={languageContextIsClient ? t('startWorkoutPage.title') : "Start New Workout"}
          description={languageContextIsClient ? t('startWorkoutPage.description') : "Choose a plan to start or begin an ad-hoc session."}
        />
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
              {[1,2].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-9 w-24" />
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('startWorkoutPage.title')}
        description={t('startWorkoutPage.description')}
      />

      <div className="space-y-6">
        {activePlanId && (
          <Card className="shadow-md border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <Ban className="w-5 h-5 mr-2" />
                {t('activeWorkoutPage.workoutInProgressTitle', { default: 'Workout In Progress' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive-foreground">
                {t('activeWorkoutPage.finishCurrentWorkoutPrompt', { default: 'You have an active workout. Please finish or abandon it before starting a new one.' })}
              </p>
              <Button asChild variant="outline" className="mt-3">
                <Link href={`/workouts/${activePlanId}/active`}>{t('resumeWorkoutButton.resumeTitle')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('startWorkoutPage.selectPlanTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {availablePlans.length > 0 ? (
              <div className="space-y-4">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
                    <div className="flex-grow">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!!activePlanId}
                      className="w-full sm:w-auto"
                      onClick={() => handleStartPlan(plan.id, plan.name)}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {t('startWorkoutPage.startPlanButton')}
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">{t('startWorkoutPage.noPlansAvailable')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
