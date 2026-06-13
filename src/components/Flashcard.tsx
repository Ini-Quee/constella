import { useEffect, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import type { Flashcard as Card, Rating } from "../lib/types";
import { SourceBadge } from "./SourceBadge";
import { readAloud, stopReading, readAloudSupported } from "../lib/voice";

/** 1–4 map to the four recall ratings, in difficulty order. */
const KEY_TO_RATING: Record<string, Rating> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

/** True when focus is in a text field, so shortcuts never hijack typing. */
function isTyping(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

const RATINGS: { key: Rating; label: string; hint: string; cls: string }[] = [
  { key: "again", label: "Again", hint: "<10m", cls: "border-ember-500/50 text-ember-400 hover:bg-ember-500/10" },
  { key: "hard", label: "Hard", hint: "soon", cls: "border-star-500/40 text-star-300 hover:bg-star-500/10" },
  { key: "good", label: "Good", hint: "later", cls: "border-thread-500/50 text-thread-300 hover:bg-thread-500/10" },
  { key: "easy", label: "Easy", hint: "much later", cls: "border-ink-500/50 text-ink-300 hover:bg-white/5" },
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
  /** study mode: low-pressure facts, no grading — just reveal and advance */
  studyMode?: boolean;
  onRate: (rating: Rating) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  function rate(r: Rating) {
    stopReading();
    setFlipped(false);
    /* let the flip-back animation breathe before the next card mounts */
    setTimeout(() => onRate(r), 250);
  }

  /* Keyboard shortcuts — fluency on stage: space flips, 1–4 rate.
     Ratings only fire once the answer is showing, so you can't grade
     a card you haven't seen. Disabled while typing in any field. */
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
    // re-bind when flip state changes so ratings respect "is the answer shown"
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
        <div className="card3d-inner min-h-64">
          {/* front — the question */}
          <div className="card-face glass flex min-h-64 flex-col justify-between rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 font-mono text-[11px] tracking-tight"
                style={{ color: courseColor, background: `${courseColor}1a`, border: `1px solid ${courseColor}55` }}
              >
                {courseLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-500">
                <RotateCcw size={12} /> tap or
                <kbd className="rounded border border-white/15 bg-night-600/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-300">space</kbd>
                to reveal
              </span>
            </div>
            <p className="display py-6 text-xl leading-snug text-ink-100 sm:text-2xl">{card.question}</p>
            <div className="h-5" />
          </div>

          {/* back — the answer, with its proof */}
          <div className="card-back glass flex min-h-64 flex-col justify-between rounded-2xl border-thread-500/30 p-6">
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
                  className="w-full rounded-xl border border-thread-500/50 bg-thread-500/10 px-3 py-2.5 text-sm font-medium text-thread-300 transition-colors hover:bg-thread-500/20"
                >
                  Got it — next ✦
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {RATINGS.map((r, i) => (
                  <button
                    key={r.key}
                    onClick={() => rate(r.key)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${r.cls}`}
                    title={`Press ${i + 1}`}
                  >
                    <span className="mr-1.5 font-mono text-[10px] opacity-50">{i + 1}</span>
                    {r.label}
                    <span className="ml-1.5 text-[10px] opacity-60">{r.hint}</span>
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
