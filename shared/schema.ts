import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, real, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  consent: boolean("consent").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("leads_email_idx").on(table.email),
]);

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  modelVersion: text("model_version").notNull().default("v0.4"),
  responses: jsonb("responses").notNull().$type<Record<string, number>>(),
  dimensionScores: jsonb("dimension_scores").notNull().$type<Record<string, number>>(),
  areaScores: jsonb("area_scores").notNull().$type<Record<string, number>>(),
  overallScore: real("overall_score").notNull(),
  overallLevel: integer("overall_level").notNull(),
  reportToken: varchar("report_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("assessments_report_token_idx").on(table.reportToken),
]);

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// Model types for the JSON data
export interface MaturityLevel {
  level: number;
  name: string;
  name_full: string;
  ai_concepts: string | null;
  overview: string;
  what_to_expect: string;
  human_focus: string;
}

export interface MaturityDimension {
  area: string;
  dimension: string;
  levels: Record<string, string>;
}

export interface Question {
  id: string;
  index: number;
  area: string;
  dimension: string;
  question_number_within_dimension: number;
  title: string;
  prompt: string;
  options: Record<string, string>;
}

export interface MaturityModel {
  model_name: string;
  source_file: string;
  version: string;
  generated_at: string;
  maturity_levels: MaturityLevel[];
  high_level_model: unknown[];
  simplified_model: Record<string, Record<string, string>>;
  maturity_model: MaturityDimension[];
  questionnaire: Question[];
}

// Lead form validation schema
export const leadFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  consent: z.boolean().refine(val => val === true, "You must agree to receive results"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
