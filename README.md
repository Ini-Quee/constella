# Constella ✦

**Every answer has a source. Every subject has a thread.**

A field-agnostic AI study companion that studies from *your* uploaded material — citing the exact
line for every claim, refusing honestly when it doesn't know, and weaving your courses into one
connected sky.

Built for the Innovation Studio Hackathon.

---

## Why it's different

Every study app gives students more to read. Constella gives them **proof they understand**.

- **Cite or refuse.** Every AI answer is grounded in the student's own uploaded material and carries
  a citation to the exact line — or the app refuses honestly. No confident guessing. This defeats
  the hallucination trust gap that breaks every other AI study tool.
- **Connection is comprehension.** Constella links concepts across subjects — criminal law to
  constitutional law, SQL injection to authentication — because understanding *is* connection. The
  "constellation" is a portrait of the student's own mind: no two are alike.
- **Works for every field.** The engine never needs to "know" law or medicine or cloud computing.
  The student's syllabus is the source of truth, so the same engine serves a law student in Lagos
  and an AWS candidate in Berlin with zero reconfiguration.

## Microsoft IQ integration

- **Foundry IQ** — the grounded knowledge base. Student material is ingested and every answer is
  retrieved + cited from it. *(Wiring in progress — see `azureProvider.ts`; the app runs today in a
  fully-functional offline mock mode with the identical cite-or-refuse contract.)*
- **Fabric IQ** — semantic cross-subject linking, powering the constellation threads. Today this runs
  offline as a keyword-overlap stand-in (`src/lib/crosslinks.ts`): uploading a new course threads it
  into the existing sky automatically, and every engine-proposed link is honestly flagged
  *"suggested — verify"* (dashed thread) rather than presented as fact. The same seam upgrades to
  Fabric IQ's real semantic graph with no UI change.
- **Work IQ** *(roadmap)* — intelligent, non-intrusive study scheduling.

## Tech stack

| Layer | Choice |
| :-- | :-- |
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animation | Motion |
| Icons | lucide-react |
| AI | Azure OpenAI + Foundry IQ (offline mock adapter today) |
| Persistence | localStorage (Supabase-ready) |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

The app runs **fully offline** in mock mode — citations, streaming, and honest refusals all work
with no API key. To enable Azure: copy `.env.example` to `.env`, fill in the keys, and the app
auto-switches. No code change needed.

## Architecture

The whole app talks to one `AIProvider` interface (`src/lib/ai/adapter.ts`). Today it resolves to a
mock provider; the moment Azure env vars exist it resolves to the real one. Nothing in the UI knows
the difference — that's the seam that let us build the entire experience before backend access
landed.

```
src/
  lib/
    ai/          adapter (the seam) · mockProvider · azureProvider · auto-switch index
    types.ts     field-agnostic domain model
    scheduler.ts SM-2 spaced repetition (FSRS-ready) + persistence
    demoData.ts  seed: 3 courses, 2 faculties, cross-links
  components/
    Constellation.tsx  ← the signature element
    Flashcard.tsx      3D flip + source badge + recall rating
    SourceBadge.tsx    the trust UI (cite, tier, hover-to-verify)
    TutorPanel.tsx     cite-or-refuse Q&A, streaming
    UploadPanel.tsx    paste any field's syllabus → grounded cards
    ProgressLedger.tsx agent observability
  App.tsx        bento dashboard composition root
```

See `CLAUDE.md` for the full task backlog and design law.

## Tasks for GitHub Copilot

Open these as issues and assign to Copilot — they're well-scoped and low-risk (Copilot stays away
from the signature design work):

1. ~~**Add keyboard shortcuts**: space flips the card, keys 1–4 rate the revealed card.~~ ✓ Done
   (`Flashcard.tsx` — global handler, guarded against text fields).
2. **Settings panel**: a small dropdown in the header with a notification toggle and a
   session-length picker (10 / 20 / all due). Persist via the existing localStorage helpers.
3. **Per-course filter**: clicking a course caption in the constellation filters the study session
   to that course's due cards.
4. **Empty + error states**: friendly copy for "no courses yet" and "couldn't parse that syllabus"
   in `UploadPanel.tsx`. Errors explain what to fix, in the app's voice.
5. **Unit tests** for `scheduler.ts` (`schedule` and `dueCards`) using Vitest.

## Development note

Built with AI assistance (Claude Code + GitHub Copilot). Architecture, design system, and all
grounding/trust logic are original to this project.
