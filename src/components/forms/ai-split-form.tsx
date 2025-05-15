
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestTrainingSplit, type SuggestTrainingSplitInput, type SuggestTrainingSplitOutput } from '@/ai/flows/suggest-training-split';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'; // Import React

// Mock functions for fetching and formatting user training data
export const mockGetUserTrainingData = async (): Promise<Array<{ date: string; exercise: string; sets: Array<{ reps: number; weight: number }> }>> => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
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

const formatAiResponse = (text: string): React.ReactNode[] => {
  if (!text) return [];

  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  
  let currentListItems: React.ReactNode[] = [];

  function flushList() {
    if (currentListItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="my-2 ml-4 space-y-1 list-disc">{currentListItems}</ul>);
      currentListItems = [];
    }
  }

  function processInlineFormatting(lineContent: string): React.ReactNode {
    const parts = lineContent.split(/(\*\*.*?\*\*)/g); // Splitta per **testo**, mantenendo i delimitatori
    return parts.filter(Boolean).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`strong-part-${index}`}>{part.substring(2, part.length - 2)}</strong>;
      }
      return part; 
    });
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      const listItemText = trimmedLine.substring(trimmedLine.startsWith('* ') ? 2 : (trimmedLine.startsWith('- ') ? 2 : 0));
      currentListItems.push(<li key={`li-${elements.length}-${currentListItems.length}`}>{processInlineFormatting(listItemText)}</li>);
    } else {
      flushList(); 
      if (trimmedLine) { 
        elements.push(<p key={`p-${elements.length}`} className="my-2">{processInlineFormatting(trimmedLine)}</p>);
      } else if (elements.length > 0) {
        // Potremmo aggiungere un <br /> o uno spazio maggiore se una riga vuota tra paragrafi è desiderata
        // Per ora, i margini di <p> dovrebbero bastare
      }
    }
  });

  flushList(); 

  return elements;
};


export function AiSplitForm() {
  const { t, isClient: languageContextIsClient } = useLanguage(); // Use languageContextIsClient
  const [isLoading, setIsLoading] = useState(true); // Start loading immediately
  const [result, setResult] = useState<SuggestTrainingSplitOutput | null>(null);
  const { toast } = useToast();

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
      if (languageContextIsClient) { // Ensure toast is called only on client
        toast({
          title: t('aiSplitForm.toastSuggestionReadyTitle'),
          description: t('aiSplitForm.toastSuggestionReadyDescription'),
        });
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      if (languageContextIsClient) {
        toast({
          title: t('aiSplitForm.toastErrorTitle'),
          description: t('aiSplitForm.toastErrorDescription'),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (languageContextIsClient) { // Ensure this runs only when context is ready on client
      handleGenerateAdvice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageContextIsClient]); // Depend on languageContextIsClient


  if (!languageContextIsClient) { 
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
                 <Skeleton className="mt-4 h-20 w-full" />
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
                <div className="p-3 rounded-md bg-secondary/50 text-sm">
                  {formatAiResponse(result.suggestedSplit)}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.detailedAnalysisLabel')}</h3>
                 <div className="p-3 rounded-md bg-secondary/50 text-sm">
                  {formatAiResponse(result.reasoning)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

