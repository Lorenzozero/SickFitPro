
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Aggiunto import per Image
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Rimosso CardHeader, CardTitle qui
import { PlusCircle, Edit2, Trash2, Share2, PlayCircle, ListChecks, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveWorkout } from '@/context/active-workout-context';
import { useRouter } from 'next/navigation';
import { MuscleGroupIcons, type MuscleGroup } from '@/components/shared/muscle-group-icons'; 

interface ExerciseDetail {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: number; 
  duration: string; 
  exerciseDetails: ExerciseDetail[];
  muscleGroups: MuscleGroup[]; 
}

const initialWorkoutPlans: WorkoutPlan[] = [
  { 
    id: '1', 
    name: 'Full Body Blast', 
    description: 'A comprehensive full-body workout for strength and endurance.', 
    exercises: 2, 
    duration: '60 min', 
    exerciseDetails: [
      { id: 'e1-1', name: 'Squats', sets: '3', reps: '8-12'},
      { id: 'e1-2', name: 'Bench Press', sets: '3', reps: '8-12'},
    ],
    muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'] 
  },
  { 
    id: '2', 
    name: 'Upper Body Power', 
    description: 'Focus on building strength in your chest, back, and arms.', 
    exercises: 1, 
    duration: '75 min', 
    exerciseDetails: [
      { id: 'e2-1', name: 'Pull-ups', sets: '4', reps: 'AMRAP'},
    ],
    muscleGroups: ['Upper Body', 'Back', 'Biceps', 'Shoulders'] 
  },
  { 
    id: '3', 
    name: 'Leg Day Domination', 
    description: 'Intense leg workout to build lower body strength and size.', 
    exercises: 0, 
    duration: '90 min', 
    exerciseDetails: [],
    muscleGroups: ['Lower Body', 'Legs', 'Abs'] 
  },
];


export default function WorkoutPlansPage() {
  const { t } = useLanguage();
  const { activePlanId, isClient: activeWorkoutIsClient, startActiveWorkout: contextStartWorkout } = useActiveWorkout();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>(initialWorkoutPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState<Partial<WorkoutPlan> & { exerciseDetails: ExerciseDetail[], muscleGroups?: MuscleGroup[] }>({ name: '', description: '', exerciseDetails: [], muscleGroups: [] });
  
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');

  const { toast } = useToast();

  const openDialog = (plan?: WorkoutPlan) => {
    if (plan) {
      setCurrentPlan({ ...plan, exerciseDetails: [...(plan.exerciseDetails || [])], muscleGroups: [...(plan.muscleGroups || [])] });
    } else {
      setCurrentPlan({ name: '', description: '', exerciseDetails: [], duration: 'N/A', muscleGroups: [] });
    }
    setNewExerciseName('');
    setNewExerciseSets('');
    setNewExerciseReps('');
    setIsDialogOpen(true);
  };

  const handleAddExerciseToCurrentPlan = () => {
    if (!newExerciseName.trim() || !newExerciseSets.trim() || !newExerciseReps.trim()) {
      toast({ title: t('toastErrorTitle'), description: "Please fill in exercise name, sets, and reps.", variant: "destructive" });
      return;
    }
    const newExercise: ExerciseDetail = {
      id: String(Date.now()), 
      name: newExerciseName,
      sets: newExerciseSets,
      reps: newExerciseReps,
    };
    setCurrentPlan(prev => ({
      ...prev,
      exerciseDetails: [...(prev.exerciseDetails || []), newExercise]
    }));
    setNewExerciseName('');
    setNewExerciseSets('');
    setNewExerciseReps('');
  };

  const handleRemoveExerciseFromCurrentPlan = (exerciseId: string) => {
    setCurrentPlan(prev => ({
        ...prev,
        exerciseDetails: (prev.exerciseDetails || []).filter(ex => ex.id !== exerciseId)
    }));
  };
  
  const handleSavePlan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPlan.name?.trim()) {
        toast({title: t('toastErrorTitle'), description: "Plan name is required.", variant: "destructive"});
        return;
    }

    const planToSave: WorkoutPlan = {
      id: currentPlan.id || String(Date.now()),
      name: currentPlan.name,
      description: currentPlan.description || '',
      exerciseDetails: currentPlan.exerciseDetails || [],
      exercises: (currentPlan.exerciseDetails || []).length,
      duration: currentPlan.duration || 'N/A', 
      muscleGroups: currentPlan.muscleGroups || [], 
    };
    
    if (currentPlan.id) { 
      setPlans(plans.map(p => p.id === planToSave.id ? planToSave : p));
      toast({ 
        title: t('workoutPlansPage.toastPlanUpdatedTitle'), 
        description: t('workoutPlansPage.toastPlanUpdatedDescription', { planName: planToSave.name }) 
      });
    } else { 
      setPlans([...plans, planToSave]);
      toast({ 
        title: t('workoutPlansPage.toastPlanCreatedTitle'), 
        description: t('workoutPlansPage.toastPlanCreatedDescription', { planName: planToSave.name }) 
      });
    }
    setIsDialogOpen(false);
    setCurrentPlan({ name: '', description: '', exerciseDetails: [], muscleGroups: [] }); 
  };
  
  const handleDeletePlan = (id: string, name: string) => {
    setPlans(plans.filter(p => p.id !== id));
    toast({ 
      title: t('workoutPlansPage.toastPlanDeletedTitle'), 
      description: t('workoutPlansPage.toastPlanDeletedDescription', { planName: name }), 
      variant: "destructive" 
    });
  }

  const handleSharePlan = (planName: string) => {
    navigator.clipboard.writeText(`Check out my workout plan: ${planName} on SickFit Pro!`); 
    toast({ 
      title: t('workoutPlansPage.toastLinkCopiedTitle'), 
      description: t('workoutPlansPage.toastLinkCopiedDescription') 
    });
  }

  const handleStartPlanClick = (planId: string, planName: string) => {
    if (activeWorkoutIsClient && activePlanId) {
      return;
    }
    contextStartWorkout(planId, planName);
    router.push(`/workouts/${planId}/active`);
  };

  return (
    <>
      <PageHeader
        title={t('workoutPlansPage.title')}
        description={t('workoutPlansPage.description')}
        actions={
          <Button onClick={() => openDialog()} disabled={!!(activeWorkoutIsClient && activePlanId)}>
            <PlusCircle className="w-4 h-4 mr-2" /> {t('workoutPlansPage.createNewPlanButton')}
          </Button>
        }
      />
      {activeWorkoutIsClient && activePlanId && (
          <Card className="mb-6 shadow-md border-destructive bg-destructive/10">
            <CardHeader className="p-4"> {/* Added CardHeader for consistency */}
              <h3 className="text-destructive flex items-center font-semibold"> {/* Changed to h3 for semantic consistency */}
                <Ban className="w-5 h-5 mr-2" />
                {t('activeWorkoutPage.workoutInProgressTitle', { default: 'Workout In Progress' })}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive-foreground">
                 {t('activeWorkoutPage.finishCurrentWorkoutPrompt', { default: 'You have an active workout. Please finish or abandon it before starting a new one or creating/editing plans.' })}
              </p>
               <Button asChild variant="outline" className="mt-3">
                <Link href={`/workouts/${activePlanId}/active`}>{t('resumeWorkoutButton.resumeTitle')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      <div className="space-y-6"> {/* Changed grid to space-y for single column */}
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* CardHeader removed as per new layout requirement */}
            <CardContent className="flex-grow p-4"> {/* Added padding to CardContent */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Left: Image */}
                <div className="relative w-full sm:w-32 h-48 flex-shrink-0"> 
                  <Image 
                      src="https://placehold.co/128x192.png" 
                      alt={t('workoutPlansPage.muscleSilhouetteAlt', {default: 'Muscle groups involved'})} 
                      layout="fill"
                      objectFit="contain"
                      className="rounded-sm"
                      data-ai-hint="muscle map human anatomy"
                  />
                </div>

                {/* Right: Details */}
                <div className="flex-grow space-y-2">
                  <h3 className="text-xl font-semibold text-primary">{plan.name}</h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{t('workoutPlansPage.muscleGroupsLabel', {default: 'Muscles'})}:</span>
                    <MuscleGroupIcons muscleGroups={plan.muscleGroups} iconClassName="w-4 h-4 text-accent" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{t('workoutPlansPage.exercisesLabel')}: {plan.exercises}</p>
                  <p className="text-sm text-muted-foreground">{t('workoutPlansPage.estDurationLabel')}: {plan.duration}</p>
                  
                  {plan.exerciseDetails && plan.exerciseDetails.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t('workoutPlansPage.exercisesLabel')}</h4>
                        <ScrollArea className="h-24">
                            <ul className="list-disc list-inside text-xs space-y-0.5 pr-2">
                                {plan.exerciseDetails.map(ex => <li key={ex.id} className="truncate">{ex.name} ({ex.sets}x{ex.reps})</li>)}
                            </ul>
                        </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t p-4"> {/* Added padding to CardFooter */}
              <Button 
                variant="default" 
                size="sm"
                disabled={!!(activeWorkoutIsClient && activePlanId)}
                onClick={() => handleStartPlanClick(plan.id, plan.name)}
                className="w-full sm:w-auto"
              >
                <PlayCircle className="w-4 h-4 mr-2" /> {t('workoutPlansPage.startButton')}
              </Button>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openDialog(plan)} disabled={!!(activeWorkoutIsClient && activePlanId)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleSharePlan(plan.name)}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id, plan.name)} disabled={!!(activeWorkoutIsClient && activePlanId)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentPlan?.id ? t('workoutPlansPage.dialogEditTitle') : t('workoutPlansPage.dialogCreateTitle')}</DialogTitle>
            <DialogDescription>
              {currentPlan?.id ? t('workoutPlansPage.dialogEditDescription') : t('workoutPlansPage.dialogCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePlan}>
            <ScrollArea className="max-h-[calc(100vh-20rem)]">
              <div className="grid gap-4 py-4 px-1"> 
                <div>
                  <Label htmlFor="planName">{t('workoutPlansPage.planNameLabel')}</Label>
                  <Input 
                    id="planName" 
                    name="planName" 
                    value={currentPlan.name || ''}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, name: e.target.value }))}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="planDescription">{t('workoutPlansPage.descriptionLabel')}</Label>
                  <Textarea 
                    id="planDescription" 
                    name="planDescription" 
                    value={currentPlan.description || ''}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="planDuration">{t('workoutPlansPage.estDurationLabel')}</Label>
                  <Input 
                    id="planDuration" 
                    name="planDuration" 
                    value={currentPlan.duration || 'N/A'}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                {/* TODO: Aggiungere qui un selettore per i muscleGroups se si vuole renderli modificabili */}

                <Card className="mt-4">
                  <CardHeader className="pb-2 p-4"> {/* Added padding to CardHeader */}
                    <h4 className="text-base flex items-center font-semibold"> {/* Changed to h4 */}
                        <ListChecks className="w-4 h-4 mr-2" />
                        {t('workoutPlansPage.addExerciseButton')}
                    </h4>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4"> {/* Added padding to CardContent */}
                    <div>
                      <Label htmlFor="newExerciseName">{t('workoutPlansPage.exerciseNameLabel')}</Label>
                      <Input id="newExerciseName" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} placeholder="es. Squat" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="newExerciseSets">{t('workoutPlansPage.setsLabel')}</Label>
                        <Input id="newExerciseSets" value={newExerciseSets} onChange={(e) => setNewExerciseSets(e.target.value)} placeholder="es. 3" />
                      </div>
                      <div>
                        <Label htmlFor="newExerciseReps">{t('workoutPlansPage.repsLabel')}</Label>
                        <Input id="newExerciseReps" value={newExerciseReps} onChange={(e) => setNewExerciseReps(e.target.value)} placeholder="es. 8-12" />
                      </div>
                    </div>
                    <div className="flex justify-center">
                        <Button type="button" variant="outline" size="sm" onClick={handleAddExerciseToCurrentPlan} className="w-full">
                        <PlusCircle className="w-4 h-4 mr-2" /> {t('workoutPlansPage.addThisExerciseButton')}
                        </Button>
                    </div>
                  </CardContent>
                </Card>

                {currentPlan.exerciseDetails && currentPlan.exerciseDetails.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">{t('workoutPlansPage.addedExercisesLabel')}</h4>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <ul className="space-y-1">
                        {currentPlan.exerciseDetails.map(ex => (
                          <li key={ex.id} className="flex justify-between items-center text-sm p-1 bg-secondary rounded-sm">
                            <span className="truncate">{ex.name} ({ex.sets} x {ex.reps})</span>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveExerciseFromCurrentPlan(ex.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
                {(!currentPlan.exerciseDetails || currentPlan.exerciseDetails.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center mt-2">{t('workoutPlansPage.noExercisesAddedYet')}</p>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t sm:justify-center">
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('workoutPlansPage.cancelButton')}</Button>
              </DialogClose>
              <Button type="submit">{t('workoutPlansPage.savePlanButton')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

