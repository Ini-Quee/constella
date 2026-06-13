/* ─────────────────────────────────────────────────────────
   CONSTELLA DOMAIN TYPES
   The field-agnostic structure of knowledge:
   concepts + connections + a source of truth + proof.
   ───────────────────────────────────────────────────────── */

/** Tiers of truth. Honesty about inference is what builds trust. */
export type SourceTier = "verbatim" | "textbook" | "inferred";

export interface SourceCitation {
  docId: string;
  /** e.g. "LAW301-syllabus.txt" — rendered like a code reference */
  docName: string;
  /** 1-based line number in the uploaded document */
  line: number;
  /** the exact text being cited, shown on hover */
  excerpt: string;
  tier: SourceTier;
}

export interface Topic {
  id: string;
  courseId: string;
  title: string;
  /** where this topic lives in the uploaded syllabus */
  syllabusLine: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  /** hex used for its constellation cluster */
  color: string;
  examDate: string; // ISO date
  topics: Topic[];
  /** raw uploaded material, line by line — the source of truth */
  syllabus: string[];
}

/** A thread between two topics, possibly across courses. The product. */
export interface CrossLink {
  id: string;
  fromTopicId: string;
  toTopicId: string;
  insight: string;
  /**
   * "curated" — a hand-verified true connection (solid thread).
   * "inferred" — the engine's own suggestion from concept overlap,
   * honestly flagged "verify" (dashed thread). Absent = curated.
   */
  tier?: "curated" | "inferred";
}

export type Rating = "again" | "hard" | "good" | "easy";

export interface Flashcard {
  id: string;
  topicId: string;
  courseId: string;
  question: string;
  answer: string;
  citation: SourceCitation;
  /** epoch ms when the card is next due */
  due: number;
  /** current interval in days */
  interval: number;
  /** ease factor, SM-2 style */
  ease: number;
  reps: number;
}

export interface LedgerStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

export interface DeckState {
  courses: Course[];
  links: CrossLink[];
  cards: Flashcard[];
  streak: number;
}
