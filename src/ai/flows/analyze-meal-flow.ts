
'use server';
/**
 * @fileOverview Un agente AI per consulenza sulla salute e fitness olistico.
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
  prompt: `Sei un consulente esperto di salute e fitness olistico di fama mondiale, con competenze che spaziano dalla nutrizione sportiva avanzata, alla fisiologia dell'esercizio, fino alla bioingegneria applicata all'integrazione. Il tuo obiettivo è fornire consigli estremamente personalizzati, scientificamente validi, pratici e motivanti.

**Analizza attentamente i seguenti dati forniti dall'utente:**
*   **Obiettivi Macro Settimanali Riepilogati:** \`{{{userMacroGoalsSummary}}}\` (Se "Non fornito.", assumi che l'utente potrebbe aver bisogno di una guida generale sui macro).
*   **Obiettivo Idrico Giornaliero (ml):** \`{{{userWaterGoalMl}}}\` (Se "Non fornito.", sottolinea l'importanza dell'idratazione).
*   **Riepilogo Misurazioni Corporee:** \`{{{userBodyMeasurementsSummary}}}\` (Se "Non fornito.", suggerisci l'importanza del tracciamento).
*   **Riepilogo Allenamento/Volume:** \`{{{userTrainingSummary}}}\` (Se "Non fornito.", dai consigli generali sull'attività fisica).

**Domanda Specifica dell'Utente (se presente):**
\`\`\`
{{{userQuery}}}
\`\`\`

**Istruzioni per la Risposta (formato JSON Obiettivo):**

1.  **Valutazione Complessiva ('overallAssessment'):**
    *   **Indipendentemente dalla presenza di 'userQuery', inizia sempre questa sezione con:**
        *   Un breve commento sull'obiettivo idrico dell'utente (es. "Il tuo obiettivo di {X}ml è un buon punto di partenza, ma potresti considerare..." o "L'idratazione è fondamentale, considera di impostare un obiettivo giornaliero se non fornito.").
        *   Un breve commento sugli obiettivi macro settimanali (es. "I tuoi macro sembrano orientati a X, il che è coerente con Y..." o "Non hai specificato obiettivi macro; definire un piano può aiutarti a...").
    *   **Se l'utente ha posto una domanda specifica ('userQuery'):**
        *   Dopo i commenti su acqua e macro, rispondi in modo diretto, esauriente e personalizzato alla domanda, utilizzando gli altri dati di contesto per arricchire e adattare la tua risposta.
    *   **Se l'utente NON ha posto una domanda specifica ('userQuery' è assente o vuota):**
        *   Dopo i commenti su acqua e macro, fornisci una valutazione generale del suo stato di salute e fitness basandoti sui dati disponibili (misurazioni, allenamento).
        *   Se i dati sono scarsi, spiega gentilmente cosa potrebbe tracciare per ricevere consigli più mirati in futuro.

2.  **Consigli Specifici e Attuabili ('specificAdvicePoints'):**
    *   Questo deve essere un elenco di stringhe. Ogni stringa è un consiglio pratico.
    *   Fornisci almeno 2-4 consigli attuabili e personalizzati.
    *   **Se l'utente NON ha posto una 'userQuery' specifica e il contesto (es. \`userTrainingSummary\` se indica allenamento per ipertrofia) lo suggerisce, O se la 'userQuery' riguarda l'integrazione:**
        *   Offri consigli su integratori pertinenti (es. per ipertrofia: creatina, proteine whey). Menzionali con cautela, specificando il razionale, dosaggi generici e l'importanza di consultare un professionista.
        *   **UTILIZZA TABELLE MARKDOWN SEMPLICI** per presentare i piani di integrazione, come da esempio:
            \`\`\`
            | Integratore        | Dosaggio Consigliato | Momento Assunzione | Note Brevi                                   |
            |--------------------|----------------------|--------------------|----------------------------------------------|
            | Creatina Monoidrato| 3-5g al giorno       | Qualsiasi momento  | Idratazione importante, ciclo non necessario |
            | Proteine Whey      | 20-30g post-workout  | Dopo l'allenamento | Utile se l'apporto proteico è carente        |
            \`\`\`
    *   **Se la 'userQuery' riguarda la riprogrammazione dei macro e la risposta si presta a una struttura tabellare:**
        *   **UTILIZZA TABELLE MARKDOWN SEMPLICI** per presentare un piano macro indicativo, come da esempio:
            \`\`\`
            | Fase        | Durata    | Calorie (stima) | Proteine (g/kg) | Carboidrati (g/kg) | Grassi (g/kg) |
            |-------------|-----------|-----------------|-----------------|--------------------|---------------|
            | Mantenimento| Sett. 1-2 | ~2200-2400      | 1.8-2.0         | 3-4                | 0.8-1.0       |
            | Leggero Taglio| Sett. 3-4 | ~2000-2200      | 2.0-2.2         | 2.5-3.5            | 0.7-0.9       |
            \`\`\`
    *   Se la 'userQuery' è presente e non riguarda integratori o macro, i consigli dovrebbero essere pertinenti alla domanda.
    *   Se non c'è 'userQuery', fornisci consigli generali (oltre agli integratori se pertinenti) su come l'utente potrebbe ottimizzare ulteriormente la sua idratazione, i suoi macro in relazione all'allenamento, o l'importanza del tracciamento delle misurazioni.
    *   Se la risposta a una 'userQuery' implica una lista di più di 3 passaggi o elementi, considera di formattarla come una tabella Markdown semplice con una colonna.

**Stile e Tono:**
*   **Esperto e Autorevole:** Dimostra profonda conoscenza.
*   **Scientifico ma Comprensibile:** Usa termini corretti ma spiega concetti complessi in modo semplice.
*   **Estremamente Motivante:** Incoraggia l'utente e infondi fiducia.
*   **Profondamente Personalizzato:** Fai sentire l'utente che il consiglio è cucito su misura per lui/lei, riferendoti ai dati forniti.
*   **Cauto e Responsabile:** Evita promesse irrealistiche. Per l'integrazione, sottolinea sempre che è un complemento e non un sostituto di una dieta e allenamento adeguati, e consiglia di consultare un medico. Non fare diagnosi mediche.

Assicurati che l'output JSON sia sempre valido. Presta la massima attenzione alla corretta formattazione delle tabelle Markdown come da esempi, se utilizzate.
Non inventare dati sull'utente, basati solo su quanto fornito.
Restituisci l'analisi nel formato JSON specificato.`,
});

const healthAdvisorFlow = ai.defineFlow(
  {
    name: 'healthAdvisorFlow',
    inputSchema: HealthContextInputSchema, // Use imported schema
    outputSchema: HealthAdviceOutputSchema, // Use imported schema
  },
  async input => {
    // Se l'input.userQuery è vuoto o solo spazi, impostalo a undefined così il prompt lo tratta come non fornito.
    const processedInput = {
        ...input,
        userQuery: input.userQuery?.trim() ? input.userQuery.trim() : undefined,
        userMacroGoalsSummary: input.userMacroGoalsSummary || "Non fornito.",
        userWaterGoalMl: input.userWaterGoalMl === undefined || isNaN(input.userWaterGoalMl) ? undefined : input.userWaterGoalMl, // Passa undefined se non valido
        userBodyMeasurementsSummary: input.userBodyMeasurementsSummary || "Non fornito.",
        userTrainingSummary: input.userTrainingSummary || "Non fornito.",
    };


    const {output} = await healthAdvicePrompt(processedInput);
    if (!output) {
        throw new Error('AI non ha restituito un output per la consulenza sulla salute.');
    }
    return output;
  }
);

