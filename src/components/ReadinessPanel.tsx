import { TrendingUp, TrendingDown, Minus, Target, CheckCircle2 } from "lucide-react";
import type { CourseReadiness, ReadinessBand, Trend } from "../lib/analytics";

/* ─────────────────────────────────────────────────────────
   READINESS PANEL — "diagnose, don't just score."
   Names the shape of the student's understanding, not a
   grade: which course is trending up, which topics they keep
   missing, whether they're exam-ready, and — blending their
   own priority weight with the data — what to study next.
   ───────────────────────────────────────────────────────── */

const BAND_TEXT: Record<ReadinessBand, string> = {
  "not started": "text-ink-500",
  "needs work": "text-ember-400",
  "getting there": "text-ink-300",
  "on track": "text-thread-300",
  "exam-ready": "text-thread-300",
};

const BAR: Record<ReadinessBand, string> = {
  "not started": "bg-ink-700",
  "needs work": "bg-ember-500",
  "getting there": "bg-ink-500",
  "on track": "bg-thread-500",
  "exam-ready": "bg-thread-400",
};

const WEIGHTS = [
  { v: 1, label: "Low" },
  { v: 2, label: "Med" },
  { v: 3, label: "High" },
];

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp size={13} className="text-thread-300" />;
  if (trend === "down") return <TrendingDown size={13} className="text-ember-400" />;
  if (trend === "flat") return <Minus size={13} className="text-ink-500" />;
  return <span className="font-mono text-[10px] text-ink-700">new</span>;
}

export function ReadinessPanel({
  items,
  onSetWeight,
}: {
  items: CourseReadiness[];
  onSetWeight: (courseId: string, weight: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="glass rounded-2xl p-5 sm:p-6" aria-label="Course readiness">
      <div className="mb-1 flex items-center gap-2">
        <Target size={16} className="text-thread-300" />
        <h2 className="display text-base font-semibold text-ink-100">What to study next</h2>
      </div>
      <p className="mb-4 text-xs text-ink-500">
        Your priority <span className="text-ink-300">×</span> the data from your daily answers. Not a grade — a diagnosis.
      </p>

      <ol className="space-y-3">
        {items.map((it, i) => (
          <li
            key={it.course.id}
            className={`rounded-xl border p-3.5 ${
              i === 0 ? "border-thread-500/40 bg-thread-500/5" : "border-white/8 bg-night-700/40"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: it.course.color }}
                  aria-hidden
                />
                <span className="font-mono text-xs text-ink-300">{it.course.code}</span>
                <span className="text-sm text-ink-100">{it.course.name}</span>
                {i === 0 && (
                  <span className="rounded-full border border-thread-500/40 bg-thread-500/10 px-2 py-0.5 text-[10px] font-medium text-thread-300">
                    focus now
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon trend={it.trend} />
                <span className={`text-sm font-semibold ${BAND_TEXT[it.band]}`}>{it.score}</span>
              </div>
            </div>

            {/* score bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div className={`h-full rounded-full ${BAR[it.band]}`} style={{ width: `${it.score}%` }} />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-ink-500">
                <span className={BAND_TEXT[it.band]}>{it.band}</span>
                {it.examReady && (
                  <span className="ml-1.5 inline-flex items-center gap-1 text-thread-300">
                    <CheckCircle2 size={11} /> exam-ready
                  </span>
                )}
                {it.daysToExam !== null && it.daysToExam >= 0 && (
                  <span className="ml-1.5 text-ink-700">· exam in {it.daysToExam}d</span>
                )}
                {it.weakTopics.length > 0 && (
                  <span className="ml-1.5">
                    · weak on <span className="text-ink-300">{it.weakTopics.join(", ")}</span>
                  </span>
                )}
              </p>

              {/* priority weight — the student's own say, blended with the data */}
              <div className="flex items-center gap-1" role="group" aria-label="Priority weight">
                {WEIGHTS.map((w) => (
                  <button
                    key={w.v}
                    onClick={() => onSetWeight(it.course.id, w.v)}
                    aria-pressed={it.course.weight === w.v}
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] transition-colors ${
                      it.course.weight === w.v
                        ? "border-thread-500/50 bg-thread-500/10 text-thread-300"
                        : "border-white/10 text-ink-500 hover:text-ink-300"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
