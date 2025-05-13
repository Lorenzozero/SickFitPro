
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';


interface ScheduledWorkout {
  id: string;
  planId: string;
  planName: string;
  time: string; 
}

interface WorkoutPlanOption {
  id: string;
  nameKey: string; // Key for translation
  defaultName: string; // Default English name
}

// Simplified list of plans for the dialog, matching structure from initialWorkoutPlans elsewhere for IDs
const availableWorkoutPlans: WorkoutPlanOption[] = [
  { id: '1', nameKey: 'calendarPage.samplePlan1', defaultName: 'Full Body Blast' },
  { id: '2', nameKey: 'calendarPage.samplePlan2', defaultName: 'Upper Body Power' },
  { id: '3', nameKey: 'calendarPage.samplePlan3', defaultName: 'Leg Day Domination' },
  { id: '4', nameKey: 'calendarPage.samplePlan4', defaultName: 'Cardio Session' },
];


export default function CalendarPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduledWorkoutsByDate, setScheduledWorkoutsByDate] = useState<Record<string, ScheduledWorkout[]>>({});
  const [currentLocale, setCurrentLocale] = useState<string>('en-US');
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState<string | undefined>(availableWorkoutPlans[0]?.id);


  useEffect(() => {
    setCurrentLocale(language === 'it' ? 'it-IT' : 'en-US');
  }, [language]);

  const getWorkoutsForSelectedDate = (): ScheduledWorkout[] => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return scheduledWorkoutsByDate[dateString] || [];
  };
  
  const handleAddWorkout = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date || !selectedWorkoutPlanId) {
      toast({ title: "Error", description: "Please select a date and a workout plan.", variant: "destructive" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const time = formData.get('time') as string;
    
    const plan = availableWorkoutPlans.find(p => p.id === selectedWorkoutPlanId);
    if (!plan) {
        toast({ title: "Error", description: "Selected plan not found.", variant: "destructive" });
        return;
    }

    const newWorkout: ScheduledWorkout = {
      id: String(Date.now()),
      planId: selectedWorkoutPlanId,
      planName: t(plan.nameKey) || plan.defaultName,
      time,
    };

    const dateString = date.toISOString().split('T')[0];
    
    setScheduledWorkoutsByDate(prev => {
      const updatedWorkoutsForDate = [...(prev[dateString] || []), newWorkout];
      return { ...prev, [dateString]: updatedWorkoutsForDate };
    });
    
    toast({ title: "Workout Scheduled!", description: `${newWorkout.planName} scheduled for ${date.toLocaleDateString(currentLocale)} at ${newWorkout.time}.` });
    setIsDialogOpen(false);
  };

  return (
    <>
      <PageHeader
        title={t('calendarPage.title')}
        description={t('calendarPage.description')}
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-lg">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                day_today: "bg-accent text-accent-foreground"
              }}
              locale={currentLocale === 'it-IT' ? (await import('date-fns/locale/it')).default : (await import('date-fns/locale/en-US')).default}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              {date ? date.toLocaleDateString(currentLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : t('calendarPage.selectADate')}
            </CardTitle>
            <CardDescription>{t('calendarPage.workoutsScheduledForThisDay')}</CardDescription>
          </CardHeader>
          <CardContent>
            {date && (
              <Button onClick={() => setIsDialogOpen(true)} className="w-full mb-4">
                <PlusCircle className="w-4 h-4 mr-2" /> {t('calendarPage.addWorkoutToDay')}
              </Button>
            )}
            {getWorkoutsForSelectedDate().length > 0 ? (
              <ul className="space-y-3">
                {getWorkoutsForSelectedDate().map(workout => (
                  <li key={workout.id} className="p-3 rounded-md bg-secondary">
                    <p className="font-semibold text-secondary-foreground">{workout.planName}</p>
                    <p className="text-sm text-muted-foreground">{workout.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                {date ? t('calendarPage.noWorkoutsScheduled') : t('calendarPage.selectDateToSeeWorkouts')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('calendarPage.dialogAddWorkoutTitle')} {date?.toLocaleDateString(currentLocale)}</DialogTitle>
            <DialogDescription>{t('calendarPage.dialogAddWorkoutDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWorkout}>
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
              <div>
                <Label htmlFor="time">{t('calendarPage.timeLabel')}</Label>
                <Input id="time" name="time" type="time" defaultValue="09:00" required />
              </div>
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
