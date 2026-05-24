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
import logo from "@/assets/logo.jpg";
import { ThemeToggle } from "@/components/theme-toggle";
import { bimCurriculum, type QuizQuestion } from "@/data/bimCurriculum";
import {
  ArrowLeft,
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
  moduleUnlocks: Record<string, number>;
};

type Profile = {
  full_name: string;
  email: string;
  date_of_birth: string | null;
  college_name: string | null;
  contact: string | null;
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
    moduleUnlocks: {},
  });

  const [profile, setProfile] = useState<Profile | null>(null);

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
        moduleUnlocks: parsed.moduleUnlocks || {},
      });
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as Profile | null));
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

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    const notes = JSON.stringify({
      completedLessonQuizzes: progress.completedLessonQuizzes.length,
      completedModuleQuizzes: progress.completedModuleQuizzes.length,
      totalLessonQuizzes,
      totalModuleQuizzes: bimCurriculum.length,
      completedAt: overallProgress === 100 ? new Date().toISOString() : null,
      moduleUnlocks: progress.moduleUnlocks,
    });

    async function syncCourseProgress() {
      const { data: existingProgress, error: findError } = await supabase
        .from("progress")
        .select("id")
        .eq("student_id", userId)
        .eq("subject", "course_completion")
        .maybeSingle();

      if (findError) {
        console.warn("Could not check course progress", findError.message);
        return;
      }

      const payload = {
        student_id: userId,
        subject: "course_completion",
        score: overallProgress,
        notes,
        updated_at: new Date().toISOString(),
      };

      const { error } = existingProgress
        ? await supabase
            .from("progress")
            .update(payload)
            .eq("id", existingProgress.id)
        : await supabase.from("progress").insert(payload);

      if (error) {
        console.warn("Could not sync course progress", error.message);
      }
    }

    syncCourseProgress();
  }, [progress, overallProgress, totalLessonQuizzes, user]);

  const lessonKey = `${selectedModule.id}-${selectedLessonIndex + 1}`;
  const lessonDurationMs = selectedLesson.durationMinutes * 60 * 1000;
  const lessonStartedAt = progress.lessonTimers[lessonKey];

  const isLessonQuizComplete =
    progress.completedLessonQuizzes.includes(lessonKey);
  const isLessonTimerComplete =
    isLessonQuizComplete ||
    Boolean(lessonStartedAt && now - lessonStartedAt >= lessonDurationMs);
  const remainingLessonSeconds = Math.max(
    0,
    Math.ceil((lessonDurationMs - (now - (lessonStartedAt || now))) / 1000)
  );

  const areAllModuleLessonsComplete = selectedModule.lessons.every((_, index) =>
    progress.completedLessonQuizzes.includes(`${selectedModule.id}-${index + 1}`)
  );

  const isModuleQuizComplete = progress.completedModuleQuizzes.includes(
    selectedModule.id
  );

  function isModuleUnlocked(moduleId: number) {
    if (moduleId === 1) return true;
    if (!progress.completedModuleQuizzes.includes(moduleId - 1)) return false;

    const unlockAt = progress.moduleUnlocks[String(moduleId)];
    return Boolean(unlockAt && now >= unlockAt);
  }

  function getModuleUnlockRemainingSeconds(moduleId: number) {
    if (moduleId === 1 || isModuleUnlocked(moduleId)) return 0;

    const unlockAt = progress.moduleUnlocks[String(moduleId)];
    if (!unlockAt) return 0;

    return Math.max(0, Math.ceil((unlockAt - now) / 1000));
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
    const key = `${moduleId}-1`;
    setProgress((current) =>
      current.lessonTimers[key]
        ? current
        : {
            ...current,
            lessonTimers: { ...current.lessonTimers, [key]: Date.now() },
          }
    );
    setQuizMode(null);
    setAnswers({});
    setShowQuizResult(false);
    setViewMode("lesson");
  }

  function selectLesson(index: number) {
    if (!isLessonUnlocked(selectedModule.id, index)) return;

    setSelectedLessonIndex(index);
    const key = `${selectedModule.id}-${index + 1}`;
    setProgress((current) =>
      current.lessonTimers[key]
        ? current
        : {
            ...current,
            lessonTimers: { ...current.lessonTimers, [key]: Date.now() },
          }
    );
    setQuizMode(null);
    setAnswers({});
    setShowQuizResult(false);
  }

  useEffect(() => {
    if (!user || !isLessonUnlocked(selectedModule.id, selectedLessonIndex)) return;

    setProgress((current) =>
      current.lessonTimers[lessonKey]
        ? current
        : {
            ...current,
            lessonTimers: { ...current.lessonTimers, [lessonKey]: Date.now() },
          }
    );
  }, [lessonKey, selectedLessonIndex, selectedModule.id, user]);

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
      const nextLessonKey = `${selectedModule.id}-${nextLessonIndex + 1}`;

      setProgress((current) => ({
        ...current,
        completedLessonQuizzes: current.completedLessonQuizzes.includes(
          lessonKey
        )
          ? current.completedLessonQuizzes
          : [...current.completedLessonQuizzes, lessonKey],
        lessonTimers:
          nextLessonIndex < selectedModule.lessons.length
            ? {
                ...current.lessonTimers,
                [nextLessonKey]:
                  current.lessonTimers[nextLessonKey] || Date.now(),
              }
            : current.lessonTimers,
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
              <Stat label="Overall progress" value={`${overallProgress}%`} />
              <Stat
                label="Lessons complete"
                value={`${completedLessons}/${totalLessonQuizzes}`}
              />
              <Stat label="Modules complete" value={`${completedModules}/45`} />
              <Stat label="Module duration" value="1 hour" />
            </div>
          </CardContent>
        </Card>

        {viewMode === "phases" && (
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
            onBack={() => setViewMode("modules")}
            onSelectLesson={selectLesson}
          />
        )}
      </main>
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

function ModuleView({
  selectedPhase,
  modules,
  progress,
  getModuleLessonCount,
  isModuleUnlocked,
  getModuleUnlockRemainingSeconds,
  onBack,
  onOpenModule,
}: {
  selectedPhase: string;
  modules: typeof bimCurriculum;
  progress: StudentProgress;
  getModuleLessonCount: (moduleId: number) => number;
  isModuleUnlocked: (moduleId: number) => boolean;
  getModuleUnlockRemainingSeconds: (moduleId: number) => number;
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
          Complete one module per day. After a module quiz is completed, the
          next module unlocks after 24 hours.
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
            previousComplete && unlockRemainingSeconds > 0
              ? `Module ${module.id - 1} completed. Module ${module.id} will unlock after ${formatDuration(unlockRemainingSeconds)}.`
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
  onBack,
  onSelectLesson,
}: {
  module: (typeof bimCurriculum)[number];
  selectedLessonIndex: number;
  selectedLesson: (typeof bimCurriculum)[number]["lessons"][number];
  quizMode: "lesson" | "module" | null;
  answers: Record<number, number | number[]>;
  showQuizResult: boolean;
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
                {!isLessonTimerComplete && !isLessonQuizComplete && (
                  <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm font-medium text-primary">
                    Lesson quiz unlocks in {remainingTime}.
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
                      : `Quiz unlocks in ${remainingTime}`}
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
