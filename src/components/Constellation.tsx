import { useMemo, useState } from "react";
import { Link2, Eye, Maximize2 } from "lucide-react";
import type { Course, CrossLink } from "../lib/types";
import { computeLayout, VIEW_W, VIEW_H } from "../lib/layout";

/* ─────────────────────────────────────────────────────────
   THE CONSTELLATION — the signature element, v2.
   Bigger canvas, hover glow on nodes, click-to-filter,
   ambient nebula glow, and richer thread rendering.
   ───────────────────────────────────────────────────────── */

const AMBIENT_STARS = [
  [45, 45], [180, 30], [320, 55], [500, 40], [680, 35], [780, 50],
  [850, 120], [820, 250], [780, 370], [700, 420], [550, 450], [380, 440],
  [200, 420], [80, 380], [40, 280], [30, 160], [130, 80], [420, 30],
  [600, 60], [720, 180], [680, 320], [500, 380], [300, 380], [150, 300],
  [100, 200], [250, 130], [450, 100], [620, 130], [750, 280], [580, 350],
] as const;

export function Constellation({
  courses,
  links,
}: {
  courses: Course[];
  links: CrossLink[];
}) {
  const [active, setActive] = useState<CrossLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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

  // courses connected to the active link
  const activeCourseIds = useMemo(() => {
    if (!active) return new Set<string>();
    const fromMeta = topicMeta.get(active.fromTopicId);
    const toMeta = topicMeta.get(active.toTopicId);
    return new Set([fromMeta?.courseCode, toMeta?.courseCode].filter(Boolean));
  }, [active, topicMeta]);

  return (
    <div className="glass-glow dotgrid relative overflow-hidden rounded-2xl">
      {/* ambient nebula glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 300px at 40% 40%, rgba(111,127,242,0.06), transparent 60%), " +
            "radial-gradient(400px 200px at 70% 60%, rgba(245,184,61,0.04), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h2 className="display text-sm font-semibold text-ink-100">Your constellation</h2>
          <p className="text-xs text-ink-500">
            {courses.length} courses · {drawableLinks.length} threads found across subjects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-thread-500/30 bg-thread-500/8 px-2.5 py-1 text-[11px] text-thread-300 sm:inline-flex">
            <Link2 size={11} /> tap a glowing thread
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label="Knowledge constellation showing connections between courses"
        style={{ minHeight: 280 }}
      >
        <defs>
          {/* glow filters per course color */}
          {courses.map((c) => (
            <filter key={`glow-${c.id}`} id={`glow-${c.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0`} />
            </filter>
          ))}
          {/* thread glow */}
          <filter id="thread-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* ambient sky — more stars, varied sizes */}
        {AMBIENT_STARS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 4 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.9}
            fill="#aab5ff"
            opacity={i % 4 === 0 ? 0.4 : 0.2}
            className="twinkle"
            style={{ animationDelay: `${(i % 7) * 0.4}s` }}
          />
        ))}

        {/* threads between subjects — with glow layer underneath */}
        {drawableLinks.map((l) => {
          const a = layout.nodes.get(l.fromTopicId)!;
          const b = layout.nodes.get(l.toTopicId)!;
          const midX = (a.x + b.x) / 2;
          const midY = Math.min(a.y, b.y) - 40;
          const d = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
          const isActive = active?.id === l.id;
          const inferred = l.tier === "inferred";
          return (
            <g key={l.id}>
              {/* glow underlayer */}
              <path
                d={d}
                fill="none"
                stroke={isActive ? "#aab5ff" : inferred ? "#8b9afb" : "#6f7ff2"}
                strokeWidth={isActive ? 6 : 4}
                strokeOpacity={isActive ? 0.15 : 0.06}
                filter="url(#thread-glow)"
                className={inferred ? "thread-fade" : "thread-draw"}
              />
              {/* main thread */}
              <path
                d={d}
                fill="none"
                stroke={isActive ? "#aab5ff" : inferred ? "#8b9afb" : "#6f7ff2"}
                strokeWidth={isActive ? 2.4 : 1.6}
                strokeDasharray={inferred ? "5 6" : undefined}
                strokeOpacity={inferred ? (isActive ? 1 : 0.5) : undefined}
                opacity={inferred ? undefined : isActive ? 1 : 0.5}
                className={inferred ? "thread-fade" : "thread-draw"}
              />
              {/* hit area */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={24}
                style={{ cursor: "pointer" }}
                onClick={() => setActive(isActive ? null : l)}
              />
            </g>
          );
        })}

        {/* course clusters — with hover glow */}
        {courses.map((course) =>
          course.topics.map((t) => {
            const p = layout.nodes.get(t.id);
            if (!p) return null;
            const isHovered = hoveredNode === t.id;
            const isLinkedToActive = activeCourseIds.has(course.code);
            return (
              <g
                key={t.id}
                onMouseEnter={() => setHoveredNode(t.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                {/* outer glow — bigger on hover */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 16 : 12}
                  fill={course.color}
                  opacity={isHovered ? 0.25 : isLinkedToActive ? 0.2 : 0.12}
                  filter={isHovered ? `url(#glow-${course.id})` : undefined}
                  style={{ transition: "r 0.2s ease, opacity 0.2s ease" }}
                />
                {/* inner star */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 5}
                  fill={course.color}
                  className="twinkle"
                  style={{
                    animationDelay: `${(Math.round(p.x) % 7) * 0.2}s`,
                    transition: "r 0.2s ease",
                  }}
                />
                {/* label */}
                <text
                  x={p.lx}
                  y={p.ly}
                  textAnchor={p.anchor}
                  fontSize={isHovered ? 13 : 12}
                  fill={isHovered ? "#d2d7e2" : "#b9becf"}
                  style={{ transition: "font-size 0.15s ease, fill 0.15s ease" }}
                >
                  {t.title}
                </text>
              </g>
            );
          }),
        )}

        {/* cluster captions — course codes */}
        {courses.map((c) => {
          const cap = layout.captions.get(c.id);
          if (!cap) return null;
          const isActive = activeCourseIds.has(c.code);
          return (
            <text
              key={c.id}
              x={cap.x}
              y={cap.y}
              textAnchor="middle"
              fontSize={12}
              fill={c.color}
              opacity={isActive ? 1 : 0.85}
              style={{
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "0.1em",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {c.code.toUpperCase()}
            </text>
          );
        })}
      </svg>

      {/* insight reveal — richer panel */}
      {active && (
        <div className="relative z-10 border-t border-white/8 bg-night-800/80 backdrop-blur-sm px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-thread-500/10 border border-thread-500/20">
              <Eye size={14} className="text-thread-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-thread-300">
                {topicMeta.get(active.fromTopicId)?.courseCode} ↔ {topicMeta.get(active.toTopicId)?.courseCode}
                {" · "}
                {active.tier === "inferred" ? (
                  <span className="text-star-400">suggested link — verify</span>
                ) : (
                  "verified cross-subject thread"
                )}
              </p>
              <p className="text-sm leading-relaxed text-ink-100">{active.insight}</p>
            </div>
            <button
              onClick={() => setActive(null)}
              className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-ink-500 hover:text-ink-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
