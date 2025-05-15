
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Edit2, Trash2, Share2, PlayCircle, ListChecks, Ban, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader as UIDialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter as UIDialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveWorkout } from '@/context/active-workout-context';
import { useRouter } from 'next/navigation';
import type { MuscleGroup } from '@/components/shared/muscle-group-icons';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Importa Checkbox


const initialExercisesMockForSelect: Array<{ id: string; name: string; muscleGroups: MuscleGroup[] }> = [
  { id: 'ex-bp', name: 'Bench Press', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { id: 'ex-sq', name: 'Squat', muscleGroups: ['Legs', 'Core'] },
  { id: 'ex-dl', name: 'Deadlift', muscleGroups: ['Back', 'Legs', 'Core'] },
  { id: 'ex-ohp', name: 'Overhead Press', muscleGroups: ['Shoulders', 'Triceps'] },
  { id: 'ex-row', name: 'Barbell Row', muscleGroups: ['Back', 'Biceps'] },
  { id: 'ex-curl', name: 'Bicep Curl', muscleGroups: ['Biceps'] },
  { id: 'ex-pushdown', name: 'Tricep Pushdown', muscleGroups: ['Triceps'] },
  { id: 'ex-legpress', name: 'Leg Press', muscleGroups: ['Legs'] },
  { id: 'ex-latraise', name: 'Lateral Raise', muscleGroups: ['Shoulders'] },
  { id: 'ex-plank', name: 'Plank', muscleGroups: ['Abs', 'Core'] },
  { id: 'ex-pullup', name: 'Pull-up', muscleGroups: ['Back', 'Biceps'] },
  { id: 'ex-dip', name: 'Dip', muscleGroups: ['Chest', 'Triceps'] },
  { id: 'ex-lunge', name: 'Lunge', muscleGroups: ['Legs'] },
  { id: 'ex-calfr', name: 'Calf Raise', muscleGroups: ['Legs'] },
  { id: 'ex-run', name: 'Running (Cardio)', muscleGroups: ['Cardio', 'Legs'] },
  { id: 'ex-cyc', name: 'Cycling (Cardio)', muscleGroups: ['Cardio', 'Legs'] },
  { id: 'ex-dsp', name: 'Dumbbell Shoulder Press', muscleGroups: ['Shoulders', 'Triceps']},
  { id: 'ex-dfly', name: 'Dumbbell Flyes', muscleGroups: ['Chest']},
  { id: 'ex-legext', name: 'Leg Extension', muscleGroups: ['Legs']},
  { id: 'ex-legcurl', name: 'Leg Curl', muscleGroups: ['Legs']},
];
const CREATE_NEW_EXERCISE_VALUE = '__create_new__';

// Definisci tutti i gruppi muscolari selezionabili
const allMuscleGroups: MuscleGroup[] = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 
  'Triceps', 'Abs', 'Core', 'Cardio', 'Full Body', 
  'Upper Body', 'Lower Body'
];

interface ExerciseDetail {
  id: string;
  name: string;
  sets: string;
  reps: string;
  muscleGroups: MuscleGroup[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  exerciseDetails: ExerciseDetail[];
  duration: string;
  muscleGroups: MuscleGroup[]; // Gruppi muscolari principali per l'intera scheda
}

const initialWorkoutPlans: WorkoutPlan[] = [
  {
    id: '1',
    name: 'Full Body Blast',
    exerciseDetails: [
      { id: 'e1-1', name: 'Squat', sets: '3', reps: '8-12', muscleGroups: ['Legs', 'Core']},
      { id: 'e1-2', name: 'Bench Press', sets: '3', reps: '8-12', muscleGroups: ['Chest', 'Triceps', 'Shoulders']},
    ],
    muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'],
    duration: '60 min',
  },
  {
    id: '2',
    name: 'Upper Body Power',
    exerciseDetails: [
      { id: 'e2-1', name: 'Pull-ups', sets: '4', reps: 'AMRAP', muscleGroups: ['Back', 'Biceps']},
    ],
    muscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
    duration: '75 min',
  },
  {
    id: '3',
    name: 'Leg Day Domination',
    exerciseDetails: [],
    muscleGroups: ['Legs', 'Abs', 'Lower Body'],
    duration: '90 min',
  },
];


export default function WorkoutPlansPage() {
  const { t, isClient: languageContextIsClient } = useLanguage();
  const { activePlanId, isClient: activeWorkoutIsClient, startActiveWorkout: contextStartWorkout } = useActiveWorkout();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>(initialWorkoutPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [currentPlan, setCurrentPlan] = useState<Partial<WorkoutPlan> & { exerciseDetails: ExerciseDetail[] }>({ name: '', exerciseDetails: [], duration: '', muscleGroups: [] });

  const [selectedExerciseIdOrAction, setSelectedExerciseIdOrAction] = useState<string>(initialExercisesMockForSelect[0]?.id || '');
  const [newExerciseManualName, setNewExerciseManualName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');
  const [dialogSelectedMuscleGroups, setDialogSelectedMuscleGroups] = useState<MuscleGroup[]>([]); // Stato per i gruppi muscolari nel dialogo

  const { toast } = useToast();

  useEffect(() => {
    if (selectedExerciseIdOrAction && selectedExerciseIdOrAction !== CREATE_NEW_EXERCISE_VALUE) {
      const selectedEx = initialExercisesMockForSelect.find(ex => ex.id === selectedExerciseIdOrAction);
      setDialogSelectedMuscleGroups(selectedEx?.muscleGroups || []);
    } else {
      setDialogSelectedMuscleGroups([]); 
    }
  }, [selectedExerciseIdOrAction]);

  const handleMuscleGroupChangeInDialog = (muscleGroup: MuscleGroup, checked: boolean) => {
    setDialogSelectedMuscleGroups(prev => 
      checked ? [...prev, muscleGroup] : prev.filter(mg => mg !== muscleGroup)
    );
  };

  const openDialog = (plan?: WorkoutPlan) => {
    if (plan) {
      setCurrentPlan({ ...plan, exerciseDetails: [...(plan.exerciseDetails || [])], muscleGroups: [...(plan.muscleGroups || [])] });
    } else {
      setCurrentPlan({ name: '', exerciseDetails: [], duration: '', muscleGroups: [] });
    }
    setSelectedExerciseIdOrAction(initialExercisesMockForSelect[0]?.id || '');
    setNewExerciseManualName('');
    setNewExerciseSets('');
    setNewExerciseReps('');
    setDialogSelectedMuscleGroups([]); // Resetta i gruppi muscolari del dialogo all'apertura
    setIsDialogOpen(true);
  };

  const handleAddExerciseToCurrentPlan = () => {
    let exerciseNameToAdd = '';
    
    if (selectedExerciseIdOrAction === CREATE_NEW_EXERCISE_VALUE) {
      if (!newExerciseManualName.trim()) {
        toast({ title: t('toastErrorTitle'), description: t('workoutPlansPage.errorNewExerciseNameRequired', { default: "Please enter a name for the new exercise." }), variant: "destructive" });
        return;
      }
      exerciseNameToAdd = newExerciseManualName.trim();
    } else {
      const selectedExercise = initialExercisesMockForSelect.find(ex => ex.id === selectedExerciseIdOrAction);
      if (!selectedExercise) {
         toast({ title: t('toastErrorTitle'), description: t('workoutPlansPage.errorSelectedExerciseNotFound', { default: "Selected exercise not found."}), variant: "destructive" });
        return;
      }
      exerciseNameToAdd = selectedExercise.name;
    }

    if (!exerciseNameToAdd || !newExerciseSets.trim() || !newExerciseReps.trim()) {
      toast({ title: t('toastErrorTitle'), description: t('workoutPlansPage.errorExerciseDetailsRequired', { default: "Please fill in exercise name, sets, and reps."}), variant: "destructive" });
      return;
    }
    
    if (dialogSelectedMuscleGroups.length === 0 && selectedExerciseIdOrAction !== CREATE_NEW_EXERCISE_VALUE) {
        const predefinedExercise = initialExercisesMockForSelect.find(ex => ex.id === selectedExerciseIdOrAction);
        if (predefinedExercise) {
            // If no muscle groups were explicitly changed in dialog, use the predefined ones for existing exercises
             setDialogSelectedMuscleGroups(predefinedExercise.muscleGroups);
        }
    }


    const newExerciseDetail: ExerciseDetail = {
      id: String(Date.now()),
      name: exerciseNameToAdd,
      sets: newExerciseSets,
      reps: newExerciseReps,
      muscleGroups: [...dialogSelectedMuscleGroups], // Usa i gruppi muscolari selezionati nel dialogo
    };

    setCurrentPlan(prev => ({
      ...prev,
      exerciseDetails: [...(prev.exerciseDetails || []), newExerciseDetail],
      // Aggiorna i gruppi muscolari della scheda in base agli esercizi aggiunti
      muscleGroups: Array.from(new Set([...(prev.muscleGroups || []), ...newExerciseDetail.muscleGroups]))
    }));

    // Reset fields for adding next exercise
    setSelectedExerciseIdOrAction(initialExercisesMockForSelect[0]?.id || '');
    setNewExerciseManualName('');
    setNewExerciseSets('');
    setNewExerciseReps('');
    setDialogSelectedMuscleGroups([]); // Resetta i gruppi muscolari del dialogo
  };

  const handleRemoveExerciseFromCurrentPlan = (exerciseId: string) => {
    setCurrentPlan(prev => {
        const updatedExerciseDetails = (prev.exerciseDetails || []).filter(ex => ex.id !== exerciseId);
        const updatedMuscleGroups = Array.from(new Set(updatedExerciseDetails.flatMap(ex => ex.muscleGroups)));
        return {
            ...prev,
            exerciseDetails: updatedExerciseDetails,
            muscleGroups: updatedMuscleGroups
        }
    });
  };

  const handleSavePlan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPlan.name?.trim()) {
        toast({title: t('toastErrorTitle'), description: t('workoutPlansPage.errorPlanNameRequired', { default: "Plan name is required."}), variant: "destructive"});
        return;
    }

    const planToSave: WorkoutPlan = {
      id: currentPlan.id || String(Date.now()),
      name: currentPlan.name,
      exerciseDetails: currentPlan.exerciseDetails || [],
      duration: currentPlan.duration || '',
      muscleGroups: Array.from(new Set((currentPlan.exerciseDetails || []).flatMap(ex => ex.muscleGroups))), // Ricalcola i gruppi della scheda
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
    setCurrentPlan({ name: '', exerciseDetails: [], duration: '', muscleGroups: [] });
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
        title={languageContextIsClient ? t('nav.workoutPlans') : "Workout Plans"}
        actions={
          <Button onClick={() => openDialog()} disabled={!!(activeWorkoutIsClient && activePlanId)}>
            <PlusCircle className="w-4 h-4 mr-2" /> {t('workoutPlansPage.createNewPlanButton')}
          </Button>
        }
      />
      {activeWorkoutIsClient && activePlanId && (
          <Card className="mb-6 shadow-md border-destructive bg-destructive/10">
            <UIDialogHeader className="p-4">
              <h3 className="text-destructive flex items-center font-semibold">
                <Ban className="w-5 h-5 mr-2" />
                {t('activeWorkoutPage.workoutInProgressTitle', { default: 'Workout In Progress' })}
              </h3>
            </UIDialogHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-destructive-foreground mt-2">
                 {t('activeWorkoutPage.finishCurrentWorkoutPrompt', { default: 'You have an active workout. Please finish or abandon it before starting a new one or creating/editing plans.' })}
              </p>
               <Button asChild variant="outline" className="mt-3">
                <Link href={`/workouts/${activePlanId}/active`}>{t('resumeWorkoutButton.resumeTitle')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="flex-grow p-4 relative">
              <div className="flex items-start gap-4">
                <div className="relative w-24 sm:w-32 h-36 sm:h-44 flex-shrink-0">
                  <Image
                      src={
                        plan.id === '1' ? "https://placehold.co/144x192.png" :
                        plan.id === '2' ? "https://placehold.co/144x192.png" :
                        "https://placehold.co/144x192.png"
                      }
                      alt={t('workoutPlansPage.muscleSilhouetteAlt', {default: 'Muscle groups involved'})}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-sm"
                      data-ai-hint={
                        plan.id === '1' ? "energetic fitness" :
                        plan.id === '2' ? "strength arms" :
                        "powerful legs"
                      }
                  />
                </div>

                <div className="flex-grow flex flex-col min-w-0">
                  <h3 className="text-xl font-semibold text-primary mb-2 truncate">{plan.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-x-4 mb-2"> 
                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-0.5">
                            {t('workoutPlansPage.involvedMusclesLabel', { default: "Muscles Involved:"})}
                        </h4>
                        {plan.muscleGroups && plan.muscleGroups.length > 0 ? (
                            <ul className="list-disc list-inside text-xs space-y-0.5 pl-4 text-muted-foreground">
                                {plan.muscleGroups.map(group => <li key={group} className="truncate">{t(`exercisesPage.muscleGroup${group.replace(/\s+/g, '')}`, {default: group})}</li>)}
                            </ul>
                        ) : (
                            <p className="text-xs text-muted-foreground">{t('workoutPlansPage.noMuscleGroupsSpecified', {default: 'N/A'})}</p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{plan.duration}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3 border-t p-3">
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
        <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh] p-0">
          <UIDialogHeader className="p-6 border-b shrink-0">
            <DialogTitle>{currentPlan?.id ? t('workoutPlansPage.dialogEditTitle') : t('workoutPlansPage.dialogCreateTitle')}</DialogTitle>
          </UIDialogHeader>
          <form onSubmit={handleSavePlan} className="flex flex-col flex-grow min-h-0">
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
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
                  <Label htmlFor="planDuration">{t('workoutPlansPage.planDurationLabel')}</Label>
                  <Input
                    id="planDuration"
                    name="planDuration"
                    value={currentPlan.duration || ''}
                    placeholder={t('workoutPlansPage.planDurationPlaceholder', { default: "es. 60 min"})}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>

                <div className="mt-4 border rounded-md p-4">
                  <h4 className="text-base flex items-center font-semibold mb-3">
                      <ListChecks className="w-4 h-4 mr-2" />
                      {t('workoutPlansPage.addExerciseButton')}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="selectExercise">{t('workoutPlansPage.exerciseNameLabel')}</Label>
                      <Select
                        value={selectedExerciseIdOrAction}
                        onValueChange={setSelectedExerciseIdOrAction}
                      >
                        <SelectTrigger id="selectExercise">
                          <SelectValue placeholder={t('workoutPlansPage.selectExercisePlaceholder', { default: "Select an exercise" })} />
                        </SelectTrigger>
                        <SelectContent>
                          {initialExercisesMockForSelect.map(ex => (
                            <SelectItem key={ex.id} value={ex.id}>
                                {ex.name} 
                                {ex.muscleGroups && ex.muscleGroups.length > 0 && 
                                 ` (${ex.muscleGroups.map(mg => t(`exercisesPage.muscleGroup${mg.replace(/\s+/g, '')}`, {default: mg})).join(', ')})`}
                            </SelectItem>
                          ))}
                          <SelectItem value={CREATE_NEW_EXERCISE_VALUE}>
                            {t('workoutPlansPage.createNewExerciseInDialog', { default: "Create New Exercise..."})}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedExerciseIdOrAction === CREATE_NEW_EXERCISE_VALUE && (
                      <div>
                        <Label htmlFor="newExerciseManualName">{t('workoutPlansPage.newExerciseNameLabel', { default: 'New Exercise Name' })}</Label>
                        <Input
                          id="newExerciseManualName"
                          value={newExerciseManualName}
                          onChange={(e) => setNewExerciseManualName(e.target.value)}
                          placeholder={t('workoutPlansPage.newExerciseNamePlaceholder', { default: "e.g., Custom Bicep Curl"})}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="newExerciseSets">{t('workoutPlansPage.setsLabel')}</Label>
                        <Input id="newExerciseSets" value={newExerciseSets} onChange={(e) => setNewExerciseSets(e.target.value)} placeholder={t('workoutPlansPage.setsPlaceholder', {default: "e.g., 3"})} />
                      </div>
                      <div>
                        <Label htmlFor="newExerciseReps">{t('workoutPlansPage.repsLabel')}</Label>
                        <Input id="newExerciseReps" value={newExerciseReps} onChange={(e) => setNewExerciseReps(e.target.value)} placeholder={t('workoutPlansPage.repsPlaceholder', {default: "e.g., 8-12"})} />
                      </div>
                    </div>
                    
                    <div>
                        <Label>{t('workoutPlansPage.muscleGroupsLabel', { default: 'Muscle Groups' })}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 p-2 border rounded-md max-h-32 overflow-y-auto">
                            {allMuscleGroups.map(mg => (
                            <div key={mg} className="flex items-center space-x-2">
                                <Checkbox
                                id={`mg-dialog-${mg}`} // Prefisso per evitare conflitti ID
                                checked={dialogSelectedMuscleGroups.includes(mg)}
                                onCheckedChange={(checked) => handleMuscleGroupChangeInDialog(mg, !!checked)}
                                />
                                <Label htmlFor={`mg-dialog-${mg}`} className="text-sm font-normal cursor-pointer">
                                {t(`exercisesPage.muscleGroup${mg.replace(/\s+/g, '')}`, { default: mg })}
                                </Label>
                            </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button type="button" variant="outline" size="sm" onClick={handleAddExerciseToCurrentPlan} className="w-full">
                        <PlusCircle className="w-4 h-4 mr-2" /> {t('workoutPlansPage.addThisExerciseButton')}
                        </Button>
                    </div>
                  </div>
                </div>

                {currentPlan.exerciseDetails && currentPlan.exerciseDetails.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">{t('workoutPlansPage.addedExercisesLabel')}</h4>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <ul className="space-y-1">
                        {currentPlan.exerciseDetails.map(ex => (
                          <li key={ex.id} className="flex justify-between items-center text-sm p-1 bg-secondary rounded-sm">
                            <span className="truncate">
                                {ex.name} ({ex.sets} x {ex.reps})
                                {ex.muscleGroups && ex.muscleGroups.length > 0 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    ({ex.muscleGroups.map(mg => t(`exercisesPage.muscleGroup${mg.replace(/\s+/g, '')}`, { default: mg })).join(', ')})
                                </span>
                                )}
                            </span>
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
            <UIDialogFooter className="p-6 border-t shrink-0 sm:justify-center">
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('workoutPlansPage.cancelButton')}</Button>
              </DialogClose>
              <Button type="submit">{t('workoutPlansPage.savePlanButton')}</Button>
            </UIDialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

