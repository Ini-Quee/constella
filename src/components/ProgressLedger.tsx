import type { LedgerStep } from "../lib/types";

/* ─────────────────────────────────────────────────────────
   PROGRESS LEDGER — observability. Students trust what
   they can see the agent doing.
   ───────────────────────────────────────────────────────── */

export function ProgressLedger({ steps }: { steps: LedgerStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5" aria-label="Agent progress">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span
              className={
                s.status === "done"
                  ? "h-1.5 w-1.5 rounded-full bg-star-400"
                  : s.status === "active"
                    ? "pulse-dot h-1.5 w-1.5 rounded-full bg-thread-400"
                    : "h-1.5 w-1.5 rounded-full bg-ink-700"
              }
            />
            <span
              className={`text-[11px] ${
                s.status === "done"
                  ? "text-ink-300"
                  : s.status === "active"
                    ? "text-thread-300"
                    : "text-ink-700"
              }`}
            >
              {s.label}
            </span>
          </span>
          {i < steps.length - 1 && <span className="text-[10px] text-ink-700">→</span>}
        </li>
      ))}
    </ol>
  );
}
