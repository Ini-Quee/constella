/* ─────────────────────────────────────────────────────────
   VOICE — Web Speech API wrappers. Free, browser-native, no key.

   · Ask by voice  → SpeechRecognition (strong in Chrome/Edge).
   · Read aloud     → speechSynthesis (universal).

   Both are feature-detected so the UI only ever shows a control
   that actually works on the current browser — never a dead
   button on stage. Recognition is cloud-backed in Chrome but
   needs no key from us; synthesis runs locally.
   ───────────────────────────────────────────────────────── */

// Minimal typings — the Web Speech API isn't in the standard DOM lib.
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  0: RecognitionAlternative;
  isFinal: boolean;
}
interface RecognitionEvent {
  results: ArrayLike<RecognitionResult>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function voiceInputSupported(): boolean {
  return recognitionCtor() !== null;
}

export function readAloudSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface VoiceSession {
  stop(): void;
}

/** Start listening. Returns a session to stop early, or null if unsupported.
    onTranscript fires with interim + final text; onEnd when listening stops. */
export function listen(
  onTranscript: (text: string, isFinal: boolean) => void,
  onEnd: () => void,
): VoiceSession | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (e) => {
    let text = "";
    let isFinal = false;
    for (let i = 0; i < e.results.length; i++) {
      text += e.results[i][0].transcript;
      if (e.results[i].isFinal) isFinal = true;
    }
    onTranscript(text, isFinal);
  };
  rec.onerror = () => onEnd();
  rec.onend = () => onEnd();

  rec.start();
  return { stop: () => rec.stop() };
}

/** Speak text aloud, cancelling anything already speaking. */
export function readAloud(text: string): void {
  if (!readAloudSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

export function stopReading(): void {
  if (readAloudSupported()) window.speechSynthesis.cancel();
}
