
'use client';

import { useState, type ChangeEvent, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { LineChart as LucideLineChart, UploadCloud, Users, PlusCircle, Edit2, Trash2, Bell, Wand2, BarChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Line, Legend as RechartsLegend, BarChart as RechartsPrimitiveBarChart, LineChart as RechartsPrimitiveLineChart } from "recharts";
import type { ChartConfig } from '@/components/ui/chart';
import { useLanguage } from '@/context/language-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AddMeasurementDialog } from '@/components/dialogs/add-measurement-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AiSplitForm } from '@/components/forms/ai-split-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, getISOWeek, getMonth, getYear, subWeeks, subMonths, subYears } from 'date-fns';
import { it as dateFnsIt, es as dateFnsEs, fr as dateFnsFr, enUS as dateFnsEnUs } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import prisma from '@/lib/database';


const BODY_MEASUREMENTS_STORAGE_KEY = 'sickfit-pro-userBodyMeasurements';
const PROGRESS_PHOTOS_STORAGE_KEY = 'sickfit-pro-progressPhotos';

interface DetailedWorkoutLog {
  date: string; // YYYY-MM-DD
  exerciseName: string;
  sets: Array<{ reps: number; weight: number }>;
}

const mockDetailedWorkoutLogs: DetailedWorkoutLog[] = [
  { date: '2024-07-29', exerciseName: 'Bench Press', sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 6, weight: 72.5 }] },
  { date: '2024-07-29', exerciseName: 'Squat', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }, { reps: 5, weight: 102.5 }] },
  { date: '2024-07-29', exerciseName: 'Bicep Curl', sets: [{ reps: 12, weight: 15 }, { reps: 10, weight: 15 }] },
  { date: '2024-07-31', exerciseName: 'Overhead Press', sets: [{ reps: 6, weight: 50 }, { reps: 6, weight: 50 }] },
  { date: '2024-07-31', exerciseName: 'Triceps Pushdown', sets: [{ reps: 12, weight: 25 }, { reps: 12, weight: 25 }] },
  { date: '2024-08-05', exerciseName: 'Bench Press', sets: [{ reps: 8, weight: 72.5 }, { reps: 7, weight: 72.5 }] },
  { date: '2024-08-05', exerciseName: 'Squat', sets: [{ reps: 5, weight: 102.5 }, { reps: 5, weight: 105 }] },
  { date: '2024-08-07', exerciseName: 'Deadlift', sets: [{ reps: 3, weight: 120 }, { reps: 3, weight: 122.5 }] },
  { date: '2024-08-07', exerciseName: 'Bicep Curl', sets: [{ reps: 10, weight: 17.5 }, { reps: 8, weight: 17.5 }] },
  { date: '2024-06-03', exerciseName: 'Bench Press', sets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 65 }] },
  { date: '2024-06-03', exerciseName: 'Squat', sets: [{ reps: 8, weight: 90 }, { reps: 8, weight: 90 }] },
  { date: '2024-06-10', exerciseName: 'Overhead Press', sets: [{ reps: 8, weight: 45 }, { reps: 7, weight: 45 }] },
  { date: '2024-05-15', exerciseName: 'Bench Press', sets: [{ reps: 10, weight: 60 }] },
  { date: '2024-05-15', exerciseName: 'Deadlift', sets: [{ reps: 5, weight: 110 }] },
];

const exerciseToMuscleGroupMap: Record<string, string> = {
  'Bench Press': 'chest',
  'Incline Dumbbell Press': 'chest',
  'Squat': 'legs',
  'Leg Press': 'legs',
  'Deadlift': 'back', 
  'Barbell Row': 'back',
  'Overhead Press': 'shoulders',
  'Lateral Raise': 'shoulders',
  'Bicep Curl': 'biceps',
  'Hammer Curl': 'biceps',
  'Triceps Pushdown': 'triceps',
  'Skullcrusher': 'triceps',
};

const MUSCLE_GROUPS_TO_TRACK = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps'];

const getDateFnsLocale = (lang: string) => {
  switch (lang) {
    case 'it': return dateFnsIt;
    case 'es': return dateFnsEs;
    case 'fr': return dateFnsFr;
    default: return dateFnsEnUs;
  }
};

const initialBodyCompositionChartData = [
  { month: "January", weight: 70 },
  { month: "February", weight: 69.5 },
  { month: "March", weight: 69 },
  { month: "April", weight: 68.5 },
  { month: "May", weight: 68 },
  { month: "June", weight: 67.5 },
];

export interface BodyMeasurement {
  id: string;
  date: string; 
  measurementName: string;
  value: number;
  unit: 'cm' | 'in' | 'kg' | 'lbs';
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  src: string;
  date: string; // YYYY-MM-DD
}

const initialBodyMeasurements: BodyMeasurement[] = [
    { id: 'm1', date: '2023-01-15', measurementName: 'Biceps', value: 35, unit: 'cm', notes: 'Right arm, flexed' },
    { id: 'm2', date: '2023-01-15', measurementName: 'Waist', value: 80, unit: 'cm' },
    { id: 'm3', date: '2023-01-15', measurementName: 'Weight', value: 70, unit: 'kg' },
];

type ReminderFrequency = 'off' | 'weekly' | 'bi-weekly' | 'monthly';


export default function ProgressPage() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { toast } = useToast();
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<BodyMeasurement> | null>(null);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('off');

  const [selectedTimeRange, setSelectedTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [performanceChartData, setPerformanceChartData] = useState<any[]>([]);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        const storedMeasurements = localStorage.getItem(BODY_MEASUREMENTS_STORAGE_KEY);
        if (storedMeasurements) {
            try {
                setBodyMeasurements(JSON.parse(storedMeasurements));
            } catch (e) {
                console.error("Error parsing body measurements from localStorage", e);
                setBodyMeasurements(initialBodyMeasurements);
            }
        }
        const storedPhotos = localStorage.getItem(PROGRESS_PHOTOS_STORAGE_KEY);
        if (storedPhotos) {
          try {
            setProgressPhotos(JSON.parse(storedPhotos));
          } catch (e) {
            console.error("Error parsing progress photos from localStorage", e);
          }
        }
    }
  }, []);

  useEffect(() => {
    if (isClient && progressPhotos.length > 0) {
      localStorage.setItem(PROGRESS_PHOTOS_STORAGE_KEY, JSON.stringify(progressPhotos));
    } else if (isClient && progressPhotos.length === 0) {
      localStorage.removeItem(PROGRESS_PHOTOS_STORAGE_KEY);
    }
  }, [progressPhotos, isClient]);

  useEffect(() => {
    if (!isClient) return;
    const sortedPhotos = [...progressPhotos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedPhotos.length === 0) {
      setPhotoBefore(null);
      setPhotoAfter(null);
    } else if (sortedPhotos.length === 1) {
      setPhotoBefore(null);
      setPhotoAfter(sortedPhotos[0].src);
    } else {
      setPhotoBefore(sortedPhotos[0].src);
      setPhotoAfter(sortedPhotos[sortedPhotos.length - 1].src);
    }
  }, [progressPhotos, isClient]);


  useEffect(() => {
    if (!isClient || !languageContextIsClient) {
      setPerformanceChartData([]);
      return;
    }

    const processData = () => {
      const locale = getDateFnsLocale(language);
      const aggregatedData: Record<string, Record<string, number>> = {};
      const periodsSet = new Set<string>();
      const now = new Date();
      let startDateLimit: Date;
      let periodFormatFn: (date: Date) => string;
      let displayFormatFn: (periodStr: string) => string;

      if (selectedTimeRange === 'weekly') {
        startDateLimit = subWeeks(now, 7); 
        periodFormatFn = (date) => `${getYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;
        displayFormatFn = (periodStr) => {
            const [_year, weekNum] = periodStr.split('-W');
            return t('progressPage.weekShortLabel', { default: `W${weekNum}`, num: weekNum });
        };
      } else if (selectedTimeRange === 'monthly') {
        startDateLimit = subMonths(now, 11); 
        periodFormatFn = (date) => `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
        displayFormatFn = (periodStr) => {
            const [year, monthNum] = periodStr.split('-');
            return format(new Date(parseInt(year), parseInt(monthNum) - 1, 1), 'MMM yy', { locale });
        };
      } else { 
        startDateLimit = subYears(now, 1);
        periodFormatFn = (date) => `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
         displayFormatFn = (periodStr) => {
            const [year, monthNum] = periodStr.split('-');
            return format(new Date(parseInt(year), parseInt(monthNum) - 1, 1), 'MMM yy', { locale });
        };
      }

      mockDetailedWorkoutLogs.forEach(log => {
        const logDate = parseISO(log.date);
        if (logDate < startDateLimit || logDate > now) return;

        const muscleGroupKey = exerciseToMuscleGroupMap[log.exerciseName];
        if (!muscleGroupKey || !MUSCLE_GROUPS_TO_TRACK.includes(muscleGroupKey)) return;

        const volume = log.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
        const periodKey = periodFormatFn(logDate);

        if (!aggregatedData[periodKey]) {
          aggregatedData[periodKey] = {};
          MUSCLE_GROUPS_TO_TRACK.forEach(mg => aggregatedData[periodKey][mg] = 0);
        }
        aggregatedData[periodKey][muscleGroupKey] = (aggregatedData[periodKey][muscleGroupKey] || 0) + volume;
        periodsSet.add(periodKey);
      });
      
      const sortedPeriods = Array.from(periodsSet).sort();

      const chartFormattedData = sortedPeriods.map(periodStr => {
        return {
          period: displayFormatFn(periodStr), 
          originalPeriod: periodStr, 
          ...aggregatedData[periodStr]
        };
      });
      
      setPerformanceChartData(chartFormattedData);
    };

    processData();
  }, [selectedTimeRange, isClient, language, t, languageContextIsClient]);

  const performanceChartConfig: ChartConfig = useMemo(() => MUSCLE_GROUPS_TO_TRACK.reduce((acc, mgKey) => {
    acc[mgKey] = {
      label: t(`progressPage.muscleGroup${mgKey.charAt(0).toUpperCase() + mgKey.slice(1)}Chart`, { default: mgKey }),
      color: `hsl(var(--chart-${(MUSCLE_GROUPS_TO_TRACK.indexOf(mgKey) % 5) + 1}))`,
      icon: LucideLineChart,
    };
    return acc;
  }, {} as ChartConfig), [t]);
  
  const bodyCompositionChartConfig: ChartConfig = {
     weight: {
      label: languageContextIsClient ? t('progressPage.weightLabel') : 'Weight (kg)',
      color: 'hsl(var(--chart-3))',
      icon: LucideLineChart, 
    }
  };


  const persistMeasurements = (updatedMeasurements: BodyMeasurement[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BODY_MEASUREMENTS_STORAGE_KEY, JSON.stringify(updatedMeasurements));
    }
  };

  const handleNewPhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ProgressPhoto = {
          id: String(Date.now()),
          src: reader.result as string,
          date: new Date().toISOString().split('T')[0],
        };
        setProgressPhotos(prevPhotos => [...prevPhotos, newPhoto]);
        toast({ title: t('progressPage.photoUploadedSuccess', {default: "Photo uploaded!"}), duration: 1000 });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const getMonthAbbreviation = (fullMonthName: string) => {
    if (!languageContextIsClient) return fullMonthName.slice(0, 3);
    const currentLanguage = languageContextIsClient ? language : 'en';
    const date = new Date(`2000 ${fullMonthName} 1`); 
    return format(date, 'MMM', { locale: getDateFnsLocale(currentLanguage) });
  };


  const handleSaveMeasurement = (measurement: BodyMeasurement) => {
    let updatedMeasurements;
    if (currentMeasurement?.id) {
      updatedMeasurements = bodyMeasurements.map(m => m.id === measurement.id ? measurement : m);
    } else {
      updatedMeasurements = [...bodyMeasurements, { ...measurement, id: String(Date.now()) }];
    }
    setBodyMeasurements(updatedMeasurements);
    persistMeasurements(updatedMeasurements);
    toast({ title: t('progressPage.measurementSaved'), duration: 1000 });
    setIsMeasurementDialogOpen(false);
    setCurrentMeasurement(null);
  };

  const openMeasurementDialog = (measurement?: BodyMeasurement) => {
    setCurrentMeasurement(measurement || {});
    setIsMeasurementDialogOpen(true);
  };

  const handleDeleteMeasurement = (id: string) => {
    const updatedMeasurements = bodyMeasurements.filter(m => m.id !== id);
    setBodyMeasurements(updatedMeasurements);
    persistMeasurements(updatedMeasurements);
    toast({ title: t('progressPage.measurementDeleted'), variant: 'destructive' });
  };


  if (!isClient || !languageContextIsClient) {
    return (
      <>
        <PageHeader
            title={t('progressPage.title')}
        />
        <div className="space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[500px] w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('progressPage.title')}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg rounded-xl border border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LucideLineChart className="w-5 h-5 mr-2 text-primary" />
              {t('progressPage.performanceMetricsCardTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as any)} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">{t('progressPage.timeRangeWeekly')}</TabsTrigger>
                <TabsTrigger value="monthly">{t('progressPage.timeRangeMonthly')}</TabsTrigger>
                <TabsTrigger value="yearly">{t('progressPage.timeRangeYearly')}</TabsTrigger>
              </TabsList>
            </Tabs>
            {/* Added overflow-x-auto for better mobile responsiveness of the chart */}
            <ChartContainer config={performanceChartConfig} className="h-[280px] sm:h-[350px] w-full overflow-x-auto min-w-[500px]">{/* Added min-w for mobile scrolling */}<ResponsiveContainer width="100%" height="100%">
                {/* Setting min-width to ensure chart content has enough space before scrolling */}
                <RechartsPrimitiveLineChart data={performanceChartData} margin={{ top: 5, right: 20, left: 30, bottom: 30 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    tickMargin={1}
                    minTickGap={10} 
                    axisLine={false}
                    tick={{ fontSize: 10 }} 
                  />
                  <YAxis
                    label={{
                      value: t('progressPage.weeklyTrainingVolumeLabel'),
                      angle: -90,
                      position: 'insideLeft',
                      offset: 0, 
                      style: { fontSize: 10, textAnchor: 'middle' }, 
                    }}
                    tick={{ fontSize: 10 }} 
                  />
                  <RechartsTooltip content={<ChartTooltipContent wrapperStyle={{ fontSize: '12px' }} />} />
                  <RechartsLegend content={<ChartLegendContent className="text-[10px] sm:text-xs" />} />
                  {MUSCLE_GROUPS_TO_TRACK.map(mgKey => (
                    <Line
                      key={mgKey}
                      dataKey={mgKey}
                      type="monotone"
                      stroke={`var(--color-${mgKey})`}
                      strokeWidth={2}
                      dot={{ r: 3 }} 
                      name={performanceChartConfig[mgKey]?.label?.toString()}
                      connectNulls={true}
                    />
                  ))}
                </RechartsPrimitiveLineChart></ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                {t('progressPage.bodyCompositionCardTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent> {/* Added overflow-x-auto for better mobile responsiveness of the chart */}
             <ChartContainer config={bodyCompositionChartConfig} className="h-[280px] sm:h-[350px] w-full overflow-x-auto min-w-[500px]">{/* Added min-w for mobile scrolling */}<ResponsiveContainer width="100%" height="100%">
                    <RechartsPrimitiveBarChart data={initialBodyCompositionChartData} margin={{ top: 5, right: 20, left: 25, bottom: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          minTickGap={5} 
                          tickFormatter={(value) => getMonthAbbreviation(value)}
                          tick={{ fontSize: 10 }} 
                        />
                        <YAxis dataKey="weight" domain={[40, 'auto']} tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<ChartTooltipContent indicator="dot" wrapperStyle={{ fontSize: '12px' }} />} />
                        <RechartsLegend content={<ChartLegendContent className="text-[10px] sm:text-xs" />} />
                        <Bar dataKey="weight" fill="var(--color-weight)" radius={4} name={bodyCompositionChartConfig.weight?.label?.toString()} />
                    </RechartsPrimitiveBarChart></ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-lg rounded-xl border bg-gradient-to-r from-yellow-400/80 to-pink-500/80 dark:from-orange-800/80 dark:to-pink-900/80 text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-primary-foreground" />
                <CardTitle className="text-primary-foreground">{t('progressPage.bodyMeasurementsCardTitle')}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                        {/* Tooltip rimosso per semplificare e risolvere potenziale conflitto di overlay */}
                        <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as ReminderFrequency)}>
                                <SelectTrigger asChild aria-label={t('progressPage.measurementReminderSettingsAriaLabel', {default: "Measurement Reminder Settings"})} >
                                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 [&_svg]:text-primary-foreground">
                                       <Bell className="w-4 h-4" />
                                    </Button>
                                </SelectTrigger>
                                <SelectContent sideOffset={5}> {/* Aggiunto sideOffset per un migliore posizionamento */}
                                    <SelectItem value="off">{t('progressPage.reminderOff')}</SelectItem>
                                    <SelectItem value="weekly">{t('progressPage.reminderWeekly')}</SelectItem>
                                    <SelectItem value="bi-weekly">{t('progressPage.reminderBiWeekly')}</SelectItem>
                                    <SelectItem value="monthly">{t('progressPage.reminderMonthly')}</SelectItem>
                                </SelectContent>
                            </Select>
                <Button onClick={() => openMeasurementDialog()} className="bg-white hover:bg-slate-100 text-black rounded-full">
                    <PlusCircle className="w-4 h-4 md:mr-2" /> 
                    <span className="hidden md:inline">{t('progressPage.addMeasurementButton')}</span>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {bodyMeasurements.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <Table>
                      <TableHeader >
                          <TableRow className="border-primary-foreground/30">
                              <TableHead className="min-w-[120px] text-primary-foreground">{t('progressPage.tableHeaderDate')}</TableHead>
                              <TableHead className="min-w-[150px] text-primary-foreground">{t('progressPage.tableHeaderMeasurementName')}</TableHead>
                              <TableHead className="min-w-[180px] text-primary-foreground">{t('progressPage.tableHeaderValue')}</TableHead>
                              <TableHead className="text-right min-w-[100px] text-primary-foreground">{t('exercisesPage.tableHeaderActions')}</TableHead> 
                            </TableRow>
                      </TableHeader>
                      <TableBody>
                          {bodyMeasurements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                              <TableRow key={m.id} className="border-primary-foreground/20 hover:bg-white/10">
                                  <TableCell className="text-primary-foreground">{new Date(m.date + 'T00:00:00').toLocaleDateString(languageContextIsClient ? language : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                  <TableCell className="text-primary-foreground">{t(`progressPage.measurementName${m.measurementName.charAt(0).toUpperCase() + m.measurementName.slice(1)}`, { default: m.measurementName })}</TableCell>
                                  <TableCell className="text-primary-foreground">{m.value} {m.unit}{m.notes ? ` (${m.notes})` : ''}</TableCell>
                                  <TableCell className="text-right space-x-1 sm:space-x-2"> {/* text-black applied to edit button */}
                                      <Button variant="ghost" size="icon" onClick={() => openMeasurementDialog(m)} className="text-primary-foreground hover:bg-white/20">
                                          <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMeasurement(m.id)}>
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </div>
            ) : (
                <p className="text-sm text-center text-primary-foreground/80 py-4">{t('progressPage.noMeasurementsYet')}</p>
            )}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg rounded-xl border bg-gradient-to-r from-orange-500/20 via-orange-500/80 to-orange-500/20 dark:from-orange-700/20 dark:via-orange-700/80 dark:to-orange-700/20 text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('progressPage.photoComparisonCardTitle')}</CardTitle>
          <div>
            <Input
              type="file"
              className="sr-only"
              id="new-progress-photo-upload"
              accept="image/*"
              onChange={handleNewPhotoUpload}
              ref={fileInputRef}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="text-white hover:text-white/90">
                    <UploadCloud className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('progressPage.uploadNewPhotoButton', { default: 'Upload New Photo' })}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {[
            { titleKey: 'progressPage.beforePhotoLabel', photoSrc: photoBefore, hint: "fitness before" },
            { titleKey: 'progressPage.afterPhotoLabel', photoSrc: photoAfter, hint: "fitness after" }
          ].map(item => (
            <div key={item.titleKey}>
              <h3 className="mb-2 text-lg font-semibold text-center">{t(item.titleKey)}</h3>
              <div className="relative w-4/5 sm:w-3/4 mx-auto overflow-hidden border-2 border-dashed rounded-lg aspect-square border-border group">
                {item.photoSrc ? (
                  <Image src={item.photoSrc} alt={t(item.titleKey)} layout="fill" objectFit="cover" data-ai-hint={item.hint} />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">{t('progressPage.noPhotoAvailable', { default: 'No photo available' })}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg rounded-xl border border-primary/50 bg-primary/10">
        <CardHeader>
          {/* Titolo rimosso come richiesto */}
        </CardHeader>
        <CardContent>
          <AiSplitForm />
        </CardContent>
      </Card>


      <AddMeasurementDialog
        isOpen={isMeasurementDialogOpen}
        onOpenChange={setIsMeasurementDialogOpen}
        onSave={handleSaveMeasurement}
        measurement={currentMeasurement}
        t={t}
      />
    </>
  ); // End of ProgressPage component return

  // Moved useEffects for DB interaction (see important note below)
  useEffect(() => {
    if (!isClient) return; // Ensure prisma calls are attempted only client-side (still problematic)
    const fetchBodyMeasurements = async () => {
        // IMPORTANT: Direct Prisma calls in 'use client' components are generally not recommended.
        // This will likely fail as Prisma is meant for server-side execution.
        // Consider moving this logic to a Server Action or an API route.
        // const bodyMeasurementsFromDB = await prisma.bodyMeasurement.findMany();
        // setBodyMeasurements(bodyMeasurementsFromDB);
        console.warn("Attempting to fetch body measurements with Prisma on client-side. This should be refactored.");
    };
    fetchBodyMeasurements();
  }, [isClient]);

  useEffect(() => {
    if (!isClient || bodyMeasurements.length === 0) return; // Avoid running if no data or not client
    const saveBodyMeasurementsToDB = async () => {
        // IMPORTANT: Similar to fetching, saving directly with Prisma here is problematic.
        // Also, createMany will attempt to re-insert all items on every change.
        // await prisma.bodyMeasurement.createMany({ data: bodyMeasurements });
        console.warn("Attempting to save body measurements with Prisma on client-side. This should be refactored.");
    };
    // saveBodyMeasurementsToDB(); // Temporarily commented out to prevent errors after fixing hook call
  }, [bodyMeasurements, isClient]);

  useEffect(() => {
    if (!isClient) return;
    // Similar warnings apply for fetching and saving progress photos with Prisma on the client.
    console.warn("Attempting to fetch/save progress photos with Prisma on client-side. This should be refactored.");
  }, [isClient, progressPhotos]);

} // End of ProgressPage component function
