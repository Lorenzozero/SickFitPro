
'use client';

import { useState, type ChangeEvent, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { LineChart as LucideLineChart, UploadCloud, BarChart as LucideBarChart, Users, PlusCircle, Edit2, Trash2, Bell, Wand2 } from 'lucide-react';
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


const BODY_MEASUREMENTS_STORAGE_KEY = 'sickfit-pro-userBodyMeasurements';

// Mock data for weekly training volume
const weeklyVolumeChartData = [
  { week: "W1", volume: 12000 },
  { week: "W2", volume: 12500 },
  { week: "W3", volume: 13000 },
  { week: "W4", volume: 12800 },
  { week: "W5", volume: 13500 },
  { week: "W6", volume: 14000 },
  { week: "W7", volume: 13800 },
  { week: "W8", volume: 14200 },
];

// Mock data for body composition chart (e.g., weight over months)
const bodyCompositionChartData = [
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
  measurementName: string; // e.g., "Biceps", "Weight", "Height"
  value: number;
  unit: 'cm' | 'in' | 'kg' | 'lbs';
  notes?: string;
}

// Mock initial measurements - will be overridden by localStorage if present
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


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        const storedMeasurements = localStorage.getItem(BODY_MEASUREMENTS_STORAGE_KEY);
        if (storedMeasurements) {
            try {
                setBodyMeasurements(JSON.parse(storedMeasurements));
            } catch (e) {
                console.error("Error parsing body measurements from localStorage", e);
                setBodyMeasurements(initialBodyMeasurements); // Fallback
            }
        }
    }
  }, []);

  const persistMeasurements = (updatedMeasurements: BodyMeasurement[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BODY_MEASUREMENTS_STORAGE_KEY, JSON.stringify(updatedMeasurements));
    }
  };


  const chartConfig: ChartConfig = {
    weeklyVolume: {
      label: languageContextIsClient ? t('progressPage.weeklyTrainingVolumeLabel') : 'Weekly Training Volume (kg)',
      color: "hsl(var(--chart-1))",
      icon: LucideLineChart,
    },
    weight: {
      label: languageContextIsClient ? t('progressPage.weightLabel') : 'Weight (kg)',
      color: 'hsl(var(--chart-3))',
      icon: LucideBarChart,
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

    if (currentLanguage === 'it') {
        const monthMap: { [key: string]: string } = {
            "January": "Gen", "February": "Feb", "March": "Mar", "April": "Apr",
            "May": "Mag", "June": "Giu", "July": "Lug", "August": "Ago",
            "September": "Set", "October": "Ott", "November": "Nov", "December": "Dic"
        };
        return monthMap[fullMonthName] || fullMonthName.slice(0,3);
    }
    return fullMonthName.slice(0, 3);
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


  if (!isClient) {
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
            <Skeleton className="h-[500px] w-full" /> {/* For AI Form */}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('progressPage.title')}
        description={t('progressPage.description')}
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
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPrimitiveLineChart data={weeklyVolumeChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value} 
                  />
                  <YAxis />
                  <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                  <RechartsLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="volume"
                    type="monotone"
                    stroke="var(--color-weeklyVolume)"
                    strokeWidth={2}
                    dot={false}
                    name={chartConfig.weeklyVolume?.label?.toString()}
                  />
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
            <CardDescription>{t('progressPage.bodyCompositionCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPrimitiveBarChart data={bodyCompositionChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => getMonthAbbreviation(value)} />
                        <YAxis dataKey="weight" />
                        <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <RechartsLegend content={<ChartLegendContent />} />
                        <Bar dataKey="weight" fill="var(--color-weight)" radius={4} name={chartConfig.weight?.label?.toString()} />
                    </RechartsPrimitiveBarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t('progressPage.bodyMeasurementsCardTitle')}</CardTitle>
                <CardDescription>{t('progressPage.bodyMeasurementsCardDescription')}</CardDescription>
            </div>
            <Button onClick={() => openMeasurementDialog()}>
                <PlusCircle className="w-4 h-4 mr-2" /> {t('progressPage.addMeasurementButton')}
            </Button>
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
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 mt-6 border-t gap-4">
                <Label htmlFor="measurement-reminders" className="flex items-center font-normal whitespace-nowrap">
                    <Bell className="w-4 h-4 mr-2" />
                    {t('progressPage.measurementReminderLabel')}
                </Label>
                <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as ReminderFrequency)}>
                    <SelectTrigger id="measurement-reminders" className="w-full sm:w-auto min-w-[180px]">
                        <SelectValue placeholder={t('progressPage.selectReminderFrequencyPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="off">{t('progressPage.reminderOff')}</SelectItem>
                        <SelectItem value="daily">{t('progressPage.reminderDaily')}</SelectItem>
                        <SelectItem value="weekly">{t('progressPage.reminderWeekly')}</SelectItem>
                        <SelectItem value="bi-weekly">{t('progressPage.reminderBiWeekly')}</SelectItem>
                        <SelectItem value="monthly">{t('progressPage.reminderMonthly')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>{t('progressPage.photoComparisonCardTitle')}</CardTitle>
          <CardDescription>{t('progressPage.photoComparisonCardDescription')}</CardDescription>
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
      
      {/* AI Fitness Advisor Form */}
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

