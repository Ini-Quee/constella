import { ShieldCheck, BookOpen, GitBranch } from "lucide-react";
import type { SourceCitation } from "../lib/types";

/* ─────────────────────────────────────────────────────────
   SOURCE BADGE — citations rendered like code references.
   "LAW301-syllabus.txt · L13" in mono = verifiable, exact.
   Gold = verbatim truth. Indigo = textbook. Dashed = the
   app being honest that it inferred something. Honesty about
   inference is what makes people trust the inferences.
   ───────────────────────────────────────────────────────── */

const TIER_STYLE: Record<SourceCitation["tier"], string> = {
  verbatim: "border-star-500/50 bg-star-500/10 text-star-300",
  textbook: "border-thread-500/50 bg-thread-500/10 text-thread-300",
  inferred: "border-dashed border-ink-500/60 bg-night-600/40 text-ink-300",
};

const TIER_LABEL: Record<SourceCitation["tier"], string> = {
  verbatim: "from your material",
  textbook: "from your textbook",
  inferred: "suggested link — verify",
};

export function SourceBadge({ citation }: { citation: SourceCitation }) {
  const Icon =
    citation.tier === "verbatim" ? ShieldCheck : citation.tier === "textbook" ? BookOpen : GitBranch;

  return (
    <span className="group relative inline-flex">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${TIER_STYLE[citation.tier]}`}
      >
        <Icon size={12} strokeWidth={2.2} />
        <span className="font-mono tracking-tight">
          {citation.docName} · L{citation.line}
        </span>
        <span className="hidden text-[10px] uppercase tracking-wider opacity-70 sm:inline">
          {TIER_LABEL[citation.tier]}
        </span>
      </span>

      {/* hover-to-verify: the exact source paragraph */}
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-72 rounded-xl border border-white/10 bg-night-700 p-3 text-left shadow-2xl group-hover:block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-ink-500">
          exact source · line {citation.line}
        </span>
        <span className="block text-xs leading-relaxed text-ink-100">
          “{citation.excerpt}”
        </span>
      </span>
    </span>
  );
}
