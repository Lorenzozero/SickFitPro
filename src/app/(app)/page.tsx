import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, CalendarCheck, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    { title: 'Active Workouts', value: '3', icon: Dumbbell, color: 'text-primary' },
    { title: 'Workouts This Week', value: '4', icon: CalendarCheck, color: 'text-accent' },
    { title: 'Weight Lifted (kg)', value: '1,250', icon: TrendingUp, color: 'text-green-500' },
    { title: 'Streak', value: '12 days', icon: Zap, color: 'text-orange-500' },
  ];

  return (
    <>
      <PageHeader
        title="Welcome to SickFit Pro!"
        description="Your journey to peak fitness starts here. Let's get to work."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right into your fitness routine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/workouts/new">Log New Workout</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/exercises">Manage Exercises</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/ai-split">Get AI Split Suggestion</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
            <CardDescription>What's on the agenda for today?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center border-2 border-dashed rounded-lg border-border">
              <Dumbbell className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">Leg Day</p>
              <p className="text-sm text-muted-foreground">5 exercises, 1 hour</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/calendar">View Full Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
