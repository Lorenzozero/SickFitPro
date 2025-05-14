
'use client';

import { useState, useEffect, type ChangeEvent, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, Drumstick, Wheat, Fish, LineChart, Target } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '../ui/skeleton';
import { dayKeys as appDayKeys } from '@/context/weekly-schedule-context';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart as RechartsPrimitiveLineChart } from "recharts";
import { format, subDays, subWeeks, subMonths, startOfWeek, startOfMonth, eachDayOfInterval, getDay, getISOWeek, getMonth } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface DailyMacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

type ChartDataPoint = {
  date: string;
  protein?: number;
  carbs?: number;
  fat?: number;
};

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
  
  const [isClient, setIsClient] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isGoalSettingOpen, setIsGoalSettingOpen] = useState(false);

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
    setIsGoalSettingOpen(false);
  }

  useEffect(() => {
    if (!isClient || !languageContextIsClient || Object.keys(weeklyMacroGoals).length === 0) {
      setChartData([]);
      return;
    }

    const today = new Date();
    const newChartData: ChartDataPoint[] = [];

    if (selectedTimeRange === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        const dayIndex = getDay(day);
        const appDayKey = appDayKeys[dayIndex === 0 ? 6 : dayIndex - 1]; 
        const goalsForDay = weeklyMacroGoals[appDayKey] || { protein: 0, carbs: 0, fat: 0 };
        newChartData.push({
          date: format(day, 'MMM d'),
          protein: goalsForDay.protein,
          carbs: goalsForDay.carbs,
          fat: goalsForDay.fat,
        });
      }
    } else if (selectedTimeRange === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 }); 
        let weeklyProtein = 0;
        let weeklyCarbs = 0;
        let weeklyFat = 0;
        
        const daysInThisWeek = eachDayOfInterval({ start: weekStart, end: subDays(startOfWeek(subWeeks(today, i-1), {weekStartsOn:1}),1) });

        daysInThisWeek.slice(0,7).forEach(dayInWeek => {
            const dayIndex = getDay(dayInWeek);
            const appDayKey = appDayKeys[dayIndex === 0 ? 6 : dayIndex - 1];
            const goalsForDay = weeklyMacroGoals[appDayKey] || { protein: 0, carbs: 0, fat: 0 };
            weeklyProtein += goalsForDay.protein;
            weeklyCarbs += goalsForDay.carbs;
            weeklyFat += goalsForDay.fat;
        });
        
        newChartData.push({
          date: t('macroTrackingCard.weekLabel', { weekNum: getISOWeek(weekStart) }),
          protein: weeklyProtein,
          carbs: weeklyCarbs,
          fat: weeklyFat,
        });
      }
    } else if (selectedTimeRange === 'monthly') {
      for (let i = 2; i >= 0; i--) { 
        const monthStart = startOfMonth(subMonths(today, i));
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: subDays(startOfMonth(subMonths(today, i-1)), 1) });
        
        let monthlyProtein = 0;
        let monthlyCarbs = 0;
        let monthlyFat = 0;

        daysInMonth.forEach(dayInMonth => {
            const dayIndex = getDay(dayInMonth);
            const appDayKey = appDayKeys[dayIndex === 0 ? 6 : dayIndex - 1];
            const goalsForDay = weeklyMacroGoals[appDayKey] || { protein: 0, carbs: 0, fat: 0 };
            monthlyProtein += goalsForDay.protein;
            monthlyCarbs += goalsForDay.carbs;
            monthlyFat += goalsForDay.fat;
        });
        
        newChartData.push({
          date: format(monthStart, 'MMM yyyy'),
          protein: monthlyProtein,
          carbs: monthlyCarbs,
          fat: monthlyFat,
        });
      }
    }
    setChartData(newChartData);
  }, [selectedTimeRange, weeklyMacroGoals, isClient, languageContextIsClient, t, language]);


  const macroDetails: Array<{ key: keyof DailyMacroGoals; labelKey: string; icon: React.ElementType; unit: string; color: string }> = [
    { key: 'protein', labelKey: 'macroTrackingCard.proteinLabel', icon: Drumstick, unit: 'g', color: 'hsl(var(--chart-1))' },
    { key: 'carbs', labelKey: 'macroTrackingCard.carbsLabel', icon: Wheat, unit: 'g', color: 'hsl(var(--chart-2))' },
    { key: 'fat', labelKey: 'macroTrackingCard.fatLabel', icon: Fish, unit: 'g', color: 'hsl(var(--chart-3))' },
  ];
  
  const currentGoalsForSelectedDay = weeklyMacroGoals[selectedDayForGoalSetting] || initialDailyGoals;

  const chartConfig = {
    protein: { label: t('macroTrackingCard.proteinLabel'), color: macroDetails.find(m=>m.key==='protein')?.color || 'hsl(var(--chart-1))' },
    carbs: { label: t('macroTrackingCard.carbsLabel'), color: macroDetails.find(m=>m.key==='carbs')?.color || 'hsl(var(--chart-2))' },
    fat: { label: t('macroTrackingCard.fatLabel'), color: macroDetails.find(m=>m.key==='fat')?.color || 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;


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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-orange-500" />
          {t('macroTrackingCard.title')}
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsGoalSettingOpen(!isGoalSettingOpen)}
                aria-label={t('macroTrackingCard.goalSettingsButtonAriaLabel', {default: "Macro Goal Settings"})}
              >
                <Target className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('macroTrackingCard.goalSettingsTooltip', {default: "Set weekly macro goals"})}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="space-y-6">
        {isGoalSettingOpen && (
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
                    value={String(currentGoalsForSelectedDay[m.key])}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleGoalPropertyChange(selectedDayForGoalSetting, m.key, e.target.value)}
                    min="0"
                  />
                </div>
              ))}
            </div>
             <div className="flex justify-center sm:justify-start">
              <Button onClick={handleSaveDayGoals} size="sm">{t('macroTrackingCard.saveGoalsButton')}</Button>
             </div>
             <Separator className="my-6" />
          </div>
        )}
        
        <div>
            <Tabs value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="daily">{t('macroTrackingCard.dailyTab')}</TabsTrigger>
                <TabsTrigger value="weekly">{t('macroTrackingCard.weeklyTab')}</TabsTrigger>
                <TabsTrigger value="monthly">{t('macroTrackingCard.monthlyTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="daily">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <RechartsPrimitiveLineChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="protein" type="monotone" stroke="var(--color-protein)" strokeWidth={2} dot={false} />
                        <Line dataKey="carbs" type="monotone" stroke="var(--color-carbs)" strokeWidth={2} dot={false} />
                        <Line dataKey="fat" type="monotone" stroke="var(--color-fat)" strokeWidth={2} dot={false} />
                    </RechartsPrimitiveLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="weekly">
                 <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <RechartsPrimitiveLineChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="protein" type="monotone" stroke="var(--color-protein)" strokeWidth={2} dot={false} />
                        <Line dataKey="carbs" type="monotone" stroke="var(--color-carbs)" strokeWidth={2} dot={false} />
                        <Line dataKey="fat" type="monotone" stroke="var(--color-fat)" strokeWidth={2} dot={false} />
                    </RechartsPrimitiveLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="monthly">
                 <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <RechartsPrimitiveLineChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="protein" type="monotone" stroke="var(--color-protein)" strokeWidth={2} dot={false} />
                        <Line dataKey="carbs" type="monotone" stroke="var(--color-carbs)" strokeWidth={2} dot={false} />
                        <Line dataKey="fat" type="monotone" stroke="var(--color-fat)" strokeWidth={2} dot={false} />
                    </RechartsPrimitiveLineChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
