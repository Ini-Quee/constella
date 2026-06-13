import type { Flashcard, Rating, DeckState } from "./types";

/* ─────────────────────────────────────────────────────────
   SCHEDULER — SM-2 style for the MVP.
   Swap-in path: `npm i ts-fsrs` and replace schedule() —
   the call signature is deliberately FSRS-compatible.
   ───────────────────────────────────────────────────────── */

const DAY = 24 * 60 * 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;

export function schedule(card: Flashcard, rating: Rating, now = Date.now()): Flashcard {
  let { interval, ease, reps } = card;

  switch (rating) {
    case "again":
      return { ...card, reps: 0, interval: 0, ease: Math.max(1.3, ease - 0.2), due: now + TEN_MIN };
    case "hard":
      interval = Math.max(1, interval * 1.2);
      ease = Math.max(1.3, ease - 0.15);
      break;
    case "good":
      interval = reps === 0 ? 1 : reps === 1 ? 3 : interval * ease;
      break;
    case "easy":
      interval = reps === 0 ? 3 : interval * ease * 1.3;
      ease = ease + 0.1;
      break;
  }

  return {
    ...card,
    reps: reps + 1,
    interval,
    ease,
    due: now + Math.round(interval * DAY),
  };
}

export function dueCards(cards: Flashcard[], now = Date.now()): Flashcard[] {
  return cards.filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
}

/* ─────────────────────────────────────────────────────────
   PERSISTENCE — localStorage for the MVP.
   Swap-in path: Supabase, same load/save signatures.
   ───────────────────────────────────────────────────────── */

const KEY = "constella:deck:v1";

export function loadDeck(): DeckState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DeckState) : null;
  } catch {
    return null;
  }
}

export function saveDeck(deck: DeckState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(deck));
  } catch {
    /* storage full or blocked — fail quietly, app keeps working in memory */
  }
}

export function resetDeck(): void {
  localStorage.removeItem(KEY);
}
