'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit2, Trash2, Share2, PlayCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Mock data
const initialWorkoutPlans = [
  { id: '1', name: 'Full Body Blast', description: 'A comprehensive full-body workout for strength and endurance.', exercises: 5, duration: '60 min' },
  { id: '2', name: 'Upper Body Power', description: 'Focus on building strength in your chest, back, and arms.', exercises: 6, duration: '75 min' },
  { id: '3', name: 'Leg Day Domination', description: 'Intense leg workout to build lower body strength and size.', exercises: 4, duration: '90 min' },
];

type WorkoutPlan = typeof initialWorkoutPlans[0] & { exerciseDetails?: { name: string; sets: string; reps: string; weight: string }[] };

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>(initialWorkoutPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<WorkoutPlan> | null>(null);
  const { toast } = useToast();

  // Simplified form handling for brevity
  const handleSavePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlan: WorkoutPlan = {
      id: currentPlan?.id || String(Date.now()),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      // In a real app, handle exerciseDetails properly
      exercises: currentPlan?.exercises || 0,
      duration: currentPlan?.duration || 'N/A',
      exerciseDetails: [], 
    };
    
    if (currentPlan?.id) {
      setPlans(plans.map(p => p.id === newPlan.id ? newPlan : p));
      toast({ title: "Plan Updated", description: `"${newPlan.name}" has been updated.` });
    } else {
      setPlans([...plans, newPlan]);
      toast({ title: "Plan Created", description: `"${newPlan.name}" has been created.` });
    }
    setIsDialogOpen(false);
    setCurrentPlan(null);
  };

  const openDialog = (plan?: WorkoutPlan) => {
    setCurrentPlan(plan || {});
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string, name: string) => {
    setPlans(plans.filter(p => p.id !== id));
    toast({ title: "Plan Deleted", description: `"${name}" has been deleted.`, variant: "destructive" });
  }

  const handleShare = (planName: string) => {
    navigator.clipboard.writeText(`Check out my workout plan: ${planName} on SickFit Pro!`);
    toast({ title: "Link Copied!", description: "Workout plan link copied to clipboard." });
  }

  return (
    <>
      <PageHeader
        title="Workout Plans"
        description="Create, manage, and share your training schedules."
        actions={
          <Button onClick={() => openDialog()}>
            <PlusCircle className="w-4 h-4 mr-2" /> Create New Plan
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">Exercises: {plan.exercises}</p>
              <p className="text-sm text-muted-foreground">Est. Duration: {plan.duration}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center gap-2 pt-4 border-t">
              <Button variant="default" size="sm">
                <PlayCircle className="w-4 h-4 mr-2" /> Start
              </Button>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openDialog(plan)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleShare(plan.name)}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id, plan.name)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentPlan?.id ? 'Edit Workout Plan' : 'Create New Workout Plan'}</DialogTitle>
            <DialogDescription>
              {currentPlan?.id ? 'Update the details of your workout plan.' : 'Design your new workout plan.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePlan}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input id="name" name="name" defaultValue={currentPlan?.name || ''} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={currentPlan?.description || ''} />
              </div>
              {/* Placeholder for adding exercises dynamically */}
              <div className="p-4 text-center border-2 border-dashed rounded-lg border-border">
                <p className="text-sm text-muted-foreground">Exercise selection and set/rep details would go here.</p>
                <Button type="button" variant="outline" size="sm" className="mt-2">Add Exercise</Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
