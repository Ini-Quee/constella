import type { Course } from "./types";
import { keywords } from "./text";

/* ─────────────────────────────────────────────────────────
   SOURCE SUGGESTER — turn the honest refusal into a door.
   When a question falls outside the student's own material,
   we don't just refuse — we point to TRUSTED, openly-licensed
   places to get material on that topic, which the student can
   then add and we'll ground an answer in.

   We only link (never re-host) and only to reputable open
   repositories — so it's copyright-safe and offline. We
   recommend; the student adds; cite-or-refuse stays intact.
   ───────────────────────────────────────────────────────── */

export interface OpenSource {
  name: string;
  url: string;
  blurb: string;
}

interface FieldDef {
  field: string;
  keywords: string[];
  sources: OpenSource[];
}

const GENERAL: OpenSource[] = [
  { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", blurb: "Free MIT lecture notes, assignments & full courses." },
  { name: "OER Commons", url: "https://oercommons.org/", blurb: "Openly-licensed materials across every subject." },
];

const FIELDS: FieldDef[] = [
  {
    field: "law",
    keywords: ["law", "legal", "arrest", "constitution", "constitutional", "criminal", "court", "statute", "rights", "tort", "contract", "case", "jurisdiction", "mens", "actus", "defence", "defense", "liability"],
    sources: [
      { name: "Cornell Legal Information Institute", url: "https://www.law.cornell.edu/", blurb: "Authoritative statutes, cases & legal definitions, free." },
      { name: "Harvard Open Casebooks (H2O)", url: "https://opencasebook.org/", blurb: "Openly-licensed law casebooks from Harvard faculty." },
    ],
  },
  {
    field: "computing & security",
    keywords: ["sql", "injection", "network", "authentication", "auth", "security", "cyber", "owasp", "encryption", "tcp", "database", "software", "programming", "code", "algorithm", "computer", "access"],
    sources: [
      { name: "OWASP", url: "https://owasp.org/", blurb: "The reference for web-app security risks & defences." },
      { name: "MIT OCW — Computer Science", url: "https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science", blurb: "Free MIT computer-science course materials." },
    ],
  },
  {
    field: "medicine & health",
    keywords: ["anatomy", "physiology", "clinical", "patient", "disease", "pharmacology", "nursing", "medicine", "medical", "health", "diagnosis"],
    sources: [
      { name: "OpenStax — Science & Health", url: "https://openstax.org/subjects/science", blurb: "Free, peer-reviewed anatomy & physiology textbooks." },
      { name: "MedlinePlus (NIH)", url: "https://medlineplus.gov/", blurb: "Trusted health info from the US National Library of Medicine." },
    ],
  },
  {
    field: "mathematics",
    keywords: ["math", "calculus", "algebra", "equation", "theorem", "probability", "statistics", "geometry", "integral", "derivative", "matrix"],
    sources: [
      { name: "Khan Academy — Math", url: "https://www.khanacademy.org/math", blurb: "Free guided practice & lessons, beginner to advanced." },
      { name: "OpenStax — Math", url: "https://openstax.org/subjects/math", blurb: "Free, peer-reviewed mathematics textbooks." },
    ],
  },
];

export interface SourceSuggestion {
  field: string;
  sources: OpenSource[];
}

/** Pick the field that best matches the question + the student's courses,
    and return trusted open sources for it (plus one general fallback). */
export function suggestSources(question: string, courses: Course[]): SourceSuggestion {
  const text =
    (question + " " + courses.map((c) => `${c.name} ${c.topics.map((t) => t.title).join(" ")}`).join(" ")).toLowerCase();
  const words = new Set(keywords(text));

  let best: FieldDef | null = null;
  let bestScore = 0;
  for (const f of FIELDS) {
    const score = f.keywords.reduce((s, k) => s + (words.has(k) || text.includes(k) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = f;
    }
  }

  if (!best || bestScore === 0) return { field: "your subject", sources: GENERAL };
  return { field: best.field, sources: [...best.sources, GENERAL[0]] };
}
