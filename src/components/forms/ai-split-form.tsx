
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestTrainingSplit, type SuggestTrainingSplitInput, type SuggestTrainingSplitOutput } from '@/ai/flows/suggest-training-split';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';

// Mock functions for fetching and formatting user training data
// In a real application, these would interact with your backend or state management
export const mockGetUserTrainingData = async (): Promise<Array<{ date: string; exercise: string; sets: Array<{ reps: number; weight: number }> }>> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
  // Return some mock data. This should be replaced with actual data fetching.
  return [
    { date: '2024-07-01', exercise: 'Squat', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }, { reps: 5, weight: 102.5 }] },
    { date: '2024-07-01', exercise: 'Bench Press', sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 7, weight: 70 }] },
    { date: '2024-07-03', exercise: 'Deadlift', sets: [{ reps: 3, weight: 120 }, { reps: 3, weight: 120 }] },
    { date: '2024-07-05', exercise: 'Overhead Press', sets: [{ reps: 6, weight: 50 }, { reps: 6, weight: 50 }, { reps: 5, weight: 50 }] },
    { date: '2024-07-05', exercise: 'Pull-ups', sets: [{ reps: 8, weight: 0 }, { reps: 7, weight: 0 }, { reps: 6, weight: 0 }] },
  ];
};

export const formatTrainingDataToString = (data: Array<{ date: string; exercise: string; sets: Array<{ reps: number; weight: number }> }>): string => {
  if (!data || data.length === 0) return "Nessuno storico allenamenti disponibile.";
  return data.map(log =>
    `Data: ${log.date}, Esercizio: ${log.exercise}, Serie: ${log.sets.map(s => `${s.reps} ripetizioni con ${s.weight}kg`).join('; ')}`
  ).join('\n');
};


export function AiSplitForm() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestTrainingSplitOutput | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateAdvice = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const rawTrainingData = await mockGetUserTrainingData();
      const formattedHistory = formatTrainingDataToString(rawTrainingData);
      
      const input: SuggestTrainingSplitInput = {
        trainingHistory: formattedHistory || t('aiSplitForm.noHistoryForAdvice', { default: "Nessuno storico allenamenti disponibile per generare consigli." }),
        trainingGoals: t('aiSplitForm.genericGoalForAdvice', { default: "Miglioramento generale basato sullo storico allenamenti e sui dati di progresso." }),
      };

      const response = await suggestTrainingSplit(input);
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
  
  if (!isClient) {
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                    <Wand2 className="w-6 h-6 mr-2 text-primary" />
                    <Skeleton className="h-6 w-48" /> 
                </CardTitle>
                <Skeleton className="h-10 w-36" /> 
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-primary" />
            {t('aiSplitForm.cardTitle')}
          </CardTitle>
          <Button onClick={handleGenerateAdvice} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {t('aiSplitForm.generateAdviceButton')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4 text-center py-10">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground">{t('aiSplitForm.generatingSplitDescription')}</p>
            </div>
          )}

          {!isLoading && !result && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('aiSplitForm.promptGenerateAdvice')}</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.suggestedKeyPointsLabel')}</h3>
                <p className="p-3 rounded-md bg-secondary/50 whitespace-pre-line text-sm">{result.suggestedSplit}</p>
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.detailedAnalysisLabel')}</h3>
                <p className="p-3 rounded-md bg-secondary/50 whitespace-pre-line text-sm">{result.reasoning}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
