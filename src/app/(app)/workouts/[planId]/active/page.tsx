'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Timer, Play, Pause, PlusCircle, Trash2, Award, Home } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useSaveSession } from '@/hooks/use-save-session';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveWorkout } from '@/context/active-workout-context';
import { useAuth } from '@/lib/auth/auth-context';

const WORKOUT_HISTORY_STORAGE_KEY = 'sickfit-pro-workoutHistory';

// Mock data for workout plans
const mockWorkoutPlans = [
  {
    id: '1',
    name: 'Full Body Blast',
    description: 'A comprehensive full-body workout for strength and endurance.',
    exercises: [
      { id: 'ex1', name: 'Squats', targetSets: 3, targetReps: '8-12', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'squat exercise' },
      { id: 'ex2', name: 'Bench Press', targetSets: 3, targetReps: '8-12', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'bench press' },
      { id: 'ex3', name: 'Deadlifts', targetSets: 1, targetReps: '5', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'deadlift variation' },
      { id: 'ex4', name: 'Overhead Press', targetSets: 3, targetReps: '8-12', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'shoulder press' },
      { id: 'ex5', name: 'Rows', targetSets: 3, targetReps: '8-12', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'back row' },
    ]
  },
  {
    id: '2',
    name: 'Upper Body Power',
    description: 'Focus on building strength in your chest, back, and arms.',
    exercises: [
      { id: 'ex6', name: 'Bench Press', targetSets: 4, targetReps: '6-10', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'bench press' },
      { id: 'ex7', name: 'Pull-ups', targetSets: 4, targetReps: 'AMRAP', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'pull up' },
      { id: 'ex8', name: 'Dips', targetSets: 3, targetReps: '10-15', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'tricep dip' },
    ]
  },
  {
    id: '3',
    name: 'Leg Day Domination',
    description: 'Intense leg workout to build lower body strength and size.',
    exercises: [
      { id: 'ex12', name: 'Squats', targetSets: 5, targetReps: '5', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'barbell squat' },
      { id: 'ex13', name: 'Romanian Deadlifts', targetSets: 3, targetReps: '8-12', gifUrl: 'https://placehold.co/300x200.png', dataAiHint: 'romanian deadlift' },
    ]
  },
];

interface ExerciseMock {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  gifUrl?: string;
  dataAiHint?: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseMock[];
}

interface LoggedSet {
  id: string;
  reps: string;
  weight: string;
  date: string;
}

interface ActiveExercise extends ExerciseMock {
  loggedSets: LoggedSet[];
}

interface SessionPBs {
  maxWeight: number;
  maxReps: number;
}

interface CompletedSetDetail {
  reps: string;
  weight: string;
}

interface CompletedExerciseDetail {
  id: string; // exercise ID
  name: string;
  loggedSets: CompletedSetDetail[];
  targetSets: number;
  targetReps: string;
}

export interface CompletedWorkout {
  id: string; // Unique ID for this completion instance
  planId: string;
  planName: string;
  completionDate: string; // YYYY-MM-DD
  duration: string;
  exercises: CompletedExerciseDetail[]; // Detailed exercise data
  userId: string;
  workoutId: string;
}

interface ExerciseCardProps {
  exercise: ActiveExercise;
  onLogSet: (exerciseId: string, setData: { reps: string; weight: string }) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  isCurrentlyVisible: boolean;
  exerciseIndex: number;
  totalExercises: number;
  t: (key: string, replacements?: Record<string, string | number | undefined>) => string;
}

interface ExerciseComparison {
  exerciseName: string;
  currentMaxWeight: number | null;
  previousMaxWeight: number | null;
  weightImprovement?: number;
  currentMaxReps: number | null;
  previousMaxReps: number | null;
  repsImprovement?: number;
  currentSetsCompleted: number;
  previousSetsCompleted: number | null;
  setsImprovement?: number;
}

type ComparisonSummary = ExerciseComparison[];

function ExerciseCard({ exercise, onLogSet, onDeleteSet, isCurrentlyVisible, exerciseIndex, totalExercises, t }: ExerciseCardProps) {
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  const completedSets = exercise.loggedSets.length;
  const progress = exercise.targetSets > 0 ? (completedSets / exercise.targetSets) * 100 : 0;

  const handleLogSetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repsInput || !weightInput) return;
    onLogSet(exercise.id, { reps: repsInput, weight: weightInput });
    setRepsInput('');
    setWeightInput('');
  };

  const sessionPBs = exercise.loggedSets.reduce<SessionPBs>((acc, set) => {
    const weightNum = parseFloat(set.weight);
    const repsNum = parseInt(set.reps, 10);
    if (!isNaN(weightNum) && weightNum > acc.maxWeight) acc.maxWeight = weightNum;
    if (!isNaN(repsNum) && repsNum > acc.maxReps) acc.maxReps = repsNum;
    return acc;
  }, { maxWeight: 0, maxReps: 0 });

  return (
    <Card
      className={cn(
        'shadow-xl overflow-hidden bg-card transition-opacity duration-500 ease-in-out mb-8',
        isCurrentlyVisible ? 'opacity-100' : 'opacity-60'
      )}
      id={`exercise-${exercise.id}`}
    >
      <div className="md:grid md:grid-cols-3">
        <div className="md:col-span-1 p-4 bg-muted/30 flex items-center justify-center">
          {exercise.gifUrl ? (
            <Image
              src={exercise.gifUrl}
              alt={`${exercise.name} ${t('activeWorkoutPage.exerciseDemoAlt', { default: 'exercise demo' })}`}
              width={300}
              height={200}
              className="rounded-md object-cover shadow-md"
              data-ai-hint={exercise.dataAiHint || 'exercise movement'}
            />
          ) : (
            <div className="w-full h-[200px] flex items-center justify-center bg-muted rounded-md text-muted-foreground">
              {t('activeWorkoutPage.noGifAvailable', { default: 'No demo available' })}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-primary">
                  {exerciseIndex + 1}. {exercise.name}
                </CardTitle>
                <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                  {t('activeWorkoutPage.targetRepsLabel', { default: 'Target' })}: {exercise.targetReps}
                </CardDescription>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {exerciseIndex + 1} / {totalExercises}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700 dark:text-muted-foreground">
                  {t('activeWorkoutPage.setCompletionLabel', { completed: completedSets, total: exercise.targetSets, default: `${completedSets}/${exercise.targetSets} sets` })}
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-green-200 dark:bg-green-800 [&>div]:bg-green-600 dark:[&>div]:bg-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleLogSetSubmit} className="grid grid-cols-6 gap-3 items-end mb-4">
              <div className="col-span-2">
                <Label htmlFor={`reps-${exercise.id}`} className="text-xs text-gray-700 dark:text-gray-300 text-center block w-full">
                  {t('activeWorkoutPage.repsInputLabel', { default: 'Reps' })}
                </Label>
                <Input
                  id={`reps-${exercise.id}`}
                  type="number"
                  placeholder="8"
                  value={repsInput}
                  onChange={(e) => setRepsInput(e.target.value)}
                  required
                  className="h-9 text-center text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`weight-${exercise.id}`} className="text-xs text-gray-700 dark:text-gray-300 text-center block w-full">
                  {t('activeWorkoutPage.weightInputLabel', { default: 'Weight (kg)' })}
                </Label>
                <Input
                  id={`weight-${exercise.id}`}
                  type="number"
                  placeholder="60"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  required
                  className="h-9 text-center text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <Button
                  type="submit"
                  className="w-full h-9 bg-green-600 hover:bg-green-700 text-black dark:text-black flex items-center justify-center sm:justify-start sm:gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('activeWorkoutPage.logSetButton', { default: 'Log Set' })}</span>
                </Button>
              </div>
            </form>

            {exercise.loggedSets.length > 0 && (
              <div className="max-h-48 overflow-y-auto pr-1 mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/5 h-8 text-xs text-gray-700 dark:text-gray-400">
                        {t('activeWorkoutPage.setColumnLabel', { default: 'Set' })}
                      </TableHead>
                      <TableHead className="w-1/4 h-8 text-xs text-gray-700 dark:text-gray-400">
                        {t('activeWorkoutPage.dateColumnLabel', { default: 'Date' })}
                      </TableHead>
                      <TableHead className="w-1/4 h-8 text-xs text-gray-700 dark:text-gray-400">
                        {t('activeWorkoutPage.repsColumnLabel', { default: 'Reps' })}
                      </TableHead>
                      <TableHead className="w-1/4 h-8 text-xs text-gray-700 dark:text-gray-400">
                        {t('activeWorkoutPage.weightColumnLabel', { default: 'Weight' })}
                      </TableHead>
                      <TableHead className="w-auto h-8 text-xs text-right text-gray-700 dark:text-gray-400" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...exercise.loggedSets].reverse().map((set, index) => (
                      <TableRow key={set.id}>
                        <TableCell className="py-1.5 text-sm font-medium text-gray-800 dark:text-gray-100">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-1.5 text-sm text-gray-800 dark:text-gray-200">{set.date}</TableCell>
                        <TableCell className="py-1.5 text-sm text-gray-800 dark:text-gray-200">{set.reps}</TableCell>
                        <TableCell className="py-1.5 text-sm text-gray-800 dark:text-gray-200">{set.weight} kg</TableCell>
                        <TableCell className="py-1.5 text-right text-gray-800 dark:text-gray-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-black dark:text-black"
                            onClick={() => onDeleteSet(exercise.id, set.id)}
                            aria-label={`Delete set ${index + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {exercise.loggedSets.length === 0 && (
              <p className="text-sm text-center text-gray-700 dark:text-muted-foreground py-4">
                {t('activeWorkoutPage.noSetsLoggedYet', { default: 'No sets logged yet' })}
              </p>
            )}

            {sessionPBs.maxWeight > 0 || sessionPBs.maxReps > 0 ? (
              <div className="p-3 mt-2 border rounded-md bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/40">
                <h4 className="mb-2 text-sm font-semibold text-yellow-700 dark:text-yellow-300 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                  {t('activeWorkoutPage.sessionPBsLabel', { default: 'Session PBs' })}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <p>{t('activeWorkoutPage.maxWeightLabel', { default: 'Max Weight' })}: {sessionPBs.maxWeight} kg</p>
                  <p>{t('activeWorkoutPage.maxRepsLabel', { default: 'Max Reps' })}: {sessionPBs.maxReps} {t('activeWorkoutPage.repsUnitLabel', { default: 'reps' })}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export default function ActiveWorkoutPage() {
  const paramsProp = useParams();
  const router = useRouter();
  const { t, isClient: languageContextIsClient } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveSession, isLoading: isSaving, error: saveError } = useSaveSession();
  const {
    activePlanId: contextActivePlanId,
    activePlanName: contextActivePlanName,
    activeWorkoutStartTime: contextStartTimeFromProvider,
    clearActiveWorkout,
    isClient: activeWorkoutContextIsClient
  } = useActiveWorkout();

  const [plan, setPlan] = useState<WorkoutPlan | null | undefined>(undefined);
  const [activeWorkout, setActiveWorkout] = useState<ActiveExercise[] | null>(null);
  const [componentWorkoutStartTime, setComponentWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [comparisonSummary, setComparisonSummary] = useState<ComparisonSummary | null>(null);

  const planIdFromRoute = typeof paramsProp.planId === 'string' ? paramsProp.planId : undefined;

  useEffect(() => {
    if (isFinished) {
      return;
    }

    if (!activeWorkoutContextIsClient || !planIdFromRoute) {
      setPlan(null);
      setActiveWorkout(null);
      return;
    }

    if (!contextActivePlanId || contextActivePlanId !== planIdFromRoute) {
      if (languageContextIsClient) {
        toast({
          title: t('activeWorkoutPage.planNotFound', { default: 'Workout Mismatch' }),
          description: t('activeWorkoutPage.planNotFoundDescription', { default: 'No active workout for this plan or mismatch. Redirecting...' }),
          variant: 'destructive',
          duration: 1000
        });
      }
      router.push('/start-workout');
      setPlan(null);
      setActiveWorkout(null);
      return;
    }

    const foundPlan = mockWorkoutPlans.find(p => p.id === planIdFromRoute);
    setPlan(foundPlan || null);

    if (foundPlan) {
      const initialActiveWorkout = foundPlan.exercises.map(ex => ({ ...ex, loggedSets: [] }));
      setActiveWorkout(initialActiveWorkout);
    } else {
      setActiveWorkout(null);
      if (languageContextIsClient) {
        toast({
          title: t('activeWorkoutPage.planNotFound', { default: 'Plan Not Found' }),
          description: t('activeWorkoutPage.planNotFoundDescription', { default: 'The workout plan could not be loaded.' }),
          variant: 'destructive',
          duration: 1000
        });
      }
      router.push('/workouts');
    }
  }, [planIdFromRoute, activeWorkoutContextIsClient, contextActivePlanId, router, toast, isFinished, languageContextIsClient, t]);

  useEffect(() => {
    if (plan && activeWorkoutContextIsClient && contextStartTimeFromProvider) {
      setComponentWorkoutStartTime(new Date(contextStartTimeFromProvider));
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [plan, contextStartTimeFromProvider, activeWorkoutContextIsClient]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && componentWorkoutStartTime && activeWorkoutContextIsClient) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - componentWorkoutStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, componentWorkoutStartTime, activeWorkoutContextIsClient]);

  const firstUncompletedIndex = useMemo(() => {
    if (!activeWorkout) return -1;
    return activeWorkout.findIndex(ex => ex.loggedSets.length < ex.targetSets);
  }, [activeWorkout]);

  const updateExerciseData = (exerciseId: string, updatedLoggedSets: LoggedSet[]) => {
    setActiveWorkout(prevWorkout => {
      if (!prevWorkout) return null;
      const newWorkoutState = prevWorkout.map(ex =>
        ex.id === exerciseId
          ? { ...ex, loggedSets: updatedLoggedSets }
          : ex
      );
      return newWorkoutState;
    });
  };

  const handleLogSet = (exerciseId: string, setData: { reps: string; weight: string }) => {
    if (!activeWorkout || !languageContextIsClient) return;
    const targetExercise = activeWorkout.find(ex => ex.id === exerciseId);
    if (!targetExercise) return;

    const newSet: LoggedSet = {
      id: String(Date.now()),
      reps: setData.reps,
      weight: setData.weight,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
    };
    const updatedLoggedSets = [...targetExercise.loggedSets, newSet];
    updateExerciseData(exerciseId, updatedLoggedSets);

    toast({
      title: t('activeWorkoutPage.toastSetLoggedTitle', { default: 'Set logged!' }),
      description: t('activeWorkoutPage.toastSetLoggedDescription', { exerciseName: targetExercise.name, default: `Set logged for ${targetExercise.name}` }),
      duration: 1000
    });
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    if (!activeWorkout || !languageContextIsClient) return;
    const targetExercise = activeWorkout.find(ex => ex.id === exerciseId);
    if (!targetExercise) return;

    const updatedLoggedSets = targetExercise.loggedSets.filter(s => s.id !== setId);
    updateExerciseData(exerciseId, updatedLoggedSets);

    toast({ title: t('activeWorkoutPage.toastSetDeletedTitle', { default: 'Set deleted' }), variant: 'destructive', duration: 1000 });
  };

  const handleFinishWorkout = async () => {
    if (!languageContextIsClient || !plan || !user || !activeWorkout) return;

    const completedExercisesData: CompletedExerciseDetail[] = activeWorkout.map(ex => ({
      id: ex.id,
      name: ex.name,
      loggedSets: ex.loggedSets.map(set => ({ reps: set.reps, weight: set.weight })),
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
    }));

    const completedWorkoutData: CompletedWorkout = {
      id: String(Date.now()),
      planId: plan.id,
      planName: plan.name,
      userId: user.uid,
      workoutId: plan.id,
      completionDate: new Date().toISOString().split('T')[0],
      duration: elapsedTime,
      exercises: completedExercisesData
    };

    if (typeof window !== 'undefined') {
      const existingHistoryString = localStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY);
      let history: CompletedWorkout[] = [];
      if (existingHistoryString) {
        try {
          history = JSON.parse(existingHistoryString);
        } catch (e) {
          console.error('Error parsing workout history from localStorage', e);
          history = [];
        }
      }
      history.unshift(completedWorkoutData); // Add to the beginning
      localStorage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 20))); // Keep last 20

      try {
        // Save to Firebase
        await saveSession(completedWorkoutData);
      } catch (e) {
        console.error('Error saving workout session to Firebase', e);
        toast({
          title: t('activeWorkoutPage.toastSaveErrorTitle', { default: 'Save Error' }),
          description: t('activeWorkoutPage.toastSaveErrorDescription', { default: 'Failed to save workout to cloud. Saved locally.' }),
          variant: 'destructive',
        });
        return; // Stop further processing if save to Firebase fails
      }
    }

    // Perform comparison for summary
    let summaryForDisplay: ComparisonSummary | null = null;
    if (typeof window !== 'undefined') {
      const historyString = localStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY);
      if (historyString) {
        try {
          const history: CompletedWorkout[] = JSON.parse(historyString);
          const currentPlanHistory = history.filter(h => h.planId === plan.id);
          let previousWorkout: CompletedWorkout | undefined = undefined;

          // The workout just completed is currentPlanHistory[0].
          // The one before that (if it exists for the same plan) is currentPlanHistory[1].
          if (currentPlanHistory.length > 1) {
            previousWorkout = currentPlanHistory[1];
          }

          if (previousWorkout) {
            summaryForDisplay = completedExercisesData.map(currentEx => {
              const prevEx = Array.isArray(previousWorkout!.exercises) ? previousWorkout!.exercises.find(pEx => pEx.id === currentEx.id) : undefined; // More robust check

              const getCurrentMax = (sets: CompletedSetDetail[], type: 'weight' | 'reps') => {
                if (!sets || sets.length === 0) return null;
                const values = sets.map(s => type === 'weight' ? parseFloat(s.weight) : parseInt(s.reps, 10));
                const validValues = values.filter(v => !isNaN(v) && v > 0); // Ensure positive values
                return validValues.length > 0 ? Math.max(...validValues) : null;
              };

              const currentMaxWeight = getCurrentMax(currentEx.loggedSets, 'weight');
              const currentMaxReps = getCurrentMax(currentEx.loggedSets, 'reps');

              const currentSetsCompleted = currentEx.loggedSets.length;
              let previousSetsCompleted: number | null = null;

              let previousMaxWeight: number | null = null;
              let previousMaxReps: number | null = null;

              if (prevEx) {
                previousMaxWeight = getCurrentMax(prevEx.loggedSets, 'weight');
                previousMaxReps = getCurrentMax(prevEx.loggedSets, 'reps');
                previousSetsCompleted = prevEx.loggedSets.length;
              }

              return {
                exerciseName: currentEx.name,
                currentMaxWeight,
                previousMaxWeight,
                weightImprovement: (currentMaxWeight !== null && previousMaxWeight !== null) ? currentMaxWeight - previousMaxWeight : undefined,
                currentMaxReps,
                previousMaxReps,
                repsImprovement: (currentMaxReps !== null && previousMaxReps !== null) ? currentMaxReps - previousMaxReps : undefined,
                currentSetsCompleted,
                previousSetsCompleted,
                setsImprovement: (previousSetsCompleted !== null) ? currentSetsCompleted - previousSetsCompleted : undefined,
              };
            });
          }
        } catch (e) {
          console.error('Error processing workout history for comparison summary', e);
        }
      }
    }
    setComparisonSummary(summaryForDisplay);

    setIsTimerRunning(false);
    setIsFinished(true);
    clearActiveWorkout();
    toast({
      title: t('activeWorkoutPage.toastWorkoutFinishedTitle', { default: 'Workout Complete!' }),
      description: t('activeWorkoutPage.toastWorkoutFinishedDescription', { duration: elapsedTime, default: `Great job! Duration: ${elapsedTime}` }),
      duration: 1000
    });
  };

  const overallProgress = activeWorkout && activeWorkout.length > 0 && activeWorkout.reduce((acc, ex) => acc + ex.targetSets, 0) > 0
    ? (activeWorkout.reduce((acc, ex) => acc + ex.loggedSets.length, 0) /
      activeWorkout.reduce((acc, ex) => acc + ex.targetSets, 0)) * 100
    : 0;

  if (!activeWorkoutContextIsClient || !languageContextIsClient || plan === undefined) {
    const loadingTitle = languageContextIsClient ? t('activeWorkoutPage.loadingWorkout', { default: 'Loading Workout...' }) : 'Loading Workout...';
    const loadingDescription = languageContextIsClient ? t('activeWorkoutPage.loadingDescription', { default: 'Please wait while we fetch the plan details.' }) : 'Please wait while we fetch the plan details.';
    return (
      <>
        <PageHeader title={loadingTitle} description={loadingDescription} />
        <Skeleton className="h-8 w-full mb-6" />
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-xl overflow-hidden">
              <div className="md:grid md:grid-cols-3">
                <div className="md:col-span-1 p-4 bg-muted/30 flex items-center justify-center">
                  <Skeleton className="w-full h-[200px] rounded-md" />
                </div>
                <div className="md:col-span-2 p-4">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (!plan || !activeWorkout) {
    return <PageHeader title={t('activeWorkoutPage.planNotFound', { default: 'Plan Not Found' })} description={t('activeWorkoutPage.planNotFoundDescription', { default: 'The workout plan could not be loaded.' })} />;
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          {t('activeWorkoutPage.workoutCompleteDescription', { planName: plan.name, default: `Great job! You've completed ${plan.name}` })}
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <p className="text-lg text-foreground dark:text-foreground">
            {t('activeWorkoutPage.totalTimeLabel', { default: 'Total Time' })}: {elapsedTime}
          </p>
          <Button
            onClick={() => router.push('/')}
            size="default"
            variant="outline"
            className="text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
            aria-label="Go back to dashboard"
          >
            <Home className="w-5 h-5 sm:mr-2 text-white" />
            <span className="hidden sm:inline">{t('activeWorkoutPage.backToDashboardButton', { default: 'Back to Dashboard' })}</span>
          </Button>
        </div>

        {comparisonSummary && comparisonSummary.length > 0 && (
          <div className="mt-8 w-full max-w-2xl text-left">
            <div className="space-y-4">
              {comparisonSummary.map((comp, index) => (
                <Card key={index} className="p-4 bg-card shadow-md">
                  <CardTitle className="text-lg mb-2 text-primary">{comp.exerciseName}</CardTitle>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    {/* Colonna Set Completati */}
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {t('activeWorkoutPage.setsCompletedLabel', { defaultValue: 'Sets' })}:
                      </p>
                      <p className="font-semibold">
                        {comp.currentSetsCompleted}
                        {comp.previousSetsCompleted !== null && (
                          <span className="text-xs text-muted-foreground/80 ml-1 font-normal">
                            ({t('activeWorkoutPage.previousLabel', { defaultValue: 'Prev:' })} {comp.previousSetsCompleted})
                          </span>
                        )}
                      </p>
                      {comp.setsImprovement !== undefined && (
                        <p
                          className={`text-xs font-medium ${
                            comp.setsImprovement > 0
                              ? 'text-green-600 dark:text-green-400'
                              : comp.setsImprovement < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300' // Invariato
                          }`}
                        >
                          {comp.setsImprovement > 0 ? `+${comp.setsImprovement}` : comp.setsImprovement}
                        </p>
                      )}
                    </div>

                    {/* Colonna Ripetizioni Massime */}
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {t('activeWorkoutPage.maxRepsLabel', { defaultValue: 'Max Reps' })}:
                      </p>
                      <p className="font-semibold">
                        {comp.currentMaxReps !== null
                          ? `${comp.currentMaxReps} ${t('activeWorkoutPage.repsUnitLabel', { defaultValue: 'reps' })}`
                          : t('activeWorkoutPage.notApplicable', { defaultValue: 'N/A' })}
                        {comp.previousMaxReps !== null && (
                          <span className="text-xs text-muted-foreground/80 ml-1 font-normal">
                            ({t('activeWorkoutPage.previousLabel', { defaultValue: 'Prev:' })} {comp.previousMaxReps}{' '}
                            {t('activeWorkoutPage.repsUnitLabel', { defaultValue: 'reps' })})
                          </span>
                        )}
                      </p>
                      {comp.repsImprovement !== undefined && (
                        <p
                          className={`text-xs font-medium ${
                            comp.repsImprovement > 0
                              ? 'text-green-600 dark:text-green-400'
                              : comp.repsImprovement < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300' // Invariato
                          }`}
                        >
                          {comp.repsImprovement > 0 ? `+${comp.repsImprovement}` : comp.repsImprovement}{' '}
                          {t('activeWorkoutPage.repsUnitLabel', { defaultValue: 'reps' })}
                        </p>
                      )}
                    </div>

                    {/* Colonna Peso Massimo */}
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {t('activeWorkoutPage.maxWeightLabel', { defaultValue: 'Max Weight' })}:
                      </p>
                      <p className="font-semibold">
                        {comp.currentMaxWeight !== null
                          ? `${comp.currentMaxWeight} kg`
                          : t('activeWorkoutPage.notApplicable', { defaultValue: 'N/A' })}
                        {comp.previousMaxWeight !== null && (
                          <span className="text-xs text-muted-foreground/80 ml-1 font-normal">
                            ({t('activeWorkoutPage.previousLabel', { defaultValue: 'Prev:' })} {comp.previousMaxWeight} kg)
                          </span>
                        )}
                      </p>
                      {comp.weightImprovement !== undefined && (
                        <p
                          className={`text-xs font-medium ${
                            comp.weightImprovement > 0
                              ? 'text-green-600 dark:text-green-400'
                              : comp.weightImprovement < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300' // Invariato
                          }`}
                        >
                          {comp.weightImprovement > 0 ? `+${comp.weightImprovement}` : comp.weightImprovement} kg
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        {comparisonSummary === null && !isFinished && (
          <p className="mt-6 text-muted-foreground">
            {t('activeWorkoutPage.calculatingSummary', { defaultValue: 'Calculating summary...' })}
          </p>
        )}
        {isFinished && comparisonSummary && comparisonSummary.length === 0 && (
          <p className="mt-6 text-muted-foreground">
            {t('activeWorkoutPage.noPreviousDataForComparison', { defaultValue: 'No previous data for this plan to compare.' })}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={languageContextIsClient ? t('activeWorkoutPage.title', { planName: plan.name, default: plan.name }) : plan.name}
        description={languageContextIsClient ? plan.description : ''}
        actions={
          <div className="flex items-center gap-1 p-2 border rounded-md bg-background shadow-sm">
            <Timer className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold font-mono">{elapsedTime}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-7 h-7 text-black dark:text-black"
              aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700 dark:text-muted-foreground">
            {t('activeWorkoutPage.overallProgressLabel', { default: 'Overall Progress' })}
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="w-full h-2 bg-green-200 dark:bg-green-800 [&>div]:bg-green-600 dark:[&>div]:bg-green-400" />
      </div>

      <div className="space-y-8">
        {activeWorkout.map((exercise, index) => (
          <div key={exercise.id} id={`exercise-wrapper-${exercise.id}`}>
            <ExerciseCard
              exercise={exercise}
              onLogSet={handleLogSet}
              onDeleteSet={handleDeleteSet}
              isCurrentlyVisible={index === firstUncompletedIndex}
              exerciseIndex={index}
              totalExercises={activeWorkout.length}
              t={t}
            />
          </div>
        ))}
      </div>

      {/* Finish Workout Fixed Button */}
      {!isFinished && (
        <div className="fixed bottom-6 right-6 z-50">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="shadow-xl bg-red-600 hover:bg-red-700 text-black dark:text-black rounded-full px-6 py-6 h-auto"
                aria-label="Finish workout"
              >
                <XCircle className="w-6 h-6 mr-2 shrink-0" />
                {t('activeWorkoutPage.finishWorkoutButton', { default: 'Finish Workout' })}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('activeWorkoutPage.confirmFinishTitle', { default: 'Finish Workout?' })}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('activeWorkoutPage.confirmFinishDescription', { default: 'Are you sure you want to finish this workout? Your progress will be saved.' })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogCancel className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700">
                  {t('calendarPage.cancelButton', { default: 'Cancel' })}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFinishWorkout}
                  disabled={isSaving}
                  className="text-black dark:text-black"
                  aria-label="Confirm finish workout"
                >
                  {t('activeWorkoutPage.confirmFinishButton', { default: 'Finish' })}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
