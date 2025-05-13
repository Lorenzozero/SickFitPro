'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, CalendarCheck, TrendingUp, Weight, PlayCircle, Users, Activity, Utensils } from 'lucide-react'; // Updated icons
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import WaterIntakeCard from '@/components/dashboard/water-intake-card';
import MacroTrackingCard from '@/components/dashboard/macro-tracking-card';


export default function DashboardPage() {
  const { t } = useLanguage();

  const stats = [
    { titleKey: 'dashboard.workoutsPlannedToday', value: '1', icon: CalendarCheck, color: 'text-primary' }, // Placeholder
    { titleKey: 'dashboard.workoutsThisWeek', value: '3/5', icon: Users, color: 'text-accent' }, // Placeholder
    { titleKey: 'dashboard.weightLifted', value: '1,250 kg', icon: TrendingUp, color: 'text-green-500' }, // Assuming kg
    { titleKey: 'dashboard.currentWeight', value: '70 kg', icon: Weight, color: 'text-orange-500' }, // Placeholder
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

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid for 3 columns */}
        <Card className="shadow-lg lg:col-span-1"> {/* Quick Actions takes 1 span */}
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>{t('dashboard.quickActionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/start-workout"> 
                <PlayCircle className="w-4 h-4 mr-2"/> {t('dashboard.logNewWorkout')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-2"> {/* Todays Focus takes 2 spans */}
          <CardHeader>
            <CardTitle>{t('dashboard.todaysFocus')}</CardTitle>
            <CardDescription>{t('dashboard.todaysFocusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center border-2 border-dashed rounded-lg border-border" data-ai-hint="workout routine">
              <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              {/* This should dynamically show today's scheduled workout */}
              <p className="font-semibold">{t('dashboard.checkCalendarForWorkout')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.viewCalendarToSeeWorkout')}</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/calendar">{t('dashboard.viewFullSchedule')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Diet and Hydration Section */}
      <div className="mt-8">
        <PageHeader
          title={t('dashboard.dietAndHydrationTitle')}
          description={t('dashboard.dietAndHydrationDescription')}
        />
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <WaterIntakeCard />
          <MacroTrackingCard />
        </div>
      </div>
    </>
  );
}
