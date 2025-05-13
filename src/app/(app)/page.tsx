
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, CalendarCheck, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

export default function DashboardPage() {
  const { t } = useLanguage();

  const stats = [
    { titleKey: 'dashboard.activeWorkouts', value: '3', icon: Dumbbell, color: 'text-primary' },
    { titleKey: 'dashboard.workoutsThisWeek', value: '4', icon: CalendarCheck, color: 'text-accent' },
    { titleKey: 'dashboard.weightLifted', value: '1,250', icon: TrendingUp, color: 'text-green-500' },
    { titleKey: 'dashboard.streak', value: '12 days', icon: Zap, color: 'text-orange-500' },
  ];

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
                {t(stat.titleKey)}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/workouts/new">{t('dashboard.logNewWorkout')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/exercises">{t('dashboard.manageExercises')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/ai-split">{t('dashboard.getAISplitSuggestion')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('dashboard.todaysFocus')}</CardTitle>
            <CardDescription>{t('dashboard.todaysFocusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center border-2 border-dashed rounded-lg border-border">
              <Dumbbell className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">{t('dashboard.sampleWorkout')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.sampleWorkoutDetails')}</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/calendar">{t('dashboard.viewFullSchedule')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
