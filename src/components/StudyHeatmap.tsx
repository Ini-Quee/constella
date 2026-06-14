import { useMemo } from "react";
import type { ReviewLog } from "../lib/types";

/* ─────────────────────────────────────────────────────────
   STUDY HEATMAP — GitHub-style contribution grid.
   Shows 12 weeks of study activity. Each cell's opacity
   maps to how many reviews were done that day.
   ───────────────────────────────────────────────────────── */

const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 12;
const CELL = 10;
const GAP = 3;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function StudyHeatmap({ reviews }: { reviews: ReviewLog[] }) {
  const { grid, maxCount, weekLabels } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = startOfWeek(new Date(today.getTime() - (WEEKS - 1) * 7 * DAY));

    // count reviews per day
    const counts = new Map<string, number>();
    reviews.forEach((r) => {
      const d = new Date(r.at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const grid: { date: Date; count: number; key: string }[][] = [];
    let maxCount = 0;
    const cursor = new Date(start);

    for (let w = 0; w < WEEKS; w++) {
      const week: { date: Date; count: number; key: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
        const count = counts.get(key) ?? 0;
        if (count > maxCount) maxCount = count;
        week.push({ date: new Date(cursor), count, key });
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(week);
    }

    // month labels
    const weekLabels: (string | null)[] = grid.map((week) => {
      const firstDay = week[0].date;
      if (firstDay.getDate() <= 7) {
        return firstDay.toLocaleString("default", { month: "short" });
      }
      return null;
    });

    return { grid, maxCount, weekLabels };
  }, [reviews]);

  const width = WEEKS * (CELL + GAP) + 20;
  const height = 7 * (CELL + GAP) + 24;

  function opacity(count: number): number {
    if (count === 0) return 0.12;
    if (maxCount === 0) return 0.12;
    return 0.25 + (count / maxCount) * 0.75;
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="overflow-hidden">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="block">
        {/* day labels */}
        {dayLabels.map((label, i) =>
          label ? (
            <text
              key={i}
              x={0}
              y={20 + i * (CELL + GAP) + CELL / 2}
              fontSize={8}
              fill="#9197ab"
              textAnchor="start"
              dominantBaseline="central"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {label}
            </text>
          ) : null,
        )}

        {/* month labels */}
        {weekLabels.map((label, i) =>
          label ? (
            <text
              key={i}
              x={18 + i * (CELL + GAP)}
              y={10}
              fontSize={8}
              fill="#9197ab"
              textAnchor="start"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {label}
            </text>
          ) : null,
        )}

        {/* cells */}
        {grid.map((week, wi) =>
          week.map((day, di) => (
            <rect
              key={day.key}
              x={18 + wi * (CELL + GAP)}
              y={18 + di * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill="#6f7ff2"
              opacity={opacity(day.count)}
              className="heatmap-cell"
            >
              <title>
                {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {day.count > 0 ? ` — ${day.count} review${day.count > 1 ? "s" : ""}` : " — no reviews"}
              </title>
            </rect>
          )),
        )}
      </svg>
    </div>
  );
}
