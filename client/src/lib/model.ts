import type { MaturityModel, Question } from "@shared/schema";

// This will be loaded from the API
let cachedModel: MaturityModel | null = null;

export async function loadModel(): Promise<MaturityModel> {
  if (cachedModel) return cachedModel;
  
  const response = await fetch('/api/model');
  if (!response.ok) {
    throw new Error('Failed to load maturity model');
  }
  cachedModel = await response.json();
  return cachedModel!;
}

export function getQuestionsByArea(model: MaturityModel): Map<string, Question[]> {
  const byArea = new Map<string, Question[]>();
  
  for (const question of model.questionnaire) {
    const existing = byArea.get(question.area) || [];
    existing.push(question);
    byArea.set(question.area, existing);
  }
  
  return byArea;
}

export function getQuestionsByDimension(model: MaturityModel): Map<string, Question[]> {
  const byDimension = new Map<string, Question[]>();
  
  for (const question of model.questionnaire) {
    const key = `${question.area}::${question.dimension}`;
    const existing = byDimension.get(key) || [];
    existing.push(question);
    byDimension.set(key, existing);
  }
  
  return byDimension;
}

export function getDimensionRubric(model: MaturityModel, area: string, dimension: string, level: number): string {
  const dim = model.maturity_model.find(d => d.area === area && d.dimension === dimension);
  if (!dim) return "";
  return dim.levels[String(level)] || "";
}

export function getLevelName(model: MaturityModel, level: number): string {
  const maturityLevel = model.maturity_levels.find(l => l.level === level);
  return maturityLevel?.name || `Level ${level}`;
}

export function getLevelFullName(model: MaturityModel, level: number): string {
  const maturityLevel = model.maturity_levels.find(l => l.level === level);
  return maturityLevel?.name_full || `Level ${level}`;
}

export function getLevelOverview(model: MaturityModel, level: number): string {
  const maturityLevel = model.maturity_levels.find(l => l.level === level);
  return maturityLevel?.overview || "";
}

export function calculateScoreLevel(score: number): number {
  if (score < 1.5) return 1;
  if (score < 2.5) return 2;
  if (score < 3.5) return 3;
  if (score < 4.5) return 4;
  return 5;
}

export function getAreas(model: MaturityModel): string[] {
  const areas = new Set<string>();
  for (const question of model.questionnaire) {
    areas.add(question.area);
  }
  return Array.from(areas);
}

export function getDimensions(model: MaturityModel, area: string): string[] {
  const dimensions = new Set<string>();
  for (const question of model.questionnaire) {
    if (question.area === area) {
      dimensions.add(question.dimension);
    }
  }
  return Array.from(dimensions);
}
