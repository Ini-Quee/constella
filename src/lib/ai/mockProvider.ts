import type { AIProvider, GroundedChunk, TutorContext } from "./adapter";
import type { SourceCitation } from "../types";

/* ─────────────────────────────────────────────────────────
   MOCK PROVIDER — demo-grade grounding, zero network.
   Retrieval here is keyword overlap against syllabus lines
   (a stand-in for Foundry IQ's real semantic retrieval).
   The behaviour contract is identical to production:
   answer WITH a citation, or refuse honestly.
   ───────────────────────────────────────────────────────── */

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "what", "when", "where", "which",
  "who", "why", "how", "does", "do", "did", "of", "in", "on", "to", "and",
  "or", "for", "me", "my", "i", "it", "that", "this", "can", "you", "about",
  "explain", "tell", "between", "difference", "vs",
]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

interface Hit {
  citation: SourceCitation;
  score: number;
  courseName: string;
}

function retrieve(question: string, ctx: TutorContext): Hit | null {
  const qWords = keywords(question);
  if (qWords.length === 0) return null;

  let best: Hit | null = null;

  for (const course of ctx.courses) {
    course.syllabus.forEach((line, i) => {
      if (!line || line.length < 25) return;
      const lineWords = new Set(keywords(line));
      let score = 0;
      for (const w of qWords) {
        if (lineWords.has(w)) score += 1;
        else if (line.toLowerCase().includes(w)) score += 0.5;
      }
      if (score >= 1.5 && (!best || score > best.score)) {
        best = {
          score,
          courseName: `${course.code} ${course.name}`,
          citation: {
            docId: course.id,
            docName: `${course.code.replace(/\s/g, "")}-syllabus.txt`,
            line: i + 1,
            excerpt: line,
            tier: "verbatim",
          },
        };
      }
    });
  }
  return best;
}

function composeAnswer(hit: Hit): string {
  return `From your own material in ${hit.courseName}: ${hit.citation.excerpt} In an exam, lead with this exact framing — it is the language your course is built on.`;
}

function composeRefusal(question: string, ctx: TutorContext): string {
  const names = ctx.courses.map((c) => c.code).join(", ");
  void question;
  return `That isn't covered in the material you've uploaded (${names}), so I won't guess — a confident wrong answer is worse than an honest gap. You can upload the relevant notes and I'll ground an answer in them, or flag this for your lecturer.`;
}

async function streamText(
  text: string,
  onChunk: (c: GroundedChunk) => void,
  asRefusal: boolean,
): Promise<void> {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const piece = (i === 0 ? "" : " ") + words[i];
    if (asRefusal) onChunk({ type: "refusal", text: piece });
    else onChunk({ type: "token", text: piece });
    await new Promise((r) => setTimeout(r, 24 + Math.random() * 30));
  }
}

export const mockProvider: AIProvider = {
  name: "mock (offline demo mode)",
  async askTutor(question, ctx, onChunk) {
    /* small "thinking" beat so the progress ledger reads naturally */
    await new Promise((r) => setTimeout(r, 600));

    const hit = retrieve(question, ctx);

    if (hit) {
      onChunk({ type: "citation", citation: hit.citation });
      await streamText(composeAnswer(hit), onChunk, false);
    } else {
      await streamText(composeRefusal(question, ctx), onChunk, true);
    }
    onChunk({ type: "done" });
  },
};
