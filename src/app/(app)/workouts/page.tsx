
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Card, CardContent, CardFooter } from '@/components/ui/card'; 
import { PlusCircle, Edit2, Trash2, Share2, PlayCircle, ListChecks, Ban, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader as UIDialogHeader, // Renamed to avoid conflict with CardHeader if used
  DialogTitle,
  DialogClose,
  DialogFooter as UIDialogFooter, // Renamed
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveWorkout } from '@/context/active-workout-context';
import { useRouter } from 'next/navigation';
import type { MuscleGroup } from '@/components/shared/muscle-group-icons'; 
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data from exercises page for the dropdown
// In a real app, this would likely come from a shared context, state, or API
const initialExercisesMockForSelect = [
  { id: '1', name: 'Bench Press' },
  { id: '2', name: 'Squat' },
  { id: '3', name: 'Deadlift' },
  { id: '4', name: 'Overhead Press' },
  { id: '5', name: 'Running' },
  // Add more common exercises
  { id: '6', name: 'Bicep Curl' },
  { id: '7', name: 'Tricep Pushdown' },
  { id: '8', name: 'Leg Press' },
  { id: '9', name: 'Lateral Raise' },
  { id: '10', name: 'Plank' },
];
const CREATE_NEW_EXERCISE_VALUE = '__create_new__';

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
  exerciseDetails: ExerciseDetail[];
  duration: string; 
  muscleGroups: MuscleGroup[]; 
}

const initialWorkoutPlans: WorkoutPlan[] = [
  { 
    id: '1', 
    name: 'Full Body Blast', 
    description: 'A comprehensive full-body workout for strength and endurance.', 
    exerciseDetails: [
      { id: 'e1-1', name: 'Squats', sets: '3', reps: '8-12'},
      { id: 'e1-2', name: 'Bench Press', sets: '3', reps: '8-12'},
    ],
    muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs'],
    duration: '60 min', 
  },
  { 
    id: '2', 
    name: 'Upper Body Power', 
    description: 'Focus on building strength in your chest, back, and arms.', 
    exerciseDetails: [
      { id: 'e2-1', name: 'Pull-ups', sets: '4', reps: 'AMRAP'},
    ],
    muscleGroups: ['Upper Body', 'Back', 'Biceps', 'Shoulders'],
    duration: '75 min', 
  },
  { 
    id: '3', 
    name: 'Leg Day Domination', 
    description: 'Intense leg workout to build lower body strength and size.', 
    exerciseDetails: [],
    muscleGroups: ['Lower Body', 'Legs', 'Abs'],
    duration: '90 min', 
  },
];


export default function WorkoutPlansPage() {
  const { t } = useLanguage();
  const { activePlanId, isClient: activeWorkoutIsClient, startActiveWorkout: contextStartWorkout } = useActiveWorkout();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkoutPlan[]>(initialWorkoutPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState<Partial<WorkoutPlan> & { exerciseDetails: ExerciseDetail[], muscleGroups?: MuscleGroup[] }>({ name: '', description: '', exerciseDetails: [], duration: 'N/A', muscleGroups: [] });
  
  const [selectedExerciseIdOrAction, setSelectedExerciseIdOrAction] = useState<string>('');
  const [newExerciseManualName, setNewExerciseManualName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');

  const { toast } = useToast();

  const openDialog = (plan?: WorkoutPlan) => {
    if (plan) {
      setCurrentPlan({ ...plan, exerciseDetails: [...(plan.exerciseDetails || [])], muscleGroups: [...(plan.muscleGroups || [])] });
    } else {
      setCurrentPlan({ name: '', description: '', exerciseDetails: [], duration: 'N/A', muscleGroups: [] });
    }
    setSelectedExerciseIdOrAction(initialExercisesMockForSelect[0]?.id || '');
    setNewExerciseManualName('');
    setNewExerciseSets('');
    setNewExerciseReps('');
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

    const newExerciseDetail: ExerciseDetail = {
      id: String(Date.now()), 
      name: exerciseNameToAdd,
      sets: newExerciseSets,
      reps: newExerciseReps,
    };

    setCurrentPlan(prev => ({
      ...prev,
      exerciseDetails: [...(prev.exerciseDetails || []), newExerciseDetail]
    }));

    setSelectedExerciseIdOrAction(initialExercisesMockForSelect[0]?.id || '');
    setNewExerciseManualName('');
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
        toast({title: t('toastErrorTitle'), description: t('workoutPlansPage.errorPlanNameRequired', { default: "Plan name is required."}), variant: "destructive"});
        return;
    }

    const planToSave: WorkoutPlan = {
      id: currentPlan.id || String(Date.now()),
      name: currentPlan.name,
      description: currentPlan.description || '',
      exerciseDetails: currentPlan.exerciseDetails || [],
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
        title={t('nav.workoutPlans')} // Using nav key for "Schede"
        actions={
          <Button onClick={() => openDialog()} disabled={!!(activeWorkoutIsClient && activePlanId)}>
            <PlusCircle className="w-4 h-4 mr-2" /> {t('workoutPlansPage.createNewPlanButton')}
          </Button>
        }
      />
      {activeWorkoutIsClient && activePlanId && (
          <Card className="mb-6 shadow-md border-destructive bg-destructive/10">
            <UIDialogHeader className="p-4"> {/* Re-using UIDialogHeader for consistent styling with Dialog headers */}
              <h3 className="text-destructive flex items-center font-semibold"> 
                <Ban className="w-5 h-5 mr-2" />
                {t('activeWorkoutPage.workoutInProgressTitle', { default: 'Workout In Progress' })}
              </h3>
            </UIDialogHeader>
            <CardContent className="p-4 pt-0"> {/* Adjust padding if header already has it */}
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
            <CardContent className="flex-grow p-4 relative"> {/* Added relative for absolute positioning of duration */}
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative w-full sm:w-36 h-48 flex-shrink-0">
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

                <div className="flex-grow flex flex-col">
                  <h3 className="text-xl font-semibold text-primary mb-2">{plan.name}</h3>
                  
                  <div className="mb-3"> 
                    <h4 className="text-sm font-semibold text-muted-foreground mb-0.5">
                        {t('workoutPlansPage.involvedMusclesLabel', { default: "Muscles Involved:"})}
                    </h4>
                    {plan.muscleGroups && plan.muscleGroups.length > 0 ? (
                        <ul className="list-disc list-inside text-xs space-y-0.5 pl-4 text-muted-foreground">
                            {plan.muscleGroups.map(group => <li key={group}>{t(`exercisesPage.muscleGroup${group.replace(/\s+/g, '')}`, {default: group})}</li>)}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground">{t('workoutPlansPage.noMuscleGroupsSpecified', {default: 'N/A'})}</p>
                    )}
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
          <form onSubmit={handleSavePlan} className="flex flex-col flex-grow overflow-hidden">
            <ScrollArea className="flex-grow">
              <div className="grid gap-4 p-6"> 
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
                  <Label htmlFor="planDuration">{t('workoutPlansPage.planDurationLabel')}</Label>
                  <Input 
                    id="planDuration" 
                    name="planDuration" 
                    value={currentPlan.duration || 'N/A'}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                
                <Card className="mt-4">
                  <UIDialogHeader className="pb-2 p-4 border-b">
                    <h4 className="text-base flex items-center font-semibold">
                        <ListChecks className="w-4 h-4 mr-2" />
                        {t('workoutPlansPage.addExerciseButton')}
                    </h4>
                  </UIDialogHeader>
                  <CardContent className="space-y-3 p-4">
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
                            <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
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

    