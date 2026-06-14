import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Flame, CalendarClock, Layers, ShieldCheck, RefreshCw, ListChecks, BookOpen,
  Bell, BellRing, Compass, Target, Upload, MessageSquare, BarChart3,
  ChevronRight, Zap,
} from "lucide-react";
import type { Course, DeckState, Flashcard, Rating, ReviewLog, UserProfile } from "./lib/types";
import { freshDeck } from "./lib/demoData";
import { dueCards, loadDeck, saveDeck, schedule, resetDeck } from "./lib/scheduler";
import { suggestCrossLinks } from "./lib/crosslinks";
import { prioritized } from "./lib/analytics";
import { Onboarding } from "./components/Onboarding";
import { PlanHeader } from "./components/PlanHeader";
import {
  notificationPermission,
  requestNotificationPermission,
  buildNudge,
  sendNudge,
  type Perm,
} from "./lib/notify";
import { Constellation } from "./components/Constellation";
import { FlashcardView } from "./components/Flashcard";
import { ReadinessPanel } from "./components/ReadinessPanel";
import { TutorPanel } from "./components/TutorPanel";
import { UploadPanel } from "./components/UploadPanel";
import { StudyHeatmap } from "./components/StudyHeatmap";

type StudyMode = "quiz" | "study";

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [deck, setDeck] = useState<DeckState>(() => loadDeck() ?? freshDeck());

  useEffect(() => {
    saveDeck(deck);
  }, [deck]);

  const [mode, setMode] = useState<StudyMode>("quiz");

  const due = useMemo(() => {
    const kind = mode === "study" ? "fact" : "qa";
    return dueCards(deck.cards.filter((c) => c.kind === kind));
  }, [deck.cards, mode]);
  const current = due[0] ?? null;
  const currentCourse = current ? deck.courses.find((c) => c.id === current.courseId) : null;

  const readiness = useMemo(
    () => prioritized(deck.courses, deck.cards, deck.reviews),
    [deck.courses, deck.cards, deck.reviews],
  );

  const nextExam = useMemo(() => {
    const upcoming = deck.courses
      .map((c) => ({ c, t: new Date(c.examDate).getTime() }))
      .filter((x) => x.t > Date.now())
      .sort((a, b) => a.t - b.t)[0];
    if (!upcoming) return null;
    const days = Math.max(0, Math.ceil((upcoming.t - Date.now()) / (24 * 3600 * 1000)));
    return { course: upcoming.c, days };
  }, [deck.courses]);

  function rate(rating: Rating) {
    if (!current) return;
    const card = current;
    setDeck((d) => {
      const reviews: ReviewLog[] =
        card.kind === "qa"
          ? [
              ...d.reviews,
              { id: `r${Date.now()}`, cardId: card.id, courseId: card.courseId, rating, at: Date.now() },
            ]
          : d.reviews;
      return {
        ...d,
        reviews,
        cards: d.cards.map((c) => (c.id === card.id ? schedule(c, rating) : c)),
      };
    });
  }

  function setWeight(courseId: string, weight: number) {
    setDeck((d) => ({
      ...d,
      courses: d.courses.map((c) => (c.id === courseId ? { ...c, weight } : c)),
    }));
  }

  function setProfile(profile: UserProfile) {
    setDeck((d) => ({ ...d, profile }));
  }

  function scrollToAddCourse() {
    document.getElementById("add-course")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const [perm, setPerm] = useState<Perm>(() => notificationPermission());

  async function remindMe() {
    let p = perm;
    if (p === "default") {
      p = await requestNotificationPermission();
      setPerm(p);
    }
    if (p === "granted") {
      const nudge = buildNudge(deck) ?? {
        title: "You're all caught up ✦",
        body: "Nothing overdue right now — come back when a card is due.",
      };
      sendNudge(nudge);
    }
  }

  function addCourse(course: Course, cards: Flashcard[]) {
    setDeck((d) => {
      const inferred = suggestCrossLinks(course, d.courses);
      return {
        ...d,
        courses: [...d.courses, course],
        links: [...d.links, ...inferred],
        cards: [...d.cards, ...cards],
      };
    });
  }

  // nav sections for sidebar
  const navSections = [
    { id: "constellation", label: "Constellation", icon: Compass },
    { id: "study", label: "Study session", icon: BookOpen },
    { id: "readiness", label: "Readiness", icon: Target },
    { id: "tutor", label: "AI Tutor", icon: MessageSquare },
    { id: "upload", label: "Add course", icon: Upload },
  ];

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-night-950">
      {/* first run: onboarding */}
      {!deck.profile && <Onboarding onComplete={setProfile} />}

      {/* background ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 70% -15%, rgba(111, 127, 242, 0.07), transparent 55%), " +
              "radial-gradient(800px 500px at 15% 115%, rgba(245, 184, 61, 0.04), transparent 55%)",
          }}
        />
      </div>

      <div className="relative z-10 flex">
        {/* ── SIDEBAR (desktop only) ─────────────────────── */}
        <aside className="hidden lg:flex lg:w-[280px] xl:w-[320px] shrink-0 flex-col border-r border-white/5 bg-night-950/80 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
          {/* logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
            <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
              <circle cx="6" cy="18" r="2.4" fill="#f5b83d" />
              <circle cx="13" cy="6" r="2.4" fill="#8b9afb" />
              <circle cx="21" cy="15" r="2.4" fill="#6fc7bd" />
              <path d="M6 18 L13 6 L21 15" stroke="#6f7ff2" strokeWidth="1.2" fill="none" opacity="0.7" />
            </svg>
            <span className="display text-lg font-semibold tracking-tight text-ink-100">Constella</span>
          </div>

          {/* nav */}
          <nav className="flex-1 px-3 py-4">
            <p className="mb-2 px-3 text-[10px] uppercase tracking-wider text-ink-700 font-semibold">Navigate</p>
            <ul className="space-y-0.5">
              {navSections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollToSection(s.id)}
                    className="nav-item flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-ink-100"
                  >
                    <s.icon size={15} className="text-ink-500" />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* courses list */}
            <div className="mt-6">
              <p className="mb-2 px-3 text-[10px] uppercase tracking-wider text-ink-700 font-semibold">Courses</p>
              <ul className="space-y-1">
                {deck.courses.map((c) => {
                  const r = readiness.find((r) => r.course.id === c.id);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => scrollToSection("readiness")}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-ink-100 hover:bg-white/3 transition-colors"
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: c.color }}
                        />
                        <span className="truncate flex-1 text-left">{c.code}</span>
                        {r && (
                          <span className="font-mono text-[10px] text-ink-500">{r.score}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* study heatmap */}
            <div className="mt-6">
              <p className="mb-2 px-3 text-[10px] uppercase tracking-wider text-ink-700 font-semibold">Activity</p>
              <div className="px-2">
                <StudyHeatmap reviews={deck.reviews} />
              </div>
            </div>
          </nav>

          {/* sidebar footer */}
          <div className="border-t border-white/5 px-4 py-3 space-y-2">
            <span className="flex items-center gap-1.5 text-[10px] text-ink-700">
              <ShieldCheck size={11} className="text-star-400" />
              Grounded · cite or refuse
            </span>
            <p className="text-[10px] text-ink-700">
              by <span className="text-ink-500">Erica Innocent Effiong</span>
            </p>
            <div className="flex items-center gap-2">
              {perm !== "unsupported" && (
                <button
                  onClick={() => void remindMe()}
                  title={perm === "denied" ? "Notifications blocked" : "Send me a study nudge"}
                  disabled={perm === "denied"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 px-2.5 py-1.5 text-[10px] text-ink-500 transition-colors hover:text-thread-300 disabled:opacity-40"
                >
                  {perm === "granted" ? <BellRing size={11} /> : <Bell size={11} />}
                  {perm === "granted" ? "Nudge" : "Remind"}
                </button>
              )}
              <button
                onClick={() => {
                  resetDeck();
                  setDeck(freshDeck());
                }}
                title="Reset to demo state"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 px-2.5 py-1.5 text-[10px] text-ink-500 transition-colors hover:text-ink-300"
              >
                <RefreshCw size={11} />
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* mobile header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-night-950/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true">
                <circle cx="6" cy="18" r="2.4" fill="#f5b83d" />
                <circle cx="13" cy="6" r="2.4" fill="#8b9afb" />
                <circle cx="21" cy="15" r="2.4" fill="#6fc7bd" />
                <path d="M6 18 L13 6 L21 15" stroke="#6f7ff2" strokeWidth="1.2" fill="none" opacity="0.7" />
              </svg>
              <span className="display text-base font-semibold tracking-tight text-ink-100">Constella</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-star-500/30 bg-star-500/8 px-2 py-1 text-[10px] text-star-300">
                <ShieldCheck size={10} /> cite or refuse
              </span>
              <button
                onClick={() => {
                  resetDeck();
                  setDeck(freshDeck());
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-white/8 px-2 py-1.5 text-[10px] text-ink-500"
              >
                <RefreshCw size={10} />
              </button>
            </div>
          </header>

          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 max-w-6xl mx-auto">
            {/* ── constellation (hero — top, bold) ─────── */}
            <Section>
              <div id="constellation" className="mb-8">
                <Constellation courses={deck.courses} links={deck.links} />
              </div>
            </Section>

            {/* plan header */}
            <Section delay={0.06}>
              {deck.profile ? (
                <PlanHeader
                  profile={deck.profile}
                  courses={deck.courses}
                  readiness={readiness}
                  dueToday={due.length}
                  reviews={deck.reviews}
                  onAddCourse={scrollToAddCourse}
                />
              ) : (
                <div className="mb-8">
                  <h1 className="display mb-2 text-3xl font-semibold leading-tight text-ink-100 sm:text-4xl">
                    Every answer has a source.
                    <br />
                    <span className="gradient-text">Every subject has a thread.</span>
                  </h1>
                  <p className="text-sm text-ink-500 max-w-xl">
                    A study companion that draws connections between your courses and grounds every answer in your own material.
                  </p>
                </div>
              )}
            </Section>

            {/* ── study session + quick stats ───────────── */}
            <div className="mb-6 grid gap-5 lg:grid-cols-3" id="study">
              <div className="lg:col-span-2">
                <Section delay={0.14}>
                  {/* mode toggle */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex rounded-xl border border-white/8 bg-night-700/40 p-0.5">
                      <button
                        onClick={() => setMode("quiz")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                          mode === "quiz"
                            ? "bg-thread-500 text-night-900 shadow-sm"
                            : "text-ink-300 hover:text-ink-100"
                        }`}
                      >
                        <ListChecks size={13} /> Quiz
                      </button>
                      <button
                        onClick={() => setMode("study")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                          mode === "study"
                            ? "bg-thread-500 text-night-900 shadow-sm"
                            : "text-ink-300 hover:text-ink-100"
                        }`}
                      >
                        <BookOpen size={13} /> Study
                      </button>
                    </div>
                    <span className="text-[11px] text-ink-500 font-mono">
                      {due.length} card{due.length !== 1 ? "s" : ""} due
                    </span>
                  </div>

                  {current && currentCourse ? (
                    <FlashcardView
                      key={current.id}
                      card={current}
                      courseLabel={`${currentCourse.code} · ${currentCourse.name}`}
                      courseColor={currentCourse.color}
                      studyMode={mode === "study"}
                      onRate={rate}
                    />
                  ) : (
                    <div className="glass-glow rounded-2xl p-8 text-center">
                      <div className="mb-3 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-thread-500/10 border border-thread-500/20">
                          <Zap size={20} className="text-thread-300" />
                        </div>
                      </div>
                      <p className="display mb-1.5 text-lg text-ink-100">All caught up ✦</p>
                      <p className="text-sm text-ink-500 max-w-sm mx-auto">
                        {mode === "study"
                          ? "No study facts queued. Switch to Quiz, or they'll resurface later."
                          : "Nothing is due. The scheduler will bring cards back right before you'd forget them."}
                      </p>
                    </div>
                  )}
                </Section>
              </div>

              {/* sidebar stats */}
              <Section delay={0.18}>
                <div className="flex flex-col gap-3">
                  {/* next exam quick card */}
                  <div className="glass stat-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarClock size={13} className="text-ink-500" />
                      <span className="text-[11px] uppercase tracking-wider text-ink-500">next exam</span>
                    </div>
                    {nextExam ? (
                      <>
                        <p className="display text-2xl font-semibold text-ink-100">
                          {nextExam.days}
                          <span className="ml-1 text-sm text-ink-500">days</span>
                        </p>
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          {nextExam.course.code} · {nextExam.course.name}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-ink-500">No exams scheduled</p>
                    )}
                  </div>

                  {/* streak */}
                  <div className="glass stat-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame size={13} className="text-ink-500" />
                      <span className="text-[11px] uppercase tracking-wider text-ink-500">streak</span>
                    </div>
                    <p className="display text-2xl font-semibold text-ink-100">{deck.streak}</p>
                    <p className="text-[11px] text-ink-500 mt-0.5">miss a day? We re-plan, not shame.</p>
                  </div>

                  {/* quick course list */}
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 size={13} className="text-ink-500" />
                      <span className="text-[11px] uppercase tracking-wider text-ink-500">courses</span>
                    </div>
                    <div className="space-y-2">
                      {readiness.slice(0, 4).map((r) => (
                        <div key={r.course.id} className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: r.course.color }}
                          />
                          <span className="text-xs text-ink-300 truncate flex-1">{r.course.code}</span>
                          <div className="h-1 w-12 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${r.score}%`,
                                background: r.course.color,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-ink-500 w-6 text-right">{r.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            <div className="section-divider mb-6" />

            {/* ── readiness ──────────────────────────────── */}
            <Section delay={0.22}>
              <div id="readiness" className="mb-6">
                <ReadinessPanel items={readiness} onSetWeight={setWeight} />
              </div>
            </Section>

            <div className="section-divider mb-6" />

            {/* ── tutor ──────────────────────────────────── */}
            <Section delay={0.26}>
              <div id="tutor" className="mb-6">
                <TutorPanel courses={deck.courses} />
              </div>
            </Section>

            <div className="section-divider mb-6" />

            {/* ── upload ─────────────────────────────────── */}
            <Section delay={0.3}>
              <div id="add-course">
                <UploadPanel courseCount={deck.courses.length} onAdd={addCourse} />
              </div>
            </Section>

            <footer className="mt-16 mb-8 text-center">
              <div className="section-divider mb-6" />
              <p className="font-mono text-[10px] text-ink-700 mb-1">
                constella · designed &amp; built by <span className="text-ink-500">Erica Innocent Effiong</span> · innovation studio hackathon
              </p>
              <p className="font-mono text-[9px] text-ink-700">
                concept, design, and implementation — all original work
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
