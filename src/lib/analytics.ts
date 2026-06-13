import type { Course, Flashcard, ReviewLog, Rating } from "./types";

/* ─────────────────────────────────────────────────────────
   ANALYTICS — turn daily answers into understanding.
   "7/10" is a grade; "you recognise X but miss it in fact
   patterns" is what a great tutor says. We compute, per
   course: a readiness score, whether it's trending up or
   down, the weakest topics, and an exam-readiness verdict —
   then blend the student's own priority weight with the data
   to decide what they should study next.
   All offline, from the review log. No backend.
   ───────────────────────────────────────────────────────── */

const DAY = 24 * 60 * 60 * 1000;

const GOOD: Record<Rating, number> = { again: 0, hard: 0.4, good: 0.85, easy: 1 };

export type ReadinessBand = "not started" | "needs work" | "getting there" | "on track" | "exam-ready";
export type Trend = "up" | "down" | "flat" | "new";

export interface CourseReadiness {
  course: Course;
  /** 0–100 mastery */
  score: number;
  band: ReadinessBand;
  trend: Trend;
  /** topic titles the student keeps missing */
  weakTopics: string[];
  daysToExam: number | null;
  examReady: boolean;
  /** blended weight × data — higher means "study this sooner" */
  priority: number;
}

function band(score: number, seen: boolean): ReadinessBand {
  if (!seen) return "not started";
  if (score < 40) return "needs work";
  if (score < 70) return "getting there";
  if (score < 85) return "on track";
  return "exam-ready";
}

function daysToExam(course: Course, now: number): number | null {
  const t = new Date(course.examDate).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - now) / DAY);
}

/** Exam proximity as 0–100 urgency: ramps up inside ~50 days. */
function examUrgency(days: number | null): number {
  if (days === null) return 0;
  if (days <= 0) return 100;
  return Math.max(0, Math.min(100, 100 - days * 2));
}

export function courseReadiness(
  course: Course,
  cards: Flashcard[],
  reviews: ReviewLog[],
  now = Date.now(),
): CourseReadiness {
  const courseCards = cards.filter((c) => c.courseId === course.id && c.kind === "qa");
  const courseReviews = reviews.filter((r) => r.courseId === course.id);
  const seen = courseReviews.length > 0;

  // Accuracy — quality of recent answers (weights newer reviews a touch more).
  let accNum = 0;
  let accDen = 0;
  courseReviews.forEach((r) => {
    const ageDays = (now - r.at) / DAY;
    const w = ageDays <= 7 ? 1 : 0.6;
    accNum += GOOD[r.rating] * w;
    accDen += w;
  });
  const accuracy = accDen > 0 ? accNum / accDen : 0;

  // Coverage maturity — how many cards are genuinely settling in.
  const mature = courseCards.filter((c) => c.reps >= 2 && c.ease >= 2.3).length;
  const maturity = courseCards.length > 0 ? mature / courseCards.length : 0;

  const score = Math.round(100 * (0.6 * accuracy + 0.4 * maturity));

  // Trend — last 7 days accuracy vs the 7 before.
  const recent = courseReviews.filter((r) => now - r.at <= 7 * DAY);
  const prior = courseReviews.filter((r) => now - r.at > 7 * DAY && now - r.at <= 14 * DAY);
  const avg = (rs: ReviewLog[]) =>
    rs.length ? rs.reduce((s, r) => s + GOOD[r.rating], 0) / rs.length : null;
  const ra = avg(recent);
  const pa = avg(prior);
  let trend: Trend = "new";
  if (ra !== null && pa !== null) trend = ra - pa > 0.08 ? "up" : ra - pa < -0.08 ? "down" : "flat";
  else if (seen) trend = "flat";

  // Weak topics — most "again"/"hard" answers, mapped to topic titles.
  const missByTopic = new Map<string, number>();
  courseReviews.forEach((r) => {
    if (r.rating === "again" || r.rating === "hard") {
      const card = cards.find((c) => c.id === r.cardId);
      if (card) missByTopic.set(card.topicId, (missByTopic.get(card.topicId) ?? 0) + 1);
    }
  });
  const weakTopics = [...missByTopic.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([topicId]) => course.topics.find((t) => t.id === topicId)?.title ?? "a topic");

  const d = daysToExam(course, now);
  const examReady = score >= 80 && (d === null || d >= 0);

  const gap = 100 - score;
  const priority = course.weight * (0.6 * gap + 0.4 * examUrgency(d));

  return {
    course,
    score,
    band: band(score, seen),
    trend,
    weakTopics,
    daysToExam: d,
    examReady,
    priority,
  };
}

/** All courses, scored and ordered by what to study next (highest priority first). */
export function prioritized(
  courses: Course[],
  cards: Flashcard[],
  reviews: ReviewLog[],
  now = Date.now(),
): CourseReadiness[] {
  return courses
    .map((c) => courseReadiness(c, cards, reviews, now))
    .sort((a, b) => b.priority - a.priority);
}
