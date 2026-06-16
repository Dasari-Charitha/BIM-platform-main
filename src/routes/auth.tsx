import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const isSupabaseConfigured = true;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const ADMIN_EMAIL = "skillariondevelopment9@gmail.com";
const ADMIN_PASSWORD = "skill@123";

function PasswordInput({
  id,
  name,
  required,
  defaultValue,
}: {
  id: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name={name ?? id}
        type={show ? "text" : "password"}
        required={required}
        defaultValue={defaultValue}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export const Route = createFileRoute("/auth")({ component: AuthPage });

const baseSignupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Name required").max(100),
    email: z.string().trim().email().max(255),
    password: z.string().min(8, "Min 8 characters").max(72),
    confirm: z.string(),
    role: z.enum(["student", "admin"]),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

const studentSignupSchema = baseSignupSchema.and(
  z.object({
    date_of_birth: z.string().min(1, "Date of birth required"),
    college_name: z.string().trim().min(2, "College required").max(150),
    contact: z.string().trim().min(7, "Contact required").max(20),
  })
);

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  role: z.enum(["student", "admin"]),
});

const resetRequestSchema = z.object({
  email: z.string().trim().email(),
});

const passwordUpdateSchema = z
  .object({
    password: z.string().min(8, "Min 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function AuthPage() {
  const navigate = useNavigate();
  const { user, role: currentRole, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [roleTab, setRoleTab] = useState<"student" | "admin">("student");
  const [submitting, setSubmitting] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [passwordResetMode, setPasswordResetMode] = useState(isPasswordRecoveryUrl);

  useEffect(() => {
    if (isPasswordRecoveryUrl()) {
      setPasswordResetMode(true);
      setTab("login");
      setAuthNotice("Enter a new password for your account.");
    }
  }, []);

  useEffect(() => {
    if (roleTab === "admin" && tab === "signup") {
      setTab("login");
    }
  }, [roleTab, tab]);

  useEffect(() => {
    if (passwordResetMode) return;

    if (!loading && user && currentRole) {
      navigate({ to: currentRole === "admin" ? "/admin" : "/student" });
    }
  }, [user, currentRole, loading, navigate, passwordResetMode]);

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
    if (roleTab === "admin") {
      toast.error("Admin signup is disabled. Use the existing admin login.");
      setTab("login");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const values = {
      full_name: String(fd.get("full_name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      confirm: String(fd.get("confirm") || ""),
      role: roleTab,
    };
    const studentDetails = {
      date_of_birth: String(fd.get("date_of_birth") || ""),
      college_name: String(fd.get("college_name") || ""),
      contact: String(fd.get("contact") || ""),
    };
    const parsed = studentSignupSchema.safeParse({
      ...values,
      ...studentDetails,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    setAuthNotice(null);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          date_of_birth:
            parsed.data.role === "student" ? studentDetails.date_of_birth : null,
          college_name:
            parsed.data.role === "student" ? studentDetails.college_name : null,
          contact: parsed.data.role === "student" ? studentDetails.contact : null,
          role: parsed.data.role,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      const message =
        "Account created. You can now log in with the same email and password.";
      setTab("login");
      setAuthNotice(message);
      toast.success(message);
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
    setAuthNotice(null);



    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error || !data.user) {
      setSubmitting(false);
      const message =
        error?.message?.toLowerCase().includes("email not confirmed")
          ? "This account is not active yet. Ask the admin to confirm it or sign up again after email confirmation is disabled."
          : error?.message || "Login failed";
      setAuthNotice(message);
      toast.error(message);
      return;
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();
    setSubmitting(false);
    if (roleRow?.role && roleRow.role !== parsed.data.role) {
      await supabase.auth.signOut();
      toast.error(`This account is not a ${parsed.data.role}.`);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: parsed.data.role === "admin" ? "/admin" : "/student" });

  }

  async function handleResetRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = resetRequestSchema.safeParse({
      email: String(fd.get("reset_email") || ""),
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    setAuthNotice(null);
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      {
        redirectTo: `${window.location.origin}/auth`,
      }
    );
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const message = "Password reset link sent. Check your email.";
    setAuthNotice(message);
    toast.success(message);
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = passwordUpdateSchema.safeParse({
      password: String(fd.get("new_password") || ""),
      confirm: String(fd.get("new_confirm") || ""),
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    setAuthNotice(null);
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.auth.signOut();
    window.history.replaceState({}, document.title, "/auth");
    setPasswordResetMode(false);
    setTab("login");
    const message = "Password updated. Please log in with your new password.";
    setAuthNotice(message);
    toast.success(message);
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
            {authNotice && (
              <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm font-medium text-primary">
                {authNotice}
              </div>
            )}

            {passwordResetMode ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <FormField id="new_password" label="New Password" type="password" />
                <FormField
                  id="new_confirm"
                  label="Re-enter New Password"
                  type="password"
                />
                <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {submitting ? "Updating..." : "Update password"}
                </Button>
              </form>
            ) : (
              <>
            <Tabs value={roleTab} onValueChange={(v) => setRoleTab(v as "student" | "admin")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className={`grid w-full ${roleTab === "student" ? "grid-cols-2" : "grid-cols-1"}`}>
                <TabsTrigger value="login">Login</TabsTrigger>
                {roleTab === "student" && (
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="login">
                <form key={roleTab} onSubmit={handleLogin} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="li-email">Email</Label>
                    <Input
                      id="li-email"
                      name="email"
                      type="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="li-password">Password</Label>
                    <PasswordInput
                      id="li-password"
                      name="password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? "Signing in…" : `Login as ${roleTab}`}
                  </Button>
                </form>

                <div className="mt-4 border-t border-border pt-4">
                  {!forgotPassword ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  ) : (
                    <form onSubmit={handleResetRequest} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="reset_email">Email</Label>
                        <Input
                          id="reset_email"
                          name="reset_email"
                          type="email"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setForgotPassword(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? "Sending..." : "Send link"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="mt-4 space-y-4">
                  <FormField id="full_name" label="Full Name" />
                  <FormField id="email" label="Email" type="email" />
                  {roleTab === "student" && (
                    <>
                      <FormField id="date_of_birth" label="Date of Birth" type="date" />
                      <FormField id="college_name" label="College Name" />
                      <FormField id="contact" label="Contact Number" type="tel" />
                    </>
                  )}
                  <FormField id="password" label="Password" type="password" />
                  <FormField id="confirm" label="Re-enter Password" type="password" />
                  <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    {submitting ? "Creating…" : `Sign up as ${roleTab}`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormField({ id, label, type = "text" }: { id: string; label: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {type === "password" ? (
        <PasswordInput id={id} required />
      ) : (
        <Input id={id} name={id} type={type} required />
      )}
    </div>
  );
}

function isPasswordRecoveryUrl() {
  if (typeof window === "undefined") return false;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);

  return (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery"
  );
}
