
'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState } from 'react';

// Mock data for workout plans, similar to initialWorkoutPlans in workouts/page.tsx
const mockWorkoutPlans = [
  { 
    id: '1', 
    name: 'Full Body Blast', 
    description: 'A comprehensive full-body workout for strength and endurance.', 
    exercises: [
      { id: 'ex1', name: 'Squats', sets: 3, reps: '8-12' },
      { id: 'ex2', name: 'Bench Press', sets: 3, reps: '8-12' },
      { id: 'ex3', name: 'Deadlifts', sets: 1, reps: '5' },
      { id: 'ex4', name: 'Overhead Press', sets: 3, reps: '8-12' },
      { id: 'ex5', name: 'Rows', sets: 3, reps: '8-12' },
    ] 
  },
  { 
    id: '2', 
    name: 'Upper Body Power', 
    description: 'Focus on building strength in your chest, back, and arms.',
    exercises: [
      { id: 'ex6', name: 'Bench Press', sets: 4, reps: '6-10' },
      { id: 'ex7', name: 'Pull-ups', sets: 4, reps: 'As many as possible' },
      { id: 'ex8', name: 'Dips', sets: 3, reps: '10-15' },
      { id: 'ex9', name: 'Barbell Rows', sets: 3, reps: '8-12' },
      { id: 'ex10', name: 'Bicep Curls', sets: 3, reps: '10-15' },
      { id: 'ex11', name: 'Tricep Extensions', sets: 3, reps: '10-15' },
    ]
  },
  { 
    id: '3', 
    name: 'Leg Day Domination', 
    description: 'Intense leg workout to build lower body strength and size.',
    exercises: [
      { id: 'ex12', name: 'Squats', sets: 5, reps: '5' },
      { id: 'ex13', name: 'Romanian Deadlifts', sets: 3, reps: '8-12' },
      { id: 'ex14', name: 'Leg Press', sets: 4, reps: '10-15' },
      { id: 'ex15', name: 'Calf Raises', sets: 4, reps: '15-20' },
    ]
  },
];

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  // Add weight, completed sets, etc. for more detailed tracking
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}


export default function ActiveWorkoutPage() {
  const params = useParams();
  const { t } = useLanguage();
  const [plan, setPlan] = useState<WorkoutPlan | null | undefined>(undefined); // undefined for loading, null for not found

  const planId = typeof params.planId === 'string' ? params.planId : undefined;

  useEffect(() => {
    if (planId) {
      const foundPlan = mockWorkoutPlans.find(p => p.id === planId);
      setPlan(foundPlan || null);
    } else {
      setPlan(null); // No planId
    }
  }, [planId]);

  if (plan === undefined) {
    return (
      <PageHeader title="Loading Workout..." description="Please wait while we fetch the plan details." />
    );
  }

  if (!plan) {
    return (
      <PageHeader title={t('activeWorkoutPage.planNotFound')} description="Please check the URL or go back." />
    );
  }

  return (
    <>
      <PageHeader
        title={t('activeWorkoutPage.title', { planName: plan.name })}
        description={plan.description}
        actions={
          <Button>
            <CheckCircle className="w-4 h-4 mr-2" />
            {t('activeWorkoutPage.finishWorkoutButton')}
          </Button>
        }
      />

      <div className="space-y-6">
        {plan.exercises.map((exercise, index) => (
          <Card key={exercise.id} className="shadow-md">
            <CardHeader>
              <CardTitle>{index + 1}. {exercise.name}</CardTitle>
              <CardDescription>
                {t('activeWorkoutPage.setsLabel')}: {exercise.sets} | {t('activeWorkoutPage.repsLabel')}: {exercise.reps}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for set tracking UI */}
              <div className="p-4 text-center border-2 border-dashed rounded-lg border-border">
                <p className="text-sm text-muted-foreground">
                  Track your sets, reps, and weight here.
                </p>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  {t('activeWorkoutPage.logSetButton')} (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
