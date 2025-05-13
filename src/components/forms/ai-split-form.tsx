
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

export function AiSplitForm() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestTrainingSplitOutput | null>(null);
  const { toast } = useToast();

  const formSchema = z.object({
    trainingHistory: z.string().min(50, { message: t('aiSplitForm.trainingHistoryMinError') }),
    trainingGoals: z.string().min(10, { message: t('aiSplitForm.trainingGoalsMinError') }),
  });
  
  const form = useForm<SuggestTrainingSplitInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingHistory: '',
      trainingGoals: '',
    },
  });

  // Update resolver if language changes to re-validate with correct messages
  useEffect(() => {
    form.trigger(); // Re-trigger validation if language changes and form has errors
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, form.trigger]);


  const onSubmit: SubmitHandler<SuggestTrainingSplitInput> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="trainingHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('aiSplitForm.trainingHistoryLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('aiSplitForm.trainingHistoryPlaceholder')}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('aiSplitForm.trainingHistoryDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {t('aiSplitForm.getAISuggestionButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
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

      {result && !isLoading && (
        <Card className="shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">{t('aiSplitForm.yourSuggestedSplitTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.suggestedSplitLabel')}</h3>
              <p className="p-3 rounded-md bg-background whitespace-pre-line">{result.suggestedSplit}</p>
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">{t('aiSplitForm.reasoningLabel')}</h3>
              <p className="p-3 rounded-md bg-background whitespace-pre-line">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
