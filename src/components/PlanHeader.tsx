import { CalendarClock, Award, Layers, Gauge, Plus } from "lucide-react";
import type { Course, UserProfile } from "../lib/types";
import type { CourseReadiness } from "../lib/analytics";

/* ─────────────────────────────────────────────────────────
   PLAN HEADER — the app's purpose, on screen, immediately.
   Who you are, what you're working toward, and the numbers
   that matter: exam countdowns, topics to master, overall
   readiness. This is what turns "some courses" into "MY plan"
   and explains why a law student's sky also holds cloud/IT.
   ───────────────────────────────────────────────────────── */

const DAY = 24 * 3600 * 1000;
function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.ceil((t - Date.now()) / DAY));
}

function Stat({ icon, value, unit, label, accent }: {
  icon: React.ReactNode; value: string; unit?: string; label: string; accent?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-1 flex items-center gap-1.5 text-ink-500">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="display text-3xl font-semibold" style={{ color: accent ?? "var(--color-ink-100)" }}>
        {value}
        {unit && <span className="ml-1 text-base text-ink-500">{unit}</span>}
      </p>
    </div>
  );
}

export function PlanHeader({
  profile,
  courses,
  readiness,
  dueToday,
  onAddCourse,
}: {
  profile: UserProfile;
  courses: Course[];
  readiness: CourseReadiness[];
  dueToday: number;
  onAddCourse: () => void;
}) {
  const finals = daysUntil(profile.finalsDate);
  const cert = daysUntil(profile.certExamDate);
  const topics = courses.reduce((s, c) => s + c.topics.length, 0);
  const avg = readiness.length
    ? Math.round(readiness.reduce((s, r) => s + r.score, 0) / readiness.length)
    : 0;

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-thread-300">your study plan</p>
          <h1 className="display text-2xl font-semibold leading-tight text-ink-100 sm:text-3xl">
            Hi {profile.name} — here's your plan
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-night-700/60 px-2.5 py-1 text-ink-300">
              {profile.institution}
            </span>
            <span className="rounded-full border border-white/10 bg-night-700/60 px-2.5 py-1 text-ink-300">
              {profile.programme} · Year {profile.year}
            </span>
            {profile.goal && (
              <span className="rounded-full border border-star-500/30 bg-star-500/10 px-2.5 py-1 text-star-300">
                → {profile.goal}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Your degree{profile.certTarget ? <> and your <span className="text-ink-300">{profile.certTarget}</span> goal</> : null}, threaded into one sky — every card is grounded in your own material.
          </p>
        </div>
        <button
          onClick={onAddCourse}
          className="inline-flex items-center gap-2 rounded-xl bg-thread-500 px-4 py-2.5 text-sm font-medium text-night-900 transition-colors hover:bg-thread-400"
        >
          <Plus size={16} /> Add a course
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<CalendarClock size={14} />}
          label="finals in"
          value={finals !== null ? String(finals) : "—"}
          unit={finals !== null ? "days" : undefined}
          accent="var(--color-ink-100)"
        />
        <Stat
          icon={<Award size={14} />}
          label={profile.certTarget ? "cert exam in" : "cert exam"}
          value={cert !== null ? String(cert) : "—"}
          unit={cert !== null ? "days" : undefined}
          accent="var(--color-star-300)"
        />
        <Stat icon={<Layers size={14} />} label="topics to master" value={String(topics)} />
        <Stat
          icon={<Gauge size={14} />}
          label="overall readiness"
          value={String(avg)}
          unit="%"
          accent={avg >= 70 ? "var(--color-thread-300)" : avg < 40 ? "var(--color-ember-400)" : "var(--color-ink-100)"}
        />
      </div>
    </div>
  );
}
