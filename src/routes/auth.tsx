import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Name required").max(100),
    email: z.string().trim().email().max(255),
    date_of_birth: z.string().min(1, "Date of birth required"),
    college_name: z.string().trim().min(2, "College required").max(150),
    contact: z.string().trim().min(7, "Contact required").max(20),
    password: z.string().min(8, "Min 8 characters").max(72),
    confirm: z.string(),
    role: z.enum(["student", "admin"]),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  role: z.enum(["student", "admin"]),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, role: currentRole, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [roleTab, setRoleTab] = useState<"student" | "admin">("student");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && currentRole) {
      navigate({ to: currentRole === "admin" ? "/admin" : "/student" });
    }
  }, [user, currentRole, loading, navigate]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-10">
          <div className="mb-4 flex w-full items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <ThemeToggle className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
          </div>
          <Card className="w-full border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Authentication is not configured</CardTitle>
              <CardDescription>
                Add your Supabase keys in a .env.local file, then restart the dev server.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = {
      full_name: String(fd.get("full_name") || ""),
      email: String(fd.get("email") || ""),
      date_of_birth: String(fd.get("date_of_birth") || ""),
      college_name: String(fd.get("college_name") || ""),
      contact: String(fd.get("contact") || ""),
      password: String(fd.get("password") || ""),
      confirm: String(fd.get("confirm") || ""),
      role: roleTab,
    };
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          date_of_birth: parsed.data.date_of_birth,
          college_name: parsed.data.college_name,
          contact: parsed.data.contact,
          role: parsed.data.role,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Signing you in…");
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      role: roleTab,
    };
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error || !data.user) {
      setSubmitting(false);
      toast.error(error?.message || "Login failed");
      return;
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();
    setSubmitting(false);
    if (roleRow?.role !== parsed.data.role) {
      await supabase.auth.signOut();
      toast.error(`This account is not a ${parsed.data.role}.`);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: roleRow.role === "admin" ? "/admin" : "/student" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex max-w-md flex-col items-center px-4 py-10">
        <div className="mb-4 flex w-full items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <ThemeToggle className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
        </div>
        <Link to="/" className="mb-6 flex items-center gap-3">
          <img
            src={logo}
            alt="SkillArion logo"
            className="h-14 w-14 rounded-xl bg-white object-contain p-1 shadow-md ring-2 ring-secondary"
          />
          <div>
            <span className="block text-xl font-bold text-primary">
              SkillArion BIM Portal
            </span>
            <span className="block text-sm font-semibold text-muted-foreground">
              Building Information Modeling
            </span>
          </div>
        </Link>
        <Card className="w-full border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-primary">Welcome to SkillArion BIM</CardTitle>
            <CardDescription>Sign in or create your BIM learning account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={roleTab} onValueChange={(v) => setRoleTab(v as "student" | "admin")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="li-email">Email</Label>
                    <Input id="li-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="li-password">Password</Label>
                    <Input id="li-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? "Signing in…" : `Login as ${roleTab}`}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="mt-4 space-y-4">
                  <Field id="full_name" label="Full Name" />
                  <Field id="email" label="Email" type="email" />
                  <Field id="date_of_birth" label="Date of Birth" type="date" />
                  <Field id="college_name" label="College Name" />
                  <Field id="contact" label="Contact Number" type="tel" />
                  <Field id="password" label="Password" type="password" />
                  <Field id="confirm" label="Re-enter Password" type="password" />
                  <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? "Creating…" : `Sign up as ${roleTab}`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ id, label, type = "text" }: { id: string; label: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required />
    </div>
  );
}
