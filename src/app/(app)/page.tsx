
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Weight, PlayCircle, Users, Activity, Clock, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWeeklySchedule, dayKeys, type WorkoutPlanOption } from '@/context/weekly-schedule-context';
import { addDays, format as formatDateFn } from 'date-fns';
import { it as dateFnsIt, es as dateFnsEs, fr as dateFnsFr, enUS as dateFnsEnUs } from 'date-fns/locale';

interface WorkoutHistoryItem {
  id: string;
  date: string;
  planNameKey: string;
  defaultPlanName: string;
  duration: string;
}

const mockWorkoutHistory: WorkoutHistoryItem[] = [
  { id: 'h1', date: '2024-07-15', planNameKey: 'calendarPage.samplePlan1', defaultPlanName: 'Full Body Blast', duration: '55 min' },
  { id: 'h2', date: '2024-07-13', planNameKey: 'calendarPage.samplePlan2', defaultPlanName: 'Upper Body Power', duration: '60 min' },
  { id: 'h3', date: '2024-07-10', planNameKey: 'calendarPage.samplePlan3', defaultPlanName: 'Leg Day Domination', duration: '70 min' },
  { id: 'h4', date: '2024-07-08', planNameKey: 'calendarPage.samplePlan1', defaultPlanName: 'Full Body Blast', duration: '50 min' },
];

interface UpcomingWorkoutDisplayItem {
  id: string;
  date: Date;
  dayOfWeek: string;
  dayOfMonth: string;
  month: string;
  planName: string;
}

const getDateFnsLocale = (lang: string) => {
  switch (lang) {
    case 'it': return dateFnsIt;
    case 'es': return dateFnsEs;
    case 'fr': return dateFnsFr;
    default: return dateFnsEnUs;
  }
};

export default function DashboardPage() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { weeklySchedule, isClient: scheduleIsClient, availableWorkoutPlans } = useWeeklySchedule();
  const [isMounted, setIsMounted] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<string>('N/A');
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<UpcomingWorkoutDisplayItem[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        const storedWeight = localStorage.getItem('app-user-current-weight');
        if (storedWeight) {
            setCurrentWeight(`${storedWeight} kg`);
        }
    }
  }, []);

  const today = useMemo(() => {
    if (!isMounted) return null;
    const date = new Date();
    let dayIndex = date.getDay() - 1; 
    if (dayIndex === -1) { 
        dayIndex = 6;
    }
    return dayKeys[dayIndex];
  }, [isMounted]);

  const todaysWorkoutsDetails = useMemo(() => {
    if (!isMounted || !today || !scheduleIsClient || !weeklySchedule[today]) {
      return [];
    }
    return weeklySchedule[today].map(scheduledWorkout => {
        const planDetails = availableWorkoutPlans.find(p => p.id === scheduledWorkout.planId);
        return {
            ...scheduledWorkout,
            planName: planDetails ? t(planDetails.nameKey, {default: planDetails.defaultName}) : scheduledWorkout.planName,
            duration: planDetails?.duration,
        };
    });
  }, [isMounted, today, scheduleIsClient, weeklySchedule, availableWorkoutPlans, t]);

  useEffect(() => {
    if (!isMounted || !scheduleIsClient || !languageContextIsClient) {
      setUpcomingWorkouts([]);
      return;
    }

    const calculateUpcomingWorkouts = () => {
      const locale = getDateFnsLocale(language);
      const todayDate = new Date();
      const nextDaysLimit = 7; // Show workouts for the next 7 days
      const workouts: UpcomingWorkoutDisplayItem[] = [];

      for (let i = 0; i < nextDaysLimit; i++) {
        const currentDate = addDays(todayDate, i);
        // date-fns getDay: 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        // My dayKeys: 0 for Monday, ..., 6 for Sunday
        const dateFnsDayIndex = currentDate.getDay();
        const appDayKey = dayKeys[dateFnsDayIndex === 0 ? 6 : dateFnsDayIndex - 1];
        
        const scheduledForDay = weeklySchedule[appDayKey];

        if (scheduledForDay && scheduledForDay.length > 0) {
          scheduledForDay.forEach(scheduledWorkout => {
            const planDetails = availableWorkoutPlans.find(p => p.id === scheduledWorkout.planId);
            if (planDetails) {
              workouts.push({
                id: `${formatDateFn(currentDate, 'yyyy-MM-dd')}-${scheduledWorkout.id}`,
                date: currentDate,
                dayOfWeek: formatDateFn(currentDate, 'EEEE', { locale }),
                dayOfMonth: formatDateFn(currentDate, 'd', { locale }),   
                month: formatDateFn(currentDate, 'MMM', { locale }),      
                planName: t(planDetails.nameKey, { default: planDetails.defaultName }),
              });
            }
          });
        }
      }
      setUpcomingWorkouts(workouts.slice(0, 5)); // Limit to show, e.g., next 5 scheduled instances found within 7 days
    };

    calculateUpcomingWorkouts();
  }, [isMounted, scheduleIsClient, languageContextIsClient, weeklySchedule, availableWorkoutPlans, language, t]);


  const totalScheduledWorkoutsThisWeek = useMemo(() => {
    if (!scheduleIsClient) return 0;
    return dayKeys.reduce((sum, dayKey) => sum + (weeklySchedule[dayKey]?.length || 0), 0);
  }, [scheduleIsClient, weeklySchedule]);

  const completedWorkoutsThisWeek = 0; 


  const stats = [
    { titleKey: 'dashboard.workoutsThisWeek', value: `${completedWorkoutsThisWeek}/${totalScheduledWorkoutsThisWeek}`, icon: Users, color: 'text-accent' },
    { titleKey: 'dashboard.weightLifted', value: '0 kg', icon: TrendingUp, color: 'text-green-500' },
    { titleKey: 'dashboard.currentWeight', value: currentWeight, icon: Weight, color: 'text-orange-500' },
  ];

  const formatDateHistory = (dateString: string) => {
    if (!isMounted) return dateString;
    return new Date(dateString + 'T00:00:00').toLocaleDateString(language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title={t('dashboard.welcomeTitle')}
        description={t('dashboard.welcomeDescription')}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.titleKey} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isMounted ? t(stat.titleKey) : stat.titleKey.split('.').pop()}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isMounted ? t('dashboard.todaysFocus') : "Today's Focus"}</CardTitle>
            <Button asChild className="md:w-auto" size="sm">
              <Link href="/start-workout">
                <PlayCircle className="w-4 h-4 mr-2"/> {isMounted ? t('dashboard.logNewWorkout') : 'Start Workout'}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative p-4 text-center border-2 border-dashed rounded-lg border-border min-h-[180px] flex flex-col justify-center" data-ai-hint="workout routine">
              {isMounted && scheduleIsClient && languageContextIsClient ? (
                todaysWorkoutsDetails.length > 0 ? (
                  <>
                    {todaysWorkoutsDetails.map(workout => (
                      <div key={workout.id} className="mb-2">
                        <p className="text-xl font-semibold text-primary">{workout.planName}</p>
                        {workout.duration && (
                          <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            <span>{workout.duration}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-semibold">{t('dashboard.todayIsRestDay')}</p>
                  </>
                )
              ) : (
                 <>
                  <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-semibold">{t('dashboard.viewCalendarToSeeWorkout')}</p>
                 </>
              )}
              <Link href="/calendar" className="absolute bottom-3 right-3 text-primary hover:text-accent transition-colors" aria-label={t('dashboard.viewFullSchedule', { default: "View Full Schedule"})}>
                <CalendarDays className="w-6 h-6" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isMounted ? t('dashboard.activityAndHistoryTitle') : "Activity & History"}</CardTitle>
          </CardHeader>
          <CardContent>
            {mockWorkoutHistory.length > 0 ? (
              <ScrollArea className="h-64">
                <ul className="space-y-2 pr-3">
                  {mockWorkoutHistory.map((item, index) => (
                    <li key={item.id}>
                      <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex-grow">
                          <p className="font-semibold text-secondary-foreground">
                            {isMounted ? t(item.planNameKey, { default: item.defaultPlanName }) : item.defaultPlanName}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateHistory(item.date)}</p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          <span>{item.duration}</span>
                        </div>
                      </div>
                      {index < mockWorkoutHistory.length - 1 && <Separator className="my-2" />}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-4">{isMounted ? t('dashboard.noWorkoutHistory') : "No workout history yet."}</p>
            )}
          </CardContent>
          {mockWorkoutHistory.length > 0 && (
              <CardFooter className="justify-center pt-3 border-t">
                   <Button asChild variant="outline" size="sm">
                      <Link href="/progress">{isMounted ? t('dashboard.viewAllHistoryButton') : "View All History"}</Link>
                  </Button>
              </CardFooter>
          )}
        </Card>
      </div>

      {/* Upcoming Workouts Section */}
      {isMounted && languageContextIsClient && upcomingWorkouts.length > 0 && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle>{t('dashboard.upcomingWorkoutsTitle', { default: 'Upcoming Workouts' })}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {upcomingWorkouts.map(workout => (
              <Card key={workout.id} className="p-3 bg-secondary/50 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">{workout.dayOfWeek}</p>
                  <p className="text-2xl font-bold text-foreground">{workout.dayOfMonth}</p>
                  <p className="text-xs text-muted-foreground uppercase">{workout.month}</p>
                </div>
                <Separator className="my-2" />
                <p className="mt-1 text-sm font-medium text-center truncate" title={workout.planName}>
                  {workout.planName}
                </p>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
