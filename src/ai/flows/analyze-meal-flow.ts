'use server';
/**
 * @fileOverview A meal analysis AI agent.
 *
 * - analyzeMeal - A function that handles the meal analysis process.
 * - AnalyzeMealInput - The input type for the analyzeMeal function.
 * - AnalyzeMealOutput - The return type for the analyzeMeal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  mealDescription: z.string().describe('A textual description of the meal.'),
  mealPhotoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  estimatedCalories: z.number().describe('Estimated total calories for the meal.'),
  macronutrients: z.object({
    proteinGrams: z.number().describe('Estimated grams of protein.'),
    carbsGrams: z.number().describe('Estimated grams of carbohydrates.'),
    fatGrams: z.number().describe('Estimated grams of fat.'),
  }),
  generalAdvice: z
    .string()
    .describe('General nutritional advice or observations about the meal, including potential improvements or positive aspects.'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `You are an expert nutritionist. Analyze the following meal based on the description and optional photo.
If a photo is provided, consider it a significant source of information.
Provide an estimated calorie count, a macronutrient breakdown (protein, carbs, and fat in grams), and general nutritional advice or observations about the meal.
Be helpful and provide constructive feedback if applicable.

Meal Description:
{{{mealDescription}}}

{{#if mealPhotoDataUri}}
Meal Photo:
{{media url=mealPhotoDataUri}}
{{/if}}

Return the analysis in the specified JSON format.
`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI did not return an output for meal analysis.');
    }
    return output;
  }
);
