import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { BarChart3, ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { MaturityModel, Question } from "@shared/schema";
import { getAreas } from "@/lib/model";

type Responses = Record<string, number>;

interface AreaProgress {
  area: string;
  questions: Question[];
  completed: number;
  total: number;
}

export default function Assessment() {
  const [, navigate] = useLocation();
  const [responses, setResponses] = useState<Responses>(() => {
    const saved = sessionStorage.getItem("assessment_responses");
    return saved ? JSON.parse(saved) : {};
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: model, isLoading, error } = useQuery<MaturityModel>({
    queryKey: ["/api/model"],
  });

  // Save responses to session storage
  useEffect(() => {
    sessionStorage.setItem("assessment_responses", JSON.stringify(responses));
  }, [responses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <Skeleton className="h-4 w-full mb-8" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-24 w-full mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-destructive mb-4">Failed to load assessment questions.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  const questions = model.questionnaire;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(responses).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Get area progress for sidebar
  const areas = getAreas(model);
  const areaProgress: AreaProgress[] = areas.map((area) => {
    const areaQuestions = questions.filter((q) => q.area === area);
    const completed = areaQuestions.filter((q) => responses[q.id] !== undefined).length;
    return { area, questions: areaQuestions, completed, total: areaQuestions.length };
  });

  const handleSelectLevel = (level: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: level,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleComplete = () => {
    if (answeredCount === totalQuestions) {
      navigate("/lead");
    }
  };

  const canGoNext = responses[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  // Find current area
  const currentArea = currentQuestion.area;
  const currentAreaIndex = areas.indexOf(currentArea);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showProgress progressPercent={progressPercent} answered={answeredCount} total={totalQuestions} />

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-6">
          {/* Area Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {areaProgress.map((ap, idx) => {
              const isActive = ap.area === currentArea;
              const isComplete = ap.completed === ap.total;
              return (
                <Badge
                  key={ap.area}
                  variant={isActive ? "default" : isComplete ? "secondary" : "outline"}
                  className="gap-1 py-1.5 px-3"
                >
                  {isComplete && <Check className="w-3 h-3" />}
                  <span className="text-xs">{ap.area}</span>
                  <span className="text-xs opacity-70">
                    ({ap.completed}/{ap.total})
                  </span>
                </Badge>
              );
            })}
          </div>

          {/* Question Card */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.area}
              </Badge>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-xs">{currentQuestion.dimension}</span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-semibold mb-2 font-[Space_Grotesk]">
              {currentQuestion.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {currentQuestion.prompt}
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((level) => {
              const isSelected = responses[currentQuestion.id] === level;
              const optionText = currentQuestion.options[String(level)];
              
              return (
                <Card
                  key={level}
                  className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
                    isSelected
                      ? "ring-2 ring-primary bg-primary/5 border-primary"
                      : "hover:border-muted-foreground/30"
                  }`}
                  onClick={() => handleSelectLevel(level)}
                  data-testid={`option-level-${level}`}
                >
                  <CardContent className="pt-4 pb-4 px-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {level}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm leading-relaxed">{optionText}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!isLastQuestion ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="gap-2"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!allAnswered}
                  className="gap-2"
                  data-testid="button-complete"
                >
                  {allAnswered ? "Complete Assessment" : `${answeredCount}/${totalQuestions} Answered`}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({
  showProgress = false,
  progressPercent = 0,
  answered = 0,
  total = 24,
}: {
  showProgress?: boolean;
  progressPercent?: number;
  answered?: number;
  total?: number;
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md p-1 -m-1">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">AI Testing Maturity</span>
            </div>
          </Link>
          
          {showProgress && (
            <Badge variant="secondary" className="gap-1">
              {answered}/{total} Questions
            </Badge>
          )}
        </div>
        
        {showProgress && (
          <Progress value={progressPercent} className="h-2" />
        )}
      </div>
    </header>
  );
}
