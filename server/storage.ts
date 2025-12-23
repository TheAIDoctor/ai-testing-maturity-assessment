import { 
  type Lead, 
  type InsertLead, 
  type Assessment, 
  type InsertAssessment,
  leads,
  assessments 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadById(id: string): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  
  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentByToken(token: string): Promise<Assessment | undefined>;
  getAssessmentWithLead(token: string): Promise<(Assessment & { lead: Lead }) | undefined>;
  getAllAssessmentsWithLeads(): Promise<(Assessment & { lead: Lead })[]>;
}

export class DatabaseStorage implements IStorage {
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.email, email));
    return lead;
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db.insert(assessments).values(insertAssessment).returning();
    return assessment;
  }

  async getAssessmentByToken(token: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.reportToken, token));
    return assessment;
  }

  async getAssessmentWithLead(token: string): Promise<(Assessment & { lead: Lead }) | undefined> {
    const result = await db
      .select()
      .from(assessments)
      .innerJoin(leads, eq(assessments.leadId, leads.id))
      .where(eq(assessments.reportToken, token));
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].assessments,
      lead: result[0].leads,
    };
  }

  async getAllAssessmentsWithLeads(): Promise<(Assessment & { lead: Lead })[]> {
    const result = await db
      .select()
      .from(assessments)
      .innerJoin(leads, eq(assessments.leadId, leads.id))
      .orderBy(assessments.createdAt);
    
    return result.map(row => ({
      ...row.assessments,
      lead: row.leads,
    }));
  }
}

export const storage = new DatabaseStorage();
