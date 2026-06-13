import type { AIProvider } from "./adapter";

/* ─────────────────────────────────────────────────────────
   AZURE PROVIDER — wire this when access lands (CLAUDE.md P0-1).

   ⚠️  SECURITY — READ BEFORE ADDING A REAL KEY  ⚠️
   Vite inlines every VITE_-prefixed variable into the PUBLIC
   browser bundle. A real VITE_AZURE_OPENAI_KEY would therefore
   ship to every visitor and be readable in DevTools → key theft,
   quota abuse and billing fraud. NEVER put a production secret
   here. The correct pattern is a tiny server-side proxy (e.g. a
   Vercel serverless function) that holds the key and that the
   browser calls without it. Set VITE_TUTOR_PROXY_URL to that
   endpoint; the direct-key path below is for LOCAL DEV ONLY.
   See SECURITY.md → "Secret handling".
   ───────────────────────────────────────────────────────── */

const proxyUrl = import.meta.env.VITE_TUTOR_PROXY_URL as string | undefined;

export function azureConfigured(): boolean {
  return Boolean(
    proxyUrl ||
      (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT && import.meta.env.VITE_AZURE_OPENAI_KEY),
  );
}

export const azureProvider: AIProvider = {
  name: proxyUrl ? "tutor-proxy (server-grounded)" : "azure-openai + foundry-iq",
  async askTutor(question, ctx, onChunk) {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT as string;
    const key = import.meta.env.VITE_AZURE_OPENAI_KEY as string;
    const deployment = (import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT as string) || "gpt-4o-mini";

    const grounding = ctx.courses
      .map((c) => `# ${c.code} ${c.name}\n` + c.syllabus.map((l, i) => `${i + 1}: ${l}`).join("\n"))
      .join("\n\n");

    // Production-safe path: hand off to a server proxy that holds the key.
    if (proxyUrl) {
      try {
        const res = await fetch(proxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, courses: ctx.courses }),
        });
        const data = await res.json();
        if (data?.refusal || !data?.answer) {
          onChunk({
            type: "refusal",
            text: data?.refusal ?? "That isn't covered in your uploaded material, so I won't guess.",
          });
        } else {
          if (data.citation) onChunk({ type: "citation", citation: data.citation });
          for (const word of String(data.answer).split(" ")) {
            onChunk({ type: "token", text: word + " " });
            await new Promise((r) => setTimeout(r, 18));
          }
        }
      } catch {
        onChunk({
          type: "refusal",
          text: "I couldn't reach the grounding service, so rather than answer unverified, I'm pausing.",
        });
      }
      onChunk({ type: "done" });
      return;
    }

    // ⚠️ LOCAL DEV ONLY — exposes the key in the bundle. Do not deploy.
    if (import.meta.env.PROD) {
      console.warn(
        "[constella] SECURITY: calling Azure directly with a client-side key in a " +
          "production build exposes the key to every visitor. Use VITE_TUTOR_PROXY_URL " +
          "(a server proxy) instead. See SECURITY.md.",
      );
    }

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
