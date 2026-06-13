# CLAUDE.md — project brief for Claude Code

You are the technical co-pilot on **Constella**, a hackathon MVP (Innovation Studio, deadline June 14).
Read this whole file before writing code. It is the single source of truth for strategy and design.

## What this app is

A field-agnostic AI study companion. Students upload their own course material (syllabus, notes);
the app generates spaced-repetition flashcards, answers questions **grounded only in that material**
(citing the exact line, or refusing honestly), and draws cross-discipline connections between their
courses as a "constellation". Positioning: *"Every study app gives students more to read. We give
them proof they understand."*

Three pillars — never compromise any of them:
1. **Cite or refuse.** Every AI answer carries a citation to the user's own document, or the app
   refuses honestly. No third option. The refusal is a feature, not a failure state.
2. **Connection is comprehension.** Cross-links between subjects (criminal law ↔ constitutional
   law, SQL injection ↔ authentication) are the product, not a gimmick.
3. **Felt certainty.** Trust is delivered by UI: source badges, tier labels, the progress ledger.

## Design law (do not violate)

- Palette is **semantic**: `thread-*` (indigo) = connections/interactive ONLY; `star-*` (gold) =
  sources/verification/truth ONLY; `night-*` = surfaces; `ink-*` = text. Never swap roles.
- Fonts: Space Grotesk (display), Instrument Sans (body), JetBrains Mono (citations/data only).
- Citations always render in mono like code references: `LAW301-syllabus.txt · L13`.
- Dark, cinematic, Linear-grade restraint. Glass (`.glass`) for floating panels only.
- The constellation is the one signature element. Everything else stays quiet around it.
- Respect `prefers-reduced-motion` (already wired in index.css). Keep keyboard focus visible.
- Never install a UI kit that imposes its own look. Hand-rolled components, shadcn-style.

## Architecture conventions

- `src/lib/ai/` is the **only** place that knows which AI backend is live. Everything else consumes
  the `AIProvider` interface (`adapter.ts`) and its `GroundedChunk` stream. Do not leak provider
  details into components.
- `src/lib/scheduler.ts` — SM-2 now, FSRS-compatible call signature. Swap via `ts-fsrs` when asked.
- `src/lib/types.ts` — domain types. Extend here first, then implement.
- Persistence is localStorage (`scheduler.ts`); keep load/save signatures stable for a future
  Supabase swap.
- TypeScript strict. No `any`. Build must pass `npm run build` before any commit.

## Task backlog (work top-down; ask before reordering)

### P0 — required for submission
1. **Wire Azure + Foundry IQ** (`src/lib/ai/azureProvider.ts`): env vars land in `.env` (see
   `.env.example`). Implement real retrieval against the Foundry IQ knowledge base, map retrieval
   metadata to `SourceCitation` (doc + line), keep the NOT_IN_MATERIAL → refusal mapping. The UI
   must need zero changes.
2. **Demo polish pass**: verify the full demo flow (load → flip card → rate → ask in-syllabus
   question → ask out-of-syllabus question → paste new course) is smooth on a 13" laptop at
   1280px and on a phone at 390px.
3. **Deploy to Vercel** and confirm the production URL works cold.

### P1 — strong differentiators if time allows
1. **Inferred-tier cross-links**: when a new course is uploaded, generate suggested `CrossLink`s
   between its topics and existing courses (keyword overlap now, Fabric IQ later). New links get
   `tier: "inferred"` styling and animate into the constellation. This is the wow moment.
2. **PDF upload** via `pdfjs-dist` in `UploadPanel` (text extraction only, keep it simple).
3. **Study notifications**: browser Notification API; one gentle nudge with a real question from
   the most overdue course. Copy tone: invitational, never guilt.
4. **Dynamic constellation layout**: positions for uploaded courses (currently only demo topics
   have coordinates in `Constellation.tsx` POS map). Simple cluster placement is fine.

### P2 — polish
1. Voice Q&A via Web Speech API in TutorPanel.
2. Recognition-vs-production stats ("you recognize X but miss it in fact patterns").
3. Keyboard shortcuts: space = flip, 1–4 = rate.

## Demo script (protect these moments)

1. Open app → constellation draws itself in.
2. Flip a card → gold source badge → hover shows the exact syllabus line.
3. Ask "When is an arrest lawful?" → ledger runs → cited answer streams.
4. Ask the out-of-syllabus question → **honest refusal** (amber). Pause here in the video.
5. Paste a cloud-cert outline → ledger → new grounded cards. "Same engine, two worlds."

## Honesty rules

- Never fake a citation. If grounding fails, refuse.
- README discloses AI-assisted development. Keep that line intact.
