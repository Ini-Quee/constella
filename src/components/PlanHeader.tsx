import { useMemo } from "react";
import { CalendarClock, Award, Layers, Gauge, Plus, ArrowRight, TrendingUp } from "lucide-react";
import type { Course, UserProfile, ReviewLog } from "../lib/types";
import type { CourseReadiness } from "../lib/analytics";
import { ReadinessRing } from "./ReadinessRing";
import { Sparkline } from "./Sparkline";

/* ─────────────────────────────────────────────────────────
   PLAN HEADER v2 — dashboard hero with rich stats.
   Animated readiness ring, sparkline trends, better
   visual hierarchy. The "you are here" moment.
   ───────────────────────────────────────────────────────── */

const DAY = 24 * 3600 * 1000;
function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.ceil((t - Date.now()) / DAY));
}

function urgencyColor(days: number | null): string {
  if (days === null) return "var(--color-ink-100)";
  if (days <= 7) return "var(--color-ember-400)";
  if (days <= 21) return "var(--color-star-300)";
  return "var(--color-ink-100)";
}

export function PlanHeader({
  profile,
  courses,
  readiness,
  dueToday,
  reviews,
  onAddCourse,
}: {
  profile: UserProfile;
  courses: Course[];
  readiness: CourseReadiness[];
  dueToday: number;
  reviews: ReviewLog[];
  onAddCourse: () => void;
}) {
  const finals = daysUntil(profile.finalsDate);
  const cert = daysUntil(profile.certExamDate);
  const topics = courses.reduce((s, c) => s + c.topics.length, 0);
  const avg = readiness.length
    ? Math.round(readiness.reduce((s, r) => s + r.score, 0) / readiness.length)
    : 0;
  const avgBand = avg >= 85 ? "exam-ready" : avg >= 70 ? "on track" : avg >= 40 ? "getting there" : "needs work";

  // build a 7-day review sparkline
  const sparkData = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayStart.setDate(dayStart.getDate() - i);
      dayEnd.setDate(dayEnd.getDate() - i + 1);
      const count = reviews.filter((r) => r.at >= dayStart.getTime() && r.at < dayEnd.getTime()).length;
      days.push(count);
    }
    return days;
  }, [reviews]);

  const totalReviews = reviews.length;

  return (
    <div className="mb-8">
      {/* greeting */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-thread-300 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-thread-500 glow-pulse" />
            your study plan
          </p>
          <h1 className="display text-2xl font-semibold leading-tight text-ink-100 sm:text-3xl">
            Hi {profile.name} — <span className="gradient-text">here's your plan</span>
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/8 bg-night-700/60 px-2.5 py-1 text-ink-300">
              {profile.institution}
            </span>
            <span className="rounded-full border border-white/8 bg-night-700/60 px-2.5 py-1 text-ink-300">
              {profile.programme} · Year {profile.year}
            </span>
            {profile.goal && (
              <span className="rounded-full border border-star-500/25 bg-star-500/8 px-2.5 py-1 text-star-300 flex items-center gap-1">
                <ArrowRight size={10} /> {profile.goal}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onAddCourse}
          className="inline-flex items-center gap-2 rounded-xl bg-thread-500 px-4 py-2.5 text-sm font-medium text-night-900 transition-all hover:bg-thread-400 hover:shadow-lg hover:shadow-thread-500/20"
        >
          <Plus size={16} /> Add a course
        </button>
      </div>

      {/* stat cards grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* readiness ring card */}
        <div className="glass stat-card col-span-2 rounded-2xl p-5 lg:col-span-1">
          <div className="mb-2 flex items-center gap-1.5 text-ink-500">
            <Gauge size={13} />
            <span className="text-[11px] uppercase tracking-wider">readiness</span>
          </div>
          <div className="flex items-center gap-3">
            <ReadinessRing score={avg} band={avgBand} size={56} strokeWidth={4} />
            <div>
              <p className="text-xs text-ink-500">{courses.length} courses</p>
              <p className="text-xs text-ink-500">{topics} topics</p>
            </div>
          </div>
        </div>

        {/* due today */}
        <div className="glass stat-card rounded-2xl p-5">
          <div className="mb-2 flex items-center gap-1.5 text-ink-500">
            <Layers size={13} />
            <span className="text-[11px] uppercase tracking-wider">due now</span>
          </div>
          <p className="display text-3xl font-semibold text-ink-100 leading-none">{dueToday}</p>
          <div className="mt-2 flex items-center gap-2">
            <Sparkline data={sparkData} width={64} height={20} color="#6f7ff2" />
            <span className="text-[10px] text-ink-500">7d trend</span>
          </div>
        </div>

        {/* finals countdown */}
        <div className="glass stat-card rounded-2xl p-5">
          <div className="mb-2 flex items-center gap-1.5 text-ink-500">
            <CalendarClock size={13} />
            <span className="text-[11px] uppercase tracking-wider">finals in</span>
          </div>
          <p className="display text-3xl font-semibold leading-none" style={{ color: urgencyColor(finals) }}>
            {finals !== null ? finals : "—"}
            {finals !== null && <span className="ml-1 text-sm text-ink-500">days</span>}
          </p>
          <p className="mt-1.5 text-[10px] text-ink-500 truncate">
            {profile.finalsDate ? new Date(profile.finalsDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date set"}
          </p>
        </div>

        {/* cert exam */}
        <div className="glass stat-card rounded-2xl p-5">
          <div className="mb-2 flex items-center gap-1.5 text-ink-500">
            <Award size={13} />
            <span className="text-[11px] uppercase tracking-wider">cert exam</span>
          </div>
          <p className="display text-3xl font-semibold leading-none" style={{ color: cert !== null && cert <= 21 ? "var(--color-star-300)" : "var(--color-ink-100)" }}>
            {cert !== null ? cert : "—"}
            {cert !== null && <span className="ml-1 text-sm text-ink-500">days</span>}
          </p>
          <p className="mt-1.5 text-[10px] text-ink-500 truncate">
            {profile.certTarget || "No cert set"}
          </p>
        </div>
      </div>
    </div>
  );
}
