
'use client';

import { useState, type ChangeEvent, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { LineChart as LucideLineChart, UploadCloud, BarChart as LucideBarChart, Users, PlusCircle, Edit2, Trash2, Bell, Wand2, BarChart } from 'lucide-react'; // Added BarChart
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Line, Legend as RechartsLegend, BarChart as RechartsPrimitiveBarChart, LineChart as RechartsPrimitiveLineChart } from "recharts";
import type { ChartConfig } from '@/components/ui/chart';
import { useLanguage } from '@/context/language-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AddMeasurementDialog } from '@/components/dialogs/add-measurement-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AiSplitForm } from '@/components/forms/ai-split-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, getISOWeek, getMonth, getYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, subWeeks, subMonths, subYears, isWithinInterval } from 'date-fns';
import { it as dateFnsIt, es as dateFnsEs, fr as dateFnsFr, enUS as dateFnsEnUs } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const BODY_MEASUREMENTS_STORAGE_KEY = 'sickfit-pro-userBodyMeasurements';

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
  // Data for previous months
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
  'Deadlift': 'back', // Can also be legs, but primarily back for this example
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
  date: string; // YYYY-MM-DD
  measurementName: string;
  value: number;
  unit: 'cm' | 'in' | 'kg' | 'lbs';
  notes?: string;
}

const initialBodyMeasurements: BodyMeasurement[] = [
    { id: 'm1', date: '2023-01-15', measurementName: 'Biceps', value: 35, unit: 'cm', notes: 'Right arm, flexed' },
    { id: 'm2', date: '2023-01-15', measurementName: 'Waist', value: 80, unit: 'cm' },
    { id: 'm3', date: '2023-01-15', measurementName: 'Weight', value: 70, unit: 'kg' },
];

type ReminderFrequency = 'off' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly';


export default function ProgressPage() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { toast } = useToast();
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>(initialBodyMeasurements);
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
    }
  }, []);

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
        startDateLimit = subWeeks(now, 7); // Last 8 weeks
        periodFormatFn = (date) => `${getYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;
        displayFormatFn = (periodStr) => {
            const [_year, weekNum] = periodStr.split('-W');
            return t('progressPage.weekShortLabel', { default: `W${weekNum}`, num: weekNum });
        };
      } else if (selectedTimeRange === 'monthly') {
        startDateLimit = subMonths(now, 11); // Last 12 months
        periodFormatFn = (date) => `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, '0')}`;
        displayFormatFn = (periodStr) => {
            const [year, monthNum] = periodStr.split('-');
            return format(new Date(parseInt(year), parseInt(monthNum) - 1, 1), 'MMM yy', { locale });
        };
      } else { // yearly (show monthly data for the past year)
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
          period: displayFormatFn(periodStr), // Use for display
          originalPeriod: periodStr, // Keep for potential further sorting if needed
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
      icon: LucideBarChart,
    }
  };


  const persistMeasurements = (updatedMeasurements: BodyMeasurement[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BODY_MEASUREMENTS_STORAGE_KEY, JSON.stringify(updatedMeasurements));
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, setImage: (url: string | null) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getMonthAbbreviation = (fullMonthName: string) => {
    if (!languageContextIsClient) return fullMonthName.slice(0, 3);
    const currentLanguage = languageContextIsClient ? language : 'en';
    const date = new Date(`2000 ${fullMonthName} 1`); // Create a date to format
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
    toast({ title: t('progressPage.measurementSaved') });
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
            description={t('progressPage.description')}
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
        <Card className="shadow-lg">
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
            <ChartContainer config={performanceChartConfig} className="h-[280px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPrimitiveLineChart data={performanceChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis label={{ value: t('progressPage.weeklyTrainingVolumeLabel'), angle: -90, position: 'insideLeft', offset: -5, style:{fontSize: '0.8rem'} }} />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <RechartsLegend content={<ChartLegendContent />} />
                  {MUSCLE_GROUPS_TO_TRACK.map(mgKey => (
                    <Line
                      key={mgKey}
                      dataKey={mgKey}
                      type="monotone"
                      stroke={`var(--color-${mgKey})`}
                      strokeWidth={2}
                      dot={true}
                      name={performanceChartConfig[mgKey]?.label?.toString()}
                      connectNulls={true}
                    />
                  ))}
                </RechartsPrimitiveLineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                {t('progressPage.bodyCompositionCardTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={bodyCompositionChartConfig} className="h-[280px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPrimitiveBarChart data={initialBodyCompositionChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => getMonthAbbreviation(value)} />
                        <YAxis dataKey="weight" domain={[40, 'auto']} />
                        <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <RechartsLegend content={<ChartLegendContent />} />
                        <Bar dataKey="weight" fill="var(--color-weight)" radius={4} name={bodyCompositionChartConfig.weight?.label?.toString()} />
                    </RechartsPrimitiveBarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-primary" />
                <CardTitle>{t('progressPage.bodyMeasurementsCardTitle')}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as ReminderFrequency)}>
                                <SelectTrigger asChild aria-label={t('progressPage.measurementReminderSettingsAriaLabel', {default: "Measurement Reminder Settings"})}>
                                    <Button variant="ghost" size="icon">
                                        <Bell className="w-4 h-4" />
                                    </Button>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="off">{t('progressPage.reminderOff')}</SelectItem>
                                    <SelectItem value="daily">{t('progressPage.reminderDaily')}</SelectItem>
                                    <SelectItem value="weekly">{t('progressPage.reminderWeekly')}</SelectItem>
                                    <SelectItem value="bi-weekly">{t('progressPage.reminderBiWeekly')}</SelectItem>
                                    <SelectItem value="monthly">{t('progressPage.reminderMonthly')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('progressPage.measurementReminderTooltip', {default: "Set measurement reminder"})}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button onClick={() => openMeasurementDialog()}>
                    <PlusCircle className="w-4 h-4 mr-2" /> {t('progressPage.addMeasurementButton')}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {bodyMeasurements.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('progressPage.tableHeaderDate')}</TableHead>
                            <TableHead>{t('progressPage.tableHeaderMeasurementName')}</TableHead>
                            <TableHead>{t('progressPage.tableHeaderValue')}</TableHead>
                            <TableHead className="text-right">{t('exercisesPage.tableHeaderActions')}</TableHead> 
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bodyMeasurements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                            <TableRow key={m.id}>
                                <TableCell>{new Date(m.date + 'T00:00:00').toLocaleDateString(languageContextIsClient ? language : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                <TableCell>{t(`progressPage.measurementName${m.measurementName.charAt(0).toUpperCase() + m.measurementName.slice(1)}`, { default: m.measurementName })}</TableCell>
                                <TableCell>{m.value} {m.unit}{m.notes ? ` (${m.notes})` : ''}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openMeasurementDialog(m)}>
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
            ) : (
                <p className="text-sm text-center text-muted-foreground py-4">{t('progressPage.noMeasurementsYet')}</p>
            )}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>{t('progressPage.photoComparisonCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {[
            { titleKey: 'progressPage.beforePhotoLabel', photo: photoBefore, setPhoto: setPhotoBefore, hint: "fitness before" },
            { titleKey: 'progressPage.afterPhotoLabel', photo: photoAfter, setPhoto: setPhotoAfter, hint: "fitness after" }
          ].map(item => (
            <div key={item.titleKey}>
              <h3 className="mb-2 text-lg font-semibold">{t(item.titleKey)}</h3>
              <div className="relative w-full overflow-hidden border-2 border-dashed rounded-lg aspect-square border-border group">
                {item.photo ? (
                  <Image src={item.photo} alt={t(item.titleKey)} layout="fill" objectFit="cover" data-ai-hint={item.hint} />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">{t('progressPage.noPhotoUploaded')}</p>
                  </div>
                )}
                <label
                  htmlFor={`upload-${item.titleKey.toLowerCase().replace(/\s+/g, '-')}`}
                  className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white transition-opacity duration-300 bg-black/50 opacity-0 cursor-pointer group-hover:opacity-100"
                >
                  {t('progressPage.clickToUpload')}
                  <Input
                    id={`upload-${item.titleKey.toLowerCase().replace(/\s+/g, '-')}`}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, item.setPhoto)}
                  />
                </label>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                const el = document.getElementById(`upload-${item.titleKey.toLowerCase().replace(/\s+/g, '-')}`);
                el?.click();
                }}>
                {t('progressPage.uploadButtonLabel')} {t(item.titleKey)}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="mt-8">
         <AiSplitForm />
      </div>


      <AddMeasurementDialog
        isOpen={isMeasurementDialogOpen}
        onOpenChange={setIsMeasurementDialogOpen}
        onSave={handleSaveMeasurement}
        measurement={currentMeasurement}
        t={t}
      />
    </>
  );
}

