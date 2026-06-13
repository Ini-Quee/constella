/* ─────────────────────────────────────────────────────────
   SHARED LEXICAL HELPERS
   Keyword extraction powers two things that both stand in for
   real semantic embeddings until the IQ layer is wired:
   · keyword-overlap retrieval in the mock provider, and
   · inferred cross-linking between courses.
   One lexicon, used in both places, so "what counts as a
   shared concept" is defined exactly once.
   ───────────────────────────────────────────────────────── */

export const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "what", "when", "where", "which",
  "who", "why", "how", "does", "do", "did", "of", "in", "on", "to", "and",
  "or", "for", "me", "my", "i", "it", "that", "this", "can", "you", "about",
  "explain", "tell", "between", "difference", "vs", "from", "with", "into",
  "under", "over", "its", "their", "each", "every", "must", "may", "be",
]);

export function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}
