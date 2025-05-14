'use server';
/**
 * @fileOverview Un agente AI per consulenza sulla salute e fitness.
 *
 * - getHealthAdvice - Una funzione che gestisce il processo di consulenza.
 * - HealthContextInput - Il tipo di input per la funzione getHealthAdvice.
 * - HealthAdviceOutput - Il tipo di ritorno per la funzione getHealthAdvice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthContextInputSchema = z.object({
  mealDescription: z
    .string()
    .optional()
    .describe('Una descrizione testuale opzionale del pasto più recente o di un pasto tipico.'),
  mealPhotoDataUri: z
    .string()
    .optional()
    .describe(
      "Una foto opzionale del pasto, come URI dati che deve includere un tipo MIME e utilizzare la codifica Base64. Formato atteso: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userMacroGoalsSummary: z
    .string()
    .optional()
    .describe("Riepilogo degli obiettivi macronutrizionali settimanali dell'utente."),
  userWaterGoalMl: z
    .number()
    .optional()
    .describe("Obiettivo di assunzione giornaliera di acqua dell'utente in millilitri."),
  userBodyMeasurementsSummary: z
    .string()
    .optional()
    .describe("Riepilogo delle recenti misurazioni corporee dell'utente."),
  userTrainingSummary: z
    .string()
    .optional()
    .describe("Riepilogo della recente attività/volume di allenamento dell'utente."),
});
export type HealthContextInput = z.infer<typeof HealthContextInputSchema>;

const HealthAdviceOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe("Una valutazione generale dei dati sulla salute e degli obiettivi forniti dall'utente."),
  specificAdvicePoints: z
    .array(z.string())
    .describe("Un elenco di punti di consulenza specifici e attuabili."),
  mealSpecificFeedback: z
    .string()
    .optional()
    .describe("Feedback specifico relativo al pasto, se è stato descritto un pasto."),
});
export type HealthAdviceOutput = z.infer<typeof HealthAdviceOutputSchema>;

export async function getHealthAdvice(input: HealthContextInput): Promise<HealthAdviceOutput> {
  return healthAdvisorFlow(input);
}

const healthAdvicePrompt = ai.definePrompt({
  name: 'healthAdvisorPrompt',
  input: {schema: HealthContextInputSchema},
  output: {schema: HealthAdviceOutputSchema},
  prompt: `Sei un consulente esperto di salute e fitness olistico.
Il tuo compito è analizzare i dati forniti dall'utente riguardanti i suoi obiettivi di macronutrienti, l'assunzione di acqua, le misurazioni corporee e l'attività di allenamento.
Se l'utente fornisce dettagli su un pasto (descrizione e/o foto), includi un feedback specifico su quel pasto nel contesto più ampio della sua salute e dei suoi obiettivi.

Ecco i dati forniti dall'utente:
{{#if userMacroGoalsSummary}}
- Obiettivi Macro Settimanali: {{{userMacroGoalsSummary}}}
{{else}}
- Obiettivi Macro Settimanali: Non forniti.
{{/if}}

{{#if userWaterGoalMl}}
- Obiettivo Idrico Giornaliero: {{{userWaterGoalMl}}} ml
{{else}}
- Obiettivo Idrico Giornaliero: Non fornito.
{{/if}}

{{#if userBodyMeasurementsSummary}}
- Riepilogo Misurazioni Corporee: {{{userBodyMeasurementsSummary}}}
{{else}}
- Riepilogo Misurazioni Corporee: Non fornito.
{{/if}}

{{#if userTrainingSummary}}
- Riepilogo Allenamento: {{{userTrainingSummary}}}
{{else}}
- Riepilogo Allenamento: Non fornito.
{{/if}}

{{#if mealDescription}}
Dettagli del Pasto:
- Descrizione: {{{mealDescription}}}
  {{#if mealPhotoDataUri}}
- Foto del Pasto: {{media url=mealPhotoDataUri}}
  {{/if}}
{{/if}}

Basandoti su queste informazioni, fornisci:
1.  Una **valutazione generale** ('overallAssessment') dello stato di salute e fitness attuale dell'utente in relazione ai suoi dati e obiettivi.
2.  Un elenco di **consigli specifici e attuabili** ('specificAdvicePoints') che l'utente può seguire per migliorare o mantenere la sua salute e raggiungere i suoi obiettivi. Questi consigli dovrebbero essere personalizzati.
3.  Se sono stati forniti dettagli su un pasto, fornisci un **feedback specifico sul pasto** ('mealSpecificFeedback') nel contesto più ampio. Se nessun pasto è stato fornito, ometti questo campo o lascialo vuoto.

Sii incoraggiante, costruttivo e fornisci spiegazioni chiare per i tuoi consigli.
Restituisci l'analisi nel formato JSON specificato.`,
});

const healthAdvisorFlow = ai.defineFlow(
  {
    name: 'healthAdvisorFlow',
    inputSchema: HealthContextInputSchema,
    outputSchema: HealthAdviceOutputSchema,
  },
  async input => {
    const {output} = await healthAdvicePrompt(input);
    if (!output) {
        throw new Error('AI non ha restituito un output per la consulenza sulla salute.');
    }
    return output;
  }
);
