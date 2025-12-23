import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadFormSchema, type MaturityModel, type Question } from "@shared/schema";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

// Load the maturity model
let maturityModel: MaturityModel | null = null;

function loadMaturityModel(): MaturityModel {
  if (maturityModel) return maturityModel;
  
  const modelPath = path.join(process.cwd(), "data", "model.json");
  const content = fs.readFileSync(modelPath, "utf-8");
  maturityModel = JSON.parse(content);
  return maturityModel!;
}

// Calculate scores
interface ScoreResult {
  dimensionScores: Record<string, number>;
  areaScores: Record<string, number>;
  overallScore: number;
  overallLevel: number;
}

// Validate that all questions are answered with valid levels (1-5)
function validateResponses(
  responses: Record<string, number>,
  model: MaturityModel
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const questionIds = model.questionnaire.map(q => q.id);
  
  // Check all questions are answered
  for (const qId of questionIds) {
    if (!(qId in responses)) {
      errors.push(`Missing answer for question: ${qId}`);
    } else {
      const value = responses[qId];
      if (typeof value !== 'number' || value < 1 || value > 5 || !Number.isInteger(value)) {
        errors.push(`Invalid answer for question ${qId}: must be 1-5`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

function calculateScores(
  responses: Record<string, number>,
  model: MaturityModel
): ScoreResult {
  const questions = model.questionnaire;
  
  // Group questions by dimension
  const dimensionQuestions = new Map<string, Question[]>();
  for (const q of questions) {
    const key = `${q.area}::${q.dimension}`;
    const existing = dimensionQuestions.get(key) || [];
    existing.push(q);
    dimensionQuestions.set(key, existing);
  }
  
  // Calculate dimension scores (responses already validated, no fallback needed)
  const dimensionScores: Record<string, number> = {};
  for (const [key, qs] of dimensionQuestions) {
    const scores = qs.map(q => responses[q.id]);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    dimensionScores[key] = avg;
  }
  
  // Group dimensions by area
  const areaScores: Record<string, number> = {};
  const areaDimensions = new Map<string, string[]>();
  
  for (const key of Object.keys(dimensionScores)) {
    const [area] = key.split("::");
    const existing = areaDimensions.get(area) || [];
    existing.push(key);
    areaDimensions.set(area, existing);
  }
  
  for (const [area, dims] of areaDimensions) {
    const scores = dims.map(d => dimensionScores[d]);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    areaScores[area] = avg;
  }
  
  // Calculate overall score
  const allDimScores = Object.values(dimensionScores);
  const overallScore = allDimScores.reduce((a, b) => a + b, 0) / allDimScores.length;
  
  // Calculate level
  let overallLevel = 1;
  if (overallScore >= 4.5) overallLevel = 5;
  else if (overallScore >= 3.5) overallLevel = 4;
  else if (overallScore >= 2.5) overallLevel = 3;
  else if (overallScore >= 1.5) overallLevel = 2;
  
  return { dimensionScores, areaScores, overallScore, overallLevel };
}

// Generate secure token
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Send email (or log in dev mode)
async function sendEmail(
  to: string,
  firstName: string,
  reportToken: string,
  overallScore: number,
  overallLevel: number
): Promise<void> {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  
  const reportUrl = `${baseUrl}/report/${reportToken}`;
  
  // Get level name for subject
  const levelNames: Record<number, string> = {
    1: "No AI Use",
    2: "Gen AI Ad-hoc Usage", 
    3: "AI-driven Workflows",
    4: "Agentic AI",
    5: "Multi-Agent Teams"
  };
  const levelName = levelNames[overallLevel] || `Level ${overallLevel}`;
  
  const subject = `${firstName}, Your AI Testing Maturity: Level ${overallLevel} - ${levelName}`;
  const body = `
Hi ${firstName},

Thank you for completing the AI Testing Maturity Assessment!

YOUR RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score: ${overallScore.toFixed(1)} out of 5.0
Maturity Level: Level ${overallLevel} - ${levelName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VIEW YOUR FULL REPORT
Your personalized report includes:
• Detailed breakdown across 5 testing areas
• Analysis of all 12 testing dimensions  
• Your top 3 improvement opportunities
• Specific next-level recommendations

Access your report here:
${reportUrl}

This link is unique to you and will remain active for future reference.

Best regards,
AI Testing Maturity Assessment Team
  `.trim();

  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (resendApiKey) {
    try {
      const emailFrom = process.env.EMAIL_FROM || "AI Testing <onboarding@resend.dev>";
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [to],
          subject,
          text: body,
        }),
      });
      
      if (!response.ok) {
        console.error("Failed to send email via Resend:", await response.text());
      } else {
        console.log(`Email sent to ${to}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  } else {
    // Dev mode - log to console
    console.log("\n========== EMAIL (Dev Mode) ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`Report URL: ${reportUrl}`);
    console.log("=======================================\n");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get maturity model
  app.get("/api/model", (req, res) => {
    try {
      const model = loadMaturityModel();
      res.json(model);
    } catch (error) {
      console.error("Failed to load model:", error);
      res.status(500).json({ error: "Failed to load maturity model" });
    }
  });

  // Submit assessment
  app.post("/api/assessment/submit", async (req, res) => {
    try {
      const { lead: leadData, responses } = req.body;
      
      // Validate lead data
      const validatedLead = leadFormSchema.parse(leadData);
      
      // Load model
      const model = loadMaturityModel();
      
      // Validate all 24 questions are answered with valid levels
      const validation = validateResponses(responses, model);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: "Incomplete assessment", 
          details: validation.errors 
        });
      }
      
      // Calculate scores
      const scores = calculateScores(responses, model);
      
      // Create lead
      const lead = await storage.createLead(validatedLead);
      
      // Generate report token
      const reportToken = generateToken();
      
      // Create assessment
      const assessment = await storage.createAssessment({
        leadId: lead.id,
        modelVersion: model.version,
        responses,
        dimensionScores: scores.dimensionScores,
        areaScores: scores.areaScores,
        overallScore: scores.overallScore,
        overallLevel: scores.overallLevel,
        reportToken,
      });
      
      // Send email
      await sendEmail(
        lead.email,
        lead.firstName,
        reportToken,
        scores.overallScore,
        scores.overallLevel
      );
      
      res.json({
        reportToken,
        message: "Assessment submitted successfully",
      });
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      res.status(400).json({ error: "Failed to submit assessment" });
    }
  });

  // Get report by token
  app.get("/api/report/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const assessmentWithLead = await storage.getAssessmentWithLead(token);
      
      if (!assessmentWithLead) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      const model = loadMaturityModel();
      
      res.json({
        assessment: assessmentWithLead,
        lead: assessmentWithLead.lead,
        model,
      });
    } catch (error) {
      console.error("Failed to get report:", error);
      res.status(500).json({ error: "Failed to load report" });
    }
  });

  // Admin login verification
  app.post("/api/admin/verify", (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    if (username === adminUsername && password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Get all assessments (admin only)
  app.get("/api/admin/assessments", async (req, res) => {
    const username = req.headers["x-admin-username"] as string;
    const password = req.headers["x-admin-password"] as string;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const assessments = await storage.getAllAssessmentsWithLeads();
      res.json({ assessments });
    } catch (error) {
      console.error("Failed to get assessments:", error);
      res.status(500).json({ error: "Failed to load assessments" });
    }
  });

  return httpServer;
}
