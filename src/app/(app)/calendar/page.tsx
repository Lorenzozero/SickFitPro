'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data structure for workouts on a given day
interface ScheduledWorkout {
  id: string;
  planName: string;
  time: string; // e.g., "08:00 AM"
}

// Mock workouts for selected day
const mockWorkouts: Record<string, ScheduledWorkout[]> = {
  '2024-07-25': [ // Example: YYYY-MM-DD
    { id: 'w1', planName: 'Full Body Blast', time: '09:00 AM' },
    { id: 'w2', planName: 'Evening Cardio', time: '06:00 PM' },
  ],
  '2024-07-27': [
    { id: 'w3', planName: 'Leg Day Domination', time: '10:00 AM' },
  ],
};


export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);

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
    // Logic to add workout to the selected date (mock for now)
    console.log("Adding workout for", date);
    setIsDialogOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Workout Calendar"
        description="Plan and track your training schedule."
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
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              {date ? date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a Date'}
            </CardTitle>
            <CardDescription>Workouts scheduled for this day.</CardDescription>
          </CardHeader>
          <CardContent>
            {date && (
              <Button onClick={() => setIsDialogOpen(true)} className="w-full mb-4">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Workout to Day
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
                {date ? 'No workouts scheduled for this day. Enjoy your rest or add one!' : 'Select a date to see scheduled workouts.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workout to {date?.toLocaleDateString()}</DialogTitle>
            <DialogDescription>Select a workout plan to schedule for this day.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWorkout}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="workoutPlan">Workout Plan</Label>
                <Select name="workoutPlan">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plan1">Full Body Blast</SelectItem>
                    <SelectItem value="plan2">Upper Body Power</SelectItem>
                    <SelectItem value="plan3">Leg Day Domination</SelectItem>
                    <SelectItem value="plan4">Cardio Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                {/* In a real app, use a time picker component */}
                <Input id="time" name="time" type="time" defaultValue="09:00" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Schedule Workout</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
