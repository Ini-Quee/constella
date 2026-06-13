import type { AIProvider } from "./adapter";

/* ─────────────────────────────────────────────────────────
   AZURE PROVIDER — wire this TOMORROW when access lands.
   Steps (also tracked in CLAUDE.md, task P0-1):
   1. Fill .env from .env.example
   2. Provision a Foundry IQ knowledge base; upload the same
      syllabus docs the user uploads in-app.
   3. Replace the fetch below with: retrieval call to Foundry
      IQ -> pass retrieved passages as grounding context ->
      chat completion with "answer ONLY from context, else
      say NOT_IN_MATERIAL" -> map NOT_IN_MATERIAL to a
      refusal chunk. Cite doc + line from retrieval metadata.
   The UI needs ZERO changes — same GroundedChunk contract.
   ───────────────────────────────────────────────────────── */

export function azureConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT && import.meta.env.VITE_AZURE_OPENAI_KEY,
  );
}

export const azureProvider: AIProvider = {
  name: "azure-openai + foundry-iq",
  async askTutor(question, ctx, onChunk) {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT as string;
    const key = import.meta.env.VITE_AZURE_OPENAI_KEY as string;
    const deployment = (import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT as string) || "gpt-4o-mini";

    const grounding = ctx.courses
      .map((c) => `# ${c.code} ${c.name}\n` + c.syllabus.map((l, i) => `${i + 1}: ${l}`).join("\n"))
      .join("\n\n");

    try {
      const res = await fetch(
        `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": key },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are a study tutor. Answer ONLY using the numbered course material provided. " +
                  "If the answer is not in the material, reply exactly: NOT_IN_MATERIAL. " +
                  "Otherwise answer in 2-3 sentences and end with the line reference like [LAW301:13].",
              },
              { role: "user", content: `MATERIAL:\n${grounding}\n\nQUESTION: ${question}` },
            ],
            max_tokens: 300,
            temperature: 0.2,
          }),
        },
      );
      const data = await res.json();
      const text: string = data?.choices?.[0]?.message?.content ?? "NOT_IN_MATERIAL";

      if (text.includes("NOT_IN_MATERIAL")) {
        onChunk({
          type: "refusal",
          text: "That isn't covered in your uploaded material, so I won't guess. Upload the relevant notes and I'll ground an answer in them.",
        });
      } else {
        for (const word of text.split(" ")) {
          onChunk({ type: "token", text: word + " " });
          await new Promise((r) => setTimeout(r, 18));
        }
      }
    } catch {
      onChunk({
        type: "refusal",
        text: "I couldn't reach the grounding service, so rather than answer unverified, I'm pausing. Check your connection or .env keys.",
      });
    }
    onChunk({ type: "done" });
  },
};
