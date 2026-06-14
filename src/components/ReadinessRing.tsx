import { useMemo } from "react";

/* ─────────────────────────────────────────────────────────
   READINESS RING — radial progress indicator.
   Animated SVG ring that draws to the score value.
   Used in the readiness panel and stat cards.
   ───────────────────────────────────────────────────────── */

const BAND_COLORS: Record<string, string> = {
  "not started": "#9197ab",
  "needs work": "#f0764a",
  "getting there": "#b2b8c8",
  "on track": "#6f7ff2",
  "exam-ready": "#8b9afb",
};

export function ReadinessRing({
  score,
  band,
  size = 72,
  strokeWidth = 5,
  label,
}: {
  score: number;
  band: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = BAND_COLORS[band] ?? "#6f7ff2";

  const style = useMemo(
    () =>
      ({
        "--ring-circumference": circumference,
        "--ring-offset": offset,
      }) as React.CSSProperties,
    [circumference, offset],
  );

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="ring-animate"
          style={style}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="display text-lg font-semibold text-ink-100 leading-none">{score}</span>
        {label && <span className="mt-0.5 text-[9px] uppercase tracking-wider text-ink-500">{label}</span>}
      </div>
    </div>
  );
}
