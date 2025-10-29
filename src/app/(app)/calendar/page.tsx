
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
import { useWeeklySchedule, type ScheduledWorkout, type WorkoutPlanOption, dayKeys } from '@/context/weekly-schedule-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { FirebaseProvider } from '@/lib/data/firebase-provider';
import { toast } from 'sonner';


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
      <ul className={`space-y-0.5 flex-grow overflow-y-auto mb-8 ${isMobile ? 'max-h-[100px]' : ''}`}>
        {workouts && workouts.length > 0 ? (
          workouts.map(workout => {
            const planDetails = availableWorkoutPlans.find(p => p.id === workout.planId);
            return (
              <li key={workout.id} className="p-1 rounded-md bg-black/10 dark:bg-white/10 text-xs">
                <div className="flex justify-between items-center gap-1">
                  <span className="font-semibold text-primary-foreground truncate flex-grow min-w-0">{workout.planName}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground shrink-0" onClick={() => onDeleteWorkout(dayKey, workout.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            );
          })
        ) : (
          <p className="text-xs text-center text-primary-foreground/80 pt-1">
            {t('calendarPage.noWorkoutsForDayOfWeek', { dayOfWeek: t(`calendarPage.days.${dayKey}`)})}
          </p>
        )}
      </ul>
      <Button 
        onClick={() => onOpenDialog(dayKey)} 
        size="icon" // Modificato per dimensione icona standard
        variant={isMobile ? "secondary" : "outline"} 
        className="rounded-full mt-auto mx-auto" // Reso rotondo e centrato orizzontalmente
        aria-label={t('calendarPage.addWorkoutToDay')} // Aggiunta etichetta per accessibilità
      >
        <PlusCircle className="h-5 w-5 shrink-0" /> {/* Icona senza margine e leggermente più grande */}
      </Button>
    </div>
  );
};


export default function CalendarPage() {
  const { t, isClient: languageContextIsClient } = useLanguage();
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
        }),
        duration: 1000, // Aggiungi una durata per l'auto-chiusura (es. 3 secondi)
    });
    setTimeout(() => {
      setIsDialogOpen(false);
      setSelectedDayForDialog(null);
    }, 1000);
  };

  const handleDeleteWorkoutFromWeek = (dayKey: string, workoutId: string) => {
    deleteWorkoutFromDay(dayKey, workoutId);
    toast({ 
        title: t('calendarPage.toastWorkoutRemovedTitle', { default: "Workout Removed" }), 
        variant: "destructive",
        duration: 3000, // Aggiungi una durata anche qui per coerenza
    });
  }


  if (!scheduleIsClient || !languageContextIsClient) {
    return (
      <>
        <PageHeader
          title={languageContextIsClient ? t('calendarPage.weeklyScheduleTitle') : "Weekly Training Schedule"}
          description={languageContextIsClient ? t('calendarPage.weeklyScheduleDescription') : "Set up your typical training week. This schedule will repeat automatically."}
        />
        <Card className="shadow-xl bg-gradient-to-br from-blue-600/80 to-indigo-700/80 dark:from-blue-900/80 dark:to-indigo-950/80 text-primary-foreground">
          <CardContent className="p-4 text-primary-foreground">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="hidden md:block">
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="md:hidden space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
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
      <Card className="shadow-xl bg-gradient-to-br from-blue-600/80 to-indigo-700/80 dark:from-blue-900/80 dark:to-indigo-950/80 text-primary-foreground">
        <CardContent className="p-0 text-primary-foreground">
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-2 p-2">
            {dayKeys.map(dayKey => (
              <Card key={`mobile-${dayKey}`} className="shadow-md bg-black/10 dark:bg-white/10">
                <CardHeader className="p-2 border-b border-primary-foreground/20"> 
                  <CardTitle className="text-base capitalize text-center font-semibold">{t(`calendarPage.days.${dayKey}`)}</CardTitle> 
                </CardHeader>
                <CardContent className="p-2 pt-0 min-h-[100px]"> 
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
                    <TableHead key={`desktop-head-${dayKey}`} className="text-center capitalize p-1.5 md:p-2 w-[14.28%] min-w-[100px] md:min-w-[80px] border-x border-primary-foreground/20 first:border-l-0 last:border-r-0"> 
                      {t(`calendarPage.days.${dayKey}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="align-top">
                  {dayKeys.map(dayKey => (
                    <TableCell key={`desktop-cell-${dayKey}`} className="p-1 md:p-1.5 h-36 md:h-40 border-x border-primary-foreground/20 first:border-l-0 last:border-r-0 align-top">
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
              <Button type="submit" className="text-black">{t('calendarPage.scheduleWorkoutButton')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


