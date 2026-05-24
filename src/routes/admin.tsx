import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/theme-toggle";
import { bimCurriculum } from "@/data/bimCurriculum";
import {
  ArrowLeft,
  AlertCircle,
  Award,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Layers3,
  LibraryBig,
  LogOut,
  Mail,
  Phone,
  Search,
  SearchCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });

type Student = {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: string | null;
  college_name: string | null;
  contact: string | null;
};

type ProgressRecord = {
  student_id: string;
  subject: string;
  score: number;
  notes: string | null;
  updated_at: string;
};

type CertificateRecord = {
  name: string;
  issuedAt: string;
};

function AdminDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("__all");
  const [studentStatus, setStudentStatus] = useState<string | null>(null);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [certificateNames, setCertificateNames] = useState<Record<string, string>>({});
  const [certificateStatus, setCertificateStatus] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCertificateStudent, setSelectedCertificateStudent] = useState<Student | null>(null);

  const refreshStudents = useCallback(async () => {
    setStudentStatus(null);

    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    if (roleError) {
      setStudents([]);
      setStudentStatus(`Could not read student roles: ${roleError.message}`);
      return;
    }

    const ids = (roleRows || []).map((row: { user_id: string }) => row.user_id);

    if (!ids.length) {
      setStudents([]);
      setStudentStatus("No student role rows found yet. The signup trigger or role backfill may not be applied in Supabase.");
      return;
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, date_of_birth, college_name, contact")
      .in("id", ids)
      .order("full_name", { ascending: true });

    if (profileError) {
      setStudents([]);
      setStudentStatus(`Could not read student profiles: ${profileError.message}`);
      return;
    }

    setStudents((profiles as Student[]) || []);
    if (!profiles?.length) {
      setStudentStatus("Student role rows exist, but admin cannot read matching profiles yet. Apply the admin profile read policy in Supabase.");
    }

    const { data: progressRows, error: progressError } = await supabase
      .from("progress")
      .select("student_id, subject, score, notes, updated_at")
      .in("student_id", ids)
      .in("subject", ["course_completion", "certificate"]);

    if (progressError) {
      setProgressRecords([]);
      setStudentStatus(`Could not read student progress: ${progressError.message}`);
      return;
    }

    setProgressRecords((progressRows as ProgressRecord[]) || []);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/auth" });
      else if (role && role !== "admin") navigate({ to: "/student" });
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (role !== "admin") return;

    refreshStudents();
  }, [role, refreshStudents]);

  useEffect(() => {
    if (role !== "admin") return;

    const channel = supabase
      .channel("admin-student-records")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refreshStudents)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, refreshStudents)
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshStudents();
    };

    window.addEventListener("focus", refreshStudents);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", refreshStudents);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [role, refreshStudents]);

  const phases = useMemo(
    () => Array.from(new Set(bimCurriculum.map((module) => module.phase))),
    [],
  );

  const totalLessons = useMemo(
    () => bimCurriculum.reduce((total, module) => total + module.lessons.length, 0),
    [],
  );

  const totalLessonQuizQuestions = useMemo(
    () =>
      bimCurriculum.reduce(
        (total, module) =>
          total + module.lessons.reduce((sum, lesson) => sum + lesson.quiz.length, 0),
        0,
      ),
    [],
  );

  const totalModuleQuizQuestions = useMemo(
    () => bimCurriculum.reduce((total, module) => total + module.moduleQuiz.length, 0),
    [],
  );

  const collegeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          students
            .map((student) => student.college_name?.trim())
            .filter((college): college is string => Boolean(college)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        [student.full_name, student.email, student.college_name, student.contact]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      const matchesCollege =
        collegeFilter === "__all" || student.college_name === collegeFilter;

      return matchesSearch && matchesCollege;
    });
  }, [students, studentSearch, collegeFilter]);

  const completeProfiles = useMemo(
    () => students.filter((student) => getProfileCompletion(student) === 100).length,
    [students],
  );

  const courseProgressByStudent = useMemo(
    () =>
      new Map(
        progressRecords
          .filter((record) => record.subject === "course_completion")
          .map((record) => [record.student_id, Math.round(Number(record.score) || 0)]),
      ),
    [progressRecords],
  );

  const certificatesByStudent = useMemo(
    () =>
      new Map(
        progressRecords
          .filter((record) => record.subject === "certificate")
          .map((record) => [record.student_id, parseCertificate(record.notes)]),
      ),
    [progressRecords],
  );

  const completedCourseStudents = useMemo(
    () => students.filter((student) => (courseProgressByStudent.get(student.id) || 0) >= 100),
    [courseProgressByStudent, students],
  );

  const phaseSummaries = useMemo(
    () =>
      phases.map((phase) => {
        const modules = bimCurriculum.filter((module) => module.phase === phase);
        const lessons = modules.reduce((total, module) => total + module.lessons.length, 0);
        const quizzes = modules.reduce(
          (total, module) =>
            total +
            module.moduleQuiz.length +
            module.lessons.reduce((sum, lesson) => sum + lesson.quiz.length, 0),
          0,
        );

        return {
          phase,
          modules: modules.length,
          lessons,
          quizzes,
        };
      }),
    [phases],
  );

  async function issueCertificate(student: Student) {
    const courseScore = courseProgressByStudent.get(student.id) || 0;
    if (courseScore < 100) {
      setCertificateStatus("Certificate unlocks only after the student completes the full course.");
      return;
    }

    const certificateName = (certificateNames[student.id] || student.full_name || "").trim();
    if (!certificateName) {
      setCertificateStatus("Enter the student name to print on the certificate.");
      return;
    }

    setCertificateStatus(null);
    const notes = JSON.stringify({
      name: certificateName,
      issuedAt: new Date().toISOString(),
    });

    const { error } = await supabase.from("progress").upsert(
      {
        student_id: student.id,
        subject: "certificate",
        score: 100,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,subject" }
    );

    if (error) {
      setCertificateStatus(`Could not issue certificate: ${error.message}`);
      return;
    }

    await refreshStudents();
    setCertificateStatus(`Certificate issued for ${certificateName}.`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Link>
            </Button>

            <img
              src={logo}
              alt="SkillArion logo"
              className="h-10 w-10 rounded-xl bg-white object-contain p-1"
            />

            <div>
              <h1 className="text-lg font-semibold leading-tight">BIM Admin Dashboard</h1>
              <p className="text-xs text-primary-foreground/75">SkillArion learning control center</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground" />

            <Button
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              variant="outline"
              className="border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-6 py-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Users}
            title="Registered Students"
            value={students.length}
            detail="Student accounts in Supabase"
          />
          <MetricCard
            icon={UserCheck}
            title="Complete Profiles"
            value={completeProfiles}
            detail="Students with all profile fields"
          />
          <MetricCard
            icon={Layers3}
            title="Curriculum Modules"
            value={bimCurriculum.length}
            detail="Full BIM learning path"
          />
          <MetricCard
            icon={BookOpenCheck}
            title="Lessons"
            value={totalLessons}
            detail="Sequential lesson content"
          />
          <MetricCard
            icon={ClipboardList}
            title="Quiz Questions"
            value={totalLessonQuizQuestions + totalModuleQuizQuestions}
            detail={`${totalLessonQuizQuestions} lesson + ${totalModuleQuizQuestions} module`}
          />
          <MetricCard
            icon={Award}
            title="Certificate Ready"
            value={completedCourseStudents.length}
            detail="Students at 100% course completion"
          />
        </section>

        <Card className="overflow-hidden border-secondary/30">
          <CardHeader className="bg-muted/35">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <GraduationCap className="h-5 w-5" />
                  Admin Overview
                </CardTitle>
                <CardDescription>
                  Manage students, review curriculum coverage, and issue certificates after full course completion.
                </CardDescription>
              </div>
              <Badge className="bg-secondary text-secondary-foreground">
                {phases.length} learning phases
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="students" className="w-full">
              <div className="border-b border-border px-6 pt-5">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="phases">Phases</TabsTrigger>
                  <TabsTrigger value="certificates">Certification</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="students" className="m-0 space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Student Records</h2>
                    <p className="text-sm text-muted-foreground">
                      Search students, filter by college, and check profile readiness.
                    </p>
                  </div>
                  <Badge variant="outline">
                    Showing {filteredStudents.length} of {students.length}
                  </Badge>
                </div>

                <div className="grid gap-3 rounded-2xl border border-border bg-muted/25 p-4 md:grid-cols-[1fr_260px_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={studentSearch}
                      onChange={(event) => setStudentSearch(event.target.value)}
                      placeholder="Search by name, email, college, or contact"
                      className="pl-9"
                    />
                  </div>

                  <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by college" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All colleges</SelectItem>
                      {collegeOptions.map((college) => (
                        <SelectItem key={college} value={college}>
                          {college}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setStudentSearch("");
                      setCollegeFilter("__all");
                    }}
                    disabled={!studentSearch && collegeFilter === "__all"}
                  >
                    <X className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>

                {studentStatus && (
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Student records need a database update</p>
                      <p className="mt-1 text-muted-foreground">{studentStatus}</p>
                    </div>
                  </div>
                )}

                {students.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No students yet"
                    text="The search and filter tools are ready. Student profile cards will appear here after students sign up."
                  />
                ) : (
                  <>
                    {filteredStudents.length === 0 ? (
                      <EmptyState
                        icon={Search}
                        title="No matching students"
                        text="Try clearing the search or choosing a different college."
                      />
                    ) : (
                      <StudentTable
                        students={filteredStudents}
                        courseProgressByStudent={courseProgressByStudent}
                        onViewStudent={setSelectedStudent}
                      />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="phases" className="m-0 space-y-5 p-6">
                <div>
                  <h2 className="text-xl font-bold text-primary">Phase Coverage</h2>
                  <p className="text-sm text-muted-foreground">
                    Quick view of how the 45-day BIM curriculum is distributed.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {phaseSummaries.map((phase, index) => {
                    const percent = Math.round((phase.modules / bimCurriculum.length) * 100);

                    return (
                      <Card key={phase.phase} className="border-border/80">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                                Phase {index + 1}
                              </p>
                              <CardTitle className="mt-1 text-primary">
                                {phase.phase.replace(/^Phase \d+:\s*/, "")}
                              </CardTitle>
                            </div>
                            <Badge>{phase.modules} modules</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Progress value={percent} />
                          <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <MiniStat label="Modules" value={phase.modules} />
                            <MiniStat label="Lessons" value={phase.lessons} />
                            <MiniStat label="Questions" value={phase.quizzes} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="border-secondary/30 bg-secondary/10">
                  <CardContent className="flex flex-wrap items-center gap-3 p-5 text-sm text-foreground">
                    <SearchCheck className="h-5 w-5 text-secondary" />
                    Real student completion analytics will appear here after we connect lesson and quiz progress to Supabase.
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificates" className="m-0 space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Certification</h2>
                    <p className="text-sm text-muted-foreground">
                      Certificates unlock only after the student completes every lesson quiz and module quiz.
                    </p>
                  </div>
                  <Badge variant="outline">
                    {completedCourseStudents.length} ready
                  </Badge>
                </div>

                {certificateStatus && (
                  <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-sm text-foreground">
                    {certificateStatus}
                  </div>
                )}

                {students.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="No students available"
                    text="Student certificate controls will appear after students sign up."
                  />
                ) : (
                  <CertificateTable
                    students={students}
                    courseProgressByStudent={courseProgressByStudent}
                    certificatesByStudent={certificatesByStudent}
                    onOpenCertificate={setSelectedCertificateStudent}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <StudentDetailsDialog
          student={selectedStudent}
          courseScore={
            selectedStudent
              ? courseProgressByStudent.get(selectedStudent.id) || 0
              : 0
          }
          onOpenChange={(open) => {
            if (!open) setSelectedStudent(null);
          }}
        />
        <CertificateDialog
          student={selectedCertificateStudent}
          courseScore={
            selectedCertificateStudent
              ? courseProgressByStudent.get(selectedCertificateStudent.id) || 0
              : 0
          }
          certificate={
            selectedCertificateStudent
              ? certificatesByStudent.get(selectedCertificateStudent.id) || null
              : null
          }
          certificateName={
            selectedCertificateStudent
              ? certificateNames[selectedCertificateStudent.id] ??
                selectedCertificateStudent.full_name ??
                ""
              : ""
          }
          onCertificateNameChange={(value) => {
            if (!selectedCertificateStudent) return;
            setCertificateNames((current) => ({
              ...current,
              [selectedCertificateStudent.id]: value,
            }));
          }}
          onIssueCertificate={() => {
            if (selectedCertificateStudent) {
              issueCertificate(selectedCertificateStudent);
            }
          }}
          onOpenChange={(open) => {
            if (!open) setSelectedCertificateStudent(null);
          }}
        />
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: typeof Users;
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card className="border-secondary/25 bg-card/90 shadow-sm transition hover:-translate-y-1 hover:border-secondary hover:shadow-xl">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/15 text-secondary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-3xl font-bold text-primary">{value}</div>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentTable({
  students,
  courseProgressByStudent,
  onViewStudent,
}: {
  students: Student[];
  courseProgressByStudent: Map<string, number>;
  onViewStudent: (student: Student) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">College</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Profile</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const profileCompletion = getProfileCompletion(student);
              const courseScore = courseProgressByStudent.get(student.id) || 0;

              return (
                <tr key={student.id} className="transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary">
                      {student.full_name || "Student"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.email}
                  </td>
                  <td className="px-4 py-3">{student.college_name || "-"}</td>
                  <td className="px-4 py-3">{student.contact || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={profileCompletion === 100 ? "default" : "outline"}>
                      {profileCompletion}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={courseScore >= 100 ? "default" : "outline"}>
                      {courseScore}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => onViewStudent(student)}>
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentDetailsDialog({
  student,
  courseScore,
  onOpenChange,
}: {
  student: Student | null;
  courseScore: number;
  onOpenChange: (open: boolean) => void;
}) {
  if (!student) return null;

  const profileCompletion = getProfileCompletion(student);

  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {student.full_name || "Student"}
          </DialogTitle>
          <DialogDescription>{student.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 text-sm sm:grid-cols-2">
            <Info icon={Building2} label="College" value={student.college_name} />
            <Info icon={Phone} label="Contact" value={student.contact} />
            <Info icon={CalendarDays} label="Date of Birth" value={student.date_of_birth} />
            <Info icon={UserCheck} label="Role" value="Student" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile completion</span>
                <span className="font-semibold text-primary">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} />
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Course progress</span>
                <span className="font-semibold text-primary">{courseScore}%</span>
              </div>
              <Progress value={courseScore} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={`mailto:${student.email}`}>
                <Mail className="mr-2 h-4 w-4" /> Email
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" disabled={!student.contact}>
              <a href={student.contact ? `tel:${student.contact}` : undefined}>
                <Phone className="mr-2 h-4 w-4" /> Call
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CertificateTable({
  students,
  courseProgressByStudent,
  certificatesByStudent,
  onOpenCertificate,
}: {
  students: Student[];
  courseProgressByStudent: Map<string, number>;
  certificatesByStudent: Map<string, CertificateRecord | null>;
  onOpenCertificate: (student: Student) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Certificate</th>
              <th className="px-4 py-3 font-semibold">Issued Name</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const courseScore = courseProgressByStudent.get(student.id) || 0;
              const isReady = courseScore >= 100;
              const certificate = certificatesByStudent.get(student.id);

              return (
                <tr key={student.id} className="transition hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary">
                      {student.full_name || "Student"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isReady ? "default" : "outline"}>
                      {courseScore}% complete
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={certificate ? "default" : isReady ? "outline" : "secondary"}
                    >
                      {certificate ? "Issued" : isReady ? "Ready" : "Locked"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {certificate?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={isReady ? "default" : "outline"}
                      onClick={() => onOpenCertificate(student)}
                    >
                      {certificate ? "Update" : isReady ? "Issue" : "View"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CertificateDialog({
  student,
  courseScore,
  certificate,
  certificateName,
  onCertificateNameChange,
  onIssueCertificate,
  onOpenChange,
}: {
  student: Student | null;
  courseScore: number;
  certificate: CertificateRecord | null;
  certificateName: string;
  onCertificateNameChange: (value: string) => void;
  onIssueCertificate: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  if (!student) return null;

  const isReady = courseScore >= 100;

  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {student.full_name || "Student"} Certificate
          </DialogTitle>
          <DialogDescription>{student.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border border-border p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Course completion</span>
              <span className="font-semibold text-primary">{courseScore}%</span>
            </div>
            <Progress value={courseScore} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Name to print on certificate
            </label>
            <Input
              value={certificateName}
              onChange={(event) => onCertificateNameChange(event.target.value)}
              placeholder="Enter certificate name"
              disabled={!isReady}
            />
          </div>

          {certificate ? (
            <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-3 text-sm">
              <p className="font-semibold text-primary">
                Certificate issued to {certificate.name}
              </p>
              <p className="text-muted-foreground">
                Issued {new Date(certificate.issuedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isReady
                ? "Enter the exact name and issue the certificate."
                : "Locked until full course completion."}
            </p>
          )}

          <Button
            onClick={onIssueCertificate}
            disabled={!isReady}
            className="w-full"
          >
            <Award className="mr-2 h-4 w-4" />
            {certificate ? "Update certificate" : "Issue certificate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 truncate font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

function getProfileCompletion(student: Student) {
  const fields = [
    student.full_name,
    student.email,
    student.date_of_birth,
    student.college_name,
    student.contact,
  ];
  const filled = fields.filter((value) => Boolean(value?.trim())).length;

  return Math.round((filled / fields.length) * 100);
}

function parseCertificate(notes: string | null): CertificateRecord | null {
  if (!notes) return null;

  try {
    const parsed = JSON.parse(notes) as Partial<CertificateRecord>;
    if (!parsed.name || !parsed.issuedAt) return null;
    return {
      name: parsed.name,
      issuedAt: parsed.issuedAt,
    };
  } catch {
    return null;
  }
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof LibraryBig;
  title: string;
  text: string;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary/15 text-secondary">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-bold text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
