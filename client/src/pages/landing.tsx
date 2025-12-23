import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Clock, Target, BarChart3, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">AI Testing Maturity</span>
          </div>
          <Link href="/privacy">
            <Button variant="ghost" size="sm" data-testid="link-privacy">
              Privacy
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Free Assessment Tool
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 font-[Space_Grotesk]">
              Assess Your AI Testing Maturity
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover where your organization stands in the AI testing journey. Get personalized insights 
              and actionable recommendations to accelerate your testing capabilities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/assessment">
                <Button size="lg" className="gap-2" data-testid="button-start-assessment">
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Badge variant="outline" className="gap-2 py-2 px-4">
                <Clock className="w-4 h-4" />
                <span>~10 minutes</span>
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 border-t bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-[Space_Grotesk]">24 Expert Questions</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Carefully crafted questions covering 5 key areas: Test Strategy, Automation, 
                  Data & Environment, Management, and Organization.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-[Space_Grotesk]">Detailed Analysis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Receive a comprehensive breakdown of your maturity across 12 dimensions with 
                  actionable insights for improvement.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-[Space_Grotesk]">Secure & Private</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your data is encrypted and stored securely. We only use your information 
                  to deliver your personalized results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Maturity Levels Preview */}
      <section className="py-12 md:py-16 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-[Space_Grotesk]">
              Five Levels of AI Testing Maturity
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understand where your organization falls on the maturity spectrum
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { level: 1, name: "No AI Use", desc: "Fully manual testing processes" },
              { level: 2, name: "Ad-hoc Usage", desc: "Occasional GenAI for specific tasks" },
              { level: 3, name: "AI Workflows", desc: "Integrated AI automation" },
              { level: 4, name: "Agentic AI", desc: "Autonomous agents with oversight" },
              { level: 5, name: "Multi-Agent", desc: "Fully autonomous AI teams" },
            ].map((item) => (
              <Card key={item.level} className="relative overflow-visible">
                <CardContent className="pt-6 pb-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    {item.level}
                  </div>
                  <h3 className="font-semibold mb-1 text-sm font-[Space_Grotesk]">{item.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-12 md:py-16 border-t bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-[Space_Grotesk]">
              What You'll Receive
            </h2>
            <div className="space-y-4">
              {[
                "Overall maturity score with level classification",
                "Detailed breakdown across 5 key testing areas",
                "Analysis of all 12 testing dimensions",
                "Personalized 'What this means' explanations",
                "Clear 'Next level' improvement roadmap",
                "Top 3 opportunities for quick wins",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Link href="/assessment">
                <Button size="lg" className="gap-2" data-testid="button-start-assessment-bottom">
                  Begin Your Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>AI Testing Maturity Model v0.4</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/admin" className="hover:underline" data-testid="link-admin">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
