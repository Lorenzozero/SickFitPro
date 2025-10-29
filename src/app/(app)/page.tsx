"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Weight, PlayCircle, Users, Activity, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useWeeklySchedule, dayKeys } from '@/context/weekly-schedule-context';
import { addDays, format as formatDateFn } from 'date-fns';
import { it as dateFnsIt, es as dateFnsEs, fr as dateFnsFr, enUS as dateFnsEnUs } from 'date-fns/locale';
import type { WorkoutSession, DashboardData } from '@/lib/types';
import { useAuth } from '@/lib/auth/auth-context';
import { FirebaseProvider } from '@/lib/data/firebase-provider';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';

// Lazy load AI components if they exist
const AIRecommendations = dynamic(
  () => import('@/components/ai/recommendations').catch(() => ({ default: () => null })),
  { ssr: false }
);

// Lazy load chart components if they exist
const ProgressChart = dynamic(
  () => import('@/components/charts/progress-chart').catch(() => ({ default: () => null })),
  { ssr: false, loading: () => <div className="h-32 bg-muted/50 rounded animate-pulse" /> }
);

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

function DashboardStats({ stats }: { stats: any[] }) {
  const renderStatCardContent = (stat: any) => (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="flex-grow text-center text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <stat.icon className={`w-5 h-5 ${stat.color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-center text-3xl font-bold text-foreground">{stat.value}</div>
      </CardContent>
    </>
  );

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-4 mb-8">
      {stats.map((stat, idx) => {
        const cardBgVariants = [
          "bg-gradient-to-br from-blue-600/80 to-indigo-700/80 dark:from-blue-900/80 dark:to-indigo-950/80",
          "bg-gradient-to-br from-green-500/80 to-emerald-700/80 dark:from-green-900/80 dark:to-emerald-950/80",
          "bg-gradient-to-br from-orange-400/80 to-pink-500/80 dark:from-orange-900/80 dark:to-pink-950/80"
        ];
        const cardBg = cardBgVariants[idx % 3];
        const cardClass = `min-h-[160px] h-[160px] max-h-[160px] w-full rounded-xl shadow-xl border-none flex flex-col justify-between hover:scale-[1.03] transition-transform ${cardBg}`;
        
        return stat.href ? (
          <Link href={stat.href} key={stat.titleKey} className="block hover:no-underline">
            <Card className={cardClass}>
              {renderStatCardContent(stat)}
            </Card>
          </Link>
        ) : (
          <Card key={stat.titleKey} className={cardClass}>
            {renderStatCardContent(stat)}
          </Card>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { weeklySchedule, isClient: scheduleIsClient, availableWorkoutPlans } = useWeeklySchedule();
  const [isMounted, setIsMounted] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<string>('N/A');
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<UpcomingWorkoutDisplayItem[]>([]);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [actualWorkoutHistory, setActualWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const { user } = useAuth();

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
          console.error('Error parsing workout history from localStorage', e);
          setActualWorkoutHistory([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoadingDashboard(false);
      setDashboardError('User not authenticated');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoadingDashboard(true);
      setDashboardError(null);
      try {
        const provider = new FirebaseProvider();
        const data: DashboardData = await provider.getDashboard(user);
        setActualWorkoutHistory(data.sessions);
        if (data.currentWeight) {
          setCurrentWeight(`${data.currentWeight} kg`);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDashboardError('Failed to load dashboard data.');
        toast.error('Failed to load dashboard data.', { description: (err as Error).message });
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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
        planName: planDetails ? t(planDetails.nameKey, { default: planDetails.defaultName }) : scheduledWorkout.planName,
        duration: planDetails?.duration,
      };
    });
  }, [isMounted, today, scheduleIsClient, weeklySchedule, availableWorkoutPlans, t]);

  const displayedUpcomingWorkouts = useMemo(() => (
    showAllUpcoming ? upcomingWorkouts : upcomingWorkouts.slice(0, 2)
  ), [showAllUpcoming, upcomingWorkouts]);

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
      }));
    };

    calculateUpcomingWorkouts();
  }, [isMounted, scheduleIsClient, languageContextIsClient, weeklySchedule, availableWorkoutPlans, language, t, todaysWorkoutsDetails]);

  const totalScheduledWorkoutsThisWeek = useMemo(() => {
    if (!scheduleIsClient) return 0;
    return dayKeys.reduce((sum, dayKey) => sum + (weeklySchedule[dayKey]?.length || 0), 0);
  }, [scheduleIsClient, weeklySchedule]);

  const completedWorkoutsThisWeek = useMemo(() => (
    actualWorkoutHistory.filter(h => {
      const completionDate = new Date(h.completionDate + 'T00:00:00');
      const todayDate = new Date();
      const startOfWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay() + (todayDate.getDay() === 0 ? -6 : 1));
      const endOfWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay() + 7);
      return completionDate >= startOfWeek && completionDate <= endOfWeek;
    }).length
  ), [actualWorkoutHistory]);

  const stats = useMemo(() => [
    { titleKey: 'dashboard.workoutsThisWeek', title: t('dashboard.workoutsThisWeek', { default: 'Workouts This Week' }), value: `${completedWorkoutsThisWeek}/${totalScheduledWorkoutsThisWeek}`, icon: Users, color: 'text-accent', href: '/calendar' },
    { titleKey: 'dashboard.weightLifted', title: t('dashboard.weightLifted', { default: 'Weight Lifted' }), value: '0 kg', icon: TrendingUp, color: 'text-green-500', href: '/progress' },
    { titleKey: 'dashboard.currentWeight', title: t('dashboard.currentWeight', { default: 'Current Weight' }), value: currentWeight, icon: Weight, color: 'text-orange-500', href: '/diet' },
  ], [completedWorkoutsThisWeek, totalScheduledWorkoutsThisWeek, currentWeight, t]);

  const formatDateHistory = (dateString: string) => {
    if (!isMounted || !languageContextIsClient) return dateString;
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    return date.toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoadingDashboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{dashboardError}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader title={t('dashboard.welcomeTitle', { default: 'Welcome to SickFit Pro!' })} description="" />
      <DashboardStats stats={stats} />

      <div className="mt-6 grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {/* Today's Focus */}
        <Card className="shadow-xl relative bg-gradient-to-br from-blue-600/80 to-indigo-700/80 dark:from-blue-900/80 dark:to-indigo-950/80 text-primary-foreground">
          <CardHeader className="relative text-center">
            <CardTitle>
              {t('dashboard.todaysFocus', { default: "Today's Focus" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-center border-2 border-dashed rounded-lg border-primary-foreground/50 min-h-[120px] flex flex-col justify-center p-4" data-ai-hint="workout routine">
              {isMounted && scheduleIsClient && languageContextIsClient ? (
                todaysWorkoutsDetails.length > 0 ? (
                  <>
                    {todaysWorkoutsDetails.map(workout => (
                      <div key={workout.id} className="mb-2">
                        <p className="text-xl font-semibold text-white">{workout.planName}</p>
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
                    <p className="font-semibold">{t('dashboard.todayIsRestDay', { default: "Today is a rest day! Enjoy it! 😊" })}</p>
                  </>
                )
              ) : (
                <>
                  <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-semibold">{t('dashboard.viewCalendarToSeeWorkout', { default: "Your scheduled workout will appear here." })}</p>
                </>
              )}
            </div>

            {isMounted && languageContextIsClient && upcomingWorkouts.length > 0 && (
              <>
                <Separator className="my-4 bg-primary-foreground/30" />
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-semibold text-center flex-grow">
                    {t('dashboard.upcomingWorkoutsTitle', { default: 'Upcoming Workouts' })}
                  </h4>
                  {upcomingWorkouts.length > 2 && (
                    <Button variant="ghost" size="icon" aria-label={showAllUpcoming ? 'Collapse upcoming workouts' : 'Expand upcoming workouts'} onClick={() => setShowAllUpcoming(!showAllUpcoming)} className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                      {showAllUpcoming ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {displayedUpcomingWorkouts.map(workout => (
                    <Card key={workout.id} className="p-2.5 bg-black/10 dark:bg-white/10 hover:shadow-md transition-shadow text-xs text-primary-foreground">
                      <div className="text-center">
                        <p className="font-semibold text-white uppercase tracking-wider">{workout.dayOfWeek}</p>
                        <p className="text-lg font-bold text-primary-foreground">{workout.dayOfMonth}</p>
                        <p className="text-muted-foreground uppercase">{workout.month}</p>
                      </div>
                      <Separator className="my-1.5 bg-primary-foreground/30" />
                      <p className="mt-1 font-medium text-center truncate" title={workout.planName}>
                        {workout.planName}
                      </p>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <Link href="/calendar" className="absolute bottom-3 right-3 text-white hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-sm p-1" aria-label={t('dashboard.viewFullSchedule', { default: "View Full Schedule" })}>
              <Calendar className="w-5 h-5" />
              <span className="sr-only">{t('dashboard.viewFullSchedule', { default: "View Full Schedule" })}</span>
            </Link>
          </CardContent>

          <Link href="/start-workout" className="md:hidden absolute z-10 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-14 h-14 flex items-center justify-center shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label={t('dashboard.logNewWorkout', { default: 'Start Workout' })} data-ai-hint="start-workout-fab">
            <PlayCircle className="w-7 h-7 text-black" />
          </Link>
        </Card>

        {/* Activity & History */}
        <Card className="shadow-xl mt-6 lg:mt-0 bg-gradient-to-br from-teal-500/80 to-cyan-600/80 dark:from-teal-900/80 dark:to-cyan-950/80 text-primary-foreground">
          <CardHeader>
            <CardTitle>{t('dashboard.activityAndHistoryTitle', { default: "Activity & History" })}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {t('dashboard.activityAndHistorySubtitle', { default: 'Your recent workout history' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-primary-foreground">
            {actualWorkoutHistory.length > 0 ? (
              <ScrollArea className="h-64">
                <ul className="space-y-2 pr-3">
                  {actualWorkoutHistory.map((item, index) => (
                    <li key={item.id}>
                      <div className="flex items-center justify-between p-2 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
                        <div className="flex-grow">
                          <p className="font-semibold text-primary-foreground">
                            {item.planName}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDateHistory(item.completionDate)}</p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          <span>{item.duration}</span>
                        </div>
                      </div>
                      {index < actualWorkoutHistory.length - 1 && <Separator className="my-2 bg-primary-foreground/30" />}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Activity className="w-12 h-12 mb-2" />
                <p>{t('dashboard.noWorkoutHistory', { default: 'No workout history yet. Start a workout to see your progress!' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Lazy loaded components */}
      <ErrorBoundary fallback={<div className="text-muted-foreground text-sm">Charts unavailable</div>}>
        <ProgressChart />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<div className="text-muted-foreground text-sm">AI recommendations unavailable</div>}>
        <AIRecommendations />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
