import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/theme-toggle";
import { CertificatePreview } from "@/components/certificate-preview";
import { bimCurriculum, type QuizQuestion } from "@/data/bimCurriculum";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lock,
  PlayCircle,
} from "lucide-react";

export const Route = createFileRoute("/student")({
  component: StudentDashboard,
});

const MODULE_UNLOCK_DELAY_MS = 24 * 60 * 60 * 1000;

type ViewMode = "phases" | "modules" | "lesson";

type StudentProgress = {
  completedLessonQuizzes: string[];
  completedModuleQuizzes: number[];
  lessonTimers: Record<string, number>;
  lessonTimerRemaining: Record<string, number>;
  lessonTimerRunning: Record<string, boolean>;
  moduleUnlocks: Record<string, number>;
};

type Profile = {
  full_name: string;
  email: string;
  date_of_birth: string | null;
  college_name: string | null;
  contact: string | null;
};

type CertificateRecord = {
  name: string;
  issuedAt: string;
};

function StudentDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("phases");
  const [selectedPhase, setSelectedPhase] = useState("Phase 1: Foundations");
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [quizMode, setQuizMode] = useState<"lesson" | "module" | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [now, setNow] = useState(Date.now());

  const [progress, setProgress] = useState<StudentProgress>({
    completedLessonQuizzes: [],
    completedModuleQuizzes: [],
    lessonTimers: {},
    lessonTimerRemaining: {},
    lessonTimerRunning: {},
    moduleUnlocks: {},
  });

  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [certificateStatus, setCertificateStatus] = useState<string | null>(null);
  const [remoteCourseScore, setRemoteCourseScore] = useState(0);
  const [courseReleasedAt, setCourseReleasedAt] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    if (role === "admin") {
      navigate({ to: "/admin" });
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const saved = window.localStorage.getItem(`bim-progress-${user.id}`);

    if (saved) {
      const parsed = JSON.parse(saved) as Partial<StudentProgress>;
      setProgress({
        completedLessonQuizzes: parsed.completedLessonQuizzes || [],
        completedModuleQuizzes: parsed.completedModuleQuizzes || [],
        lessonTimers: parsed.lessonTimers || {},
        lessonTimerRemaining: parsed.lessonTimerRemaining || {},
        lessonTimerRunning: parsed.lessonTimerRunning || {},
        moduleUnlocks: parsed.moduleUnlocks || {},
      });
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const nextProfile = data as Profile | null;
        setProfile(nextProfile);
        setCertificateName((current) => current || nextProfile?.full_name || "");
      });

    supabase
      .from("progress")
      .select("notes")
      .eq("student_id", user.id)
      .eq("subject", "certificate")
      .maybeSingle()
      .then(({ data }) => {
        const nextCertificate = parseCertificate(data?.notes || null);
        setCertificate(nextCertificate);
        setCertificateName((current) => current || nextCertificate?.name || "");
      });

    supabase
      .from("progress")
      .select("score")
      .eq("student_id", user.id)
      .eq("subject", "course_completion")
      .maybeSingle()
      .then(({ data }) => {
        const savedScore = Number(data?.score) || 0;
        setRemoteCourseScore(savedScore);

        if (savedScore >= 100) {
          setProgress((current) => ({
            ...current,
            ...getCompletedCourseProgress(),
          }));
        }
      });

    supabase
      .from("course_settings")
      .select("released_at")
      .eq("id", "bim_course")
      .maybeSingle()
      .then(({ data }) => setCourseReleasedAt(data?.released_at || null));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("student-course-release")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "course_settings" },
        (payload) => {
          const next = payload.new as { released_at?: string | null };
          setCourseReleasedAt(next.released_at || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    window.localStorage.setItem(
      `bim-progress-${user.id}`,
      JSON.stringify(progress)
    );
  }, [progress, user]);

  useEffect(() => {
    setProgress((current) => {
      let changed = false;
      const moduleUnlocks = { ...current.moduleUnlocks };

      for (const completedModuleId of current.completedModuleQuizzes) {
        const nextModuleId = completedModuleId + 1;
        if (
          nextModuleId <= bimCurriculum.length &&
          !moduleUnlocks[String(nextModuleId)]
        ) {
          moduleUnlocks[String(nextModuleId)] =
            Date.now() + MODULE_UNLOCK_DELAY_MS;
          changed = true;
        }
      }

      return changed ? { ...current, moduleUnlocks } : current;
    });
  }, [progress.completedModuleQuizzes]);

  const phases = Array.from(new Set(bimCurriculum.map((module) => module.phase)));

  const selectedPhaseModules = bimCurriculum.filter(
    (module) => module.phase === selectedPhase
  );

  const selectedModule =
    bimCurriculum.find((module) => module.id === selectedModuleId) ||
    bimCurriculum[0];

  const selectedLesson = selectedModule.lessons[selectedLessonIndex];

  const totalLessonQuizzes = bimCurriculum.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  const completedLessons = progress.completedLessonQuizzes.length;
  const completedModules = progress.completedModuleQuizzes.length;

  const overallProgress = Number(
    (
      ((completedLessons + completedModules) /
        (totalLessonQuizzes + bimCurriculum.length)) *
      100
    ).toFixed(1)
  );
  const displayedProgress = Math.max(
    overallProgress,
    remoteCourseScore,
    certificate ? 100 : 0
  );
  const isCourseComplete = displayedProgress >= 100;
  const courseReleaseTime = courseReleasedAt
    ? new Date(courseReleasedAt).getTime()
    : null;
  const isCourseReleased = Boolean(courseReleaseTime && now >= courseReleaseTime);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    const notes = JSON.stringify({
      completedLessonQuizzes: progress.completedLessonQuizzes.length,
      completedModuleQuizzes: progress.completedModuleQuizzes.length,
      totalLessonQuizzes,
      totalModuleQuizzes: bimCurriculum.length,
      completedAt: overallProgress === 100 ? new Date().toISOString() : null,
      lessonTimerRemaining: progress.lessonTimerRemaining,
      lessonTimerRunning: progress.lessonTimerRunning,
      moduleUnlocks: progress.moduleUnlocks,
    });

    async function syncCourseProgress() {
      const { data: existingProgress, error: findError } = await supabase
        .from("progress")
        .select("score")
        .eq("student_id", userId)
        .eq("subject", "course_completion")
        .maybeSingle();

      if (findError) {
        console.warn("Could not check course progress", findError.message);
        return;
      }

      const savedScore = Number(existingProgress?.score) || 0;
      const syncedProgress = Math.max(overallProgress, savedScore);
      setRemoteCourseScore(syncedProgress);

      const payload = {
        student_id: userId,
        subject: "course_completion",
        score: syncedProgress,
        notes,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("progress")
        .upsert(payload, { onConflict: "student_id,subject" });

      if (error) {
        console.warn("Could not sync course progress", error.message);
      }
    }

    syncCourseProgress();
  }, [progress, overallProgress, totalLessonQuizzes, user]);

  const lessonKey = `${selectedModule.id}-${selectedLessonIndex + 1}`;
  const lessonDurationMs = selectedLesson.durationMinutes * 60 * 1000;
  const lessonStartedAt = progress.lessonTimers[lessonKey];
  const savedLessonRemainingMs = progress.lessonTimerRemaining[lessonKey];
  const savedLessonRunning = progress.lessonTimerRunning[lessonKey];
  const isLegacyTimerRunning =
    Boolean(lessonStartedAt) &&
    savedLessonRemainingMs === undefined &&
    savedLessonRunning === undefined;
  const isLessonTimerStarted = Boolean(
    lessonStartedAt || savedLessonRemainingMs !== undefined
  );
  const isLessonTimerRunning = Boolean(
    lessonStartedAt && (savedLessonRunning || isLegacyTimerRunning)
  );
  const lessonRemainingMs = isLessonTimerRunning
    ? Math.max(
        0,
        (savedLessonRemainingMs ?? lessonDurationMs) - (now - lessonStartedAt)
      )
    : (savedLessonRemainingMs ?? lessonDurationMs);

  const isLessonQuizComplete =
    progress.completedLessonQuizzes.includes(lessonKey);
  const isLessonTimerComplete =
    isLessonQuizComplete || (isLessonTimerStarted && lessonRemainingMs <= 0);
  const remainingLessonSeconds = Math.max(
    0,
    Math.ceil(lessonRemainingMs / 1000)
  );

  const areAllModuleLessonsComplete = selectedModule.lessons.every((_, index) =>
    progress.completedLessonQuizzes.includes(`${selectedModule.id}-${index + 1}`)
  );

  const isModuleQuizComplete = progress.completedModuleQuizzes.includes(
    selectedModule.id
  );

  function getScheduledModuleUnlockAt(moduleId: number) {
    if (!courseReleaseTime) return null;

    return courseReleaseTime + (moduleId - 1) * MODULE_UNLOCK_DELAY_MS;
  }

  function isModuleUnlocked(moduleId: number) {
    if (isCourseComplete) return true;

    const scheduledUnlockAt = getScheduledModuleUnlockAt(moduleId);
    if (!scheduledUnlockAt || now < scheduledUnlockAt) return false;

    if (moduleId === 1) return true;

    if (!progress.completedModuleQuizzes.includes(moduleId - 1)) return false;

    return true;
  }

  function getModuleUnlockRemainingSeconds(moduleId: number) {
    if (moduleId === 1 || isModuleUnlocked(moduleId)) return 0;

    const scheduledUnlockAt = getScheduledModuleUnlockAt(moduleId);
    if (!scheduledUnlockAt) return 0;

    return Math.max(0, Math.ceil((scheduledUnlockAt - now) / 1000));
  }

  function isLessonUnlocked(moduleId: number, lessonIndex: number) {
    if (!isModuleUnlocked(moduleId)) return false;

    if (lessonIndex === 0) return true;

    return progress.completedLessonQuizzes.includes(
      `${moduleId}-${lessonIndex}`
    );
  }

  function getModuleLessonCount(moduleId: number) {
    return progress.completedLessonQuizzes.filter((key) =>
      key.startsWith(`${moduleId}-`)
    ).length;
  }

  function getPhaseProgress(phase: string) {
    if (displayedProgress >= 100) return 100;

    const modules = bimCurriculum.filter((module) => module.phase === phase);

    const totalSteps = modules.reduce(
      (total, module) => total + module.lessons.length + 1,
      0
    );

    const completedSteps = modules.reduce((total, module) => {
      const lessonCount = getModuleLessonCount(module.id);
      const moduleQuiz = progress.completedModuleQuizzes.includes(module.id)
        ? 1
        : 0;

      return total + lessonCount + moduleQuiz;
    }, 0);

    return Math.round((completedSteps / totalSteps) * 100);
  }

  function openPhase(phase: string) {
    setSelectedPhase(phase);
    setViewMode("modules");
  }

  function openModule(moduleId: number) {
    if (!isModuleUnlocked(moduleId)) return;

    setSelectedModuleId(moduleId);
    setSelectedLessonIndex(0);
    setQuizMode(null);
    setAnswers({});
    setShowQuizResult(false);
    setViewMode("lesson");
  }

  function selectLesson(index: number) {
    if (!isLessonUnlocked(selectedModule.id, index)) return;

    setSelectedLessonIndex(index);
    setQuizMode(null);
    setAnswers({});
    setShowQuizResult(false);
  }

  function startSelectedLesson() {
    setProgress((current) =>
      ({
        ...current,
        lessonTimers: { ...current.lessonTimers, [lessonKey]: Date.now() },
        lessonTimerRemaining: {
          ...current.lessonTimerRemaining,
          [lessonKey]: current.lessonTimerRemaining[lessonKey] ?? lessonDurationMs,
        },
        lessonTimerRunning: {
          ...current.lessonTimerRunning,
          [lessonKey]: true,
        },
      })
    );
  }

  function pauseSelectedLesson() {
    setProgress((current) => ({
      ...current,
      lessonTimerRemaining: {
        ...current.lessonTimerRemaining,
        [lessonKey]: lessonRemainingMs,
      },
      lessonTimerRunning: {
        ...current.lessonTimerRunning,
        [lessonKey]: false,
      },
    }));
  }

  const activeQuestions = useMemo(
    () => (quizMode === "module" ? selectedModule.moduleQuiz : selectedLesson.quiz),
    [quizMode, selectedLesson.quiz, selectedModule.moduleQuiz]
  );

  function isQuestionCorrect(question: QuizQuestion, questionIndex: number) {
    const selected = answers[questionIndex];

    if (question.type === "multiple") {
      const correctAnswers = question.answers || [];
      const selectedAnswers = Array.isArray(selected) ? selected : [];

      return (
        correctAnswers.length === selectedAnswers.length &&
        correctAnswers.every((answer) => selectedAnswers.includes(answer))
      );
    }

    return selected === question.answer;
  }

  function submitQuiz() {
    if (Object.keys(answers).length < activeQuestions.length) return;

    const passed = activeQuestions.every((question, index) =>
      isQuestionCorrect(question, index)
    );

    if (!passed) {
      setShowQuizResult(true);
      return;
    }

    completeQuizAfterReview();
  }

  async function saveStudentCertificateName() {
    if (!user || !isCourseComplete) return;

    const name = certificateName.trim();
    if (!name) {
      setCertificateStatus("Enter the name exactly as it should appear on the certificate.");
      return;
    }

    const issuedAt = certificate?.issuedAt || new Date().toISOString();
    const notes = JSON.stringify({ name, issuedAt });
    const userId = user.id;

    const payload = {
      student_id: userId,
      subject: "certificate",
      score: 100,
      notes,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("progress")
      .upsert(payload, { onConflict: "student_id,subject" });

    if (error) {
      setCertificateStatus(`Could not save certificate name: ${error.message}`);
      return;
    }

    setCertificate({ name, issuedAt });
    setCertificateStatus(null);
    setCertificateDialogOpen(false);
  }

  function completeQuizAfterReview() {
    if (quizMode === "module") {
      const nextModule = bimCurriculum.find(
        (module) => module.id === selectedModule.id + 1
      );
      const nextModuleUnlockAt = Date.now() + MODULE_UNLOCK_DELAY_MS;

      setProgress((current) => ({
        ...current,
        completedModuleQuizzes: current.completedModuleQuizzes.includes(
          selectedModule.id
        )
          ? current.completedModuleQuizzes
          : [...current.completedModuleQuizzes, selectedModule.id],
        moduleUnlocks: nextModule
          ? {
              ...current.moduleUnlocks,
              [String(nextModule.id)]:
                current.moduleUnlocks[String(nextModule.id)] || nextModuleUnlockAt,
            }
          : current.moduleUnlocks,
      }));

      if (nextModule) {
        setSelectedPhase(nextModule.phase);
        setViewMode("modules");
      }
    } else {
      const nextLessonIndex = selectedLessonIndex + 1;

      setProgress((current) => ({
        ...current,
        completedLessonQuizzes: current.completedLessonQuizzes.includes(
          lessonKey
        )
          ? current.completedLessonQuizzes
          : [...current.completedLessonQuizzes, lessonKey],
      }));

      if (nextLessonIndex < selectedModule.lessons.length) {
        setSelectedLessonIndex(nextLessonIndex);
      }
    }

    setQuizMode(null);
    setAnswers({});
    setShowQuizResult(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
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

            <span className="text-lg font-semibold">BIM Student Dashboard</span>
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
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-6 py-10">
        <Card className="border-secondary/40 bg-card/90 shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">
              Welcome, {profile?.full_name || "Student"}
            </CardTitle>
            <CardDescription>
              Continue your BIM learning path. Complete lessons, review quiz
              results, and unlock the next module step by step.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Email" value={profile?.email || user?.email} />
              <Info label="Date of Birth" value={profile?.date_of_birth} />
              <Info label="College" value={profile?.college_name} />
              <Info label="Contact" value={profile?.contact} />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Overall progress" value={`${displayedProgress}%`} />
              <Stat
                label="Lessons complete"
                value={`${completedLessons}/${totalLessonQuizzes}`}
              />
              <Stat label="Modules complete" value={`${completedModules}/45`} />
              <Stat label="Module duration" value="1 hour" />
            </div>

            {!isCourseReleased && !isCourseComplete && (
              <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-sm font-medium text-primary">
                The course has not been released yet. Modules will open after
                the admin releases the course.
              </div>
            )}

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-primary">
                    <Award className="h-5 w-5 text-secondary" />
                    Course Certificate
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {certificate
                      ? "Your certificate is ready to print or save as PDF."
                      : displayedProgress >= 100
                        ? "Click to enter your certificate name."
                        : "Certificate unlocks after full course completion."}
                  </p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-sm font-semibold text-primary">
                  {certificate ? "Ready" : displayedProgress >= 100 ? "Name required" : "Locked"}
                </span>
              </div>

              {displayedProgress >= 100 && !certificate && (
                <Button
                  type="button"
                  className="mt-4 w-full sm:w-auto"
                  onClick={() => {
                    setCertificateName(profile?.full_name || certificateName);
                    setCertificateStatus(null);
                    setCertificateDialogOpen(true);
                  }}
                >
                  Enter certificate name
                </Button>
              )}

              {certificate && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mb-4"
                    onClick={() => {
                      setCertificateName(certificate.name);
                      setCertificateStatus(null);
                      setCertificateDialogOpen(true);
                    }}
                  >
                    Update certificate name
                  </Button>
                  <CertificatePreview
                    studentName={certificate.name}
                    studentEmail={profile?.email || user?.email}
                    issuedAt={certificate.issuedAt}
                    certificateId={`BIM-${(user?.id || "student").slice(0, 8).toUpperCase()}`}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isCourseComplete ? (
          <CourseCompletionView
            completedLessons={totalLessonQuizzes}
            totalLessonQuizzes={totalLessonQuizzes}
            completedModules={bimCurriculum.length}
          />
        ) : viewMode === "phases" && (
          <PhaseView
            phases={phases}
            getPhaseProgress={getPhaseProgress}
            onOpenPhase={openPhase}
          />
        )}

        {viewMode === "modules" && (
          <ModuleView
            selectedPhase={selectedPhase}
            modules={selectedPhaseModules}
            progress={progress}
            getModuleLessonCount={getModuleLessonCount}
            isModuleUnlocked={isModuleUnlocked}
            getModuleUnlockRemainingSeconds={getModuleUnlockRemainingSeconds}
            isCourseReleased={isCourseReleased}
            onBack={() => setViewMode("phases")}
            onOpenModule={openModule}
          />
        )}

        {viewMode === "lesson" && (
          <LessonView
            module={selectedModule}
            selectedLessonIndex={selectedLessonIndex}
            selectedLesson={selectedLesson}
            quizMode={quizMode}
            answers={answers}
            showQuizResult={showQuizResult}
            isLessonTimerStarted={isLessonTimerStarted}
            isLessonTimerRunning={isLessonTimerRunning}
            isLessonTimerComplete={isLessonTimerComplete}
            remainingLessonSeconds={remainingLessonSeconds}
            progress={progress}
            isLessonQuizComplete={isLessonQuizComplete}
            areAllModuleLessonsComplete={areAllModuleLessonsComplete}
            isModuleQuizComplete={isModuleQuizComplete}
            isLessonUnlocked={isLessonUnlocked}
            setQuizMode={setQuizMode}
            setAnswers={setAnswers}
            setShowQuizResult={setShowQuizResult}
            submitQuiz={submitQuiz}
            completeQuizAfterReview={completeQuizAfterReview}
            onStartLesson={startSelectedLesson}
            onPauseLesson={pauseSelectedLesson}
            onBack={() => setViewMode("modules")}
            onSelectLesson={selectLesson}
          />
        )}
      </main>

      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Certificate Name</DialogTitle>
            <DialogDescription>
              Enter your name exactly as it should appear on the certificate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={certificateName}
              onChange={(event) => {
                setCertificateName(event.target.value);
                setCertificateStatus(null);
              }}
              placeholder="Enter your full name"
            />

            {certificateStatus && (
              <p className="text-sm text-destructive">{certificateStatus}</p>
            )}

            <Button
              type="button"
              className="w-full"
              onClick={saveStudentCertificateName}
              disabled={!isCourseComplete}
            >
              Save certificate name
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhaseView({
  phases,
  getPhaseProgress,
  onOpenPhase,
}: {
  phases: string[];
  getPhaseProgress: (phase: string) => number;
  onOpenPhase: (phase: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Choose a learning phase</CardTitle>
        <CardDescription>
          Each phase contains related BIM modules. Open a phase to continue your
          sequential learning journey.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {phases.map((phase, index) => {
          const phaseProgress = getPhaseProgress(phase);

          return (
            <button
              key={phase}
              onClick={() => onOpenPhase(phase)}
              className="group rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-secondary hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                    Phase {index + 1}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-primary">
                    {phase.replace(/^Phase \d+:\s*/, "")}
                  </h3>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-secondary" />
              </div>

              <Progress value={phaseProgress} className="mt-5" />

              <p className="mt-3 text-sm text-muted-foreground">
                {phaseProgress}% completed
              </p>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CourseCompletionView({
  completedLessons,
  totalLessonQuizzes,
  completedModules,
}: {
  completedLessons: number;
  totalLessonQuizzes: number;
  completedModules: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Course Completion</CardTitle>
        <CardDescription>
          The full BIM learning path has been completed and the certificate is
          available above.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <Progress value={100} />

        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Course progress" value="100%" />
          <Stat
            label="Lessons complete"
            value={`${completedLessons}/${totalLessonQuizzes}`}
          />
          <Stat label="Modules complete" value={`${completedModules}/45`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleView({
  selectedPhase,
  modules,
  progress,
  getModuleLessonCount,
  isModuleUnlocked,
  getModuleUnlockRemainingSeconds,
  isCourseReleased,
  onBack,
  onOpenModule,
}: {
  selectedPhase: string;
  modules: typeof bimCurriculum;
  progress: StudentProgress;
  getModuleLessonCount: (moduleId: number) => number;
  isModuleUnlocked: (moduleId: number) => boolean;
  getModuleUnlockRemainingSeconds: (moduleId: number) => number;
  isCourseReleased: boolean;
  onBack: () => void;
  onOpenModule: (moduleId: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <Button variant="outline" className="mb-4 w-fit" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to phases
        </Button>

        <CardTitle className="text-primary">{selectedPhase}</CardTitle>

        <CardDescription>
          Complete one module per day. After admin release, each next module
          unlocks on the 24-hour schedule.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const unlocked = isModuleUnlocked(module.id);
          const complete = progress.completedModuleQuizzes.includes(module.id);
          const previousComplete =
            module.id > 1 &&
            progress.completedModuleQuizzes.includes(module.id - 1);
          const unlockRemainingSeconds = getModuleUnlockRemainingSeconds(
            module.id
          );
          const lessonCount = getModuleLessonCount(module.id);
          const totalSteps = module.lessons.length + 1;
          const lockedMessage =
            !isCourseReleased
              ? "Locked until admin releases the course."
              : unlockRemainingSeconds > 0
                ? `Module ${module.id} will unlock after ${formatDuration(unlockRemainingSeconds)}.`
                : module.id > 1 && !previousComplete
                  ? `Complete module ${module.id - 1} to unlock this module.`
              : "Locked";

          return (
            <button
              key={module.id}
              onClick={() => onOpenModule(module.id)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                unlocked
                  ? "bg-card hover:-translate-y-1 hover:border-secondary hover:shadow-xl"
                  : "bg-muted/40 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                    Module {module.id}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-primary">
                    {module.title}
                  </h3>
                </div>

                {complete ? (
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                ) : unlocked ? (
                  <PlayCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <Progress
                value={complete ? 100 : (lessonCount / totalSteps) * 100}
                className="mt-5"
              />

              <p className="mt-3 text-sm text-muted-foreground">
                {complete
                  ? "Module quiz complete"
                  : unlocked
                    ? `${lessonCount}/${module.lessons.length} lessons complete · 1 hour`
                    : lockedMessage}
              </p>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function LessonView({
  module,
  selectedLessonIndex,
  selectedLesson,
  quizMode,
  answers,
  showQuizResult,
  isLessonTimerStarted,
  isLessonTimerRunning,
  isLessonTimerComplete,
  remainingLessonSeconds,
  progress,
  isLessonQuizComplete,
  areAllModuleLessonsComplete,
  isModuleQuizComplete,
  isLessonUnlocked,
  setQuizMode,
  setAnswers,
  setShowQuizResult,
  submitQuiz,
  completeQuizAfterReview,
  onStartLesson,
  onPauseLesson,
  onBack,
  onSelectLesson,
}: {
  module: (typeof bimCurriculum)[number];
  selectedLessonIndex: number;
  selectedLesson: (typeof bimCurriculum)[number]["lessons"][number];
  quizMode: "lesson" | "module" | null;
  answers: Record<number, number | number[]>;
  showQuizResult: boolean;
  isLessonTimerStarted: boolean;
  isLessonTimerRunning: boolean;
  isLessonTimerComplete: boolean;
  remainingLessonSeconds: number;
  progress: StudentProgress;
  isLessonQuizComplete: boolean;
  areAllModuleLessonsComplete: boolean;
  isModuleQuizComplete: boolean;
  isLessonUnlocked: (moduleId: number, lessonIndex: number) => boolean;
  setQuizMode: React.Dispatch<React.SetStateAction<"lesson" | "module" | null>>;
  setAnswers: React.Dispatch<
    React.SetStateAction<Record<number, number | number[]>>
  >;
  setShowQuizResult: React.Dispatch<React.SetStateAction<boolean>>;
  submitQuiz: () => void;
  completeQuizAfterReview: () => void;
  onStartLesson: () => void;
  onPauseLesson: () => void;
  onBack: () => void;
  onSelectLesson: (index: number) => void;
}) {
  const remainingMinutes = Math.floor(remainingLessonSeconds / 60);
  const remainingSeconds = remainingLessonSeconds % 60;
  const remainingTime = `${remainingMinutes}:${String(remainingSeconds).padStart(2, "0")}`;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <Button variant="outline" className="mb-4 w-fit" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to modules
          </Button>

          <p className="text-xs font-bold uppercase tracking-wide text-secondary">
            Module {module.id}
          </p>

          <CardTitle className="text-primary">{module.title}</CardTitle>

          <CardDescription>
            1 hour · {module.lessons.length} lessons · lesson quizzes · module
            assessment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {module.lessons.map((lesson, index) => {
            const unlocked = isLessonUnlocked(module.id, index);
            const complete = progress.completedLessonQuizzes.includes(
              `${module.id}-${index + 1}`
            );

            return (
              <button
                key={lesson.title}
                onClick={() => onSelectLesson(index)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedLessonIndex === index
                    ? "border-secondary bg-secondary/15"
                    : unlocked
                      ? "border-border bg-card hover:border-secondary"
                      : "border-border bg-muted/40 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-secondary">
                    Lesson {index + 1}
                  </span>

                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                  ) : unlocked ? (
                    <PlayCircle className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>

                <h3 className="mt-2 text-sm font-semibold text-primary">
                  {lesson.title.replace(/^Lesson \d+:\s*/, "")}
                </h3>

                <p className="mt-2 text-xs text-muted-foreground">
                  {complete ? "Quiz complete" : unlocked ? "Available" : "Locked"}
                </p>
              </button>
            );
          })}

          <div
            className={`rounded-xl border p-4 ${
              areAllModuleLessonsComplete
                ? "border-secondary bg-secondary/15"
                : "border-border bg-muted/40 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-secondary">
                Module Quiz
              </span>

              {isModuleQuizComplete ? (
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              ) : areAllModuleLessonsComplete ? (
                <PlayCircle className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              15 questions · unlocks next module
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">
            {quizMode === "module"
              ? "Module Quiz"
              : quizMode === "lesson"
                ? `${selectedLesson.title} Quiz`
                : selectedLesson.title}
          </CardTitle>

          <CardDescription>
            {quizMode
              ? "Answer every question correctly to unlock the next step."
              : "Read the lesson content. The quiz unlocks when the lesson timer ends."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {!quizMode ? (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-secondary">
                  <Clock className="h-4 w-4" /> {selectedLesson.durationMinutes} minutes
                </div>
                {!isLessonTimerStarted && !isLessonQuizComplete && (
                  <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm font-medium text-primary">
                    Start this lesson when you are ready. The quiz timer will
                    begin only after you start.
                  </div>
                )}

                {isLessonTimerStarted &&
                  !isLessonTimerComplete &&
                  !isLessonQuizComplete && (
                  <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm font-medium text-primary">
                    {isLessonTimerRunning
                      ? `Lesson quiz unlocks in ${remainingTime}.`
                      : `Lesson timer paused at ${remainingTime}.`}
                  </div>
                )}

                <div className="space-y-3 text-sm leading-7 text-foreground">
                  {selectedLesson.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={isLessonTimerRunning ? onPauseLesson : onStartLesson}
                  disabled={isLessonQuizComplete || isLessonTimerComplete}
                  variant="outline"
                >
                  {isLessonTimerComplete
                    ? "Timer complete"
                    : isLessonTimerRunning
                      ? "Pause lesson"
                      : isLessonTimerStarted
                        ? "Resume lesson"
                        : "Start lesson"}
                </Button>

                <Button
                  onClick={() => {
                    setQuizMode("lesson");
                    setAnswers({});
                    setShowQuizResult(false);
                  }}
                  disabled={isLessonQuizComplete || !isLessonTimerComplete}
                >
                  {isLessonQuizComplete
                    ? "Lesson quiz completed"
                    : isLessonTimerComplete
                      ? "Start lesson quiz"
                      : isLessonTimerStarted
                        ? isLessonTimerRunning
                          ? `Quiz unlocks in ${remainingTime}`
                          : "Resume lesson to unlock quiz"
                        : "Start lesson to unlock quiz"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizMode("module");
                    setAnswers({});
                    setShowQuizResult(false);
                  }}
                  disabled={!areAllModuleLessonsComplete || isModuleQuizComplete}
                >
                  {isModuleQuizComplete
                    ? "Module quiz completed"
                    : areAllModuleLessonsComplete
                      ? "Start module quiz"
                      : "Complete all lessons to unlock module quiz"}
                </Button>
              </div>
            </>
          ) : (
            <QuizView
              questions={
                quizMode === "module" ? module.moduleQuiz : selectedLesson.quiz
              }
              answers={answers}
              setAnswers={setAnswers}
              setShowQuizResult={setShowQuizResult}
              showQuizResult={showQuizResult}
              onSubmit={submitQuiz}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizView({
  questions,
  answers,
  setAnswers,
  setShowQuizResult,
  showQuizResult,
  onSubmit,
}: {
  questions: QuizQuestion[];
  answers: Record<number, number | number[]>;
  setAnswers: React.Dispatch<
    React.SetStateAction<Record<number, number | number[]>>
  >;
  setShowQuizResult: React.Dispatch<React.SetStateAction<boolean>>;
  showQuizResult: boolean;
  onSubmit: () => void;
}) {
  const ready = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-5">
      {showQuizResult && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          Some answers are not correct yet. Review the lesson content and try
          again. Answers are hidden until you get every question right.
        </div>
      )}

      {questions.map((question, questionIndex) => (
        <div key={question.question} className="rounded-xl border border-border p-4">
          <h3 className="font-semibold text-primary">
            {questionIndex + 1}. {question.question}
          </h3>

          <div className="mt-3 grid gap-2">
            {question.options.map((option, optionIndex) => {
              const isMultiple = question.type === "multiple";
              const selectedAnswer = answers[questionIndex];

              const checked = isMultiple
                ? Array.isArray(selectedAnswer) &&
                  selectedAnswer.includes(optionIndex)
                : selectedAnswer === optionIndex;

              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm hover:border-secondary"
                >
                  <input
                    type={isMultiple ? "checkbox" : "radio"}
                    name={`question-${questionIndex}`}
                    checked={checked}
                    onChange={() => {
                      setShowQuizResult(false);
                      setAnswers((current) => {
                        if (!isMultiple) {
                          return {
                            ...current,
                            [questionIndex]: optionIndex,
                          };
                        }

                        const currentValues = Array.isArray(current[questionIndex])
                          ? (current[questionIndex] as number[])
                          : [];

                        const nextValues = currentValues.includes(optionIndex)
                          ? currentValues.filter((value) => value !== optionIndex)
                          : [...currentValues, optionIndex];

                        return {
                          ...current,
                          [questionIndex]: nextValues,
                        };
                      });
                    }}
                  />

                  {option}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <Button onClick={onSubmit} disabled={!ready} className="w-full">
        {showQuizResult ? "Try again" : "Submit quiz"}
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
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

function getCompletedCourseProgress(): Pick<
  StudentProgress,
  "completedLessonQuizzes" | "completedModuleQuizzes" | "moduleUnlocks"
> {
  return {
    completedLessonQuizzes: bimCurriculum.flatMap((module) =>
      module.lessons.map((_, index) => `${module.id}-${index + 1}`)
    ),
    completedModuleQuizzes: bimCurriculum.map((module) => module.id),
    moduleUnlocks: Object.fromEntries(
      bimCurriculum.map((module) => [String(module.id), Date.now()])
    ),
  };
}
