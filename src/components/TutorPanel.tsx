import { useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { provider } from "../lib/ai";
import type { GroundedChunk } from "../lib/ai";
import type { Course, SourceCitation, LedgerStep } from "../lib/types";
import { SourceBadge } from "./SourceBadge";
import { ProgressLedger } from "./ProgressLedger";

/* ─────────────────────────────────────────────────────────
   TUTOR PANEL — cite or refuse, live on screen.
   The two suggested questions are the demo script:
   one lands inside the material (gold citation appears),
   one lands outside (graceful, honest refusal appears).
   That refusal is the most convincing trust demo we have.
   ───────────────────────────────────────────────────────── */

const SUGGESTED = [
  "When is an arrest lawful?",
  "What did the Supreme Court decide in 2025 about crypto?",
];

const IDLE_STEPS: LedgerStep[] = [];

function makeSteps(stage: 0 | 1 | 2 | 3): LedgerStep[] {
  const labels = ["Reading question", "Searching your material", "Grounding answer", "Cited & done"];
  return labels.map((label, i) => ({
    id: String(i),
    label,
    status: i < stage ? "done" : i === stage ? "active" : "pending",
  }));
}

export function TutorPanel({ courses }: { courses: Course[] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citation, setCitation] = useState<SourceCitation | null>(null);
  const [refused, setRefused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<LedgerStep[]>(IDLE_STEPS);
  const liveRef = useRef<HTMLDivElement>(null);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setAnswer("");
    setCitation(null);
    setRefused(false);
    setSteps(makeSteps(0));
    setTimeout(() => setSteps(makeSteps(1)), 250);

    await provider.askTutor(q, { courses }, (chunk: GroundedChunk) => {
      if (chunk.type === "citation") {
        setCitation(chunk.citation);
        setSteps(makeSteps(2));
      } else if (chunk.type === "token") {
        setSteps(makeSteps(2));
        setAnswer((a) => a + chunk.text);
      } else if (chunk.type === "refusal") {
        setRefused(true);
        setSteps(makeSteps(2));
        setAnswer((a) => a + chunk.text);
      } else if (chunk.type === "done") {
        setSteps(makeSteps(3));
        setBusy(false);
      }
    });
  }

  return (
    <section className="glass rounded-2xl p-5 sm:p-6" aria-label="Ask your material">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="display text-base font-semibold text-ink-100">Ask your material</h2>
          <p className="text-xs text-ink-500">
            Answers come from your uploads, with the exact line cited — or an honest refusal. Never a guess.
          </p>
        </div>
        <span className="font-mono text-[10px] text-ink-700">engine: {provider.name}</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-night-600/50 px-3 py-1.5 text-xs text-ink-300 transition-colors hover:border-thread-500/50 hover:text-thread-300 disabled:opacity-40"
          >
            <Sparkles size={12} /> {s}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your courses…"
          aria-label="Your question"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-night-700/70 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 focus:border-thread-500/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-thread-500 px-4 py-2.5 text-sm font-medium text-night-900 transition-colors hover:bg-thread-400 disabled:opacity-40"
        >
          <Send size={15} /> Ask
        </button>
      </form>

      {(busy || answer) && (
        <div className="mt-4 space-y-3" ref={liveRef} aria-live="polite">
          <ProgressLedger steps={steps} />
          <div
            className={`rounded-xl border p-4 text-sm leading-relaxed ${
              refused
                ? "border-star-500/40 bg-star-500/5 text-ink-100"
                : "border-white/8 bg-night-700/50 text-ink-100"
            }`}
          >
            {citation && (
              <div className="mb-2.5">
                <SourceBadge citation={citation} />
              </div>
            )}
            {refused && (
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-star-300">
                honest refusal — not in your material
              </p>
            )}
            <p>
              {answer}
              {busy && <span className="caret text-thread-300">▍</span>}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
