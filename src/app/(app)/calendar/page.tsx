
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardDescription, CardHeader, CardTitle as they are not directly used from here for main card
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input'; // Time input removed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { MuscleGroupIcons, type MuscleGroup } from '@/components/shared/muscle-group-icons';

interface ScheduledWorkout {
  id: string;
  planId: string;
  planName: string;
  // time: string; // Removed time
}

interface WorkoutPlanOption {
  id:string;
  nameKey: string;
  defaultName: string;
  muscleGroups: MuscleGroup[];
}

const availableWorkoutPlans: WorkoutPlanOption[] = [
  { id: '1', nameKey: 'calendarPage.samplePlan1', defaultName: 'Full Body Blast', muscleGroups: ['Full Body'] },
  { id: '2', nameKey: 'calendarPage.samplePlan2', defaultName: 'Upper Body Power', muscleGroups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
  { id: '3', nameKey: 'calendarPage.samplePlan3', defaultName: 'Leg Day Domination', muscleGroups: ['Legs', 'Abs'] },
  { id: '4', nameKey: 'calendarPage.samplePlan4', defaultName: 'Cardio Session', muscleGroups: ['Cardio'] },
];

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function CalendarPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDayForDialog, setSelectedDayForDialog] = useState<string | null>(null);
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState<string | undefined>(availableWorkoutPlans[0]?.id);
  
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, ScheduledWorkout[]>>(
    dayKeys.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleOpenDialog = (dayKey: string) => {
    setSelectedDayForDialog(dayKey);
    setSelectedWorkoutPlanId(availableWorkoutPlans[0]?.id);
    setIsDialogOpen(true);
  };
  
  const handleAddWorkoutToWeek = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDayForDialog || !selectedWorkoutPlanId) {
      toast({ title: t('toastErrorTitle', { default: "Error"}), description: t('calendarPage.errorSelectDayAndPlan', { default: "Please select a day and a workout plan."}), variant: "destructive" });
      return;
    }

    // const formData = new FormData(e.currentTarget); // Not needed if time is removed
    // const time = formData.get('time') as string; // Removed time
    
    const plan = availableWorkoutPlans.find(p => p.id === selectedWorkoutPlanId);
    if (!plan) {
        toast({ title: t('toastErrorTitle', {default: "Error"}), description: t('calendarPage.errorPlanNotFound', { default: "Selected plan not found."}), variant: "destructive" });
        return;
    }

    const newWorkout: ScheduledWorkout = {
      id: String(Date.now()),
      planId: selectedWorkoutPlanId,
      planName: t(plan.nameKey) || plan.defaultName,
      // time, // Removed time
    };
    
    setWeeklySchedule(prev => {
      const updatedWorkoutsForDay = [...(prev[selectedDayForDialog] || []), newWorkout];
      // Sorting by time removed, could sort by planName or id if needed
      // .sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [selectedDayForDialog]: updatedWorkoutsForDay };
    });
    
    toast({ 
        title: t('calendarPage.toastWorkoutScheduledTitle', {default: "Workout Scheduled!"}), 
        description: t('calendarPage.toastWorkoutScheduledDescriptionNoTime', { // New translation key
            planName: newWorkout.planName, 
            dayOfWeek: t(`calendarPage.days.${selectedDayForDialog}`),
        })
    });
    setIsDialogOpen(false);
    setSelectedDayForDialog(null);
  };

  const handleDeleteWorkoutFromWeek = (dayKey: string, workoutId: string) => {
    setWeeklySchedule(prev => {
        const updatedWorkoutsForDay = (prev[dayKey] || []).filter(w => w.id !== workoutId);
        return {...prev, [dayKey]: updatedWorkoutsForDay};
    });
    toast({ title: t('calendarPage.toastWorkoutRemovedTitle', { default: "Workout Removed" }), variant: "destructive"});
  }


  if (!isClient) {
    return (
      <>
        <PageHeader
          title={t('calendarPage.weeklyScheduleTitle')}
          description={t('calendarPage.weeklyScheduleDescription')}
        />
        <Card className="shadow-lg">
          {/* Basic skeleton if CardHeader was used */}
          <CardContent>
            <p>{t('calendarPage.loadingCalendar')}</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('calendarPage.weeklyScheduleTitle')}
        description={t('calendarPage.weeklyScheduleDescription')}
      />
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto"> {/* Added for horizontal scroll on small screens */}
            <Table className="min-w-full md:min-w-0"> {/* Ensure table can shrink */}
              <TableHeader>
                <TableRow>
                  {dayKeys.map(dayKey => (
                    <TableHead key={dayKey} className="text-center capitalize p-2 md:p-4 w-[14.28%] min-w-[80px] md:min-w-[100px]"> {/* Adjusted padding and min-width */}
                      {t(`calendarPage.days.${dayKey}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="align-top">
                  {dayKeys.map(dayKey => (
                    <TableCell key={dayKey} className="p-1 md:p-2 h-56 md:h-64 border align-top"> {/* Adjusted padding and height */}
                      <div className="flex flex-col h-full">
                        <ul className="space-y-1 flex-grow overflow-y-auto mb-2">
                          {weeklySchedule[dayKey] && weeklySchedule[dayKey].length > 0 ? (
                            weeklySchedule[dayKey].map(workout => {
                              const planDetails = availableWorkoutPlans.find(p => p.id === workout.planId);
                              return (
                                <li key={workout.id} className="p-1.5 rounded-md bg-secondary text-xs">
                                  <div className="flex justify-between items-center gap-1">
                                    <span className="font-semibold text-secondary-foreground truncate flex-grow min-w-0">{workout.planName}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => handleDeleteWorkoutFromWeek(dayKey, workout.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  {/* Removed time display: <p className="text-muted-foreground">{workout.time}</p> */}
                                  {planDetails && <MuscleGroupIcons muscleGroups={planDetails.muscleGroups} className="mt-1" />}
                                </li>
                              );
                            })
                          ) : (
                            <p className="text-xs text-center text-muted-foreground pt-2">
                              {t('calendarPage.noWorkoutsForDayOfWeek', { dayOfWeek: t(`calendarPage.days.${dayKey}`)})}
                            </p>
                          )}
                        </ul>
                        <Button onClick={() => handleOpenDialog(dayKey)} size="sm" variant="outline" className="w-full mt-auto text-xs px-2 py-1 h-auto">
                          <PlusCircle className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">{t('calendarPage.addWorkoutToDay')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('calendarPage.dialogAddWorkoutTitle', { dayOfWeek: selectedDayForDialog ? t(`calendarPage.days.${selectedDayForDialog}`) : '' })}</DialogTitle>
            <DialogDescription>{t('calendarPage.dialogAddWorkoutDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWorkoutToWeek}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="workoutPlan">{t('calendarPage.workoutPlanLabel')}</Label>
                <Select 
                    name="workoutPlan" 
                    value={selectedWorkoutPlanId} 
                    onValueChange={setSelectedWorkoutPlanId}
                    required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('calendarPage.selectAPlanPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkoutPlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                            {t(plan.nameKey) || plan.defaultName}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Time input removed
              <div>
                <Label htmlFor="time">{t('calendarPage.timeLabel')}</Label>
                <Input id="time" name="time" type="time" defaultValue="09:00" required />
              </div>
              */}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('calendarPage.cancelButton')}</Button>
              <Button type="submit">{t('calendarPage.scheduleWorkoutButton')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

