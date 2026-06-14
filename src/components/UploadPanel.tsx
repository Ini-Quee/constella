import { useState } from "react";
import { Upload, Plus, FileText, Sparkles } from "lucide-react";
import type { Course, Flashcard, LedgerStep } from "../lib/types";
import { ProgressLedger } from "./ProgressLedger";

/* ─────────────────────────────────────────────────────────
   UPLOAD PANEL v2 — better visual treatment.
   Richer collapsed state, better form layout,
   more polished generation flow.
   ───────────────────────────────────────────────────────── */

const CLUSTER_COLORS = ["#7fb5f0", "#8fd0a0", "#f0b87f", "#e58fc1"];

const STAGES = ["Reading material", "Extracting topics", "Generating grounded cards", "Done"];

function makeSteps(stage: number): LedgerStep[] {
  return STAGES.map((label, i) => ({
    id: String(i),
    label,
    status: i < stage ? "done" : i === stage ? "active" : "pending",
  }));
}

function isTopicLine(line: string): boolean {
  return /^(module|unit|week|topic|chapter|\d+[.)])/i.test(line.trim());
}

export function UploadPanel({
  courseCount,
  onAdd,
}: {
  courseCount: number;
  onAdd: (course: Course, cards: Flashcard[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [steps, setSteps] = useState<LedgerStep[]>([]);
  const [busy, setBusy] = useState(false);

  async function generate() {
    if (!name.trim() || !text.trim() || busy) return;
    setBusy(true);

    const lines = text.split("\n").map((l) => l.trim());
    const id = `u${Date.now()}`;
    const code = name.trim().slice(0, 18);
    const color = CLUSTER_COLORS[courseCount % CLUSTER_COLORS.length];

    for (let s = 0; s < STAGES.length - 1; s++) {
      setSteps(makeSteps(s));
      await new Promise((r) => setTimeout(r, 650));
    }

    const topics: Course["topics"] = [];
    const cards: Flashcard[] = [];

    lines.forEach((line, i) => {
      if (!isTopicLine(line)) return;
      const title = line.replace(/^(module|unit|week|topic|chapter)\s*\d*\s*[—:-]?\s*/i, "").replace(/^\d+[.)]\s*/, "").trim() || line;
      const contentIdx = lines.findIndex((l, j) => j > i && l.length > 30);
      if (contentIdx === -1) return;
      const topicId = `${id}-t${topics.length}`;
      topics.push({ id: topicId, courseId: id, title, syllabusLine: i + 1 });
      cards.push({
        id: `${id}-c${cards.length}`,
        topicId,
        courseId: id,
        question: `Explain: ${title}`,
        answer: lines[contentIdx],
        kind: "qa",
        citation: {
          docId: id,
          docName: `${code.replace(/\s+/g, "")}-upload.txt`,
          line: contentIdx + 1,
          excerpt: lines[contentIdx],
          tier: "verbatim",
        },
        due: Date.now(),
        interval: 0,
        ease: 2.5,
        reps: 0,
      });
    });

    setSteps(makeSteps(STAGES.length - 1).map((s) => ({ ...s, status: "done" as const })));

    if (topics.length > 0) {
      const exam = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      onAdd(
        { id, code, name: name.trim(), color, examDate: exam, weight: 2, syllabus: lines, topics },
        cards,
      );
      setName("");
      setText("");
      setTimeout(() => {
        setSteps([]);
        setOpen(false);
      }, 900);
    } else {
      setSteps([{ id: "none", label: "No topics found — add lines starting with Module/Week/1.", status: "done" }]);
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glass group flex w-full items-center justify-center gap-3 rounded-2xl border-dashed py-5 text-sm text-ink-300 transition-all hover:border-thread-500/40 hover:text-thread-300 hover:bg-thread-500/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-night-700/40 group-hover:border-thread-500/30 group-hover:bg-thread-500/10 transition-all">
          <Plus size={16} className="text-ink-500 group-hover:text-thread-300 transition-colors" />
        </div>
        <span>Add a course — paste any syllabus, any field</span>
      </button>
    );
  }

  return (
    <section className="glass-glow rounded-2xl p-5 sm:p-6" aria-label="Upload course material">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-thread-500/10 border border-thread-500/20">
          <Upload size={14} className="text-thread-300" />
        </div>
        <div>
          <h2 className="display text-base font-semibold text-ink-100">New course from your material</h2>
          <p className="text-[11px] text-ink-500">
            Any field, any format — the engine adapts
          </p>
        </div>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-ink-500">
        Paste a syllabus or outline. Lines starting with "Module", "Week", "Unit" or "1." become topics; the
        text under each becomes a grounded card citing its exact line.
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Course name, e.g. AZ-900 Azure Fundamentals"
        aria-label="Course name"
        className="mb-2 w-full rounded-xl border border-white/10 bg-night-700/60 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 focus:border-thread-500/50 focus:outline-none focus:ring-1 focus:ring-thread-500/20 transition-all"
      />

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"Module 1 — Cloud concepts\nThe cloud delivers computing services over the internet on a pay-as-you-go basis…"}
          aria-label="Syllabus text"
          className="mb-3 w-full rounded-xl border border-white/10 bg-night-700/60 px-4 py-3 font-mono text-xs leading-relaxed text-ink-100 placeholder:text-ink-700 focus:border-thread-500/50 focus:outline-none focus:ring-1 focus:ring-thread-500/20 transition-all"
        />
        <div className="absolute right-3 top-3 flex items-center gap-1 text-[10px] text-ink-700">
          <FileText size={10} />
          {text.split("\n").filter(l => l.trim()).length} lines
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <ProgressLedger steps={steps} />
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-ink-500 hover:text-ink-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void generate()}
            disabled={busy || !name.trim() || !text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-thread-500 px-4 py-2 text-sm font-medium text-night-900 transition-all hover:bg-thread-400 hover:shadow-lg hover:shadow-thread-500/20 disabled:opacity-40"
          >
            <Sparkles size={14} />
            Generate grounded cards
          </button>
        </div>
      </div>
    </section>
  );
}
