import { useRef, useState } from "react";
import { Send, Sparkles, Mic, Square, Volume2, VolumeX, ExternalLink, Compass } from "lucide-react";
import { provider } from "../lib/ai";
import type { GroundedChunk } from "../lib/ai";
import type { Course, SourceCitation, LedgerStep } from "../lib/types";
import { suggestSources, type SourceSuggestion } from "../lib/sources";
import { SourceBadge } from "./SourceBadge";
import { ProgressLedger } from "./ProgressLedger";
import {
  listen,
  readAloud,
  stopReading,
  voiceInputSupported,
  readAloudSupported,
  type VoiceSession,
} from "../lib/voice";

/* ─────────────────────────────────────────────────────────
   TUTOR PANEL — cite or refuse, live on screen.
   The two suggested questions are the demo script:
   one lands inside the material (gold citation appears),
   one lands outside (graceful, honest refusal appears).
   That refusal is the most convincing trust demo we have.
   ───────────────────────────────────────────────────────── */

const SUGGESTED = [
  "When is an arrest lawful?",
  "What did the Supreme Court decide in 2025 about crypto?",
];

const IDLE_STEPS: LedgerStep[] = [];

function makeSteps(stage: 0 | 1 | 2 | 3): LedgerStep[] {
  const labels = ["Reading question", "Searching your material", "Grounding answer", "Cited & done"];
  return labels.map((label, i) => ({
    id: String(i),
    label,
    status: i < stage ? "done" : i === stage ? "active" : "pending",
  }));
}

export function TutorPanel({ courses }: { courses: Course[] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citation, setCitation] = useState<SourceCitation | null>(null);
  const [refused, setRefused] = useState(false);
  const [sources, setSources] = useState<SourceSuggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<LedgerStep[]>(IDLE_STEPS);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<VoiceSession | null>(null);
  const spokeRef = useRef(false); // did the current question come in by voice?

  const canListen = voiceInputSupported();
  const canSpeak = readAloudSupported();

  /* Read an answer aloud while it stays on screen — hear it and see it. */
  function speak(text: string) {
    if (!text.trim()) return;
    setSpeaking(true);
    readAloud(text);
    // speechSynthesis has no reliable end event across browsers, so we
    // approximate: clear the speaking flag when cancelled or after a beat.
    const ms = Math.min(20000, 600 + text.length * 55);
    window.setTimeout(() => setSpeaking(false), ms);
  }

  function toggleSpeak(text: string) {
    if (speaking) {
      stopReading();
      setSpeaking(false);
    } else {
      speak(text);
    }
  }

  function toggleMic() {
    if (listening) {
      sessionRef.current?.stop();
      return;
    }
    const session = listen(
      (text, isFinal) => {
        setQuestion(text);
        if (isFinal) {
          spokeRef.current = true;
          sessionRef.current?.stop();
          void ask(text);
        }
      },
      () => {
        setListening(false);
        sessionRef.current = null;
      },
    );
    if (session) {
      sessionRef.current = session;
      setListening(true);
    }
  }

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    stopReading();
    setSpeaking(false);
    setBusy(true);
    setAnswer("");
    setCitation(null);
    setRefused(false);
    setSources(null);
    setSteps(makeSteps(0));
    setTimeout(() => setSteps(makeSteps(1)), 250);

    const wasVoice = spokeRef.current;
    spokeRef.current = false;
    let full = "";
    let didRefuse = false;

    await provider.askTutor(q, { courses }, (chunk: GroundedChunk) => {
      if (chunk.type === "citation") {
        setCitation(chunk.citation);
        setSteps(makeSteps(2));
      } else if (chunk.type === "token") {
        setSteps(makeSteps(2));
        full += chunk.text;
        setAnswer((a) => a + chunk.text);
      } else if (chunk.type === "refusal") {
        setRefused(true);
        didRefuse = true;
        setSteps(makeSteps(2));
        full += chunk.text;
        setAnswer((a) => a + chunk.text);
      } else if (chunk.type === "done") {
        setSteps(makeSteps(3));
        setBusy(false);
        // Don't leave them stranded: point to trusted material to add.
        if (didRefuse) setSources(suggestSources(q, courses));
        // If they asked by voice, answer them by voice too.
        if (wasVoice && canSpeak) speak(full);
      }
    });
  }

  return (
    <section className="glass rounded-2xl p-5 sm:p-6" aria-label="Ask your material">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="display text-base font-semibold text-ink-100">Ask your material</h2>
          <p className="text-xs text-ink-500">
            Answers come from your uploads, with the exact line cited — or an honest refusal. Never a guess.
          </p>
        </div>
        <span className="font-mono text-[10px] text-ink-700">engine: {provider.name}</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-night-600/50 px-3 py-1.5 text-xs text-ink-300 transition-colors hover:border-thread-500/50 hover:text-thread-300 disabled:opacity-40"
          >
            <Sparkles size={12} /> {s}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={listening ? "Listening…" : "Ask anything about your courses…"}
          aria-label="Your question"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-night-700/70 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 focus:border-thread-500/60 focus:outline-none"
        />
        {canListen && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : "Ask by voice"}
            title={listening ? "Stop listening" : "Ask by voice"}
            className={`inline-flex items-center justify-center rounded-xl border px-3 py-2.5 transition-colors ${
              listening
                ? "border-ember-500/60 bg-ember-500/10 text-ember-400"
                : "border-white/10 text-ink-300 hover:border-thread-500/50 hover:text-thread-300"
            }`}
          >
            {listening ? <Square size={15} /> : <Mic size={15} />}
          </button>
        )}
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-thread-500 px-4 py-2.5 text-sm font-medium text-night-900 transition-colors hover:bg-thread-400 disabled:opacity-40"
        >
          <Send size={15} /> Ask
        </button>
      </form>

      {(busy || answer) && (
        <div className="mt-4 space-y-3" ref={liveRef} aria-live="polite">
          <ProgressLedger steps={steps} />
          <div
            className={`rounded-xl border p-4 text-sm leading-relaxed ${
              refused
                ? "border-star-500/40 bg-star-500/5 text-ink-100"
                : "border-white/8 bg-night-700/50 text-ink-100"
            }`}
          >
            {citation && (
              <div className="mb-2.5">
                <SourceBadge citation={citation} />
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              {refused && (
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-star-300">
                  honest refusal — not in your material
                </p>
              )}
              {canSpeak && answer && !busy && (
                <button
                  type="button"
                  onClick={() => toggleSpeak(answer)}
                  aria-label={speaking ? "Stop reading" : "Read answer aloud"}
                  title={speaking ? "Stop reading" : "Read answer aloud"}
                  className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-ink-300 transition-colors hover:border-thread-500/50 hover:text-thread-300"
                >
                  {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  {speaking ? "Stop" : "Read aloud"}
                </button>
              )}
            </div>
            <p>
              {answer}
              {busy && <span className="caret text-thread-300">▍</span>}
            </p>
          </div>

          {/* refusal → a door: trusted open material to add, never a dead end */}
          {sources && !busy && (
            <div className="rounded-xl border border-white/10 bg-night-700/40 p-4">
              <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-300">
                <Compass size={13} className="text-thread-300" />
                Where to get trustworthy material on {sources.field}
              </p>
              <ul className="space-y-1.5">
                {sources.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-1.5 text-sm text-ink-100 hover:text-thread-300"
                    >
                      <ExternalLink size={13} className="mt-0.5 shrink-0 text-ink-500 group-hover:text-thread-300" />
                      <span>
                        <span className="font-medium underline-offset-2 group-hover:underline">{s.name}</span>
                        <span className="block text-[11px] text-ink-500">{s.blurb}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-[11px] text-ink-500">
                Add what you find via <span className="text-ink-300">“Add a course”</span> below — then I’ll ground an answer in it and cite the line.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
