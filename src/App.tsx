import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Flame, CalendarClock, Layers, ShieldCheck, RefreshCw } from "lucide-react";
import type { Course, DeckState, Flashcard, Rating } from "./lib/types";
import { freshDeck } from "./lib/demoData";
import { dueCards, loadDeck, saveDeck, schedule, resetDeck } from "./lib/scheduler";
import { suggestCrossLinks } from "./lib/crosslinks";
import { Constellation } from "./components/Constellation";
import { FlashcardView } from "./components/Flashcard";
import { TutorPanel } from "./components/TutorPanel";
import { UploadPanel } from "./components/UploadPanel";

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
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

  const due = useMemo(() => dueCards(deck.cards), [deck.cards]);
  const current = due[0] ?? null;
  const currentCourse = current ? deck.courses.find((c) => c.id === current.courseId) : null;

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
    setDeck((d) => ({
      ...d,
      cards: d.cards.map((c) => (c.id === current.id ? schedule(c, rating) : c)),
    }));
  }

  function addCourse(course: Course, cards: Flashcard[]) {
    setDeck((d) => {
      // The wow moment: thread the new course into the existing sky.
      // Inferred (keyword-overlap) links, honestly flagged "verify".
      const inferred = suggestCrossLinks(course, d.courses);
      return {
        ...d,
        courses: [...d.courses, course],
        links: [...d.links, ...inferred],
        cards: [...d.cards, ...cards],
      };
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      {/* ── header ─────────────────────────────────────── */}
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="6" cy="18" r="2.4" fill="#f5b83d" />
            <circle cx="13" cy="6" r="2.4" fill="#8b9afb" />
            <circle cx="21" cy="15" r="2.4" fill="#6fc7bd" />
            <path d="M6 18 L13 6 L21 15" stroke="#6f7ff2" strokeWidth="1.2" fill="none" opacity="0.7" />
          </svg>
          <span className="display text-lg font-semibold tracking-tight text-ink-100">Constella</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-star-500/40 bg-star-500/10 px-3 py-1.5 text-[11px] font-medium text-star-300 sm:inline-flex">
            <ShieldCheck size={13} /> Grounded · cite or refuse
          </span>
          <button
            onClick={() => {
              resetDeck();
              setDeck(freshDeck());
            }}
            title="Reset demo data"
            aria-label="Reset demo data"
            className="rounded-full border border-white/10 p-2 text-ink-500 transition-colors hover:text-ink-300"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </header>

      {/* ── hero ───────────────────────────────────────── */}
      <Section>
        <h1 className="display mb-2 text-3xl font-semibold leading-tight text-ink-100 sm:text-4xl">
          Every answer has a source.
          <br />
          <span className="text-thread-300">Every subject has a thread.</span>
        </h1>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-ink-500">
          Constella studies from <em className="not-italic text-ink-300">your</em> uploaded material — citing the
          exact line for every claim, refusing honestly when it doesn't know, and weaving your courses into one
          connected sky.
        </p>
      </Section>

      {/* ── bento: constellation + today ───────────────── */}
      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Section delay={0.08}>
          <div className="lg:hidden" />
        </Section>
        <div className="lg:col-span-2">
          <Section delay={0.08}>
            <Constellation courses={deck.courses} links={deck.links} />
          </Section>
        </div>
        <Section delay={0.16}>
          <div className="flex h-full flex-col gap-4">
            <div className="glass flex-1 rounded-2xl p-5">
              <div className="mb-1 flex items-center gap-2 text-ink-500">
                <Layers size={14} />
                <span className="text-[11px] uppercase tracking-wider">due now</span>
              </div>
              <p className="display text-4xl font-semibold text-ink-100">{due.length}</p>
              <p className="text-xs text-ink-500">cards scheduled by recall, not by guilt</p>
            </div>
            <div className="glass flex-1 rounded-2xl p-5">
              <div className="mb-1 flex items-center gap-2 text-ink-500">
                <CalendarClock size={14} />
                <span className="text-[11px] uppercase tracking-wider">next exam</span>
              </div>
              {nextExam ? (
                <>
                  <p className="display text-4xl font-semibold text-ink-100">
                    {nextExam.days}
                    <span className="ml-1 text-base text-ink-500">days</span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {nextExam.course.code} · {nextExam.course.name}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-500">No exams scheduled</p>
              )}
            </div>
            <div className="glass flex-1 rounded-2xl p-5">
              <div className="mb-1 flex items-center gap-2 text-ink-500">
                <Flame size={14} />
                <span className="text-[11px] uppercase tracking-wider">streak</span>
              </div>
              <p className="display text-4xl font-semibold text-ink-100">{deck.streak}</p>
              <p className="text-xs text-ink-500">miss a day? We re-plan, we don't shame.</p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── study session ──────────────────────────────── */}
      <Section delay={0.22}>
        <div className="mb-5">
          {current && currentCourse ? (
            <FlashcardView
              key={current.id}
              card={current}
              courseLabel={`${currentCourse.code} · ${currentCourse.name}`}
              courseColor={currentCourse.color}
              onRate={rate}
            />
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="display mb-1 text-lg text-ink-100">All caught up ✦</p>
              <p className="text-sm text-ink-500">
                Nothing is due. The scheduler will bring cards back right before you'd forget them.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* ── tutor ──────────────────────────────────────── */}
      <Section delay={0.28}>
        <div className="mb-5">
          <TutorPanel courses={deck.courses} />
        </div>
      </Section>

      {/* ── upload ─────────────────────────────────────── */}
      <Section delay={0.34}>
        <UploadPanel courseCount={deck.courses.length} onAdd={addCourse} />
      </Section>

      <footer className="mt-12 text-center font-mono text-[10px] text-ink-700">
        constella · built for the innovation studio hackathon · grounded by design
      </footer>
    </div>
  );
}
