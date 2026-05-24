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
  Send,
  Trash2,
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

type CourseRelease = {
  released_at: string | null;
  released_by: string | null;
  updated_at: string | null;
};

function AdminDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("__all");
  const [studentStatus, setStudentStatus] = useState<string | null>(null);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [courseRelease, setCourseRelease] = useState<CourseRelease | null>(null);
  const [releaseStatus, setReleaseStatus] = useState<string | null>(null);

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

  const refreshCourseRelease = useCallback(async () => {
    const { data, error } = await supabase
      .from("course_settings")
      .select("released_at, released_by, updated_at")
      .eq("id", "bim_course")
      .maybeSingle();

    if (error) {
      setReleaseStatus(`Could not read release settings: ${error.message}`);
      return;
    }

    setCourseRelease(data);
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
    refreshCourseRelease();
  }, [role, refreshCourseRelease, refreshStudents]);

  useEffect(() => {
    if (role !== "admin") return;

    const channel = supabase
      .channel("admin-student-records")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refreshStudents)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, refreshStudents)
      .on("postgres_changes", { event: "*", schema: "public", table: "course_settings" }, refreshCourseRelease)
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshStudents();
        refreshCourseRelease();
      }
    };

    const handleFocus = () => {
      refreshStudents();
      refreshCourseRelease();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [role, refreshCourseRelease, refreshStudents]);

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

  const releaseDate = courseRelease?.released_at
    ? new Date(courseRelease.released_at)
    : null;
  const releaseSummary = releaseDate
    ? `Released on ${releaseDate.toLocaleDateString()} at ${releaseDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Not released yet";

  async function releaseCourse() {
    if (!user) return;

    const confirmed = window.confirm(
      "Release the BIM course now? Candidates will get module 1 immediately, then one new module every 24 hours."
    );

    if (!confirmed) return;

    const releasedAt = new Date().toISOString();
    setReleaseStatus(null);

    const { error } = await supabase.from("course_settings").upsert({
      id: "bim_course",
      released_at: releasedAt,
      released_by: user.id,
      updated_at: releasedAt,
    });

    if (error) {
      setReleaseStatus(`Could not release course: ${error.message}`);
      return;
    }

    setCourseRelease({
      released_at: releasedAt,
      released_by: user.id,
      updated_at: releasedAt,
    });
    setReleaseStatus("Course released. Module 1 is available now; each next module unlocks every 24 hours.");
  }

  async function removeStudent(student: Student) {
    const label = student.full_name || student.email || "this student";
    const confirmed = window.confirm(
      `Remove ${label} from the candidate list? This removes their app profile, role, and progress records.`
    );

    if (!confirmed) return;

    setStudentStatus(null);

    const progressDelete = await supabase
      .from("progress")
      .delete()
      .eq("student_id", student.id);

    if (progressDelete.error) {
      setStudentStatus(`Could not remove progress records: ${progressDelete.error.message}`);
      return;
    }

    const roleDelete = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", student.id)
      .eq("role", "student");

    if (roleDelete.error) {
      setStudentStatus(`Could not remove student role: ${roleDelete.error.message}`);
      return;
    }

    const profileDelete = await supabase
      .from("profiles")
      .delete()
      .eq("id", student.id);

    if (profileDelete.error) {
      setStudentStatus(`Could not remove student profile: ${profileDelete.error.message}`);
      return;
    }

    if (selectedStudent?.id === student.id) {
      setSelectedStudent(null);
    }

    await refreshStudents();
    window.alert(`${label} was removed from the candidate list.`);
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
            title="Course Completed"
            value={completedCourseStudents.length}
            detail="Students at 100% course completion"
          />
          <MetricCard
            icon={Send}
            title="Course Release"
            value={releaseDate ? "Live" : "Locked"}
            detail={releaseDate ? "One module per day" : "Waiting for admin release"}
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
                  Manage students, review curriculum coverage, and monitor course completion.
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
                  <TabsTrigger value="release">Release</TabsTrigger>
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
                        onRemoveStudent={removeStudent}
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

              <TabsContent value="release" className="m-0 space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Course Release</h2>
                    <p className="text-sm text-muted-foreground">
                      Release the course only when candidates should start. After release, module access follows one module per day.
                    </p>
                  </div>
                  <Badge variant={releaseDate ? "default" : "outline"}>
                    {releaseDate ? "Released" : "Not released"}
                  </Badge>
                </div>

                <Card className="border-secondary/30 bg-secondary/10">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-primary">{releaseSummary}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Module 1 unlocks immediately. Module 2 unlocks after 24 hours, module 3 after 48 hours, and the same pattern continues for all 45 modules.
                        </p>
                      </div>

                      <Button onClick={releaseCourse} disabled={Boolean(releaseDate)}>
                        <Send className="mr-2 h-4 w-4" />
                        {releaseDate ? "Course released" : "Release course"}
                      </Button>
                    </div>

                    {releaseStatus && (
                      <div className="rounded-xl border border-border bg-background/80 p-3 text-sm text-foreground">
                        {releaseStatus}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
          onRemoveStudent={removeStudent}
          onOpenChange={(open) => {
            if (!open) setSelectedStudent(null);
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
  onRemoveStudent,
}: {
  students: Student[];
  courseProgressByStudent: Map<string, number>;
  onViewStudent: (student: Student) => void;
  onRemoveStudent: (student: Student) => void;
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
                  <td className="space-x-2 px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => onViewStudent(student)}>
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onRemoveStudent(student)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
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
  onRemoveStudent,
  onOpenChange,
}: {
  student: Student | null;
  courseScore: number;
  onRemoveStudent: (student: Student) => void;
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
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onRemoveStudent(student)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove Candidate
            </Button>
          </div>
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
