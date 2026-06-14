import { TrendingUp, TrendingDown, Minus, Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { CourseReadiness, ReadinessBand, Trend } from "../lib/analytics";
import { ReadinessRing } from "./ReadinessRing";

/* ─────────────────────────────────────────────────────────
   READINESS PANEL v2 — radial rings, richer layout.
   Each course gets a ring + details. Top course gets
   focus treatment. Better visual hierarchy.
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
      <p className="mb-5 text-xs text-ink-500">
        Your priority <span className="text-ink-300">×</span> the data from your daily answers. Not a grade — a diagnosis.
      </p>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={it.course.id}
            className={`group rounded-xl border p-4 transition-all duration-200 ${
              i === 0
                ? "border-thread-500/30 bg-gradient-to-r from-thread-500/8 to-transparent hover:border-thread-500/50"
                : "border-white/6 bg-night-700/30 hover:border-white/10 hover:bg-night-700/50"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* ring */}
              <div className="shrink-0 hidden sm:block">
                <ReadinessRing score={it.score} band={it.band} size={64} strokeWidth={4} />
              </div>

              {/* details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: it.course.color }}
                    aria-hidden
                  />
                  <span className="font-mono text-xs text-ink-300">{it.course.code}</span>
                  <span className="text-sm text-ink-100 font-medium">{it.course.name}</span>
                  {i === 0 && (
                    <span className="rounded-full border border-thread-500/40 bg-thread-500/10 px-2 py-0.5 text-[10px] font-medium text-thread-300">
                      focus now
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <TrendIcon trend={it.trend} />
                    <span className={`display text-lg font-semibold leading-none ${BAND_TEXT[it.band]}`}>{it.score}</span>
                    <span className="text-[10px] text-ink-500">/100</span>
                  </div>
                </div>

                {/* progress bar */}
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${BAR[it.band]}`}
                    style={{ width: `${it.score}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`text-[11px] ${BAND_TEXT[it.band]}`}>{it.band}</span>

                  {it.examReady && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-thread-300">
                      <CheckCircle2 size={11} /> exam-ready
                    </span>
                  )}

                  {it.daysToExam !== null && it.daysToExam >= 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                      <Clock size={10} /> {it.daysToExam}d to exam
                    </span>
                  )}

                  {it.weakTopics.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <AlertTriangle size={10} className="text-ember-400" />
                      <span className="text-ink-400">weak: {it.weakTopics.join(", ")}</span>
                    </span>
                  )}

                  {/* priority weight */}
                  <div className="ml-auto flex items-center gap-1" role="group" aria-label="Priority weight">
                    {WEIGHTS.map((w) => (
                      <button
                        key={w.v}
                        onClick={() => onSetWeight(it.course.id, w.v)}
                        aria-pressed={it.course.weight === w.v}
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] transition-colors ${
                          it.course.weight === w.v
                            ? "border-thread-500/50 bg-thread-500/10 text-thread-300"
                            : "border-white/8 text-ink-500 hover:text-ink-300"
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
