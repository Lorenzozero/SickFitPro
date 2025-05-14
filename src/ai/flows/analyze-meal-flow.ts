
'use server';
/**
 * @fileOverview Un agente AI per consulenza sulla salute e fitness.
 *
 * - getHealthAdvice - Una funzione che gestisce il processo di consulenza.
 * - HealthContextInput - Il tipo di input per la funzione getHealthAdvice.
 * - HealthAdviceOutput - Il tipo di ritorno per la funzione getHealthAdvice.
 */

import {ai} from '@/ai/genkit';
import type { z } from 'genkit'; // Use import type for z if only used for types here
import { HealthContextInputSchema, HealthAdviceOutputSchema } from '@/ai/schemas/health-advisor-schemas';


// Type alias for input, inferred from the schema in the schemas file
export type HealthContextInput = z.infer<typeof HealthContextInputSchema>;

// Type alias for output, inferred from the schema in the schemas file
export type HealthAdviceOutput = z.infer<typeof HealthAdviceOutputSchema>;


export async function getHealthAdvice(input: HealthContextInput): Promise<HealthAdviceOutput> {
  return healthAdvisorFlow(input);
}

const healthAdvicePrompt = ai.definePrompt({
  name: 'healthAdvisorPrompt',
  input: {schema: HealthContextInputSchema}, // Use imported schema
  output: {schema: HealthAdviceOutputSchema}, // Use imported schema
  prompt: `Sei un consulente esperto di salute e fitness olistico.
Il tuo compito è analizzare i dati forniti dall'utente riguardanti i suoi obiettivi di macronutrienti, l'assunzione di acqua, le misurazioni corporee, l'attività di allenamento e rispondere alla sua domanda specifica, se fornita.

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

{{#if userQuery}}
Domanda specifica dell'utente:
"{{{userQuery}}}"
Per favore, fornisci una risposta mirata a questa domanda, utilizzando i dati di contesto sopra elencati per personalizzare la risposta.
{{else}}
L'utente non ha posto una domanda specifica. Fornisci una consulenza generale basata sui dati disponibili.
{{/if}}

Basandoti su queste informazioni (e sulla domanda dell'utente, se presente), fornisci:
1.  Una **valutazione generale** ('overallAssessment') dello stato di salute e fitness attuale dell'utente in relazione ai suoi dati, obiettivi e alla sua domanda.
2.  Un elenco di **consigli specifici e attuabili** ('specificAdvicePoints') che l'utente può seguire per migliorare o mantenere la sua salute, raggiungere i suoi obiettivi e/o rispondere alla sua domanda. Questi consigli dovrebbero essere personalizzati.

Sii incoraggiante, costruttivo e fornisci spiegazioni chiare per i tuoi consigli.
Restituisci l'analisi nel formato JSON specificato.`,
});

const healthAdvisorFlow = ai.defineFlow(
  {
    name: 'healthAdvisorFlow',
    inputSchema: HealthContextInputSchema, // Use imported schema
    outputSchema: HealthAdviceOutputSchema, // Use imported schema
  },
  async input => {
    const {output} = await healthAdvicePrompt(input);
    if (!output) {
        throw new Error('AI non ha restituito un output per la consulenza sulla salute.');
    }
    return output;
  }
);

