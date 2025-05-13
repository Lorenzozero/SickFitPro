'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Utensils, Zap, Flame, Fish, Wheat, Drumstick, Bell } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';

interface Macro {
  goal: number;
  current: number;
}

interface Macros {
  protein: Macro;
  carbs: Macro;
  fat: Macro;
}

const initialMacros: Macros = {
  protein: { goal: 150, current: 0 }, // g
  carbs: { goal: 250, current: 0 },   // g
  fat: { goal: 70, current: 0 },      // g
};

type ReminderFrequency = 'off' | 'daily' | 'mealtime';

export default function MacroTrackingCard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [macros, setMacros] = useState<Macros>(initialMacros);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('off');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, load macros and reminderFrequency from localStorage or backend
  }, []);

  const handleGoalChange = (macroKey: keyof Macros, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setMacros(prev => ({
        ...prev,
        [macroKey]: { ...prev[macroKey], goal: numValue },
      }));
    } else if (value === '') {
       setMacros(prev => ({
        ...prev,
        [macroKey]: { ...prev[macroKey], goal: 0 },
      }));
    }
  };

  const handleIntakeChange = (macroKey: keyof Macros, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setMacros(prev => ({
        ...prev,
        [macroKey]: { ...prev[macroKey], current: numValue },
      }));
    } else if (value === '') {
       setMacros(prev => ({
        ...prev,
        [macroKey]: { ...prev[macroKey], current: 0 },
      }));
    }
  };

  const handleSaveGoals = () => {
    // Here you would typically save to localStorage or backend
    toast({
        title: t('macroTrackingCard.goalsSavedTitle'),
        description: t('macroTrackingCard.goalsSavedDescription')
    });
  }
  
  const handleSaveIntake = () => {
    // Here you would typically save to localStorage or backend
     toast({
        title: t('macroTrackingCard.intakeSavedTitle'),
        description: t('macroTrackingCard.intakeSavedDescription')
    });
  }


  const macroDetails: Array<{ key: keyof Macros; labelKey: string; icon: React.ElementType; unit: string; color: string }> = [
    { key: 'protein', labelKey: 'macroTrackingCard.proteinLabel', icon: Drumstick, unit: 'g', color: 'bg-red-500' },
    { key: 'carbs', labelKey: 'macroTrackingCard.carbsLabel', icon: Wheat, unit: 'g', color: 'bg-yellow-500' },
    { key: 'fat', labelKey: 'macroTrackingCard.fatLabel', icon: Fish, unit: 'g', color: 'bg-green-500' },
  ];

  if (!isClient) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-orange-500" />
            {t('macroTrackingCard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4 mb-4" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-10 bg-muted rounded-md animate-pulse mb-4" />)}
          <Skeleton className="h-10 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-orange-500" />
          {t('macroTrackingCard.title')}
        </CardTitle>
        <CardDescription>{t('macroTrackingCard.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-md font-semibold mb-3">{t('macroTrackingCard.setYourDailyGoals')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {macroDetails.map(m => (
              <div key={m.key}>
                <Label htmlFor={`${m.key}-goal`} className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                  <m.icon className="w-4 h-4 mr-1.5" /> {t(m.labelKey)} ({m.unit})
                </Label>
                <Input
                  id={`${m.key}-goal`}
                  type="number"
                  value={macros[m.key].goal}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleGoalChange(m.key, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
           <div className="flex justify-center sm:justify-start">
            <Button onClick={handleSaveGoals} size="sm">{t('macroTrackingCard.saveGoalsButton')}</Button>
           </div>
        </div>
        
        <hr className="border-border" />

        <div>
            <h3 className="text-md font-semibold mb-3">{t('macroTrackingCard.logYourDailyIntake')}</h3>
            {macroDetails.map(m => {
            const progress = m.goal > 0 ? (macros[m.key].current / m.goal) * 100 : 0;
            const IconComponent = m.icon;
            return (
                <div key={m.key} className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <Label htmlFor={`${m.key}-current`} className="flex items-center text-sm font-medium text-muted-foreground">
                      <IconComponent className="w-4 h-4 mr-1.5" /> {t(m.labelKey)}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                    {macros[m.key].current}{m.unit} / {macros[m.key].goal}{m.unit}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        id={`${m.key}-current`}
                        type="number"
                        value={macros[m.key].current}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleIntakeChange(m.key, e.target.value)}
                        min="0"
                        className="flex-grow"
                    />
                    <span className="text-xs font-medium w-12 text-right">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className={`w-full h-1.5 mt-1.5 ${m.color}`} />
                </div>
            );
            })}
            <div className="flex justify-center sm:justify-start">
                <Button onClick={handleSaveIntake} size="sm" className="mt-2">{t('macroTrackingCard.saveIntakeButton')}</Button>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-4 border-t gap-2">
            <Label htmlFor="macro-reminders" className="flex items-center font-normal whitespace-nowrap">
                <Bell className="w-4 h-4 mr-2" />
                {t('macroTrackingCard.reminderLabel')}
            </Label>
            <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as ReminderFrequency)}>
                <SelectTrigger id="macro-reminders" className="w-full sm:w-auto min-w-[180px]">
                    <SelectValue placeholder={t('macroTrackingCard.selectReminderFrequencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="off">{t('macroTrackingCard.reminderOff')}</SelectItem>
                    <SelectItem value="daily">{t('macroTrackingCard.reminderDaily')}</SelectItem>
                    <SelectItem value="mealtime">{t('macroTrackingCard.reminderMealtime')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardContent>
    </Card>
  );
}
