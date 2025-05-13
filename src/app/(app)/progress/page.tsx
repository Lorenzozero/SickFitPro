
'use client';

import { useState, type ChangeEvent, useEffect, FormEvent } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { LineChart as LucideLineChart, UploadCloud, BarChart as LucideBarChart, Users, PlusCircle, Edit2, Trash2, Bell } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Line, Legend as RechartsLegend, BarChart, LineChart } from "recharts";
import type { ChartConfig } from '@/components/ui/chart';
import { useLanguage } from '@/context/language-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AddMeasurementDialog } from '@/components/dialogs/add-measurement-dialog'; // New component

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

export interface MuscleMeasurement {
  id: string;
  date: string; // YYYY-MM-DD
  muscle: string;
  value: number;
  unit: 'cm' | 'in';
  notes?: string;
}

// Mock initial measurements
const initialMuscleMeasurements: MuscleMeasurement[] = [
    { id: 'm1', date: '2023-01-15', muscle: 'Biceps', value: 35, unit: 'cm', notes: 'Right arm, flexed' },
    { id: 'm2', date: '2023-01-15', muscle: 'Waist', value: 80, unit: 'cm' },
    { id: 'm3', date: '2023-03-15', muscle: 'Biceps', value: 36, unit: 'cm', notes: 'Right arm, flexed' },
];


export default function ProgressPage() {
  const { t, language, isClient: languageContextIsClient } = useLanguage();
  const { toast } = useToast();
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [muscleMeasurements, setMuscleMeasurements] = useState<MuscleMeasurement[]>(initialMuscleMeasurements);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<MuscleMeasurement> | null>(null);
  const [measurementReminderEnabled, setMeasurementReminderEnabled] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartConfig: ChartConfig = {
    desktop: {
      label: languageContextIsClient ? t('progressPage.benchPressLabel') : 'Bench Press (kg)',
      color: "hsl(var(--chart-1))",
      icon: LucideLineChart,
    },
    mobile: {
      label: languageContextIsClient ? t('progressPage.squatLabel') : 'Squat (kg)',
      color: "hsl(var(--chart-2))",
      icon: LucideBarChart,
    },
     weight: {
      label: languageContextIsClient ? t('progressPage.weightLabel') : 'Weight (kg)',
      color: 'hsl(var(--chart-3))'
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

    if (language === 'it') {
        const monthMap: { [key: string]: string } = {
            "January": "Gen", "February": "Feb", "March": "Mar", "April": "Apr",
            "May": "Mag", "June": "Giu", "July": "Lug", "August": "Ago",
            "September": "Set", "October": "Ott", "November": "Nov", "December": "Dic"
        };
        return monthMap[fullMonthName] || fullMonthName.slice(0,3);
    }
    return fullMonthName.slice(0, 3);
  };

  const handleSaveMeasurement = (measurement: MuscleMeasurement) => {
    if (currentMeasurement?.id) {
      setMuscleMeasurements(muscleMeasurements.map(m => m.id === measurement.id ? measurement : m));
    } else {
      setMuscleMeasurements([...muscleMeasurements, { ...measurement, id: String(Date.now()) }]);
    }
    toast({ title: t('progressPage.measurementSaved') });
    setIsMeasurementDialogOpen(false);
    setCurrentMeasurement(null);
  };

  const openMeasurementDialog = (measurement?: MuscleMeasurement) => {
    setCurrentMeasurement(measurement || {});
    setIsMeasurementDialogOpen(true);
  };

  const handleDeleteMeasurement = (id: string) => {
    setMuscleMeasurements(muscleMeasurements.filter(m => m.id !== id));
    toast({ title: t('progressPage.measurementDeleted'), variant: 'destructive' });
  };


  if (!isClient) {
    // Render skeleton or null for SSR to avoid hydration issues with client-side state
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
            <CardDescription>{t('progressPage.performanceMetricsCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPrimitiveLineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => getMonthAbbreviation(value)}
                  />
                  <YAxis />
                  <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                  <RechartsLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="desktop"
                    type="monotone"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={false}
                    name={chartConfig.desktop?.label?.toString()}
                  />
                  <Line
                    dataKey="mobile"
                    type="monotone"
                    stroke="var(--color-mobile)"
                    strokeWidth={2}
                    dot={false}
                    name={chartConfig.mobile?.label?.toString()}
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
                    <RechartsPrimitiveBarChart data={chartData.map(d => ({...d, weight: d.desktop / 2 + 50}))}> {/* Mocking weight data */}
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
                <CardTitle>{t('progressPage.muscleMeasurementsCardTitle')}</CardTitle>
                <CardDescription>{t('progressPage.muscleMeasurementsCardDescription')}</CardDescription>
            </div>
            <Button onClick={() => openMeasurementDialog()}>
                <PlusCircle className="w-4 h-4 mr-2" /> {t('progressPage.addMeasurementButton')}
            </Button>
        </CardHeader>
        <CardContent>
            {muscleMeasurements.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('progressPage.tableHeaderDate')}</TableHead>
                            <TableHead>{t('progressPage.tableHeaderMuscle')}</TableHead>
                            <TableHead>{t('progressPage.tableHeaderMeasurement')}</TableHead>
                            <TableHead>{t('exercisesPage.tableHeaderActions')}</TableHead> 
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {muscleMeasurements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(m => (
                            <TableRow key={m.id}>
                                <TableCell>{new Date(m.date + 'T00:00:00').toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                <TableCell>{m.muscle}</TableCell>
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
             <div className="flex items-center justify-between p-4 mt-6 border-t">
                <Label htmlFor="measurement-reminders" className="flex items-center font-normal">
                    <Bell className="w-4 h-4 mr-2" />
                    {t('progressPage.enableMeasurementReminders')}
                </Label>
                <Switch id="measurement-reminders" checked={measurementReminderEnabled} onCheckedChange={setMeasurementReminderEnabled} />
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

const RechartsPrimitiveLineChart = LineChart;
const RechartsPrimitiveBarChart = BarChart;
