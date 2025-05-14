
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, TrendingUp, Weight, PlayCircle, Users, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface WorkoutHistoryItem {
  id: string;
  date: string; // e.g., "2024-07-15"
  planNameKey: string; // For translation
  defaultPlanName: string;
  duration: string; // e.g., "45 min"
}

const mockWorkoutHistory: WorkoutHistoryItem[] = [
  { id: 'h1', date: '2024-07-15', planNameKey: 'calendarPage.samplePlan1', defaultPlanName: 'Full Body Blast', duration: '55 min' },
  { id: 'h2', date: '2024-07-13', planNameKey: 'calendarPage.samplePlan2', defaultPlanName: 'Upper Body Power', duration: '60 min' },
  { id: 'h3', date: '2024-07-10', planNameKey: 'calendarPage.samplePlan3', defaultPlanName: 'Leg Day Domination', duration: '70 min' },
  { id: 'h4', date: '2024-07-08', planNameKey: 'calendarPage.samplePlan1', defaultPlanName: 'Full Body Blast', duration: '50 min' },
];


export default function DashboardPage() {
  const { t, language, isClient } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = [
    { titleKey: 'dashboard.workoutsPlannedToday', value: '1', icon: CalendarCheck, color: 'text-primary' }, 
    { titleKey: 'dashboard.workoutsThisWeek', value: '0/0', icon: Users, color: 'text-accent' }, 
    { titleKey: 'dashboard.weightLifted', value: '0 kg', icon: TrendingUp, color: 'text-green-500' }, 
    { titleKey: 'dashboard.currentWeight', value: 'N/A', icon: Weight, color: 'text-orange-500' }, 
  ];

  const formatDate = (dateString: string) => {
    if (!isMounted) return dateString; // Fallback for SSR or before hydration
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-8 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="shadow-lg lg:col-span-1 flex flex-col justify-center">
          <CardContent className="p-6">
            <Button asChild className="w-full">
              <Link href="/start-workout">
                <PlayCircle className="w-4 h-4 mr-2"/> {isMounted ? t('dashboard.logNewWorkout') : 'Start Workout'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>{isMounted ? t('dashboard.todaysFocus') : "Today's Focus"}</CardTitle>
            <CardDescription>{isMounted ? t('dashboard.todaysFocusDescription') : "What's on the agenda?"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center border-2 border-dashed rounded-lg border-border" data-ai-hint="workout routine">
              <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">{isMounted ? t('dashboard.checkCalendarForWorkout') : "Check calendar!"}</p>
              <p className="text-sm text-muted-foreground">{isMounted ? t('dashboard.viewCalendarToSeeWorkout') : "Scheduled workout here."}</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/calendar">{isMounted ? t('dashboard.viewFullSchedule') : "View Schedule"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>{isMounted ? t('dashboard.workoutHistoryTitle') : "Workout History"}</CardTitle>
          <CardDescription>{isMounted ? t('dashboard.workoutHistoryDescription') : "Review your past sessions."}</CardDescription>
        </CardHeader>
        <CardContent>
          {mockWorkoutHistory.length > 0 ? (
            <ScrollArea className="h-72">
              <ul className="space-y-3 pr-4">
                {mockWorkoutHistory.map((item, index) => (
                  <li key={item.id}>
                    <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
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
                    {index < mockWorkoutHistory.length - 1 && <Separator className="my-3" />}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-4">{isMounted ? t('dashboard.noWorkoutHistory') : "No workout history yet."}</p>
          )}
        </CardContent>
        {mockWorkoutHistory.length > 0 && (
            <CardFooter className="justify-center pt-4 border-t">
                 <Button asChild variant="outline" size="sm">
                    <Link href="/progress">{isMounted ? t('dashboard.viewAllHistoryButton') : "View All History"}</Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </>
  );
}
