
'use client';

import { useState, type ChangeEvent, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, UploadCloud, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { getHealthAdvice, type HealthContextInput, type HealthAdviceOutput } from '@/ai/flows/analyze-meal-flow';
import { HealthContextInputSchema } from '@/ai/schemas/health-advisor-schemas'; 
import { Skeleton } from '@/components/ui/skeleton';
import type { BodyMeasurement } from '@/app/(app)/progress/page'; 
import { mockGetUserTrainingData, formatTrainingDataToString } from '@/components/forms/ai-split-form'; 
import { z } from 'zod';


// Zod schema for form validation (only for fields user directly interacts with)
// Only mealPhotoDataUri is left as a direct user input for the form.
const formValidationSchema = HealthContextInputSchema.pick({ 
  mealPhotoDataUri: true,    
});

// Type for the fields managed by react-hook-form
type UserEditableFormValues = z.infer<typeof formValidationSchema>;

export default function AiHealthAdvisorForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<HealthAdviceOutput | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<UserEditableFormValues>({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      mealPhotoDataUri: undefined,
    },
  });
  
  useEffect(() => {
    // Trigger validation if language changes and form has errors
    // This can be useful if error messages are translated
    form.trigger(); 
  }, [t, form]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            title: t('nutritionalAnalysis.errorTitle'),
            description: t('settingsPage.photoSizeError'),
            variant: "destructive"
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        form.setValue('mealPhotoDataUri', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    form.setValue('mealPhotoDataUri', undefined);
    const photoInput = document.getElementById('mealPhotoForAdvisor') as HTMLInputElement | null;
    if (photoInput) {
        photoInput.value = '';
    }
  };

  const onSubmit: SubmitHandler<UserEditableFormValues> = async (formData) => {
    setIsLoading(true);
    setAdviceResult(null);

    let userMacroGoalsSummary: string | undefined = undefined;
    let userWaterGoalMl: number | undefined = undefined;
    let userBodyMeasurementsSummary: string | undefined = undefined;
    let userTrainingSummary: string | undefined = undefined;

    if (typeof window !== 'undefined') {
        const storedMacroGoals = localStorage.getItem('sickfit-pro-weeklyMacroGoals');
        if (storedMacroGoals) {
            try {
                const parsedGoals = JSON.parse(storedMacroGoals);
                userMacroGoalsSummary = Object.entries(parsedGoals)
                    .map(([day, goals]: [string, any]) => 
                        `${t(`calendarPage.days.${day}`)}: P ${goals.protein}g, C ${goals.carbs}g, F ${goals.fat}g`
                    ).join('; ');
            } catch (e) { console.error("Error parsing macro goals for AI advisor", e); }
        }

        const storedWaterGoal = localStorage.getItem('sickfit-pro-userWaterGoal');
        if (storedWaterGoal) {
            userWaterGoalMl = parseInt(storedWaterGoal, 10);
            if (isNaN(userWaterGoalMl)) userWaterGoalMl = undefined;
        }

        const storedBodyMeasurements = localStorage.getItem('sickfit-pro-userBodyMeasurements');
        if (storedBodyMeasurements) {
            try {
                const measurements: BodyMeasurement[] = JSON.parse(storedBodyMeasurements);
                userBodyMeasurementsSummary = measurements
                    .slice(-5) 
                    .map(m => `${m.date} - ${m.measurementName}: ${m.value} ${m.unit}`)
                    .join('; ');
            } catch (e) { console.error("Error parsing body measurements for AI advisor", e); }
        }
        
        try {
            const rawTrainingData = await mockGetUserTrainingData();
            userTrainingSummary = formatTrainingDataToString(rawTrainingData);
        } catch (e) { console.error("Error fetching training data for AI advisor", e); }
    }

    const inputData: HealthContextInput = {
      // mealDescription is removed as it's no longer part of the form or UserEditableFormValues
      mealPhotoDataUri: formData.mealPhotoDataUri,
      userMacroGoalsSummary,
      userWaterGoalMl,
      userBodyMeasurementsSummary,
      userTrainingSummary,
    };
    
    try {
      const response = await getHealthAdvice(inputData);
      setAdviceResult(response);
      toast({
        title: t('aiHealthAdvisor.adviceReadyTitle'),
        description: t('aiHealthAdvisor.adviceReadyDescription'),
      });
    } catch (error) {
      console.error("Error fetching AI health advice:", error);
      toast({
        title: t('aiHealthAdvisor.errorTitle'),
        description: t('aiHealthAdvisor.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="w-6 h-6 mr-2 text-primary" />
          {t('aiHealthAdvisor.cardTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-3 mb-6 text-sm border rounded-md bg-accent/10 text-accent-foreground">
            <div className="flex items-start">
                <Info className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>{t('aiHealthAdvisor.dataUsageInfo')}</p>
            </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Meal Description Field Removed */}

            <FormItem>
              <FormLabel>{t('aiHealthAdvisor.mealPhotoLabel')}</FormLabel>
              <FormControl>
                <Input 
                    id="mealPhotoForAdvisor" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              {photoPreview && (
                <div className="mt-4 relative w-full max-w-xs aspect-video border rounded-md overflow-hidden group">
                  <Image src={photoPreview} alt={t('nutritionalAnalysis.photoPreviewAlt')} layout="fill" objectFit="cover" data-ai-hint="food meal context" />
                   <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        onClick={removePhoto}
                        className="absolute top-1 right-1 h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity"
                        aria-label={t('nutritionalAnalysis.removePhoto')}
                    >
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>
              )}
               {!photoPreview && (
                <div className="mt-2 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg border-border bg-muted/50">
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">{t('nutritionalAnalysis.noPhotoSelected')}</p>
                </div>
              )}
              <FormDescription>{t('aiHealthAdvisor.mealContextInfoPhoto')}</FormDescription>
              <FormMessage /> {/* This will show validation errors for mealPhotoDataUri if any */}
            </FormItem>
            
            <div className="flex justify-center">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                )}
                {t('aiHealthAdvisor.getAdviceButton')}
                </Button>
            </div>
          </form>
        </Form>

        {isLoading && (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {adviceResult && !isLoading && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-center text-primary">{t('aiHealthAdvisor.resultsTitle')}</h3>
            
            <Card className="bg-secondary/30">
                <CardHeader><CardTitle className="text-lg">{t('aiHealthAdvisor.overallAssessment')}</CardTitle></CardHeader>
                <CardContent>
                    <p className="whitespace-pre-line text-sm">{adviceResult.overallAssessment}</p>
                </CardContent>
            </Card>

            <Card className="bg-secondary/30">
                <CardHeader><CardTitle className="text-lg">{t('aiHealthAdvisor.specificAdvice')}</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {adviceResult.specificAdvicePoints.map((advice, index) => (
                            <li key={index}>{advice}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            
            {adviceResult.mealSpecificFeedback && (
                 <Card className="bg-secondary/30">
                    <CardHeader><CardTitle className="text-lg">{t('aiHealthAdvisor.mealFeedback')}</CardTitle></CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-line text-sm">{adviceResult.mealSpecificFeedback}</p>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
