import type { Course, SourceCitation } from "../types";

/* ─────────────────────────────────────────────────────────
   AI ADAPTER — the single seam in the whole app.
   Today:    mockProvider (offline, demo-perfect)
   Tomorrow: azureProvider (Azure OpenAI + Foundry IQ)
   Nothing outside lib/ai knows or cares which one is live.
   ───────────────────────────────────────────────────────── */

export type GroundedChunk =
  | { type: "token"; text: string }
  | { type: "citation"; citation: SourceCitation }
  | { type: "refusal"; text: string }
  | { type: "done" };

export interface TutorContext {
  courses: Course[];
}

export interface AIProvider {
  name: string;
  /**
   * Ask a question. The provider MUST follow cite-or-refuse:
   * every answer is grounded in ctx.courses[].syllabus and
   * emits a citation chunk, OR it emits a refusal chunk.
   * There is no third option. Confidence theater is banned.
   */
  askTutor(
    question: string,
    ctx: TutorContext,
    onChunk: (chunk: GroundedChunk) => void,
  ): Promise<void>;
}
