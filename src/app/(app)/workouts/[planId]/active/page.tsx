
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
import { CheckCircle, XCircle, Timer, Play, Pause, ChevronLeft, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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
}

interface ActiveExercise extends ExerciseMock {
  loggedSets: LoggedSet[];
}


export default function ActiveWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [plan, setPlan] = useState<WorkoutPlan | null | undefined>(undefined);
  const [activeWorkout, setActiveWorkout] = useState<ActiveExercise[] | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');

  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const planId = typeof params.planId === 'string' ? params.planId : undefined;

  useEffect(() => {
    if (planId) {
      const foundPlan = mockWorkoutPlans.find(p => p.id === planId);
      setPlan(foundPlan || null);
      if (foundPlan) {
        setActiveWorkout(foundPlan.exercises.map(ex => ({ ...ex, loggedSets: [] })));
        setWorkoutStartTime(new Date());
        setIsTimerRunning(true);
      } else {
        setActiveWorkout(null);
      }
    } else {
      setPlan(null);
      setActiveWorkout(null);
    }
  }, [planId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && workoutStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - workoutStartTime.getTime();
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
  }, [isTimerRunning, workoutStartTime]);

  const handleLogSet = () => {
    if (!currentReps || !currentWeight || !activeWorkout) return;
    const updatedWorkout = [...activeWorkout];
    const currentExercise = updatedWorkout[currentExerciseIndex];
    currentExercise.loggedSets.push({ id: String(Date.now()), reps: currentReps, weight: currentWeight });
    setActiveWorkout(updatedWorkout);
    setCurrentReps('');
    setCurrentWeight('');
    toast({ title: t('activeWorkoutPage.toastSetLoggedTitle'), description: t('activeWorkoutPage.toastSetLoggedDescription', { exerciseName: currentExercise.name }) });
  };

  const handleDeleteSet = (setIndex: number) => {
    if (!activeWorkout) return;
    const updatedWorkout = [...activeWorkout];
    updatedWorkout[currentExerciseIndex].loggedSets.splice(setIndex, 1);
    setActiveWorkout(updatedWorkout);
     toast({ title: t('activeWorkoutPage.toastSetDeletedTitle'), variant: 'destructive' });
  };

  const handleNextExercise = () => {
    if (activeWorkout && currentExerciseIndex < activeWorkout.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleFinishWorkout = () => {
    setIsTimerRunning(false);
    setIsFinished(true);
    toast({ title: t('activeWorkoutPage.toastWorkoutFinishedTitle'), description: t('activeWorkoutPage.toastWorkoutFinishedDescription', { duration: elapsedTime }) });
    // router.push('/'); // Or to a summary page
  };

  const currentExercise = activeWorkout ? activeWorkout[currentExerciseIndex] : null;
  const totalSetsForCurrentExercise = currentExercise?.targetSets ?? 0;
  const completedSetsForCurrentExercise = currentExercise?.loggedSets.length ?? 0;
  const progressForCurrentExercise = totalSetsForCurrentExercise > 0 ? (completedSetsForCurrentExercise / totalSetsForCurrentExercise) * 100 : 0;
  
  const overallProgress = activeWorkout ? (activeWorkout.reduce((acc, ex) => acc + ex.loggedSets.length, 0) / activeWorkout.reduce((acc, ex) => acc + ex.targetSets, 0)) * 100 : 0;


  if (plan === undefined) {
    return <PageHeader title={t('activeWorkoutPage.loadingWorkout')} description={t('activeWorkoutPage.loadingDescription')} />;
  }

  if (!plan || !activeWorkout) {
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
                    <AlertDialogFooter>
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


      {currentExercise && (
        <Card className="shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm">
          <div className="md:grid md:grid-cols-3">
            <div className="md:col-span-1 p-2 bg-muted/30 flex items-center justify-center">
              {currentExercise.gifUrl ? (
                  <Image 
                    src={currentExercise.gifUrl} 
                    alt={`${currentExercise.name} exercise demonstration`} 
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
                            {currentExerciseIndex + 1}. {currentExercise.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {t('activeWorkoutPage.targetSetsLabel')}: {currentExercise.targetSets} | {t('activeWorkoutPage.targetRepsLabel')}: {currentExercise.targetReps}
                        </CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handlePrevExercise} disabled={currentExerciseIndex === 0}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextExercise} disabled={currentExerciseIndex === activeWorkout.length - 1}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{t('activeWorkoutPage.setCompletionLabel', { completed: completedSetsForCurrentExercise, total: totalSetsForCurrentExercise })}</span>
                         <span className="text-xs font-medium">{Math.round(progressForCurrentExercise)}%</span>
                    </div>
                    <Progress value={progressForCurrentExercise} className="h-1.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={(e) => { e.preventDefault(); handleLogSet(); }} className="grid grid-cols-6 gap-3 items-end mb-4">
                  <div className="col-span-2">
                    <Label htmlFor="reps" className="text-xs">{t('activeWorkoutPage.repsInputLabel')}</Label>
                    <Input id="reps" type="number" placeholder="8" value={currentReps} onChange={(e) => setCurrentReps(e.target.value)} required className="h-9"/>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="weight" className="text-xs">{t('activeWorkoutPage.weightInputLabel')}</Label>
                    <Input id="weight" type="number" placeholder="60" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} required className="h-9" />
                  </div>
                  <div className="col-span-2">
                    <Button type="submit" className="w-full h-9" disabled={completedSetsForCurrentExercise >= totalSetsForCurrentExercise}>
                      <PlusCircle className="w-4 h-4 mr-1.5" /> {t('activeWorkoutPage.logSetButton')}
                    </Button>
                  </div>
                </form>

                {currentExercise.loggedSets.length > 0 && (
                  <div className="max-h-40 overflow-y-auto pr-1">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4 h-8 text-xs">{t('activeWorkoutPage.setColumnLabel')}</TableHead>
                          <TableHead className="w-1/3 h-8 text-xs">{t('activeWorkoutPage.repsColumnLabel')}</TableHead>
                          <TableHead className="w-1/3 h-8 text-xs">{t('activeWorkoutPage.weightColumnLabel')}</TableHead>
                          <TableHead className="w-auto h-8 text-xs text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentExercise.loggedSets.map((set, index) => (
                          <TableRow key={set.id}>
                            <TableCell className="py-1.5 text-sm font-medium">{index + 1}</TableCell>
                            <TableCell className="py-1.5 text-sm">{set.reps}</TableCell>
                            <TableCell className="py-1.5 text-sm">{set.weight} kg</TableCell>
                            <TableCell className="py-1.5 text-right">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSet(index)}>
                                    <Trash2 className="h-3.5 w-3.5"/>
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {currentExercise.loggedSets.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">{t('activeWorkoutPage.noSetsLoggedYet')}</p>
                )}
              </CardContent>
            </div>
          </div>
           <CardFooter className="p-4 border-t flex justify-center">
                {completedSetsForCurrentExercise >= totalSetsForCurrentExercise && currentExerciseIndex < activeWorkout.length - 1 && (
                    <Button onClick={handleNextExercise} variant="default" size="lg" className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
                        {t('activeWorkoutPage.nextExerciseButton')} <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                )}
                 {completedSetsForCurrentExercise >= totalSetsForCurrentExercise && currentExerciseIndex === activeWorkout.length - 1 && (
                    <Button onClick={handleFinishWorkout} variant="default" size="lg" className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                        <CheckCircle className="w-5 h-5 mr-2" /> {t('activeWorkoutPage.completeWorkoutButton')}
                    </Button>
                )}
            </CardFooter>
        </Card>
      )}
    </>
  );
}
