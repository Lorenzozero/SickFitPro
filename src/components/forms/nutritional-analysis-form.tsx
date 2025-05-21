
'use client';

import { useState, type ChangeEvent, useEffect, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Info, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { getHealthAdvice, type HealthContextInput, type HealthAdviceOutput } from '@/ai/flows/analyze-meal-flow';
import { HealthContextInputSchema } from '@/ai/schemas/health-advisor-schemas';
import { Skeleton } from '@/components/ui/skeleton';
import type { BodyMeasurement } from '@/app/(app)/progress/page';
import { mockGetUserTrainingData, formatTrainingDataToString } from '@/components/forms/ai-split-form';
import { z } from 'zod';
import React from 'react';


// Type for the fields managed by react-hook-form. User only edits userQuery.
interface UserEditableFormValues {
  userQuery?: string;
}

// Funzione per formattare la risposta AI (simile a quella in AiSplitForm)
const formatHealthAdviceResponse = (text: string): React.ReactNode[] => {
  if (!text) return [];
  let keyCounter = 0; // Counter for stable keys

  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  
  let currentListItems: React.ReactNode[] = [];
  let inTable = false;
  let tableHeaders: React.ReactNode[] = [];
  let tableRows: React.ReactNode[][] = [];

  function flushList() {
    if (currentListItems.length > 0) {
      elements.push(<ul key={`ul-${keyCounter++}`} className="my-2 ml-6 list-disc space-y-1">{currentListItems}</ul>);
      currentListItems = [];
    }
  }

  function flushTable() {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      elements.push(
        <div key={`table-wrapper-${keyCounter++}`} className="my-4 overflow-x-auto rounded-md border border-border">
          <table className="min-w-full w-full border-collapse text-sm">
            {tableHeaders.length > 0 && (
              <thead className="bg-muted/50">
                <tr key={`thr-${keyCounter++}`}>{tableHeaders}</tr>
              </thead>
            )}
            {tableRows.length > 0 && (
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={`tr-${i}-${keyCounter++}`} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                    {row}
                  </tr>
                ))}
              </tbody>
            )}
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
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) { // Ensure it's not just "**"
        return <strong key={`strong-part-${index}-${keyCounter++}`}>{part.substring(2, part.length - 2)}</strong>;
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
        // Markdown table separator line, only used if headers are not yet set from first data row
         if (tableHeaders.length === 0 && tableRows.length > 0 && tableRows[0]?.length === cells.length) {
            tableHeaders = tableRows[0].map((cellContent, i) => 
                <th key={`th-implicit-${lineIndex}-${i}-${keyCounter++}`} className="p-2 border-b border-r border-border text-left font-semibold last:border-r-0">{cellContent}</th>
            );
            tableRows.shift(); 
        }
      } else if (tableHeaders.length === 0 && tableRows.length === 0) { 
        tableHeaders = cells.map((cell, i) => 
            <th key={`th-${lineIndex}-${i}-${keyCounter++}`} className="p-2 border-b border-r border-border text-left font-semibold last:border-r-0">{processInlineFormatting(cell)}</th>
        );
      } else { 
        tableRows.push(cells.map((cell, i) => 
            <td key={`td-${lineIndex}-${i}-${keyCounter++}`} className="p-2 border-r border-border last:border-r-0">{processInlineFormatting(cell)}</td>
        ));
      }
    } else { 
      if (inTable) {
        flushTable();
      }
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const listItemText = trimmedLine.substring(trimmedLine.startsWith('* ') ? 2 : 1).trimStart();
        currentListItems.push(<li key={`li-${lineIndex}-${keyCounter++}`}>{processInlineFormatting(listItemText)}</li>);
      } else {
        flushList();
        if (trimmedLine) {
          elements.push(<p key={`p-${lineIndex}-${keyCounter++}`} className="my-2">{processInlineFormatting(trimmedLine)}</p>);
        }
      }
    }
  });

  flushTable(); 
  flushList(); 

  return elements;
};


export default function AiHealthAdvisorForm() {
  const { t, isClient: languageContextIsClient } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<HealthAdviceOutput | null>(null);

  const formValidationSchema = useMemo(() => {
    return HealthContextInputSchema.pick({ userQuery: true }).extend({
        userQuery: z.string().optional().refine(val => {
          if (val && val.trim().length > 0) { // Check if not just whitespace
            return val.trim().length >= 10;
          }
          return true; // Empty or whitespace-only string is valid
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
    if (form.formState.errors.userQuery && languageContextIsClient) {
        form.trigger('userQuery'); 
    }
  }, [t, form, formValidationSchema, languageContextIsClient]);


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
      userQuery: formData.userQuery?.trim() || undefined, 
      userMacroGoalsSummary,
      userWaterGoalMl,
      userBodyMeasurementsSummary,
      userTrainingSummary,
    };
    
    try {
      const response = await getHealthAdvice(inputData);
      setAdviceResult(response);
      if (languageContextIsClient) {
        toast({
            title: t('aiHealthAdvisor.adviceReadyTitle'),
            description: t('aiHealthAdvisor.adviceReadyDescription'),
            duration: 1000, // Aggiungi questa riga per 1 secondo di durata
        });
      }
    } catch (error) {
      console.error("Error fetching AI health advice:", error);
      if (languageContextIsClient) {
        toast({
            title: t('aiHealthAdvisor.errorTitle'),
            description: t('aiHealthAdvisor.errorDescription'),
            variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically get initial advice when the component mounts
  useEffect(() => {
    if (languageContextIsClient && !adviceResult && !isLoading) { // Only if no result yet and not already loading
      onSubmit({ userQuery: '' }); // Submit with an empty query to get initial advice
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageContextIsClient]); // Dependency on languageContextIsClient ensures t() is ready

  if (!languageContextIsClient) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-7 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-10 w-1/3 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Wand2 className="w-6 h-6 mr-2 text-primary" />
          {t('aiHealthAdvisor.cardTitle')}
        </CardTitle>
        <div>
          {/* Pulsante responsivo per Ottieni/Rigenera Consulenza */}
          <Button
            type="submit"
            form="ai-health-advisor-form"
            disabled={isLoading}
            variant="outline" // Usiamo outline per un bordo leggero, e poi sovrascriviamo bg/text
            className="bg-white hover:bg-gray-100 text-black dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-black
                       h-10 w-10 p-0 md:h-9 md:w-auto md:px-3 md:py-2 flex items-center justify-center rounded-md"
            aria-label={t('aiHealthAdvisor.getAdviceButton')}
          >
            {/* Icona si adatta alla dimensione e allo stato di caricamento */}
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin md:h-4 md:w-4" /> : <Wand2 className="h-5 w-5 md:h-4 md:w-4" />}
            {/* Testo visibile solo su schermi md e superiori */}
            <span className="hidden md:ml-2 md:inline-block">{t('aiHealthAdvisor.getAdviceButton')}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="ai-health-advisor-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          </form>
        </Form>

        {isLoading && !adviceResult && ( // Show this loader only during initial advice generation
          <div className="mt-8 space-y-4 text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">{t('aiHealthAdvisor.generatingAdviceDescription', { default: "L'AI sta elaborando i tuoi consigli..."})}</p>
          </div>
        )}
        
        {isLoading && adviceResult && ( // Show a smaller loader if adviceResult already exists and we are refreshing
            <div className="mt-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )}


        {adviceResult && ( // Always show results if available, even if isLoading is true for a refresh
          <div className="mt-8 space-y-6 prose prose-sm max-w-none">
            <h3 className="text-xl font-semibold text-center text-primary">{t('aiHealthAdvisor.resultsTitle')}</h3>
            
            <Card className="bg-secondary/30">
                <CardHeader><CardTitle className="text-lg">{t('aiHealthAdvisor.overallAssessment')}</CardTitle></CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                    {formatHealthAdviceResponse(adviceResult.overallAssessment)}
                </CardContent>
            </Card>

            <Card className="bg-secondary/30">
                <CardHeader><CardTitle className="text-lg">{t('aiHealthAdvisor.specificAdvice')}</CardTitle></CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                     {adviceResult.specificAdvicePoints.map((advice, index) => (
                        <div key={index} className="mb-2">{formatHealthAdviceResponse(advice)}</div>
                     ))}
                </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
