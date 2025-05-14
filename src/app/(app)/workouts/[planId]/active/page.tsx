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
import { CheckCircle, XCircle, Timer, Play, Pause, PlusCircle, Trash2, Award } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveWorkout } from '@/context/active-workout-context';

// Mock data for workout plans
const mockWorkoutPlans = [
  { 
    id: '1', 
    name: 'Full Body Blast', 
    description: 'A comprehensive full-body workout for strength and endurance.', 
    exercises: [
      { id: 'ex1', name: 'Squats', targetSets: 3, targetReps: '8-12', gifUrl: 'https://picsum.photos/300/200?random=1' },
      { id: 'ex2', name: 'Bench Press', targetSets: 3, targetReps: '8-12', gifUrl: 'https://picsum.photos/300/200?random=2' },
      { id: 'ex3', name: 'Deadlifts', targetSets: 1, targetReps: '5', gifUrl: 'https://picsum.photos/300/200?random=3' },
      { id: 'ex4', name: 'Overhead Press', targetSets: 3, targetReps: '8-12', gifUrl: 'https://picsum.photos/300/200?random=4' },
      { id: 'ex5', name: 'Rows', targetSets: 3, targetReps: '8-12', gifUrl: 'https://picsum.photos/300/200?random=5' },
    ] 
  },
  { 
    id: '2', 
    name: 'Upper Body Power', 
    description: 'Focus on building strength in your chest, back, and arms.',
    exercises: [
      { id: 'ex6', name: 'Bench Press', targetSets: 4, targetReps: '6-10', gifUrl: 'https://picsum.photos/300/200?random=6' },
      { id: 'ex7', name: 'Pull-ups', targetSets: 4, targetReps: 'AMRAP', gifUrl: 'https://picsum.photos/300/200?random=7' },
      { id: 'ex8', name: 'Dips', targetSets: 3, targetReps: '10-15', gifUrl: 'https://picsum.photos/300/200?random=8' },
    ]
  },
  { 
    id: '3', 
    name: 'Leg Day Domination', 
    description: 'Intense leg workout to build lower body strength and size.',
    exercises: [
      { id: 'ex12', name: 'Squats', targetSets: 5, targetReps: '5', gifUrl: 'https://picsum.photos/300/200?random=9' },
      { id: 'ex13', name: 'Romanian Deadlifts', targetSets: 3, targetReps: '8-12', gifUrl: 'https://picsum.photos/300/200?random=10' },
    ]
  },
];

interface ExerciseMock {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  gifUrl?: string;
}

interface WorkoutPlan {
  id:string;
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

interface ExerciseCardProps {
  exercise: ActiveExercise;
  onLogSet: (exerciseId: string, setData: { reps: string; weight: string }) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  isCurrentlyVisible: boolean;
  exerciseIndex: number;
  totalExercises: number;
  t: (key: string, replacements?: Record<string, string | number | undefined>) => string;
}

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
            "shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm transition-opacity duration-500 ease-in-out mb-8",
            isCurrentlyVisible ? 'opacity-100' : 'opacity-60'
        )}
        id={`exercise-${exercise.id}`}
    >
      <div className="md:grid md:grid-cols-3">
        <div className="md:col-span-1 p-4 bg-muted/30 flex items-center justify-center">
          {exercise.gifUrl ? (
            <Image 
              src={exercise.gifUrl} 
              alt={`${exercise.name} ${t('activeWorkoutPage.exerciseDemoAlt')}`} 
              width={300} 
              height={200} 
              className="rounded-md object-cover shadow-md"
              data-ai-hint="exercise movement"
            />
          ) : (
            <div className="w-full h-[200px] flex items-center justify-center bg-muted rounded-md text-muted-foreground">
              {t('activeWorkoutPage.noGifAvailable')}
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
                <CardDescription className="text-base">
                  {t('activeWorkoutPage.targetSetsLabel')}: {exercise.targetSets} | {t('activeWorkoutPage.targetRepsLabel')}: {exercise.targetReps}
                </CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">{exerciseIndex + 1} / {totalExercises}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t('activeWorkoutPage.setCompletionLabel', { completed: completedSets, total: exercise.targetSets })}</span>
                <span className="text-xs font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleLogSetSubmit} className="grid grid-cols-6 gap-3 items-end mb-4">
              <div className="col-span-2">
                <Label htmlFor={`reps-${exercise.id}`} className="text-xs">{t('activeWorkoutPage.repsInputLabel')}</Label>
                <Input id={`reps-${exercise.id}`} type="number" placeholder="8" value={repsInput} onChange={(e) => setRepsInput(e.target.value)} required className="h-9"/>
              </div>
              <div className="col-span-2">
                <Label htmlFor={`weight-${exercise.id}`} className="text-xs">{t('activeWorkoutPage.weightInputLabel')}</Label>
                <Input id={`weight-${exercise.id}`} type="number" placeholder="60" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} required className="h-9" />
              </div>
              <div className="col-span-2">
                <Button type="submit" className="w-full h-9" disabled={completedSets >= exercise.targetSets}>
                  <PlusCircle className="w-4 h-4 mr-1.5" /> {t('activeWorkoutPage.logSetButton')}
                </Button>
              </div>
            </form>

            {exercise.loggedSets.length > 0 && (
              <div className="max-h-48 overflow-y-auto pr-1 mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/5 h-8 text-xs">{t('activeWorkoutPage.setColumnLabel')}</TableHead>
                      <TableHead className="w-1/4 h-8 text-xs">{t('activeWorkoutPage.dateColumnLabel')}</TableHead>
                      <TableHead className="w-1/4 h-8 text-xs">{t('activeWorkoutPage.repsColumnLabel')}</TableHead>
                      <TableHead className="w-1/4 h-8 text-xs">{t('activeWorkoutPage.weightColumnLabel')}</TableHead>
                      <TableHead className="w-auto h-8 text-xs text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercise.loggedSets.map((set, index) => (
                      <TableRow key={set.id}>
                        <TableCell className="py-1.5 text-sm font-medium">{index + 1}</TableCell>
                        <TableCell className="py-1.5 text-sm">{set.date}</TableCell>
                        <TableCell className="py-1.5 text-sm">{set.reps}</TableCell>
                        <TableCell className="py-1.5 text-sm">{set.weight} kg</TableCell>
                        <TableCell className="py-1.5 text-right">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDeleteSet(exercise.id, set.id)}>
                            <Trash2 className="h-3.5 w-3.5"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {exercise.loggedSets.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">{t('activeWorkoutPage.noSetsLoggedYet')}</p>
            )}
            
            {sessionPBs.maxWeight > 0 || sessionPBs.maxReps > 0 ? (
                <div className="p-3 mt-2 border rounded-md bg-accent/10">
                    <h4 className="mb-2 text-sm font-semibold text-accent-foreground flex items-center">
                        <Award className="w-4 h-4 mr-2 text-accent" />
                        {t('activeWorkoutPage.sessionPBsLabel')}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-accent-foreground/80">
                        <p>{t('activeWorkoutPage.maxWeightLabel')}: {sessionPBs.maxWeight} kg</p>
                        <p>{t('activeWorkoutPage.maxRepsLabel')}: {sessionPBs.maxReps} {t('activeWorkoutPage.repsUnitLabel')}</p>
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
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    activePlanId: contextActivePlanId,
    activeWorkoutStartTime: contextStartTimeFromProvider, 
    clearActiveWorkout, 
    isClient: activeWorkoutIsClient 
  } = useActiveWorkout();


  const [plan, setPlan] = useState<WorkoutPlan | null | undefined>(undefined);
  const [activeWorkout, setActiveWorkout] = useState<ActiveExercise[] | null>(null);
  
  const [componentWorkoutStartTime, setComponentWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [visibleExerciseId, setVisibleExerciseId] = useState<string | null>(null);
  
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const planIdFromRoute = typeof params.planId === 'string' ? params.planId : undefined;

  // Effect 1: Load plan details and initialize local exercise state.
  // Validates if the current route's planId matches the one in context.
  useEffect(() => {
    if (!activeWorkoutIsClient || !planIdFromRoute) {
      setPlan(null);
      setActiveWorkout(null);
      return;
    }

    if (!contextActivePlanId || contextActivePlanId !== planIdFromRoute) {
      toast({ 
        title: t('activeWorkoutPage.planNotFound', { default: "Workout Mismatch"}), 
        description: t('activeWorkoutPage.planNotFoundDescription', { default: "No active workout for this plan or mismatch. Redirecting..."}), 
        variant: "destructive" 
      });
      router.push('/start-workout'); 
      setPlan(null);
      setActiveWorkout(null);
      return;
    }

    const foundPlan = mockWorkoutPlans.find(p => p.id === planIdFromRoute);
    setPlan(foundPlan || null);

    if (foundPlan) {
      // TODO: Implement loading of logged sets if resuming a workout session.
      // This currently always starts fresh.
      const initialActiveWorkout = foundPlan.exercises.map(ex => ({ ...ex, loggedSets: [] }));
      setActiveWorkout(initialActiveWorkout);
      if (initialActiveWorkout.length > 0) {
        setVisibleExerciseId(initialActiveWorkout[0].id);
        exerciseRefs.current = initialActiveWorkout.map(() => null);
      }
    } else {
      setActiveWorkout(null); 
      toast({ 
        title: t('activeWorkoutPage.planNotFound', { default: "Plan Not Found"}), 
        description: t('activeWorkoutPage.planNotFoundDescription', { default: "The workout plan could not be loaded."}), 
        variant: "destructive" 
      });
      router.push('/workouts');
    }
  }, [planIdFromRoute, activeWorkoutIsClient, contextActivePlanId, router, toast, t]);


  // Effect 2: Set up local timer based on context's start time.
  useEffect(() => {
    if (plan && activeWorkoutIsClient && contextStartTimeFromProvider) {
      setComponentWorkoutStartTime(new Date(contextStartTimeFromProvider));
      setIsTimerRunning(true); 
    } else {
      setIsTimerRunning(false); 
    }
  }, [plan, contextStartTimeFromProvider, activeWorkoutIsClient]);


  // Effect for elapsedTime string update
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && componentWorkoutStartTime && activeWorkoutIsClient) {
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
  }, [isTimerRunning, componentWorkoutStartTime, activeWorkoutIsClient]);

  // Effect for IntersectionObserver
  useEffect(() => {
    if (!activeWorkout || activeWorkout.length === 0 || !activeWorkoutIsClient) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setVisibleExerciseId(entry.target.id.replace('exercise-', ''));
          }
        });
      },
      { threshold: 0.5, rootMargin: "-40% 0px -40% 0px" } 
    );

    exerciseRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      exerciseRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, [activeWorkout, activeWorkoutIsClient]);


  const updateExerciseData = (exerciseId: string, updatedLoggedSets: LoggedSet[]) => {
    setActiveWorkout(prevWorkout => {
        if (!prevWorkout) return null;
        const newWorkoutState = prevWorkout.map(ex => 
            ex.id === exerciseId 
            ? { ...ex, loggedSets: updatedLoggedSets } 
            : ex
        );
        // TODO: Persist newWorkoutState for resume functionality if desired
        return newWorkoutState;
    });
  };

  const handleLogSet = (exerciseId: string, setData: { reps: string; weight: string }) => {
    if (!activeWorkout) return;
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
        title: t('activeWorkoutPage.toastSetLoggedTitle'), 
        description: t('activeWorkoutPage.toastSetLoggedDescription', { exerciseName: targetExercise.name }) 
    });
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    const targetExercise = activeWorkout.find(ex => ex.id === exerciseId);
    if (!targetExercise) return;

    const updatedLoggedSets = targetExercise.loggedSets.filter(s => s.id !== setId);
    updateExerciseData(exerciseId, updatedLoggedSets);

    toast({ title: t('activeWorkoutPage.toastSetDeletedTitle'), variant: 'destructive' });
  };

  const handleFinishWorkout = () => {
    setIsTimerRunning(false);
    setIsFinished(true);
    clearActiveWorkout(); 
    toast({ 
        title: t('activeWorkoutPage.toastWorkoutFinishedTitle'), 
        description: t('activeWorkoutPage.toastWorkoutFinishedDescription', { duration: elapsedTime }) 
    });
    // TODO: Save completed workout data to history
  };
  
  const overallProgress = activeWorkout && activeWorkout.length > 0 && activeWorkout.reduce((acc, ex) => acc + ex.targetSets, 0) > 0
    ? (activeWorkout.reduce((acc, ex) => acc + ex.loggedSets.length, 0) / 
       activeWorkout.reduce((acc, ex) => acc + ex.targetSets, 0)) * 100 
    : 0;


  if (!activeWorkoutIsClient || plan === undefined) { 
    return (
        <>
            <PageHeader title={t('activeWorkoutPage.loadingWorkout')} description={t('activeWorkoutPage.loadingDescription')} />
            <Skeleton className="h-8 w-full mb-6" />
            <div className="space-y-8">
                {[1,2,3].map(i => (
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

  if (!plan || !activeWorkout) { // Plan might be null if not found or if context mismatch occurred
    return <PageHeader title={t('activeWorkoutPage.planNotFound')} description={t('activeWorkoutPage.planNotFoundDescription')} />;
  }
  
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-bold mb-2">{t('activeWorkoutPage.workoutCompleteTitle')}</h1>
        <p className="text-xl text-muted-foreground mb-4">{t('activeWorkoutPage.workoutCompleteDescription', { planName: plan.name })}</p>
        <p className="text-lg mb-6">{t('activeWorkoutPage.totalTimeLabel')}: {elapsedTime}</p>
        <Button onClick={() => router.push('/')} size="lg">
          {t('activeWorkoutPage.backToDashboardButton')}
        </Button>
      </div>
    );
  }


  return (
    <>
      <PageHeader
        title={t('activeWorkoutPage.title', { planName: plan.name })}
        description={plan.description}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-2 border rounded-md bg-background shadow-sm">
              <Timer className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold font-mono">{elapsedTime}</span>
              <Button variant="ghost" size="icon" onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-7 h-7">
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        {t('activeWorkoutPage.finishWorkoutButton')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('activeWorkoutPage.confirmFinishTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('activeWorkoutPage.confirmFinishDescription')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogCancel>{t('calendarPage.cancelButton')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinishWorkout}>
                        {t('activeWorkoutPage.confirmFinishButton')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">{t('activeWorkoutPage.overallProgressLabel')}</span>
            <span className="text-sm font-semibold">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="w-full h-2" />
      </div>

      <div className="space-y-8">
        {activeWorkout.map((exercise, index) => (
          <div key={exercise.id} ref={el => exerciseRefs.current[index] = el} id={`exercise-wrapper-${exercise.id}`}>
            <ExerciseCard
              exercise={exercise}
              onLogSet={handleLogSet}
              onDeleteSet={handleDeleteSet}
              isCurrentlyVisible={exercise.id === visibleExerciseId}
              exerciseIndex={index}
              totalExercises={activeWorkout.length}
              t={t}
            />
          </div>
        ))}
      </div>

      {activeWorkout.length > 0 && !isFinished && (
        <CardFooter className="p-4 mt-8 border-t flex justify-center">
            <Button onClick={handleFinishWorkout} variant="default" size="lg" className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                <CheckCircle className="w-5 h-5 mr-2" /> {t('activeWorkoutPage.completeWorkoutButton')}
            </Button>
        </CardFooter>
      )}
    </>
  );
}
