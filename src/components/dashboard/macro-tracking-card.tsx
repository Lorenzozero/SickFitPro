
'use client';

import { useState, useEffect, type ChangeEvent, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, Drumstick, Wheat, Fish } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';
import { dayKeys as appDayKeys } from '@/context/weekly-schedule-context';
import { Separator } from '../ui/separator';

interface DailyMacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

const initialDailyGoals: DailyMacroGoals = { protein: 150, carbs: 250, fat: 70 };

const initialWeeklyMacroGoals: Record<string, DailyMacroGoals> = appDayKeys.reduce((acc, day) => {
    acc[day] = { ...initialDailyGoals };
    return acc;
}, {} as Record<string, DailyMacroGoals>);

const MACRO_GOALS_STORAGE_KEY = 'sickfit-pro-weeklyMacroGoals';

export default function MacroTrackingCard() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { toast } = useToast();
  
  const [weeklyMacroGoals, setWeeklyMacroGoals] = useState<Record<string, DailyMacroGoals>>(initialWeeklyMacroGoals);
  const [selectedDayForGoalSetting, setSelectedDayForGoalSetting] = useState<string>(appDayKeys[0]);
  const [currentMonthTotals, setCurrentMonthTotals] = useState<DailyMacroGoals | null>(null);
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedGoals = localStorage.getItem(MACRO_GOALS_STORAGE_KEY);
      if (storedGoals) {
        try {
          const parsedGoals = JSON.parse(storedGoals);
          const fullGoals = appDayKeys.reduce((acc, day) => {
            acc[day] = parsedGoals[day] || { ...initialDailyGoals };
            return acc;
          }, {} as Record<string, DailyMacroGoals>)
          setWeeklyMacroGoals(fullGoals);
        } catch (e) {
          console.error("Error parsing weekly macro goals from localStorage", e);
          setWeeklyMacroGoals(initialWeeklyMacroGoals);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(MACRO_GOALS_STORAGE_KEY, JSON.stringify(weeklyMacroGoals));
    }
  }, [weeklyMacroGoals, isClient]);

  const handleGoalPropertyChange = (dayKey: string, macroKey: keyof DailyMacroGoals, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeeklyMacroGoals(prev => ({
        ...prev,
        [dayKey]: { ...prev[dayKey], [macroKey]: numValue },
      }));
    } else if (value === '') {
       setWeeklyMacroGoals(prev => ({
        ...prev,
        [dayKey]: { ...prev[dayKey], [macroKey]: 0 },
      }));
    }
  };
  
  const handleSaveDayGoals = () => {
    toast({
        title: t('macroTrackingCard.goalsSavedTitle'),
        description: t('macroTrackingCard.goalsForDaySaved', { dayOfWeek: t(`calendarPage.days.${selectedDayForGoalSetting}`) })
    });
  }

  const calculateMonthlyTotals = useCallback((year: number, month: number, goals: Record<string, DailyMacroGoals>): DailyMacroGoals => {
    const totals: DailyMacroGoals = { protein: 0, carbs: 0, fat: 0 };
    if (Object.keys(goals).length === 0 || Object.values(goals).every(g => !g)) return totals;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        const jsDayIndex = currentDate.getDay();
        const appDayKey = appDayKeys[jsDayIndex === 0 ? 6 : jsDayIndex - 1];
        
        const dailyGoal = goals[appDayKey];
        if (dailyGoal) {
            totals.protein += dailyGoal.protein;
            totals.carbs += dailyGoal.carbs;
            totals.fat += dailyGoal.fat;
        }
    }
    return totals;
  }, []);

  useEffect(() => {
    if (isClient && languageContextIsClient) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const totals = calculateMonthlyTotals(year, month, weeklyMacroGoals);
      setCurrentMonthTotals(totals);
    }
  }, [weeklyMacroGoals, isClient, languageContextIsClient, calculateMonthlyTotals]);


  const macroDetails: Array<{ key: keyof DailyMacroGoals; labelKey: string; icon: React.ElementType; unit: string; color: string }> = [
    { key: 'protein', labelKey: 'macroTrackingCard.proteinLabel', icon: Drumstick, unit: 'g', color: 'bg-red-500' },
    { key: 'carbs', labelKey: 'macroTrackingCard.carbsLabel', icon: Wheat, unit: 'g', color: 'bg-yellow-500' },
    { key: 'fat', labelKey: 'macroTrackingCard.fatLabel', icon: Fish, unit: 'g', color: 'bg-green-500' },
  ];
  
  const currentGoalsForSelectedDay = weeklyMacroGoals[selectedDayForGoalSetting] || initialDailyGoals;

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
          <Skeleton className="h-10 bg-muted rounded-md animate-pulse mb-4" />
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-md font-semibold mb-3">{t('macroTrackingCard.setYourWeeklyGoals')}</h3>
          
          <div className="mb-4">
            <Label htmlFor="select-day-for-goals">{t('macroTrackingCard.selectDay')}</Label>
            <Select value={selectedDayForGoalSetting} onValueChange={setSelectedDayForGoalSetting}>
              <SelectTrigger id="select-day-for-goals">
                <SelectValue placeholder={t('macroTrackingCard.selectDay')} />
              </SelectTrigger>
              <SelectContent>
                {appDayKeys.map(dayKey => (
                  <SelectItem key={dayKey} value={dayKey}>
                    {t(`calendarPage.days.${dayKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {macroDetails.map(m => (
              <div key={m.key}>
                <Label htmlFor={`${selectedDayForGoalSetting}-${m.key}-goal`} className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                  <m.icon className="w-4 h-4 mr-1.5" /> {t(m.labelKey)} ({m.unit})
                </Label>
                <Input
                  id={`${selectedDayForGoalSetting}-${m.key}-goal`}
                  type="number"
                  value={currentGoalsForSelectedDay[m.key]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleGoalPropertyChange(selectedDayForGoalSetting, m.key, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
           <div className="flex justify-center sm:justify-start">
            <Button onClick={handleSaveDayGoals} size="sm">{t('macroTrackingCard.saveGoalsButton')}</Button>
           </div>
        </div>
        
        <Separator />

        <div>
            <h3 className="text-md font-semibold mb-3">{t('macroTrackingCard.monthlyTotalsTitle')}</h3>
            {currentMonthTotals ? (
                 <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-1 text-sm">
                        <p className="flex justify-between">
                            <span>{t('macroTrackingCard.totalProteinMonth')}:</span> 
                            <span className="font-medium">{currentMonthTotals.protein.toLocaleString()} {t('macroTrackingCard.unitGrams')}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>{t('macroTrackingCard.totalCarbsMonth')}:</span>
                            <span className="font-medium">{currentMonthTotals.carbs.toLocaleString()} {t('macroTrackingCard.unitGrams')}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>{t('macroTrackingCard.totalFatMonth')}:</span>
                            <span className="font-medium">{currentMonthTotals.fat.toLocaleString()} {t('macroTrackingCard.unitGrams')}</span>
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <p className="text-sm text-muted-foreground">{t('macroTrackingCard.loadingTotals')}</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
