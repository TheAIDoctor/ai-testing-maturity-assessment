import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8 font-[Space_Grotesk]">Privacy Policy</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-[Space_Grotesk]">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>When you complete our AI Testing Maturity Assessment, we collect the following information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>First name and last name</li>
                  <li>Email address</li>
                  <li>Company name</li>
                  <li>Professional role</li>
                  <li>Your assessment responses and calculated scores</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-[Space_Grotesk]">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>We use the information collected to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Generate and deliver your personalized maturity assessment report</li>
                  <li>Send you a secure link to access your results</li>
                  <li>Follow up with relevant content and resources (with your consent)</li>
                  <li>Improve our assessment tool and services</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-[Space_Grotesk]">Data Storage & Security</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>Your data is stored securely in our database with the following protections:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Encrypted connections for all data transmission</li>
                  <li>Secure report access via unique, randomly generated tokens</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-[Space_Grotesk]">Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>
                  We retain your assessment data for up to 2 years from the date of submission. 
                  Your report link will remain accessible during this period. After the retention 
                  period, data may be anonymized for aggregate analysis or deleted.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-[Space_Grotesk]">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access your personal data and assessment results</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent for marketing communications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-[Space_Grotesk]">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  If you have any questions about this privacy policy or wish to exercise your 
                  data rights, please contact us through the appropriate channels. We aim to 
                  respond to all requests within 30 days.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center">
            <Link href="/">
              <Button variant="outline" className="gap-2" data-testid="button-back-to-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
