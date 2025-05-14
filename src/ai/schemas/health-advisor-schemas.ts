
// src/ai/schemas/health-advisor-schemas.ts
import { z } from 'zod';

export const HealthContextInputSchema = z.object({
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

export const HealthAdviceOutputSchema = z.object({
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
