'use client';

import { useState, type ChangeEvent, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, UploadCloud, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { analyzeMeal, type AnalyzeMealInput, type AnalyzeMealOutput } from '@/ai/flows/analyze-meal-flow';
import { Skeleton } from '@/components/ui/skeleton';

const NutritionalAnalysisFormSchema = z.object({
  mealDescription: z.string().min(10, { message: "Please describe the meal (at least 10 characters)." }), // Message will be translated by t()
  mealPhotoDataUri: z.string().optional(),
});

type NutritionalAnalysisFormValues = z.infer<typeof NutritionalAnalysisFormSchema>;

export default function NutritionalAnalysisForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeMealOutput | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const formSchema = NutritionalAnalysisFormSchema.extend({
     mealDescription: z.string().min(10, { message: t('nutritionalAnalysis.mealDescriptionPlaceholder') }),
  });


  const form = useForm<NutritionalAnalysisFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealDescription: '',
      mealPhotoDataUri: undefined,
    },
  });
  
  // Update resolver if language changes to re-validate with correct messages
  useEffect(() => {
    form.trigger();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, form.trigger]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            title: t('nutritionalAnalysis.errorTitle'),
            description: "Photo size should not exceed 2MB.", // Add translation key if needed
            variant: "destructive"
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        form.setValue('mealPhotoDataUri', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    form.setValue('mealPhotoDataUri', undefined);
    const photoInput = document.getElementById('mealPhoto') as HTMLInputElement | null;
    if (photoInput) {
        photoInput.value = ''; // Reset file input
    }
  };

  const onSubmit: SubmitHandler<NutritionalAnalysisFormValues> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const inputData: AnalyzeMealInput = {
      mealDescription: data.mealDescription,
    };

    if (photoFile && photoPreview) {
      inputData.mealPhotoDataUri = photoPreview; // Already a data URI
    }
    
    try {
      const response = await analyzeMeal(inputData);
      setAnalysisResult(response);
      toast({
        title: t('nutritionalAnalysis.analysisReadyTitle'),
        description: t('nutritionalAnalysis.analysisReadyDescription'),
      });
    } catch (error) {
      console.error("Error fetching nutritional analysis:", error);
      toast({
        title: t('nutritionalAnalysis.errorTitle'),
        description: t('nutritionalAnalysis.errorDescription'),
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
          {t('nutritionalAnalysis.cardTitle')}
        </CardTitle>
        <CardDescription>{t('nutritionalAnalysis.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mealDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionalAnalysis.mealDescriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('nutritionalAnalysis.mealDescriptionPlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t('nutritionalAnalysis.mealPhotoLabel')}</FormLabel>
              <FormControl>
                <Input 
                    id="mealPhoto" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              {photoPreview && (
                <div className="mt-4 relative w-full max-w-xs aspect-video border rounded-md overflow-hidden group">
                  <Image src={photoPreview} alt={t('nutritionalAnalysis.photoPreviewAlt')} layout="fill" objectFit="cover" data-ai-hint="food meal" />
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
              <FormDescription>{t('nutritionalAnalysis.uploadPhotoButton')}</FormDescription>
              <FormMessage />
            </FormItem>
            
            <div className="flex justify-center">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                )}
                {t('nutritionalAnalysis.analyzeMealButton')}
                </Button>
            </div>
          </form>
        </Form>

        {isLoading && (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-center text-primary">{t('nutritionalAnalysis.resultsTitle')}</h3>
            <Card className="bg-secondary/50">
                <CardContent className="p-4 space-y-2">
                    <p><strong>{t('nutritionalAnalysis.estimatedCalories')}:</strong> {analysisResult.estimatedCalories.toLocaleString()}</p>
                    <p><strong>{t('nutritionalAnalysis.protein')}:</strong> {analysisResult.macronutrients.proteinGrams.toLocaleString()} g</p>
                    <p><strong>{t('nutritionalAnalysis.carbs')}:</strong> {analysisResult.macronutrients.carbsGrams.toLocaleString()} g</p>
                    <p><strong>{t('nutritionalAnalysis.fat')}:</strong> {analysisResult.macronutrients.fatGrams.toLocaleString()} g</p>
                    <div>
                        <h4 className="font-semibold mt-2">{t('nutritionalAnalysis.generalAdvice')}:</h4>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">{analysisResult.generalAdvice}</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
