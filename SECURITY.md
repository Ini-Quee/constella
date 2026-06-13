# Security posture & assessment — Constella

_Last reviewed: 2026-06-13. This document is honest about what is and isn't
protected today, so no one assumes a guarantee the code doesn't make._

## What Constella is today (the threat surface)

Constella is currently a **100% client-side single-page app**. There is:

- **No backend server, no database, no user accounts, no login, no sessions.**
- **No authentication and no MFA** — because there is nothing to log in to.
- All state (courses, cards, progress) lives in the **visitor's own browser**
  via `localStorage`. It never leaves their device. One browser = one private,
  local dataset.
- The live AI is an **offline mock** (`mockProvider`); no network calls, no keys,
  no data sent anywhere.

So the questions about "people's login details" and "multi-factor authentication"
have an honest answer: **those systems do not exist yet.** That is not a
vulnerability in what's built — it's a feature boundary. The moment the product
gains accounts and a server (see "Roadmap" below), a real auth/PII threat model
applies, and the controls listed there become mandatory.

## Findings

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **Critical (latent)** | Client-exposed AI key: `VITE_AZURE_OPENAI_KEY` is read in browser code. Vite inlines every `VITE_` var into the public bundle, so a real key would be stolen from DevTools → quota abuse, billing fraud. Dormant today (mock mode, no key). | **Mitigated in code** — see below |
| 2 | High (dev only) | `esbuild` advisory GHSA-gv7w-rqvm-qjhr via `vite`/`@vitejs/plugin-react`. Build-time toolchain only; **not shipped to users**. Fix needs a breaking Vite major bump. | Deferred (post-hackathon) |
| 3 | Medium (future) | No authn/authz/MFA. Fine while single-user/local; **blocking before any multi-user or PII handling**. | Roadmap |
| 4 | Medium (future) | Third-party data egress: once Azure/Foundry is wired, uploaded material (possibly personal/copyrighted notes) is sent off-device. Needs consent + disclosure. | Roadmap |
| 5 | Low | Prompt-injection / grounding integrity: a malicious uploaded document could try to subvert the "cite or refuse" instruction. | Mitigations noted |
| 6 | Low | `localStorage` is unencrypted and readable by any script on the origin. Acceptable for non-sensitive demo data; revisit if PII is stored. | Accepted (demo) |
| 7 | Info | No HTTP security headers / CSP yet (set at deploy). | `vercel.json` added |

### Positive controls already in place
- **No dangerous sinks**: no `dangerouslySetInnerHTML`, `eval`, `innerHTML`,
  or `document.write`. React's default escaping covers user-supplied text
  (uploaded syllabus, questions) against XSS.
- **Secrets are git-ignored**: `.env` / `.env.local` are in `.gitignore`; only
  `.env.example` (no real values) is tracked. No secrets committed.
- **Safe deserialization**: `loadDeck()` wraps `JSON.parse` of `localStorage`
  in try/catch and fails closed to a fresh deck.
- **Fail-closed AI**: on any provider error the app **refuses** rather than
  emitting an unverified answer — the trust contract holds even on failure.

## Finding 1 — how it's mitigated

`azureProvider.ts` and `.env.example` now:
- Document loudly that `VITE_` vars are public.
- Support a **server-proxy path** via `VITE_TUTOR_PROXY_URL`: the browser POSTs
  the question + course context to your serverless endpoint, which holds the key
  and returns a grounded answer/citation/refusal. **No secret in the browser.**
- `console.warn` if a production build is still using the direct client-side key.

### The secure pattern (implement when Azure access lands)
Create a serverless function (e.g. `api/tutor.ts` on Vercel) that:
1. Reads the key from a **server-only** env var (NOT `VITE_`-prefixed).
2. Calls Foundry IQ retrieval + the chat completion with the
   "answer ONLY from context, else NOT_IN_MATERIAL" system prompt.
3. Returns `{ answer, citation }` or `{ refusal }`.
Then set `VITE_TUTOR_PROXY_URL=/api/tutor`. The UI needs zero changes.

## Finding 5 — prompt-injection mitigations
- Keep the system prompt **server-side** (the proxy), so a document can't see or
  rewrite it.
- Treat uploaded material strictly as **data**, never as instructions.
- Validate the model's output for the `NOT_IN_MATERIAL` sentinel and the
  citation shape before trusting it; refuse on malformed output.

## Roadmap — required before handling real user data
If/when Constella adds accounts and stores other people's information:

- **Auth**: use a managed provider (e.g. Supabase Auth, Auth0, Entra ID) — never
  hand-roll password storage. Hash with bcrypt/argon2 if you ever must.
- **MFA**: enable TOTP/passkeys via the auth provider.
- **Authorization**: row-level security so a user can only read their own
  courses/cards (Supabase RLS or equivalent).
- **Encryption**: TLS in transit (default on Vercel); encrypt sensitive columns
  at rest; consider client-side encryption for notes.
- **Privacy**: a privacy notice + explicit consent before any material is sent
  to a third-party model; a data-deletion path; data-retention limits.
- **Secrets**: server-only env vars + a secret manager; rotate keys; never
  `VITE_`-prefix a secret.
- **Headers/CSP**: tighten the CSP in `vercel.json` once the real origins
  (Azure endpoint, auth domain) are known.
- **Dependencies**: resolve finding 2 (Vite/esbuild bump) and run `npm audit`
  in CI.

## Reporting
Found an issue? Email the maintainer rather than opening a public issue.
