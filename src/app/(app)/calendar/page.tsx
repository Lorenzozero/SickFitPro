
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MuscleGroupIcons } from '@/components/shared/muscle-group-icons';
import { useWeeklySchedule, type ScheduledWorkout, type WorkoutPlanOption, dayKeys } from '@/context/weekly-schedule-context';

interface DayScheduleContentProps {
  dayKey: string;
  workouts: ScheduledWorkout[];
  onOpenDialog: (dayKey: string) => void;
  onDeleteWorkout: (dayKey: string, workoutId: string) => void;
  t: (key: string, replacements?: Record<string, string | number | undefined>) => string;
  availableWorkoutPlans: WorkoutPlanOption[];
  isMobile?: boolean;
}

const DayScheduleContent: React.FC<DayScheduleContentProps> = ({
  dayKey,
  workouts,
  onOpenDialog,
  onDeleteWorkout,
  t,
  availableWorkoutPlans,
  isMobile = false,
}) => {
  return (
    <div className="flex flex-col h-full">
      <ul className={`space-y-0.5 flex-grow overflow-y-auto mb-1.5 ${isMobile ? 'max-h-[150px]' : ''}`}> {/* Reduced space-y and mb */}
        {workouts && workouts.length > 0 ? (
          workouts.map(workout => {
            const planDetails = availableWorkoutPlans.find(p => p.id === workout.planId);
            return (
              <li key={workout.id} className="p-1 rounded-md bg-secondary text-xs"> {/* Reduced p-1.5 to p-1 */}
                <div className="flex justify-between items-center gap-1">
                  <span className="font-semibold text-secondary-foreground truncate flex-grow min-w-0">{workout.planName}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => onDeleteWorkout(dayKey, workout.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {planDetails && <MuscleGroupIcons muscleGroups={planDetails.muscleGroups} className="mt-0.5" iconClassName="w-2.5 h-2.5" />} {/* Reduced icon size and mt */}
              </li>
            );
          })
        ) : (
          <p className="text-xs text-center text-muted-foreground pt-2">
            {t('calendarPage.noWorkoutsForDayOfWeek', { dayOfWeek: t(`calendarPage.days.${dayKey}`)})}
          </p>
        )}
      </ul>
      <Button 
        onClick={() => onOpenDialog(dayKey)} 
        size="sm" 
        variant={isMobile ? "default" : "outline"} 
        className="w-full mt-auto text-xs px-2 py-1 h-auto"
      >
        <PlusCircle className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">{t('calendarPage.addWorkoutToDay')}</span>
      </Button>
    </div>
  );
};


export default function CalendarPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    weeklySchedule, 
    availableWorkoutPlans, 
    addWorkoutToDay, 
    deleteWorkoutFromDay, 
    isClient: scheduleIsClient 
  } = useWeeklySchedule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDayForDialog, setSelectedDayForDialog] = useState<string | null>(null);
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState<string | undefined>(availableWorkoutPlans[0]?.id);
  
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
    
    const plan = availableWorkoutPlans.find(p => p.id === selectedWorkoutPlanId);
    if (!plan) {
        toast({ title: t('toastErrorTitle', {default: "Error"}), description: t('calendarPage.errorPlanNotFound', { default: "Selected plan not found."}), variant: "destructive" });
        return;
    }

    addWorkoutToDay(selectedDayForDialog, selectedWorkoutPlanId);
    
    toast({ 
        title: t('calendarPage.toastWorkoutScheduledTitle', {default: "Workout Scheduled!"}), 
        description: t('calendarPage.toastWorkoutScheduledDescriptionNoTime', { 
            planName: t(plan.nameKey, { default: plan.defaultName}), 
            dayOfWeek: t(`calendarPage.days.${selectedDayForDialog}`),
        })
    });
    setIsDialogOpen(false);
    setSelectedDayForDialog(null);
  };

  const handleDeleteWorkoutFromWeek = (dayKey: string, workoutId: string) => {
    deleteWorkoutFromDay(dayKey, workoutId);
    toast({ title: t('calendarPage.toastWorkoutRemovedTitle', { default: "Workout Removed" }), variant: "destructive"});
  }


  if (!scheduleIsClient) {
    return (
      <>
        <PageHeader
          title={t('calendarPage.weeklyScheduleTitle')}
          description={t('calendarPage.weeklyScheduleDescription')}
        />
        <Card className="shadow-lg">
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
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-3 p-3"> {/* Reduced gap and padding */}
            {dayKeys.map(dayKey => (
              <Card key={`mobile-${dayKey}`} className="shadow-sm border">
                <CardHeader className="p-2.5"> {/* Reduced padding */}
                  <CardTitle className="text-md capitalize text-center font-semibold">{t(`calendarPage.days.${dayKey}`)}</CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 pt-0 min-h-[110px]"> {/* Reduced padding and min-height */}
                  <DayScheduleContent
                    dayKey={dayKey}
                    workouts={weeklySchedule[dayKey] || []}
                    onOpenDialog={handleOpenDialog}
                    onDeleteWorkout={handleDeleteWorkoutFromWeek}
                    t={t}
                    availableWorkoutPlans={availableWorkoutPlans}
                    isMobile={true}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="relative w-full overflow-auto">
            <Table className="min-w-full md:min-w-0">
              <TableHeader>
                <TableRow>
                  {dayKeys.map(dayKey => (
                    <TableHead key={`desktop-head-${dayKey}`} className="text-center capitalize p-2 md:p-3 w-[14.28%] min-w-[110px] md:min-w-[90px]"> {/* Reduced padding and min-width */}
                      {t(`calendarPage.days.${dayKey}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="align-top">
                  {dayKeys.map(dayKey => (
                    <TableCell key={`desktop-cell-${dayKey}`} className="p-1 md:p-1.5 h-48 md:h-56 border align-top"> {/* Reduced padding and height */}
                      <DayScheduleContent
                        dayKey={dayKey}
                        workouts={weeklySchedule[dayKey] || []}
                        onOpenDialog={handleOpenDialog}
                        onDeleteWorkout={handleDeleteWorkoutFromWeek}
                        t={t}
                        availableWorkoutPlans={availableWorkoutPlans}
                        isMobile={false}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
            </div>
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
                            {t(plan.nameKey, { default: plan.defaultName })}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('calendarPage.cancelButton')}</Button>
              <Button type="submit">{t('calendarPage.scheduleWorkoutButton')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
