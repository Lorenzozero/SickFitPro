
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { suggestTrainingSplit, type SuggestTrainingSplitInput, type SuggestTrainingSplitOutput } from '@/ai/flows/suggest-training-split';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input'; // Added import

// Mock functions for fetching and formatting user training data
// In a real application, these would interact with your backend or state management
const mockGetUserTrainingData = async (): Promise<Array<{ date: string; exercise: string; sets: Array<{ reps: number; weight: number }> }>> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return some mock data. This should be replaced with actual data fetching.
  return [
    { date: '2024-07-01', exercise: 'Squat', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }, { reps: 5, weight: 102.5 }] },
    { date: '2024-07-01', exercise: 'Bench Press', sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 7, weight: 70 }] },
    { date: '2024-07-03', exercise: 'Deadlift', sets: [{ reps: 3, weight: 120 }, { reps: 3, weight: 120 }] },
    { date: '2024-07-05', exercise: 'Overhead Press', sets: [{ reps: 6, weight: 50 }, { reps: 6, weight: 50 }, { reps: 5, weight: 50 }] },
    { date: '2024-07-05', exercise: 'Pull-ups', sets: [{ reps: 8, weight: 0 }, { reps: 7, weight: 0 }, { reps: 6, weight: 0 }] },
  ];
  // To simulate no data: return [];
};

const formatTrainingDataToString = (data: Array<{ date: string; exercise: string; sets: Array<{ reps: number; weight: number }> }>): string => {
  if (!data || data.length === 0) return "Nessuno storico allenamenti disponibile.";
  return data.map(log =>
    `Data: ${log.date}, Esercizio: ${log.exercise}, Serie: ${log.sets.map(s => `${s.reps} ripetizioni con ${s.weight}kg`).join('; ')}`
  ).join('\n');
};


export function AiSplitForm() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [result, setResult] = useState<SuggestTrainingSplitOutput | null>(null);
  const { toast } = useToast();

  // Schema updated: trainingHistory is still technically required by the flow,
  // but its value will be set programmatically. User only fills trainingGoals.
  const formSchema = z.object({
    trainingHistory: z.string().default(""), // Will be populated programmatically
    trainingGoals: z.string().min(10, { message: t('aiSplitForm.trainingGoalsMinError') }),
  });
  
  const form = useForm<SuggestTrainingSplitInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingHistory: '', // Will be set by useEffect
      trainingGoals: '',
    },
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setIsFetchingHistory(true);
      try {
        const rawData = await mockGetUserTrainingData();
        const formattedHistory = formatTrainingDataToString(rawData);
        form.setValue('trainingHistory', formattedHistory, { shouldValidate: true });
      } catch (error) {
        console.error("Error fetching user training data:", error);
        form.setValue('trainingHistory', "Errore nel recupero dello storico allenamenti.");
        toast({
          title: t('aiSplitForm.toastErrorTitle'),
          description: t('aiSplitForm.errorFetchingHistory'),
          variant: "destructive",
        });
      } finally {
        setIsFetchingHistory(false);
      }
    };
    fetchHistory();
  }, [form, toast, t]);
  
  // Update resolver if language changes to re-validate with correct messages
  useEffect(() => {
    form.trigger();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, form.trigger]);


  const onSubmit: SubmitHandler<SuggestTrainingSplitInput> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      // Ensure trainingHistory is populated if it was somehow cleared
      if (!data.trainingHistory) {
        const rawData = await mockGetUserTrainingData(); // Re-fetch if empty, or handle error
        data.trainingHistory = formatTrainingDataToString(rawData);
      }
      const response = await suggestTrainingSplit(data);
      setResult(response);
      toast({
        title: t('aiSplitForm.toastSuggestionReadyTitle'),
        description: t('aiSplitForm.toastSuggestionReadyDescription'),
      });
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      toast({
        title: t('aiSplitForm.toastErrorTitle'),
        description: t('aiSplitForm.toastErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-primary" />
            {t('aiSplitForm.cardTitle')}
          </CardTitle>
          <CardDescription>
            {t('aiSplitForm.cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Training History is no longer a user input field */}
                {/* It's good to show the user what data is being used, if desired,
                    or simply inform them it's being auto-collected.
                    For now, we'll just use a description for trainingGoals.
                */}
                 <FormField
                  control={form.control}
                  name="trainingHistory"
                  render={({ field }) => (
                    <FormItem className="hidden"> {/* Hidden field, but value is set */}
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {t('aiSplitForm.trainingHistoryAutoCollectedInfo')}
                </p>

                <FormField
                  control={form.control}
                  name="trainingGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('aiSplitForm.trainingGoalsLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('aiSplitForm.trainingGoalsPlaceholder')}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('aiSplitForm.trainingGoalsDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || isFetchingHistory} className="w-full md:w-auto">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {t('aiSplitForm.getAISuggestionButton')}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {(isLoading && !isFetchingHistory) && ( // Show generating split only if not fetching history
        <Card className="shadow-md animate-pulse">
          <CardHeader>
            <CardTitle>{t('aiSplitForm.generatingSplitTitle')}</CardTitle>
            <CardDescription>{t('aiSplitForm.generatingSplitDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-8 rounded bg-muted"></div>
            <div className="w-3/4 h-4 rounded bg-muted"></div>
            <div className="w-full h-20 rounded bg-muted"></div>
          </CardContent>
        </Card>
      )}

      {result && !isLoading && !isFetchingHistory && (
        <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">{t('aiSplitForm.yourSuggestedAdviceTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.suggestedKeyPointsLabel')}</h3>
              <p className="p-3 rounded-md bg-background whitespace-pre-line">{result.suggestedSplit}</p>
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.detailedAnalysisLabel')}</h3>
              <p className="p-3 rounded-md bg-background whitespace-pre-line">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

