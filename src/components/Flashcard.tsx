import { useEffect, useState } from "react";
import { RotateCcw, Volume2, Sparkles } from "lucide-react";
import type { Flashcard as Card, Rating } from "../lib/types";
import { SourceBadge } from "./SourceBadge";
import { readAloud, stopReading, readAloudSupported } from "../lib/voice";

/* ─────────────────────────────────────────────────────────
   FLASHCARD v2 — richer 3D flip with better styling.
   Glow effects on flip, premium card feel, better
   rating buttons with color-coded feedback.
   ───────────────────────────────────────────────────────── */

const KEY_TO_RATING: Record<string, Rating> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

const RATINGS: { key: Rating; label: string; hint: string; cls: string; icon: string }[] = [
  { key: "again", label: "Again", hint: "<10m", cls: "border-ember-500/50 text-ember-400 hover:bg-ember-500/10 hover:border-ember-500/70", icon: "↺" },
  { key: "hard", label: "Hard", hint: "soon", cls: "border-star-500/40 text-star-300 hover:bg-star-500/10 hover:border-star-500/60", icon: "◔" },
  { key: "good", label: "Good", hint: "later", cls: "border-thread-500/50 text-thread-300 hover:bg-thread-500/10 hover:border-thread-500/70", icon: "✓" },
  { key: "easy", label: "Easy", hint: "much later", cls: "border-ink-500/40 text-ink-300 hover:bg-white/5 hover:border-ink-500/60", icon: "✦" },
];

export function FlashcardView({
  card,
  courseLabel,
  courseColor,
  studyMode = false,
  onRate,
}: {
  card: Card;
  courseLabel: string;
  courseColor: string;
  studyMode?: boolean;
  onRate: (rating: Rating) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  function rate(r: Rating) {
    stopReading();
    setFlipped(false);
    setTimeout(() => onRate(r), 250);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping()) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && !studyMode && KEY_TO_RATING[e.key]) {
        e.preventDefault();
        rate(KEY_TO_RATING[e.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, studyMode]);

  return (
    <div>
      <div
        className={`card3d ${flipped ? "flipped" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Show question" : "Reveal answer"}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div className="card3d-inner min-h-72">
          {/* front — the question */}
          <div className="card-face glass-glow flex min-h-72 flex-col justify-between rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 font-mono text-[11px] tracking-tight"
                style={{ color: courseColor, background: `${courseColor}15`, border: `1px solid ${courseColor}40` }}
              >
                {courseLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-500">
                <RotateCcw size={12} /> tap or
                <kbd className="rounded border border-white/15 bg-night-600/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">space</kbd>
              </span>
            </div>
            <div className="py-6">
              <p className="display text-xl leading-snug text-ink-100 sm:text-2xl">{card.question}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-500">
              <Sparkles size={12} className="text-thread-400" />
              <span>tap to reveal the answer</span>
            </div>
          </div>

          {/* back — the answer, with its proof */}
          <div className="card-back glass-glow flex min-h-72 flex-col justify-between rounded-2xl border-thread-500/20 p-6 sm:p-7">
            <div className="flex items-center justify-between gap-2">
              <SourceBadge citation={card.citation} />
              {readAloudSupported() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    readAloud(card.answer);
                  }}
                  aria-label="Read answer aloud"
                  title="Read answer aloud"
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 p-1.5 text-ink-500 transition-colors hover:border-thread-500/50 hover:text-thread-300"
                >
                  <Volume2 size={13} />
                </button>
              )}
            </div>
            <p className="py-5 text-base leading-relaxed text-ink-100 sm:text-lg">{card.answer}</p>
            {studyMode ? (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => rate("good")}
                  className="w-full rounded-xl border border-thread-500/40 bg-thread-500/10 px-4 py-3 text-sm font-medium text-thread-300 transition-all hover:bg-thread-500/20 hover:border-thread-500/60"
                >
                  Got it — next ✦
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2" onClick={(e) => e.stopPropagation()}>
                {RATINGS.map((r, i) => (
                  <button
                    key={r.key}
                    onClick={() => rate(r.key)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${r.cls}`}
                    title={`Press ${i + 1}`}
                  >
                    <span className="block text-base leading-none mb-1">{r.icon}</span>
                    <span className="block text-[11px]">{r.label}</span>
                    <span className="block font-mono text-[9px] opacity-50 mt-0.5">{r.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
