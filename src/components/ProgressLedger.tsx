import { Check, Loader } from "lucide-react";
import type { LedgerStep } from "../lib/types";

/* ─────────────────────────────────────────────────────────
   PROGRESS LEDGER v2 — richer visual treatment.
   Step-by-step with connecting lines, better status icons.
   ───────────────────────────────────────────────────────── */

export function ProgressLedger({ steps }: { steps: LedgerStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5" aria-label="Agent progress">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5">
            {s.status === "done" ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-star-400/20">
                <Check size={10} className="text-star-400" />
              </span>
            ) : s.status === "active" ? (
              <span className="flex h-4 w-4 items-center justify-center">
                <Loader size={11} className="text-thread-400 animate-spin" />
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-ink-700" />
            )}
            <span
              className={`text-[11px] ${
                s.status === "done"
                  ? "text-ink-300"
                  : s.status === "active"
                    ? "text-thread-300 font-medium"
                    : "text-ink-700"
              }`}
            >
              {s.label}
            </span>
          </span>
          {i < steps.length - 1 && (
            <span className="text-ink-700 mx-0.5">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 4h8M7 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
