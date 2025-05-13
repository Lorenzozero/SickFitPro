'use client';

import { useState } from 'react';
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

const formSchema = z.object({
  trainingHistory: z.string().min(50, { message: "Please provide detailed training history (at least 50 characters)." }),
  trainingGoals: z.string().min(10, { message: "Please describe your training goals (at least 10 characters)." }),
});

export function AiSplitForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestTrainingSplitOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SuggestTrainingSplitInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingHistory: '',
      trainingGoals: '',
    },
  });

  const onSubmit: SubmitHandler<SuggestTrainingSplitInput> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await suggestTrainingSplit(data);
      setResult(response);
      toast({
        title: "Suggestion Ready!",
        description: "AI has generated a training split for you.",
      });
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestion. Please try again.",
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
            AI Training Split Suggester
          </CardTitle>
          <CardDescription>
            Let our AI craft a personalized training split based on your history and goals.
            Provide as much detail as possible for the best results.
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
                    <FormLabel>Training History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Been lifting for 2 years, current split is PPL. Squat 100kg, Bench 80kg, Deadlift 120kg. Usually train 3-4 times a week..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your past and current training, including exercises, frequency, weights, etc.
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
                    <FormLabel>Training Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Looking to gain muscle mass, improve strength in compound lifts, and increase overall endurance. Specifically want to grow my legs and shoulders."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What do you want to achieve with your training? (e.g., muscle gain, fat loss, strength increase)
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
                Get AI Suggestion
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-md animate-pulse">
          <CardHeader>
            <CardTitle>Generating your split...</CardTitle>
            <CardDescription>Our AI is thinking. This might take a moment.</CardDescription>
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
            <CardTitle className="text-primary">Your AI-Suggested Training Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-1 text-lg font-semibold">Suggested Split:</h3>
              <p className="p-3 rounded-md bg-background whitespace-pre-line">{result.suggestedSplit}</p>
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Reasoning:</h3>
              <p className="p-3 rounded-md bg-background whitespace-pre-line">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
