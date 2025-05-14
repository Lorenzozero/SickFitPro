
// src/ai/schemas/health-advisor-schemas.ts
import { z } from 'zod';

export const HealthContextInputSchema = z.object({
  userQuery: z
    .string()
    .optional()
    .describe('A specific question or request from the user, if any.'),
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

export const HealthAdviceOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe("Una valutazione generale dei dati sulla salute e degli obiettivi forniti dall'utente, considerando la sua domanda specifica se presente."),
  specificAdvicePoints: z
    .array(z.string())
    .describe("Un elenco di punti di consulenza specifici e attuabili, pertinenti alla domanda dell'utente e al suo contesto generale."),
});

