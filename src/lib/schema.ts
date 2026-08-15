import { z } from "zod";

export const analyzeInputSchema = z.object({
  facebookUrl: z.string().trim().optional().default(""),
  instagramUrl: z.string().trim().optional().default(""),
  websiteUrl: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
  businessName: z.string().trim().optional().default(""),
  whatTheySell: z.string().trim().optional().default(""),
  whatYouNotice: z.string().trim().optional().default(""),
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;

export const prioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export const complexitySchema = z.enum(["Low", "Medium", "High"]);
export const confidenceSchema = z.enum(["High", "Medium", "Low"]);
export const observationSourceSchema = z.enum(["screenshot", "website", "notes"]);

export const dataAvailabilitySchema = z.object({
  website: z.boolean(),
  facebook: z.boolean(),
  instagram: z.boolean(),
  notes: z.boolean(),
  screenshots: z.boolean(),
});

export const observationSchema = z.object({
  text: z.string(),
  source: observationSourceSchema,
});

export const businessSnapshotSchema = z.object({
  businessName: z.string(),
  industry: z.string(),
  businessType: z.string(),
  whatTheyOffer: z.string(),
  summary: z.string(),
});

export const topOpportunitySchema = z.object({
  title: z.string(),
  whyItMatters: z.string(),
  recommendation: z.array(z.string()).min(1).max(8),
  priority: prioritySchema,
  confidence: confidenceSchema,
  expectedImpact: z.string(),
});

export const opportunitySchema = z.object({
  title: z.string(),
  priority: prioritySchema,
  confidence: confidenceSchema,
  possibleNeed: z.string(),
  why: z.string(),
  whatWeOffer: z.array(z.string()).min(1).max(8),
});

export const bestOfferSchema = z.object({
  name: z.string(),
  includes: z.array(z.string()).min(1).max(8),
  reason: z.string(),
  complexity: complexitySchema,
});

export const approachSchema = z.object({
  whatToLeadWith: z.string(),
  openingMessage: z.string(),
});

export const analysisResultSchema = z.object({
  dataAvailability: dataAvailabilitySchema,
  dataLimitationsNote: z.string(),
  observations: z.array(observationSchema).max(8).default([]),
  businessSnapshot: businessSnapshotSchema,
  topOpportunity: topOpportunitySchema,
  opportunities: z.array(opportunitySchema).min(3).max(5),
  bestOffer: bestOfferSchema,
  approach: approachSchema,
  insufficientData: z.boolean(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Complexity = z.infer<typeof complexitySchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Observation = z.infer<typeof observationSchema>;
