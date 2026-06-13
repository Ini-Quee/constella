import type { Course, CrossLink, Topic } from "./types";
import { keywords } from "./text";

/* ─────────────────────────────────────────────────────────
   INFERRED CROSS-LINKS — the wow moment, built honestly.
   When a new course is uploaded, we look for concept overlap
   between its topics and the topics already in the sky, and
   propose threads. This is keyword overlap today (a stand-in
   for Fabric IQ's semantic graph), so every link it makes is
   tagged tier:"inferred" and rendered "suggested — verify".
   Admitting it's inference is exactly what makes the
   inferences trustworthy. Never present a guess as a fact.
   ───────────────────────────────────────────────────────── */

const MAX_LINKS = 3;
const MIN_SHARED = 1;

/** The words that describe a topic: its title plus the line it cites. */
function topicTerms(course: Course, topic: Topic): Set<string> {
  const line = course.syllabus[topic.syllabusLine - 1] ?? "";
  const next = course.syllabus[topic.syllabusLine] ?? "";
  return new Set([
    ...keywords(topic.title),
    ...keywords(line),
    ...keywords(next),
  ]);
}

function composeInsight(
  fromTitle: string,
  toTitle: string,
  otherCode: string,
  shared: string[],
): string {
  // Lead with the longest shared term — usually the real concept,
  // not a coincidental short word.
  const term = [...shared].sort((a, b) => b.length - a.length)[0];
  return `“${fromTitle}” and “${toTitle}” (${otherCode}) both turn on ${term} — likely the same idea wearing two course uniforms. Verify before you lean on it.`;
}

export function suggestCrossLinks(
  newCourse: Course,
  existing: Course[],
): CrossLink[] {
  const scored: { link: CrossLink; score: number }[] = [];

  for (const nt of newCourse.topics) {
    const nTerms = topicTerms(newCourse, nt);
    if (nTerms.size === 0) continue;

    for (const course of existing) {
      if (course.id === newCourse.id) continue;
      for (const et of course.topics) {
        const eTerms = topicTerms(course, et);
        const shared = [...nTerms].filter((w) => eTerms.has(w));
        if (shared.length < MIN_SHARED) continue;
        scored.push({
          score: shared.length,
          link: {
            id: `x-${nt.id}-${et.id}`,
            fromTopicId: nt.id,
            toTopicId: et.id,
            tier: "inferred",
            insight: composeInsight(nt.title, et.title, course.code, shared),
          },
        });
      }
    }
  }

  // Strongest first, at most one thread per new topic so the sky
  // stays readable, capped to a tasteful few.
  scored.sort((a, b) => b.score - a.score);
  const usedFrom = new Set<string>();
  const out: CrossLink[] = [];
  for (const { link } of scored) {
    if (usedFrom.has(link.fromTopicId)) continue;
    usedFrom.add(link.fromTopicId);
    out.push(link);
    if (out.length >= MAX_LINKS) break;
  }
  return out;
}
