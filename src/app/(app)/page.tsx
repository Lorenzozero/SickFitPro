
'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, TrendingUp, Weight, PlayCircle, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
// WaterIntakeCard and MacroTrackingCard are moved to /diet page

export default function DashboardPage() {
  const { t } = useLanguage();

  const stats = [
    { titleKey: 'dashboard.workoutsPlannedToday', value: '1', icon: CalendarCheck, color: 'text-primary' }, // Placeholder
    { titleKey: 'dashboard.workoutsThisWeek', value: '0/0', icon: Users, color: 'text-accent' }, // Placeholder, to be dynamic
    { titleKey: 'dashboard.weightLifted', value: '0 kg', icon: TrendingUp, color: 'text-green-500' }, // Placeholder, to be dynamic
    { titleKey: 'dashboard.currentWeight', value: 'N/A', icon: Weight, color: 'text-orange-500' }, // Placeholder
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

      <div className="mt-8 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Card for Start Workout Button - "Quick Actions" header removed */}
        <Card className="shadow-lg lg:col-span-1 flex flex-col justify-center">
          <CardContent className="p-6">
            <Button asChild className="w-full">
              <Link href="/start-workout">
                <PlayCircle className="w-4 h-4 mr-2"/> {t('dashboard.logNewWorkout')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.todaysFocus')}</CardTitle>
            <CardDescription>{t('dashboard.todaysFocusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center border-2 border-dashed rounded-lg border-border" data-ai-hint="workout routine">
              <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              {/* This should dynamically show today's scheduled workout from calendar */}
              <p className="font-semibold">{t('dashboard.checkCalendarForWorkout')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.viewCalendarToSeeWorkout')}</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/calendar">{t('dashboard.viewFullSchedule')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diet and Hydration Section is now on the /diet page */}
    </>
  );
}
