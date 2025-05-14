
'use client';

import { useState, type ChangeEvent, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { getHealthAdvice, type HealthContextInput, type HealthAdviceOutput } from '@/ai/flows/analyze-meal-flow';
import { HealthContextInputSchema } from '@/ai/schemas/health-advisor-schemas';
import { Skeleton } from '@/components/ui/skeleton';
import type { BodyMeasurement } from '@/app/(app)/progress/page';
import { mockGetUserTrainingData, formatTrainingDataToString } from '@/components/forms/ai-split-form';
import { z } from 'zod';


// Type for the fields managed by react-hook-form. User only edits userQuery.
interface UserEditableFormValues {
  userQuery?: string;
}

export default function AiHealthAdvisorForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<HealthAdviceOutput | null>(null);

  const formValidationSchema = useMemo(() => {
    return z.object({
      userQuery: z.string()
        .optional()
        .refine(val => {
          if (val && val.length > 0) {
            return val.length >= 10;
          }
          return true; 
        }, { message: t('aiHealthAdvisor.userQueryMinError') }),
    });
  }, [t]);
  
  const form = useForm<UserEditableFormValues>({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      userQuery: '',
    },
  });
  
  useEffect(() => {
    if (form.formState.errors.userQuery) {
        form.trigger('userQuery'); 
    }
  }, [t, form, formValidationSchema]);


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
      userQuery: formData.userQuery || undefined, 
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
            <FormField
              control={form.control}
              name="userQuery"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={t('aiHealthAdvisor.userQueryPlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
