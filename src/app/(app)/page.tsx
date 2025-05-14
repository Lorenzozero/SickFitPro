
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


export default function DashboardPage() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { weeklySchedule, isClient: scheduleIsClient, availableWorkoutPlans } = useWeeklySchedule();
  const [isMounted, setIsMounted] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<string>('N/A');

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

  const todaysWorkouts = useMemo(() => {
    if (!isMounted || !today || !scheduleIsClient || !weeklySchedule[today]) {
      return [];
    }
    return weeklySchedule[today].map(scheduledWorkout => {
        const planDetails = availableWorkoutPlans.find(p => p.id === scheduledWorkout.planId);
        return {
            ...scheduledWorkout,
            planName: planDetails ? t(planDetails.nameKey, {default: planDetails.defaultName}) : scheduledWorkout.planName,
        };
    });
  }, [isMounted, today, scheduleIsClient, weeklySchedule, availableWorkoutPlans, t]);

  const totalScheduledWorkoutsThisWeek = useMemo(() => {
    if (!scheduleIsClient) return 0;
    return dayKeys.reduce((sum, dayKey) => sum + (weeklySchedule[dayKey]?.length || 0), 0);
  }, [scheduleIsClient, weeklySchedule]);

  const completedWorkoutsThisWeek = 0; // Placeholder - implement actual tracking later


  const stats = [
    { titleKey: 'dashboard.workoutsThisWeek', value: `${completedWorkoutsThisWeek}/${totalScheduledWorkoutsThisWeek}`, icon: Users, color: 'text-accent' },
    { titleKey: 'dashboard.weightLifted', value: '0 kg', icon: TrendingUp, color: 'text-green-500' },
    { titleKey: 'dashboard.currentWeight', value: currentWeight, icon: Weight, color: 'text-orange-500' },
  ];

  const formatDate = (dateString: string) => {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Reduced gap from 6 to 4 */}
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

      <div className="mt-6 grid gap-4 md:grid-cols-1 lg:grid-cols-2"> {/* Reduced mt-8 to mt-6, gap to 4. Changed to lg:grid-cols-2 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isMounted ? t('dashboard.todaysFocus') : "Today's Focus"}</CardTitle>
            <CardDescription>{isMounted ? t('dashboard.todaysFocusDescription') : "What's on the agenda?"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center border-2 border-dashed rounded-lg border-border min-h-[180px] flex flex-col justify-center" data-ai-hint="workout routine"> {/* Added min-height and flex for centering */}
              {isMounted && scheduleIsClient && languageContextIsClient ? (
                todaysWorkouts.length > 0 ? (
                  <>
                    <CalendarDays className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">{t('dashboard.checkCalendarForWorkout')}</p>
                    <ul className="mt-1 text-sm text-muted-foreground">
                      {todaysWorkouts.map(workout => (
                        <li key={workout.id}>{workout.planName}</li>
                      ))}
                    </ul>
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
              <Button asChild variant="link" className="mt-2">
                <Link href="/calendar">{isMounted ? t('dashboard.viewFullSchedule') : "View Schedule"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg"> {/* Was Card for Activity & History */}
          <CardHeader>
            <CardTitle>{isMounted ? t('dashboard.activityAndHistoryTitle') : "Activity & History"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-center"> {/* Reduced mb-6 to mb-4 */}
              <Button asChild className="w-full md:w-auto">
                <Link href="/start-workout">
                  <PlayCircle className="w-4 h-4 mr-2"/> {isMounted ? t('dashboard.logNewWorkout') : 'Start Workout'}
                </Link>
              </Button>
            </div>

            {mockWorkoutHistory.length > 0 ? (
              <ScrollArea className="h-64"> {/* Reduced height from h-72 */}
                <ul className="space-y-2 pr-3"> {/* Reduced space-y-3 to space-y-2, pr-4 to pr-3 */}
                  {mockWorkoutHistory.map((item, index) => (
                    <li key={item.id}>
                      <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"> {/* Reduced p-3 to p-2 */}
                        <div className="flex-grow">
                          <p className="font-semibold text-secondary-foreground">
                            {isMounted ? t(item.planNameKey, { default: item.defaultPlanName }) : item.defaultPlanName}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground shrink-0">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          <span>{item.duration}</span>
                        </div>
                      </div>
                      {index < mockWorkoutHistory.length - 1 && <Separator className="my-2" />} {/* Reduced my-3 to my-2 */}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-4">{isMounted ? t('dashboard.noWorkoutHistory') : "No workout history yet."}</p>
            )}
          </CardContent>
          {mockWorkoutHistory.length > 0 && (
              <CardFooter className="justify-center pt-3 border-t"> {/* Reduced pt-4 to pt-3 */}
                   <Button asChild variant="outline" size="sm">
                      <Link href="/progress">{isMounted ? t('dashboard.viewAllHistoryButton') : "View All History"}</Link>
                  </Button>
              </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}

