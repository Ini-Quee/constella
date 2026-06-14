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
  /** how much the student cares about this course (1 low … 3 high).
      Blended with measured readiness + exam proximity to set priority. */
  weight: number;
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

/** "qa" — a graded question/answer card (signal for mastery).
    "fact" — a low-pressure study card ("Did you know…") from their notes. */
export type CardKind = "qa" | "fact";

export interface Flashcard {
  id: string;
  topicId: string;
  courseId: string;
  question: string;
  answer: string;
  citation: SourceCitation;
  kind: CardKind;
  /** epoch ms when the card is next due */
  due: number;
  /** current interval in days */
  interval: number;
  /** ease factor, SM-2 style */
  ease: number;
  reps: number;
}

/** One graded answer, kept as history so we can show knowledge gain/loss
    over time (not just the card's latest state). */
export interface ReviewLog {
  id: string;
  cardId: string;
  courseId: string;
  rating: Rating;
  at: number; // epoch ms
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
  reviews: ReviewLog[];
  streak: number;
  /** who the student is and what they're working toward — set in onboarding.
      This is what gives the courses meaning (a degree + a career goal). */
  profile: UserProfile | null;
}

/** The student, captured in the first-run survey. Turns a pile of courses
    into "my plan": my degree, my career goal, my exam dates. */
export interface UserProfile {
  name: string;
  institution: string;
  /** degree / programme, e.g. "LLB Law" */
  programme: string;
  /** year of study, e.g. 2 */
  year: number;
  /** ISO date of finals / main exams */
  finalsDate: string;
  /** career ambition, e.g. "Cloud Engineer" */
  goal: string;
  /** a certification they're also pursuing, e.g. "AWS Cloud Practitioner" */
  certTarget: string;
  /** ISO date of that cert exam (optional) */
  certExamDate: string;
}
