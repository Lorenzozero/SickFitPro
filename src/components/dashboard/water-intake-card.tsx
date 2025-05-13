// src/components/dashboard/water-intake-card.tsx
'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplet, PlusCircle, MinusCircle, RotateCcw, GlassWater, Milk, Bell } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton'; // Added import for Skeleton

const DEFAULT_DAILY_WATER_GOAL_ML = 2500;
const WATER_INCREMENT_ML = 250;
type ReminderFrequency = 'off' | 'hourly' | 'daily';


export default function WaterIntakeCard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentWaterIntake, setCurrentWaterIntake] = useState(0);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(DEFAULT_DAILY_WATER_GOAL_ML);
  const [inputGoal, setInputGoal] = useState(DEFAULT_DAILY_WATER_GOAL_ML.toString());
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('off');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, load dailyWaterGoal and reminderFrequency from localStorage or backend
  }, []);

  const addWater = (amount: number) => {
    setCurrentWaterIntake(prev => Math.max(0, prev + amount));
  };

  const resetWater = () => {
    setCurrentWaterIntake(0);
    toast({
      title: t('waterIntakeCard.waterResetTitle'),
      description: t('waterIntakeCard.waterResetDescription'),
    });
  };

  const handleGoalInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputGoal(e.target.value);
  };
  
  const handleSaveGoal = () => {
    const newGoal = parseInt(inputGoal, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setDailyWaterGoal(newGoal);
      toast({
        title: t('waterIntakeCard.goalSavedTitle'),
        description: t('waterIntakeCard.goalSavedDescription'),
      });
    } else {
      toast({
        title: t('toastErrorTitle'),
        description: "Please enter a valid goal.", // Add translation if needed
        variant: "destructive"
      });
      setInputGoal(dailyWaterGoal.toString()); // Reset input to current valid goal
    }
  };

  const progressPercentage = dailyWaterGoal > 0 ? (currentWaterIntake / dailyWaterGoal) * 100 : 0;

  if (!isClient) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-blue-500" />
            {t('waterIntakeCard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-10 bg-muted rounded-md mb-4" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-blue-500" />
            {t('waterIntakeCard.title')}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={resetWater} aria-label={t('waterIntakeCard.resetWaterButton')}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('waterIntakeCard.resetWaterButton')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>{t('waterIntakeCard.description', { dailyGoal: dailyWaterGoal })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="water-goal">{t('waterIntakeCard.setGoalLabel')}</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="water-goal"
              type="number"
              value={inputGoal}
              onChange={handleGoalInputChange}
              min="1"
              className="w-full"
            />
            <Button onClick={handleSaveGoal} size="sm">{t('waterIntakeCard.saveGoalButton')}</Button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">
              {t('waterIntakeCard.currentIntakeLabel', { current: currentWaterIntake, dailyGoal: dailyWaterGoal })}
            </span>
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full h-2" />
        </div>
        <TooltipProvider>
          <div className="grid grid-cols-2 gap-2"> {/* Changed from grid-cols-3 to grid-cols-2 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => addWater(WATER_INCREMENT_ML)} 
                  variant="outline" 
                  aria-label={t('waterIntakeCard.ariaAddGlass', { amount: WATER_INCREMENT_ML })}
                  className="w-full h-12 sm:h-10 flex flex-col items-center justify-center"
                >
                  <GlassWater className="w-5 h-5 mb-0.5" />
                  <span className="text-xs">+{WATER_INCREMENT_ML}ml</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('waterIntakeCard.tooltipAddAmount', { amount: WATER_INCREMENT_ML })}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => addWater(WATER_INCREMENT_ML * 2)} 
                  variant="outline" 
                  aria-label={t('waterIntakeCard.ariaAddBottle', { amount: WATER_INCREMENT_ML * 2 })}
                  className="w-full h-12 sm:h-10 flex flex-col items-center justify-center"
                >
                  <Milk className="w-5 h-5 mb-0.5" />
                   <span className="text-xs">+{WATER_INCREMENT_ML * 2}ml</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('waterIntakeCard.tooltipAddAmount', { amount: WATER_INCREMENT_ML * 2 })}</p>
              </TooltipContent>
            </Tooltip>

            {/* Removed the -500ml button */}
          </div>
        </TooltipProvider>
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-4 border-t gap-2">
            <Label htmlFor="water-reminders" className="flex items-center font-normal whitespace-nowrap">
                <Bell className="w-4 h-4 mr-2" />
                {t('waterIntakeCard.reminderLabel')}
            </Label>
            <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as ReminderFrequency)}>
                <SelectTrigger id="water-reminders" className="w-full sm:w-auto min-w-[180px]">
                    <SelectValue placeholder={t('waterIntakeCard.selectReminderFrequencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="off">{t('waterIntakeCard.reminderOff')}</SelectItem>
                    <SelectItem value="hourly">{t('waterIntakeCard.reminderHourly')}</SelectItem>
                    <SelectItem value="daily">{t('waterIntakeCard.reminderDaily')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardContent>
    </Card>
  );
}

