
'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // PlayCircle removed from imports
import { Ban } from 'lucide-react'; // PlayCircle icon is no longer used here
import { useLanguage } from '@/context/language-context';
import { useActiveWorkout } from '@/context/active-workout-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
          <CardHeader className="text-center">
            <CardTitle>{t('startWorkoutPage.selectPlanTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {availablePlans.length > 0 ? (
              <div className="space-y-4">
                {availablePlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      "p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out bg-gradient-to-tr from-sky-50 to-blue-50 dark:from-sky-700 dark:to-blue-700", // Sfondo più luminoso
                      !!activePlanId
                        ? "opacity-60 cursor-not-allowed" // Stile per quando un allenamento è attivo
                        : "cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" // Stile per quando è cliccabile
                    )}
                    onClick={() => {
                      if (!activePlanId) { // Esegui solo se nessun allenamento è attivo
                        handleStartPlan(plan.id, plan.name);
                      }
                    }}
                    role="button"
                    tabIndex={!!activePlanId ? -1 : 0}
                    aria-disabled={!!activePlanId}
                    aria-label={languageContextIsClient ? t('startWorkoutPage.startPlanButtonAlt', { planName: plan.name }) : `Start plan ${plan.name}`}
                  >
                    <div className="flex-grow text-center"> {/* Testo centrato */}
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{plan.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{plan.description}</p>
                    </div>
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
