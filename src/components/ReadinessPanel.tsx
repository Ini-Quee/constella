import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { CourseReadiness, ReadinessBand, Trend } from "../lib/analytics";

/* ─────────────────────────────────────────────────────────
   READINESS PANEL v3 — proper analytics graph.
   SVG bar chart with animated bars, grid lines,
   percentage labels. Looks like a real dashboard.
   ───────────────────────────────────────────────────────── */

const BAND_COLORS: Record<ReadinessBand, string> = {
  "not started": "#9197ab",
  "needs work": "#f0764a",
  "getting there": "#b2b8c8",
  "on track": "#6f7ff2",
  "exam-ready": "#8b9afb",
};

const BAND_GLOW: Record<ReadinessBand, string> = {
  "not started": "rgba(145,151,171,0.15)",
  "needs work": "rgba(240,118,74,0.15)",
  "getting there": "rgba(178,184,200,0.1)",
  "on track": "rgba(111,127,242,0.2)",
  "exam-ready": "rgba(139,154,251,0.25)",
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

// SVG bar chart component
function ReadinessChart({ items }: { items: CourseReadiness[] }) {
  const chartW = 600;
  const chartH = 220;
  const padL = 120;
  const padR = 60;
  const padT = 20;
  const padB = 30;
  const barH = 28;
  const barGap = 14;
  const innerW = chartW - padL - padR;

  // grid lines at 0, 25, 50, 75, 100
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${chartW} ${padT + items.length * (barH + barGap) - barGap + padB}`}
      className="w-full"
      style={{ minHeight: 180 }}
    >
      <defs>
        {items.map((it) => (
          <linearGradient key={`grad-${it.course.id}`} id={`bar-${it.course.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BAND_COLORS[it.band]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={BAND_COLORS[it.band]} stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      {/* grid lines */}
      {gridLines.map((v) => {
        const x = padL + (v / 100) * innerW;
        return (
          <g key={v}>
            <line
              x1={x} y1={padT - 5}
              x2={x} y2={padT + items.length * (barH + barGap) - barGap + 5}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={padT + items.length * (barH + barGap) - barGap + 20}
              textAnchor="middle"
              fontSize="9"
              fill="#9197ab"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {v}%
            </text>
          </g>
        );
      })}

      {/* axis line */}
      <line
        x1={padL} y1={padT - 5}
        x2={padL} y2={padT + items.length * (barH + barGap) - barGap + 5}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />

      {/* bars */}
      {items.map((it, i) => {
        const y = padT + i * (barH + barGap);
        const barW = (it.score / 100) * innerW;
        const color = BAND_COLORS[it.band];
        const glow = BAND_GLOW[it.band];

        return (
          <g key={it.course.id}>
            {/* course label */}
            <text
              x={padL - 10}
              y={y + barH / 2 + 1}
              textAnchor="end"
              dominantBaseline="central"
              fontSize="11"
              fill="#d2d7e2"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {it.course.code}
            </text>

            {/* bar background track */}
            <rect
              x={padL}
              y={y}
              width={innerW}
              height={barH}
              rx="6"
              fill="rgba(255,255,255,0.03)"
            />

            {/* glow behind bar */}
            <rect
              x={padL}
              y={y + 2}
              width={barW > 0 ? Math.max(barW, 12) : 0}
              height={barH - 4}
              rx="5"
              fill={glow}
              className="fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            />

            {/* actual bar */}
            <rect
              x={padL}
              y={y + 3}
              width={barW > 0 ? Math.max(barW, 8) : 0}
              height={barH - 6}
              rx="4"
              fill={`url(#bar-${it.course.id})`}
              className="fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            />

            {/* percentage label */}
            <text
              x={padL + barW + 10}
              y={y + barH / 2 + 1}
              dominantBaseline="central"
              fontSize="12"
              fontWeight="600"
              fill={color}
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              {it.score}%
            </text>

            {/* trend arrow next to percentage */}
            {it.trend === "up" && (
              <text
                x={padL + barW + 42}
                y={y + barH / 2 + 1}
                dominantBaseline="central"
                fontSize="10"
                fill="#aab5ff"
              >
                ↑
              </text>
            )}
            {it.trend === "down" && (
              <text
                x={padL + barW + 42}
                y={y + barH / 2 + 1}
                dominantBaseline="central"
                fontSize="10"
                fill="#ff9d7a"
              >
                ↓
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ReadinessPanel({
  items,
  onSetWeight,
}: {
  items: CourseReadiness[];
  onSetWeight: (courseId: string, weight: number) => void;
}) {
  if (items.length === 0) return null;

  const avgScore = Math.round(items.reduce((s, r) => s + r.score, 0) / items.length);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6" aria-label="Course readiness">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-thread-300" />
          <h2 className="display text-base font-semibold text-ink-100">Readiness overview</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-500">avg</span>
          <span className="display text-lg font-semibold text-thread-300">{avgScore}%</span>
        </div>
      </div>
      <p className="mb-5 text-xs text-ink-500">
        Your priority <span className="text-ink-300">×</span> the data from your daily answers. Not a grade — a diagnosis.
      </p>

      {/* ── the graph ───────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-white/6 bg-night-800/40 p-4 overflow-x-auto">
        <ReadinessChart items={items} />
      </div>

      {/* ── detailed cards below the graph ──────────── */}
      <div className="space-y-2.5">
        {items.map((it, i) => (
          <div
            key={it.course.id}
            className={`group flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border px-4 py-3 transition-all duration-200 ${
              i === 0
                ? "border-thread-500/25 bg-thread-500/5 hover:border-thread-500/40"
                : "border-white/5 bg-night-700/20 hover:border-white/8 hover:bg-night-700/40"
            }`}
          >
            {/* course identity */}
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: it.course.color }}
                aria-hidden
              />
              <span className="font-mono text-[11px] text-ink-400">{it.course.code}</span>
              <span className="text-sm text-ink-100 truncate">{it.course.name}</span>
              {i === 0 && (
                <span className="rounded-full border border-thread-500/30 bg-thread-500/8 px-2 py-0.5 text-[10px] font-medium text-thread-300 shrink-0">
                  focus now
                </span>
              )}
            </div>

            {/* status line */}
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <TrendIcon trend={it.trend} />

              <span className="font-mono text-[10px] text-ink-500">{it.band}</span>

              {it.examReady && (
                <span className="inline-flex items-center gap-1 text-[10px] text-thread-300">
                  <CheckCircle2 size={10} /> exam-ready
                </span>
              )}

              {it.daysToExam !== null && it.daysToExam >= 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-ink-600">
                  <Clock size={9} /> {it.daysToExam}d
                </span>
              )}

              {it.weakTopics.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px]">
                  <AlertTriangle size={9} className="text-ember-400" />
                  <span className="text-ink-500 hidden sm:inline">{it.weakTopics.join(", ")}</span>
                </span>
              )}

              {/* priority weight */}
              <div className="flex items-center gap-0.5 border-l border-white/6 pl-2.5" role="group" aria-label="Priority weight">
                {WEIGHTS.map((w) => (
                  <button
                    key={w.v}
                    onClick={() => onSetWeight(it.course.id, w.v)}
                    aria-pressed={it.course.weight === w.v}
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] transition-colors ${
                      it.course.weight === w.v
                        ? "border-thread-500/40 bg-thread-500/10 text-thread-300"
                        : "border-white/6 text-ink-600 hover:text-ink-400"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
