
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
import type { CompletedWorkout } from '@/app/(app)/workouts/[planId]/active/page'; // Import CompletedWorkout

const WORKOUT_HISTORY_STORAGE_KEY = 'sickfit-pro-workoutHistory';


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
  const [actualWorkoutHistory, setActualWorkoutHistory] = useState<CompletedWorkout[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        const storedWeight = localStorage.getItem('app-user-current-weight');
        if (storedWeight) {
            setCurrentWeight(`${storedWeight} kg`);
        }
        const storedHistory = localStorage.getItem(WORKOUT_HISTORY_STORAGE_KEY);
        if (storedHistory) {
            try {
                setActualWorkoutHistory(JSON.parse(storedHistory));
            } catch (e) {
                console.error("Error parsing workout history from localStorage", e);
                setActualWorkoutHistory([]);
            }
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
      const nextDaysLimit = 7; 
      const workouts: UpcomingWorkoutDisplayItem[] = [];

      for (let i = 0; i < nextDaysLimit; i++) {
        const currentDate = addDays(todayDate, i);
        const dateFnsDayIndex = currentDate.getDay();
        const appDayKey = dayKeys[dateFnsDayIndex === 0 ? 6 : dateFnsDayIndex - 1];
        
        const scheduledForDay = weeklySchedule[appDayKey];

        if (scheduledForDay && scheduledForDay.length > 0) {
          scheduledForDay.forEach(scheduledWorkout => {
            const planDetails = availableWorkoutPlans.find(p => p.id === scheduledWorkout.planId);
            if (planDetails) {
              if (i === 0 && todaysWorkoutsDetails.some(tw => tw.id === scheduledWorkout.id)) {
                return;
              }
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
      setUpcomingWorkouts(workouts.filter(w => {
          const workoutDate = new Date(w.date);
          const todaySimple = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
          const workoutDateSimple = new Date(workoutDate.getFullYear(), workoutDate.getMonth(), workoutDate.getDate());
          return workoutDateSimple > todaySimple;
      }).slice(0, 5));
    };

    calculateUpcomingWorkouts();
  }, [isMounted, scheduleIsClient, languageContextIsClient, weeklySchedule, availableWorkoutPlans, language, t, todaysWorkoutsDetails]);


  const totalScheduledWorkoutsThisWeek = useMemo(() => {
    if (!scheduleIsClient) return 0;
    return dayKeys.reduce((sum, dayKey) => sum + (weeklySchedule[dayKey]?.length || 0), 0);
  }, [scheduleIsClient, weeklySchedule]);
  
  // Placeholder for completed workouts. In a real app, this would come from tracked data.
  const completedWorkoutsThisWeek = actualWorkoutHistory.filter(h => {
    const completionDate = new Date(h.completionDate + 'T00:00:00');
    const todayDate = new Date();
    const startOfWeek = new Date(todayDate.setDate(todayDate.getDate() - todayDate.getDay() + (todayDate.getDay() === 0 ? -6 : 1))); // Monday as start of week
    const endOfWeek = new Date(todayDate.setDate(todayDate.getDate() - todayDate.getDay() + 7));
    return completionDate >= startOfWeek && completionDate <= endOfWeek;
  }).length;


  const stats = [
    { titleKey: 'dashboard.workoutsThisWeek', value: `${completedWorkoutsThisWeek}/${totalScheduledWorkoutsThisWeek}`, icon: Users, color: 'text-accent' },
    { titleKey: 'dashboard.weightLifted', value: '0 kg', icon: TrendingUp, color: 'text-green-500' }, // Placeholder
    { titleKey: 'dashboard.currentWeight', value: currentWeight, icon: Weight, color: 'text-orange-500' },
  ];

  const formatDateHistory = (dateString: string) => {
    if (!isMounted || !languageContextIsClient) return dateString;
    return new Date(dateString + 'T00:00:00').toLocaleDateString(language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title={languageContextIsClient ? t('dashboard.welcomeTitle') : "Welcome to SickFit Pro!"}
        description={languageContextIsClient ? t('dashboard.welcomeDescription') : "Your journey to peak fitness starts here. Let's get to work."}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.titleKey} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isMounted && languageContextIsClient ? t(stat.titleKey) : stat.titleKey.split('.').pop()}
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
            <CardTitle>{isMounted && languageContextIsClient ? t('dashboard.todaysFocus') : "Today's Focus"}</CardTitle>
            <Button asChild className="md:w-auto" size="sm">
              <Link href="/start-workout">
                <PlayCircle className="w-4 h-4 mr-2"/> {isMounted && languageContextIsClient ? t('dashboard.logNewWorkout') : 'Start Workout'}
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-center border-2 border-dashed rounded-lg border-border min-h-[120px] flex flex-col justify-center p-4" data-ai-hint="workout routine">
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
            </div>
            
            {isMounted && languageContextIsClient && upcomingWorkouts.length > 0 && (
              <>
                <Separator className="my-4" />
                <h4 className="text-md font-semibold text-center mb-3">
                  {t('dashboard.upcomingWorkoutsTitle', { default: 'Upcoming Workouts' })}
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {upcomingWorkouts.map(workout => (
                    <Card key={workout.id} className="p-2.5 bg-secondary/50 hover:shadow-md transition-shadow text-xs">
                      <div className="text-center">
                        <p className="font-semibold text-primary uppercase tracking-wider">{workout.dayOfWeek}</p>
                        <p className="text-lg font-bold text-foreground">{workout.dayOfMonth}</p>
                        <p className="text-muted-foreground uppercase">{workout.month}</p>
                      </div>
                      <Separator className="my-1.5" />
                      <p className="mt-1 font-medium text-center truncate" title={workout.planName}>
                        {workout.planName}
                      </p>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <Link href="/calendar" className="absolute bottom-3 right-3 text-primary hover:text-accent transition-colors" aria-label={t('dashboard.viewFullSchedule', { default: "View Full Schedule"})}>
              <CalendarDays className="w-6 h-6" />
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isMounted && languageContextIsClient ? t('dashboard.activityAndHistoryTitle') : "Activity & History"}</CardTitle>
          </CardHeader>
          <CardContent>
            {actualWorkoutHistory.length > 0 ? (
              <ScrollArea className="h-64">
                <ul className="space-y-2 pr-3">
                  {actualWorkoutHistory.map((item, index) => (
                    <li key={item.id}>
                      <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex-grow">
                          <p className="font-semibold text-secondary-foreground">
                            {item.planName}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateHistory(item.completionDate)}</p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          <span>{item.duration}</span>
                        </div>
                      </div>
                      {index < actualWorkoutHistory.length - 1 && <Separator className="my-2" />}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {isMounted && languageContextIsClient ? t('dashboard.noWorkoutHistory') : "No workout history yet."}
              </p>
            )}
          </CardContent>
          {actualWorkoutHistory.length > 0 && (
              <CardFooter className="justify-center pt-3 border-t">
                   <Button asChild variant="outline" size="sm">
                      <Link href="/progress">{isMounted && languageContextIsClient ? t('dashboard.viewAllHistoryButton') : "View All History"}</Link>
                  </Button>
              </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
