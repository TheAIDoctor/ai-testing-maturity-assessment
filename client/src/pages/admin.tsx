import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import { BarChart3, Lock, ExternalLink, Users } from "lucide-react";
import type { Assessment, Lead } from "@shared/schema";

interface AdminData {
  assessments: (Assessment & { lead: Lead })[];
}

interface AdminCredentials {
  username: string;
  password: string;
}

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setAuthError("");
        setCredentials({ username, password });
        sessionStorage.setItem("admin_auth", JSON.stringify({ username, password }));
      } else {
        setAuthError("Invalid username or password");
      }
    } catch {
      setAuthError("Authentication failed");
    }
  };

  useState(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved) {
      try {
        const creds = JSON.parse(saved) as AdminCredentials;
        fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(creds),
        }).then(res => {
          if (res.ok) {
            setIsAuthenticated(true);
            setCredentials(creds);
          }
        });
      } catch {
        sessionStorage.removeItem("admin_auth");
      }
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-[Space_Grotesk]">Admin Access</CardTitle>
            <CardDescription>
              Enter your credentials to view assessment data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-admin-username"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
              {authError && (
                <p className="text-sm text-destructive">{authError}</p>
              )}
              <Button type="submit" className="w-full" data-testid="button-admin-login">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard credentials={credentials!} />;
}

function AdminDashboard({ credentials }: { credentials: AdminCredentials }) {
  const { data, isLoading, error } = useQuery<AdminData>({
    queryKey: ["/api/admin/assessments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/assessments", {
        headers: {
          "X-Admin-Username": credentials.username,
          "X-Admin-Password": credentials.password,
        },
      });
      if (!response.ok) throw new Error("Failed to load");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <div className="max-w-6xl mx-auto px-6">
            <Skeleton className="h-12 w-48 mb-6" />
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
        <main className="py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-destructive">Failed to load assessment data.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold font-[Space_Grotesk]">Assessment Leads</h1>
            </div>
            <Badge variant="secondary">{data.assessments.length} Total</Badge>
          </div>

          {data.assessments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No assessments yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="w-[80px]">Report</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.assessments.map((item) => (
                      <TableRow key={item.id} data-testid={`row-assessment-${item.id}`}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString()}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.lead.firstName} {item.lead.lastName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <a href={`mailto:${item.lead.email}`} className="hover:underline text-primary">
                            {item.lead.email}
                          </a>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{item.lead.company}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.lead.role}</TableCell>
                        <TableCell className="font-mono">
                          {item.overallScore.toFixed(1)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {item.overallLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/report/${item.reportToken}`} target="_blank">
                            <Button size="icon" variant="ghost" data-testid={`button-view-report-${item.id}`}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
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
        <Badge variant="secondary">Admin</Badge>
      </div>
    </header>
  );
}
