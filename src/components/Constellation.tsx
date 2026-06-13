import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import type { Course, CrossLink } from "../lib/types";

/* ─────────────────────────────────────────────────────────
   THE CONSTELLATION — the signature element.
   Each course is a star cluster. Each cross-discipline link
   is a thread of light that draws itself in. Clicking a
   thread reveals the insight. No two students' skies match,
   because the sky is a portrait of THEIR courses.
   ───────────────────────────────────────────────────────── */

const POS: Record<string, { x: number; y: number; label: "left" | "right" | "below" }> = {
  "t-actus": { x: 150, y: 112, label: "left" },
  "t-arrest": { x: 248, y: 178, label: "below" },
  "t-defences": { x: 158, y: 246, label: "left" },
  "t-rights": { x: 548, y: 108, label: "right" },
  "t-fairhearing": { x: 648, y: 178, label: "right" },
  "t-separation": { x: 580, y: 250, label: "right" },
  "t-network": { x: 318, y: 352, label: "left" },
  "t-sqli": { x: 412, y: 312, label: "below" },
  "t-auth": { x: 492, y: 382, label: "right" },
};

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

  const topicMeta = useMemo(() => {
    const m = new Map<string, { title: string; color: string; courseCode: string }>();
    for (const c of courses)
      for (const t of c.topics) m.set(t.id, { title: t.title, color: c.color, courseCode: c.code });
    return m;
  }, [courses]);

  const drawableLinks = links.filter((l) => POS[l.fromTopicId] && POS[l.toTopicId]);

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

      <svg viewBox="0 0 800 460" className="w-full" role="img" aria-label="Knowledge constellation showing connections between courses">
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
          const a = POS[l.fromTopicId];
          const b = POS[l.toTopicId];
          const midX = (a.x + b.x) / 2;
          const midY = Math.min(a.y, b.y) - 36;
          const isActive = active?.id === l.id;
          return (
            <g key={l.id}>
              <path
                d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
                fill="none"
                stroke={isActive ? "#aab5ff" : "#6f7ff2"}
                strokeWidth={isActive ? 2.4 : 1.4}
                opacity={isActive ? 1 : 0.55}
                className="thread-draw"
              />
              {/* generous invisible hit area */}
              <path
                d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
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
            const p = POS[t.id];
            if (!p) return null;
            const anchor = p.label === "left" ? "end" : p.label === "right" ? "start" : "middle";
            const lx = p.label === "left" ? p.x - 14 : p.label === "right" ? p.x + 14 : p.x;
            const ly = p.label === "below" ? p.y + 24 : p.y + 4;
            return (
              <g key={t.id}>
                <circle cx={p.x} cy={p.y} r={11} fill={course.color} opacity={0.18} />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill={course.color}
                  className="twinkle"
                  style={{ animationDelay: `${(p.x % 7) * 0.2}s` }}
                />
                <text x={lx} y={ly} textAnchor={anchor} fontSize={12} fill="#b9becf">
                  {t.title}
                </text>
              </g>
            );
          }),
        )}

        {/* cluster captions */}
        {courses.map((c, i) => {
          const caption = [
            { x: 165, y: 58 },
            { x: 595, y: 58 },
            { x: 405, y: 444 },
          ][i] ?? { x: 60 + i * 200, y: 30 };
          return (
            <text key={c.id} x={caption.x} y={caption.y} textAnchor="middle" fontSize={11} fill={c.color} opacity={0.9} style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>
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
            {" · "}suggested link — verify
          </p>
          <p className="text-sm leading-relaxed text-ink-100">{active.insight}</p>
        </div>
      )}
    </div>
  );
}
