
// src/ai/schemas/health-advisor-schemas.ts
import { z } from 'zod';

export const HealthContextInputSchema = z.object({
  userQuery: z
    .string()
    .optional()
    .describe('A specific question or request from the user, if any. Examples: "Suggest supplements for memory.", "How can I reprogram my monthly macros? Please show as a table."'),
  userMacroGoalsSummary: z
    .string()
    .optional()
    .describe("Summary of the user's weekly macronutrient goals. Example: 'Monday: P 150g, C 200g, F 60g; Tuesday: ...'"),
  userWaterGoalMl: z
    .number()
    .optional()
    .describe("User's daily water intake goal in milliliters. Example: 2500"),
  userBodyMeasurementsSummary: z
    .string()
    .optional()
    .describe("Summary of the user's recent body measurements. Example: '2024-07-01 - Weight: 70kg, Waist: 80cm; 2024-07-15 - Weight: 69.5kg, Waist: 79cm'"),
  userTrainingSummary: z
    .string()
    .optional()
    .describe("Summary of the user's recent training activity/volume. Example: 'Last week: 3 strength sessions (Full Body), 2 cardio sessions (30min LISS). Total volume approx 8000kg.'"),
});

export const HealthAdviceOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe("A general assessment of the user's health data and goals, or a direct answer to their specific query. This should be comprehensive."),
  specificAdvicePoints: z
    .array(z.string())
    .describe("A list of specific, actionable advice points relevant to the user's query and/or their overall context. This can include supplement recommendations, macro adjustments, etc. Use Markdown tables for structured info like supplement plans or macro tables if applicable and if the list is longer than 3 items."),
});
