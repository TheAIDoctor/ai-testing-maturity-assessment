import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { 
  BarChart3, 
  Mail, 
  Target, 
  TrendingUp, 
  Award,
  ArrowUpRight,
  Lightbulb,
  Brain,
  Users,
  Zap,
  Bot,
  Cog,
  Shield,
  ClipboardList,
  Database,
  Server,
  Gauge,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import type { MaturityModel, Assessment, Lead } from "@shared/schema";
import { calculateScoreLevel, getLevelName, getLevelFullName } from "@/lib/model";

interface ReportData {
  assessment: Assessment;
  lead: Lead;
  model: MaturityModel;
}

const areaIcons: Record<string, typeof Target> = {
  "Test Strategy": ClipboardList,
  "Test Automation": Cog,
  "Data & Environment": Database,
  "Test Management": Gauge,
  "Test Organization": Users,
};

const levelColors: Record<number, { bg: string; text: string; badge: string }> = {
  1: { bg: "bg-red-600", text: "text-white", badge: "bg-red-600 text-white" },
  2: { bg: "bg-red-200 dark:bg-red-300", text: "text-gray-900", badge: "bg-red-200 dark:bg-red-300 text-gray-900" },
  3: { bg: "bg-amber-500", text: "text-white", badge: "bg-amber-500 text-white" },
  4: { bg: "bg-green-200 dark:bg-green-300", text: "text-gray-900", badge: "bg-green-200 dark:bg-green-300 text-gray-900" },
  5: { bg: "bg-green-600", text: "text-white", badge: "bg-green-600 text-white" },
};

const levelBgColors: Record<number, string> = {
  1: "bg-red-600/10 dark:bg-red-600/20",
  2: "bg-red-200/30 dark:bg-red-300/20",
  3: "bg-amber-500/10 dark:bg-amber-500/20",
  4: "bg-green-200/30 dark:bg-green-300/20",
  5: "bg-green-600/10 dark:bg-green-600/20",
};

export default function Report() {
  const params = useParams<{ token: string }>();
  
  const { data, isLoading, error } = useQuery<ReportData>({
    queryKey: ["/api/report", params.token],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-5xl mx-auto px-6">
            <Skeleton className="h-64 mb-8" />
            <Skeleton className="h-48 mb-8" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-destructive mb-4">
                  Report not found or has expired.
                </p>
                <Link href="/">
                  <a className="text-primary hover:underline">Return to Home</a>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const { assessment, lead, model } = data;
  const overallLevel = assessment.overallLevel;
  const overallScore = assessment.overallScore;
  const areaScores = assessment.areaScores as Record<string, number>;
  const dimensionScores = assessment.dimensionScores as Record<string, number>;

  // Get current level info
  const currentLevelInfo = model.maturity_levels.find(l => l.level === overallLevel);
  
  // Get areas in order
  const areas = Array.from(new Set(model.maturity_model.map(d => d.area)));
  
  // Get dimensions grouped by area
  const dimensionsByArea = new Map<string, Array<{
    dimension: string;
    score: number;
    level: number;
    currentText: string;
    nextText: string | null;
  }>>();
  
  model.maturity_model.forEach(dim => {
    const key = `${dim.area}::${dim.dimension}`;
    const score = dimensionScores[key] || 0;
    const level = calculateScoreLevel(score);
    const dimData = {
      dimension: dim.dimension,
      score,
      level,
      currentText: dim.levels[String(level)] || "",
      nextText: level < 5 ? dim.levels[String(level + 1)] || "" : null,
    };
    
    if (!dimensionsByArea.has(dim.area)) {
      dimensionsByArea.set(dim.area, []);
    }
    dimensionsByArea.get(dim.area)!.push(dimData);
  });

  // Find top 3 opportunities (lowest scoring dimensions)
  const allDimensions = Array.from(dimensionsByArea.values()).flat();
  const opportunities = [...allDimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Get simplified model descriptions
  const simplifiedModel = model.simplified_model as Record<string, Record<string, string>>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-6">
          {/* Email Confirmation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Mail className="w-4 h-4" />
            <span>Report sent to: {lead.email}</span>
          </div>

          {/* Hero Section - Overall Score */}
          <div className="relative mb-10 rounded-xl overflow-hidden">
            <div className={`absolute inset-0 ${levelBgColors[overallLevel]}`} />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <Card className="relative border-0 bg-transparent shadow-none">
              <CardContent className="pt-8 pb-10">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-40 h-40 rounded-full bg-background shadow-lg flex flex-col items-center justify-center relative">
                      <div className={`absolute inset-2 rounded-full ${levelColors[overallLevel].bg} opacity-10`} />
                      <span className="text-5xl font-bold text-foreground relative z-10">{overallScore.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground relative z-10">out of 5.0</span>
                    </div>
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full ${levelColors[overallLevel].bg} ${levelColors[overallLevel].text} text-sm font-semibold whitespace-nowrap`}>
                      Level {overallLevel}
                    </div>
                  </div>
                  
                  {/* Level Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <Badge className="mb-3 text-sm">{getLevelFullName(model, overallLevel)}</Badge>
                    <h1 className="text-2xl md:text-3xl font-bold mb-3 font-[Space_Grotesk]">
                      Your AI Testing Maturity Assessment
                    </h1>
                    <p className="text-muted-foreground mb-6 text-lg">
                      {currentLevelInfo?.overview}
                    </p>
                    
                    {/* What to Expect & Human Focus */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-sm">What to Expect</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentLevelInfo?.what_to_expect}
                        </p>
                      </div>
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-sm">Human Focus</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currentLevelInfo?.human_focus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Legend */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
              {model.maturity_levels.map(level => (
                <div 
                  key={level.level}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    level.level === overallLevel 
                      ? `${levelColors[level.level].bg} ${levelColors[level.level].text} font-semibold shadow-md` 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <span className="font-medium">L{level.level}</span>
                  <span className="hidden sm:inline">{level.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Area Scores Overview */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6 font-[Space_Grotesk] flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Area Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map(area => {
                const score = areaScores[area] || 0;
                const level = calculateScoreLevel(score);
                const Icon = areaIcons[area] || Target;
                return (
                  <Card key={area} className="overflow-hidden">
                    <div className={`h-1 ${levelColors[level].bg}`} />
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${levelBgColors[level]} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm font-[Space_Grotesk] truncate">{area}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
                            <Badge variant="secondary" className="text-xs">
                              Level {level}
                            </Badge>
                          </div>
                          <Progress value={(score / 5) * 100} className="h-1.5 mt-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Detailed Area & Dimension Analysis */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6 font-[Space_Grotesk] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Detailed Analysis by Area
            </h2>
            
            <Accordion type="multiple" defaultValue={areas} className="space-y-4">
              {areas.map(area => {
                const score = areaScores[area] || 0;
                const level = calculateScoreLevel(score);
                const Icon = areaIcons[area] || Target;
                const dimensions = dimensionsByArea.get(area) || [];
                const areaDescription = simplifiedModel[area]?.[String(level)] || "";
                
                return (
                  <AccordionItem 
                    key={area} 
                    value={area}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${levelBgColors[level]} flex items-center justify-center shrink-0`}>
                          <Icon className="w-6 h-6 text-foreground" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg font-[Space_Grotesk]">{area}</h3>
                            <Badge className={`${levelColors[level].badge}`}>
                              Level {level} - {getLevelName(model, level)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Score: {score.toFixed(1)} / 5.0
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5">
                      {/* Area-level description */}
                      <div className={`${levelBgColors[level]} rounded-lg p-4 mb-5`}>
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm mb-1">Current Maturity State</p>
                            <p className="text-sm text-muted-foreground">{areaDescription}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dimensions within this area */}
                      <div className="space-y-4">
                        {dimensions.map((dim, idx) => (
                          <Card key={idx} className="border-l-4" style={{ borderLeftColor: `hsl(var(--primary))` }}>
                            <CardContent className="py-4">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <h4 className="font-semibold text-sm font-[Space_Grotesk]">{dim.dimension}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={(dim.score / 5) * 100} className="h-1.5 w-24" />
                                    <span className="text-sm text-muted-foreground">{dim.score.toFixed(1)}</span>
                                    <Badge variant="outline" className="text-xs">L{dim.level}</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <div className="bg-muted/30 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-medium">Current State (Level {dim.level})</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{dim.currentText}</p>
                                </div>
                                
                                {dim.nextText ? (
                                  <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ArrowUpRight className="w-4 h-4 text-primary" />
                                      <span className="text-xs font-medium">Next Level (Level {dim.level + 1})</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{dim.nextText}</p>
                                  </div>
                                ) : (
                                  <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                                    <div className="flex items-center gap-2">
                                      <Award className="w-4 h-4 text-emerald-500" />
                                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Highest level achieved!</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>

          {/* Top Opportunities */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6 font-[Space_Grotesk] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Top 3 Improvement Opportunities
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {opportunities.map((opp, idx) => (
                <Card key={idx} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${levelColors[opp.level].bg}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-[Space_Grotesk] leading-tight">
                          {opp.dimension}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{opp.score.toFixed(1)}</Badge>
                          <span>Level {opp.level}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {opp.nextText && (
                      <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/20">
                        <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          To reach Level {opp.level + 1}:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {opp.nextText}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Next Steps CTA */}
          <section className="mb-10">
            <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-8 text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2 font-[Space_Grotesk]">
                  Ready to Advance Your AI Testing Maturity?
                </h2>
                <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                  Based on your assessment, we can help you develop a roadmap to reach the next level of AI-powered testing maturity.
                </p>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">We'll be in touch soon with personalized recommendations.</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Model Info */}
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium">AI Testing Maturity Model {model.version}</p>
            <p className="mt-1">
              Assessment completed on {new Date(assessment.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="mt-3 text-xs">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md p-1 -m-1">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">AI Testing Maturity</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
