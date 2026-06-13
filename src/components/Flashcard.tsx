import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Flashcard as Card, Rating } from "../lib/types";
import { SourceBadge } from "./SourceBadge";

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
  onRate,
}: {
  card: Card;
  courseLabel: string;
  courseColor: string;
  onRate: (rating: Rating) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  function rate(r: Rating) {
    setFlipped(false);
    /* let the flip-back animation breathe before the next card mounts */
    setTimeout(() => onRate(r), 250);
  }

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
                <RotateCcw size={12} /> tap to reveal
              </span>
            </div>
            <p className="display py-6 text-xl leading-snug text-ink-100 sm:text-2xl">{card.question}</p>
            <div className="h-5" />
          </div>

          {/* back — the answer, with its proof */}
          <div className="card-back glass flex min-h-64 flex-col justify-between rounded-2xl border-thread-500/30 p-6">
            <SourceBadge citation={card.citation} />
            <p className="py-5 text-base leading-relaxed text-ink-100 sm:text-lg">{card.answer}</p>
            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              {RATINGS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => rate(r.key)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${r.cls}`}
                >
                  {r.label}
                  <span className="ml-1.5 text-[10px] opacity-60">{r.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
