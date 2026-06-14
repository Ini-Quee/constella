import { useState } from "react";
import { Sparkles, GraduationCap, Target, ArrowRight } from "lucide-react";
import type { UserProfile } from "../lib/types";
import { demoProfile } from "../lib/demoData";

/* ─────────────────────────────────────────────────────────
   ONBOARDING — the first thing the student does is plan.
   A short survey turns a pile of courses into "my plan":
   my degree, my career goal, my exam dates. THIS is what
   makes the courses mean something — a law degree AND a
   cloud-cert side-goal is why the sky holds both Law and
   Cybersecurity. Without this, the app has no purpose on
   screen. With it, every number downstream is about YOU.
   ───────────────────────────────────────────────────────── */

const field =
  "w-full rounded-xl border border-white/10 bg-night-700/70 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 focus:border-thread-500/60 focus:outline-none";
const label = "mb-1 block text-[11px] uppercase tracking-wider text-ink-500";

export function Onboarding({ onComplete }: { onComplete: (p: UserProfile) => void }) {
  const [p, setP] = useState<UserProfile>({
    name: "",
    institution: "",
    programme: "",
    year: 1,
    finalsDate: "",
    goal: "",
    certTarget: "",
    certExamDate: "",
  });

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => setP((s) => ({ ...s, [k]: v }));
  const ready = p.name.trim() && p.programme.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night-950/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="glass my-6 w-full max-w-xl rounded-2xl p-6 sm:p-8">
        <div className="mb-1 flex items-center gap-2 text-thread-300">
          <Sparkles size={16} />
          <span className="font-mono text-[11px] uppercase tracking-wider">welcome to Constella</span>
        </div>
        <h1 className="display mb-1.5 text-2xl font-semibold text-ink-100 sm:text-3xl">
          Let's build your study plan
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-ink-500">
          Two minutes now, and every card, deadline and connection becomes about{" "}
          <em className="not-italic text-ink-300">you</em> — your degree, your career goal, your exams.
        </p>

        {/* You */}
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 text-ink-300">
            <GraduationCap size={14} className="text-thread-300" />
            <span className="text-sm font-medium">You</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Your name</label>
              <input className={field} value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Erica" />
            </div>
            <div>
              <label className={label}>Institution</label>
              <input className={field} value={p.institution} onChange={(e) => set("institution", e.target.value)} placeholder="University of Warwick" />
            </div>
          </div>
        </div>

        {/* Degree */}
        <div className="mb-5">
          <div className="mb-2 text-sm font-medium text-ink-300">Your degree</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className={label}>Programme</label>
              <input className={field} value={p.programme} onChange={(e) => set("programme", e.target.value)} placeholder="LLB Law" />
            </div>
            <div>
              <label className={label}>Year</label>
              <input type="number" min={1} max={7} className={field} value={p.year} onChange={(e) => set("year", Number(e.target.value) || 1)} />
            </div>
            <div>
              <label className={label}>Finals date</label>
              <input type="date" className={field} value={p.finalsDate} onChange={(e) => set("finalsDate", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Goal */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-ink-300">
            <Target size={14} className="text-star-300" />
            <span className="text-sm font-medium">Your goal beyond the degree</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={label}>Career</label>
              <input className={field} value={p.goal} onChange={(e) => set("goal", e.target.value)} placeholder="Cloud Engineer" />
            </div>
            <div>
              <label className={label}>Certification</label>
              <input className={field} value={p.certTarget} onChange={(e) => set("certTarget", e.target.value)} placeholder="AWS Cloud Practitioner" />
            </div>
            <div>
              <label className={label}>Cert exam date</label>
              <input type="date" className={field} value={p.certExamDate} onChange={(e) => set("certExamDate", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onComplete(demoProfile)}
            className="text-xs text-ink-500 underline-offset-2 hover:text-ink-300 hover:underline"
          >
            Use the demo profile (Erica · Warwick)
          </button>
          <button
            onClick={() => onComplete({ ...p, name: p.name.trim(), institution: p.institution.trim() || "your institution", programme: p.programme.trim() })}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-xl bg-thread-500 px-5 py-2.5 text-sm font-medium text-night-900 transition-colors hover:bg-thread-400 disabled:opacity-40"
          >
            Create my plan <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
