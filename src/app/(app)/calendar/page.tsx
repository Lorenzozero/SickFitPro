
'use client';

import { useState, useEffect } from 'react';
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


interface ScheduledWorkout {
  id: string;
  planName: string;
  time: string; 
}

const mockWorkouts: Record<string, ScheduledWorkout[]> = {
  '2024-07-25': [ 
    { id: 'w1', planName: 'Full Body Blast', time: '09:00 AM' },
    { id: 'w2', planName: 'Evening Cardio', time: '06:00 PM' },
  ],
  '2024-07-27': [
    { id: 'w3', planName: 'Leg Day Domination', time: '10:00 AM' },
  ],
};


export default function CalendarPage() {
  const { t, language } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [currentLocale, setCurrentLocale] = useState<string>('en-US');

  useEffect(() => {
    // Basic locale mapping, can be expanded
    setCurrentLocale(language === 'it' ? 'it-IT' : 'en-US');
  }, [language]);


  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setScheduledWorkouts(mockWorkouts[dateString] || []);
    } else {
      setScheduledWorkouts([]);
    }
  };
  
  const handleAddWorkout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Adding workout for", date);
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
              onSelect={handleDateSelect}
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
            {scheduledWorkouts.length > 0 ? (
              <ul className="space-y-3">
                {scheduledWorkouts.map(workout => (
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
                <Select name="workoutPlan">
                  <SelectTrigger>
                    <SelectValue placeholder={t('calendarPage.selectAPlanPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan1">{t('calendarPage.samplePlan1')}</SelectItem>
                    <SelectItem value="plan2">{t('calendarPage.samplePlan2')}</SelectItem>
                    <SelectItem value="plan3">{t('calendarPage.samplePlan3')}</SelectItem>
                    <SelectItem value="plan4">{t('calendarPage.samplePlan4')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">{t('calendarPage.timeLabel')}</Label>
                <Input id="time" name="time" type="time" defaultValue="09:00" />
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
