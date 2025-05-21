
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestTrainingSplit, type SuggestTrainingSplitInput, type SuggestTrainingSplitOutput } from '@/ai/flows/suggest-training-split';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'; 

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
  let inTable = false;
  let tableHeaders: React.ReactNode[] = [];
  let tableRows: React.ReactNode[][] = [];

  function flushList() {
    if (currentListItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="my-2 ml-6 space-y-1 list-disc">{currentListItems}</ul>);
      currentListItems = [];
    }
  }

  function flushTable() {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`table-wrapper-${elements.length}`} className="my-4 overflow-x-auto rounded-md border border-border">
          <table className="min-w-full border-collapse">
            {tableHeaders.length > 0 && <thead className="bg-muted/50"><tr>{tableHeaders}</tr></thead>}
            {tableRows.length > 0 && <tbody>{tableRows.map((row, i) => <tr key={`tr-${i}`} className="border-b border-border last:border-b-0 hover:bg-muted/20">{row}</tr>)}</tbody>}
          </table>
        </div>
      );
    }
    inTable = false;
    tableHeaders = [];
    tableRows = [];
  }
  
  function processInlineFormatting(lineContent: string): React.ReactNode {
    const parts = lineContent.split(/(\*\*.*?\*\*)/g); 
    return parts.filter(Boolean).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`strong-part-${index}-${Math.random()}`}>{part.substring(2, part.length - 2)}</strong>;
      }
      return part; 
    });
  }

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (!inTable) {
        flushList();
        inTable = true;
      }
      const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim());
      
      if (cells.every(cell => cell.match(/^--+$/))) {
        // Riga di separazione Markdown, non la renderizziamo direttamente ma la usiamo come flag
        if (tableHeaders.length === 0 && tableRows.length > 0) { // Potrebbe essere una tabella senza header esplicito ma con dati
            // Tentativo di usare la prima riga di dati come header se non c'è stata una riga di separazione dopo un header
            tableHeaders = tableRows[0].map((cellContent, i) => <th key={`th-implicit-${i}`} className="p-2 border-b border-r border-border text-left font-semibold text-sm last:border-r-0">{cellContent}</th>);
            tableRows.shift(); // Rimuovi la riga usata come header dai dati
        }
      } else if (tableHeaders.length === 0 && tableRows.length === 0) { // Presumibilmente riga di intestazione
        tableHeaders = cells.map((cell, i) => <th key={`th-${lineIndex}-${i}`} className="p-2 border-b border-r border-border text-left font-semibold text-sm last:border-r-0">{processInlineFormatting(cell)}</th>);
      } else { // Riga di dati
        tableRows.push(cells.map((cell, i) => <td key={`td-${lineIndex}-${i}`} className="p-2 border-r border-border text-sm last:border-r-0">{processInlineFormatting(cell)}</td>));
      }
    } else { // Non è una riga di tabella
      if (inTable) {
        flushTable();
      }
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const listItemText = trimmedLine.substring(trimmedLine.startsWith('* ') ? 2 : 1).trimStart();
        currentListItems.push(<li key={`li-${lineIndex}`} className="text-sm">{processInlineFormatting(listItemText)}</li>);
      } else {
        flushList();
        if (trimmedLine) {
          elements.push(<p key={`p-${lineIndex}`} className="my-2 text-sm">{processInlineFormatting(trimmedLine)}</p>);
        } else if (elements.length > 0) {
            const lastElement = elements[elements.length - 1];
            let isLastElementUl = false;
            let isLastElementTableWrapper = false;

            if (React.isValidElement(lastElement)) {
                if (typeof lastElement.type === 'string' && lastElement.type === 'ul') {
                    isLastElementUl = true;
                }
                // Ensure key is not null and is a string before calling startsWith
                if (lastElement.key !== null && typeof lastElement.key === 'string' && lastElement.key.startsWith('table-wrapper')) {
                    isLastElementTableWrapper = true;
                }
            }
            
            if (!(isLastElementUl || isLastElementTableWrapper)) {
            // Aggiunge spazio solo se la riga precedente non era una lista o una tabella
            // This block was originally empty. If the intent is to add a space for empty lines
            // not following a list or table, it would be done here.
            // e.g., elements.push(<br key={`br-${lineIndex}-${elementKeyCounter++}`} />);
            // For now, keeping it empty as per original logic, but with safe access.
            }
        }
      }
    }
  });

  flushTable(); // Assicurati che l'ultima tabella venga renderizzata se il testo finisce con una tabella
  flushList(); // Assicurati che l'ultima lista venga renderizzata

  return elements;
};


export function AiSplitForm() {
  const { t, isClient: languageContextIsClient } = useLanguage();
  const [isLoading, setIsLoading] = useState(true); 
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
      if (languageContextIsClient) {
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
    if (languageContextIsClient) { 
      handleGenerateAdvice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageContextIsClient]); 


  if (!languageContextIsClient && !result) { // Mostra skeleton solo se il contesto non è pronto E non ci sono risultati (es. primo caricamento)
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
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-16 w-full mb-4" />
                 <Skeleton className="h-8 w-1/3 mb-4" />
                 <Skeleton className="h-24 w-full" />
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
          {/* Pulsante responsivo per Ottieni/Rigenera Consulenza */}
          <Button 
            onClick={handleGenerateAdvice} 
            disabled={isLoading}
            variant="outline" // Usiamo outline per un bordo leggero, e poi sovrascriviamo bg/text
            className="bg-white hover:bg-gray-100 text-black dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-black
                       h-10 w-10 p-0 md:h-9 md:w-auto md:px-3 md:py-2 flex items-center justify-center rounded-md"
            aria-label={t('aiSplitForm.generateAdviceButton')}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin md:h-4 md:w-4" />
            ) : (
              <Wand2 className="h-5 w-5 md:h-4 md:w-4" />
            )}
            <span className="hidden md:ml-2 md:inline-block">{t('aiSplitForm.generateAdviceButton')}</span>
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
            <div className="space-y-6 pt-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-primary">{t('aiSplitForm.suggestedKeyPointsLabel')}</h3>
                <div className="p-3 rounded-md bg-secondary/50 prose prose-sm max-w-none">
                  {formatAiResponse(result.suggestedSplit)}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-primary">{t('aiSplitForm.detailedAnalysisLabel')}</h3>
                 <div className="p-3 rounded-md bg-secondary/50 prose prose-sm max-w-none">
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
