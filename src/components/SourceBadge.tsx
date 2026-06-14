import { ShieldCheck, BookOpen, GitBranch } from "lucide-react";
import type { SourceCitation } from "../lib/types";

/* ─────────────────────────────────────────────────────────
   SOURCE BADGE v2 — richer visual treatment.
   Better glow effects, improved tooltip, gold shimmer
   on verbatim citations.
   ───────────────────────────────────────────────────────── */

const TIER_STYLE: Record<SourceCitation["tier"], string> = {
  verbatim: "border-star-500/40 bg-gradient-to-r from-star-500/15 to-star-500/5 text-star-300",
  textbook: "border-thread-500/40 bg-gradient-to-r from-thread-500/15 to-thread-500/5 text-thread-300",
  inferred: "border-dashed border-ink-500/50 bg-night-600/30 text-ink-300",
};

const TIER_LABEL: Record<SourceCitation["tier"], string> = {
  verbatim: "from your material",
  textbook: "from your textbook",
  inferred: "suggested — verify",
};

export function SourceBadge({ citation }: { citation: SourceCitation }) {
  const Icon =
    citation.tier === "verbatim" ? ShieldCheck : citation.tier === "textbook" ? BookOpen : GitBranch;

  return (
    <span className="group relative inline-flex">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${TIER_STYLE[citation.tier]}`}
      >
        <Icon size={11} strokeWidth={2.2} />
        <span className="font-mono tracking-tight">
          {citation.docName} · L{citation.line}
        </span>
        <span className="hidden text-[10px] uppercase tracking-wider opacity-60 sm:inline">
          {TIER_LABEL[citation.tier]}
        </span>
      </span>

      {/* hover-to-verify tooltip */}
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-72 rounded-xl border border-white/10 bg-night-800/95 backdrop-blur-sm p-3.5 text-left shadow-2xl shadow-black/40 group-hover:block">
        <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-500">
          <span className={`h-1.5 w-1.5 rounded-full ${citation.tier === "verbatim" ? "bg-star-400" : citation.tier === "textbook" ? "bg-thread-400" : "bg-ink-500"}`} />
          exact source · line {citation.line}
        </span>
        <span className="block text-xs leading-relaxed text-ink-100">
          "{citation.excerpt}"
        </span>
      </span>
    </span>
  );
}
