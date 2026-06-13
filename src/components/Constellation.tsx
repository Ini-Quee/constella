import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import type { Course, CrossLink } from "../lib/types";
import { computeLayout, VIEW_W, VIEW_H } from "../lib/layout";

/* ─────────────────────────────────────────────────────────
   THE CONSTELLATION — the signature element.
   Each course is a star cluster. Each cross-discipline link
   is a thread of light that draws itself in. Clicking a
   thread reveals the insight. No two students' skies match,
   because the sky is a portrait of THEIR courses — including
   every course they upload (positions are computed in
   lib/layout.ts, never hardcoded).
   Solid threads are curated, verified links. Dashed threads
   are the engine's own suggestions, honestly flagged.
   ───────────────────────────────────────────────────────── */

const AMBIENT_STARS = [
  [60, 60], [340, 50], [470, 90], [720, 60], [760, 200], [60, 330],
  [120, 400], [700, 330], [380, 200], [300, 250], [520, 300], [740, 420],
  [200, 320], [620, 400], [90, 190],
] as const;

export function Constellation({
  courses,
  links,
}: {
  courses: Course[];
  links: CrossLink[];
}) {
  const [active, setActive] = useState<CrossLink | null>(null);

  const layout = useMemo(() => computeLayout(courses), [courses]);

  const topicMeta = useMemo(() => {
    const m = new Map<string, { title: string; color: string; courseCode: string }>();
    for (const c of courses)
      for (const t of c.topics) m.set(t.id, { title: t.title, color: c.color, courseCode: c.code });
    return m;
  }, [courses]);

  const drawableLinks = links.filter(
    (l) => layout.nodes.has(l.fromTopicId) && layout.nodes.has(l.toTopicId),
  );

  return (
    <div className="glass dotgrid relative overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <h2 className="display text-sm font-semibold text-ink-100">Your constellation</h2>
          <p className="text-xs text-ink-500">
            {courses.length} courses · {drawableLinks.length} threads found across subjects
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-thread-500/40 bg-thread-500/10 px-2.5 py-1 text-[11px] text-thread-300 sm:inline-flex">
          <Link2 size={12} /> tap a glowing thread
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label="Knowledge constellation showing connections between courses"
      >
        {/* ambient sky */}
        {AMBIENT_STARS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.4}
            fill="#aab5ff"
            opacity={0.35}
            className="twinkle"
            style={{ animationDelay: `${(i % 5) * 0.55}s` }}
          />
        ))}

        {/* threads between subjects */}
        {drawableLinks.map((l) => {
          const a = layout.nodes.get(l.fromTopicId)!;
          const b = layout.nodes.get(l.toTopicId)!;
          const midX = (a.x + b.x) / 2;
          const midY = Math.min(a.y, b.y) - 36;
          const d = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
          const isActive = active?.id === l.id;
          const inferred = l.tier === "inferred";
          return (
            <g key={l.id}>
              <path
                d={d}
                fill="none"
                stroke={isActive ? "#aab5ff" : inferred ? "#8b9afb" : "#6f7ff2"}
                strokeWidth={isActive ? 2.4 : 1.4}
                strokeDasharray={inferred ? "5 6" : undefined}
                strokeOpacity={inferred ? (isActive ? 1 : 0.55) : undefined}
                opacity={inferred ? undefined : isActive ? 1 : 0.55}
                className={inferred ? "thread-fade" : "thread-draw"}
              />
              {/* generous invisible hit area */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={22}
                style={{ cursor: "pointer" }}
                onClick={() => setActive(isActive ? null : l)}
              />
            </g>
          );
        })}

        {/* course clusters */}
        {courses.map((course) =>
          course.topics.map((t) => {
            const p = layout.nodes.get(t.id);
            if (!p) return null;
            return (
              <g key={t.id}>
                <circle cx={p.x} cy={p.y} r={11} fill={course.color} opacity={0.18} />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={course.color}
                  className="twinkle"
                  style={{ animationDelay: `${(Math.round(p.x) % 7) * 0.2}s` }}
                />
                <text x={p.lx} y={p.ly} textAnchor={p.anchor} fontSize={12} fill="#b9becf">
                  {t.title}
                </text>
              </g>
            );
          }),
        )}

        {/* cluster captions */}
        {courses.map((c) => {
          const cap = layout.captions.get(c.id);
          if (!cap) return null;
          return (
            <text
              key={c.id}
              x={cap.x}
              y={cap.y}
              textAnchor="middle"
              fontSize={11}
              fill={c.color}
              opacity={0.9}
              style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}
            >
              {c.code.toUpperCase()}
            </text>
          );
        })}
      </svg>

      {/* insight reveal */}
      {active && (
        <div className="border-t border-white/8 bg-night-700/60 px-5 py-4">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-thread-300">
            {topicMeta.get(active.fromTopicId)?.courseCode} ↔ {topicMeta.get(active.toTopicId)?.courseCode}
            {" · "}
            {active.tier === "inferred" ? "suggested link — verify" : "verified cross-subject thread"}
          </p>
          <p className="text-sm leading-relaxed text-ink-100">{active.insight}</p>
        </div>
      )}
    </div>
  );
}
