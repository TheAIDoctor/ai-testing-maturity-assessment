import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import { BarChart3, Loader2, Mail, User, Building2, Briefcase } from "lucide-react";
import { leadFormSchema, type LeadFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface SubmitResponse {
  reportToken: string;
  message: string;
}

export default function Lead() {
  const [, navigate] = useLocation();
  const [responses, setResponses] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = sessionStorage.getItem("assessment_responses");
    if (saved) {
      setResponses(JSON.parse(saved));
    } else {
      // No responses, redirect back to assessment
      navigate("/assessment");
    }
  }, [navigate]);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      role: "",
      consent: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const response = await apiRequest("POST", "/api/assessment/submit", {
        lead: data,
        responses,
      });
      return response.json() as Promise<SubmitResponse>;
    },
    onSuccess: (data) => {
      // Clear session storage
      sessionStorage.removeItem("assessment_responses");
      // Navigate to report
      navigate(`/report/${data.reportToken}`);
    },
  });

  const onSubmit = (data: LeadFormData) => {
    submitMutation.mutate(data);
  };

  // Check if we have responses
  const hasResponses = Object.keys(responses).length === 24;

  if (!hasResponses) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Please complete the assessment before viewing your results.
            </p>
            <Link href="/assessment">
              <Button data-testid="button-start-assessment">Start Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
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

      <main className="py-12 md:py-16">
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 font-[Space_Grotesk]">
              Almost There!
            </h1>
            <p className="text-muted-foreground">
              Enter your details to receive your personalized assessment report.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-[Space_Grotesk]">Your Details</CardTitle>
              <CardDescription>
                We'll email you a secure link to your results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="John"
                                className="pl-9"
                                data-testid="input-first-name"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Smith"
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="john@company.com"
                              className="pl-9"
                              data-testid="input-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="Acme Inc."
                              className="pl-9"
                              data-testid="input-company"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="QA Manager"
                              className="pl-9"
                              data-testid="input-role"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-consent"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I agree to receive my assessment results via email and allow follow-up 
                            communication about AI testing resources.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {submitMutation.error && (
                    <p className="text-sm text-destructive">
                      {submitMutation.error instanceof Error
                        ? submitMutation.error.message
                        : "An error occurred. Please try again."}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Get My Results"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By submitting, you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
