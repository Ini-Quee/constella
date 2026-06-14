import type { Course } from "./types";

/* ─────────────────────────────────────────────────────────
   CONSTELLATION LAYOUT — field-agnostic star placement.
   The constellation must draw ANY course the student uploads,
   not just the demo seed. So positions are computed, never
   hardcoded: each course becomes a cluster on a ring, its
   topics fan around the cluster centre, and labels radiate
   outward away from the middle so they don't collide.
   Deterministic in, deterministic out — the same courses
   always produce the same sky, but no two students' skies
   match, because the sky is a portrait of THEIR courses.
   ───────────────────────────────────────────────────────── */

export const VIEW_W = 800;
export const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = 252;

export interface NodeLayout {
  x: number;
  y: number;
  /** SVG text-anchor for this topic's label */
  anchor: "start" | "middle" | "end";
  /** label position */
  lx: number;
  ly: number;
}

export interface ConstellationLayout {
  nodes: Map<string, NodeLayout>;
  captions: Map<string, { x: number; y: number }>;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function computeLayout(courses: Course[]): ConstellationLayout {
  const nodes = new Map<string, NodeLayout>();
  const captions = new Map<string, { x: number; y: number }>();
  const n = Math.max(1, courses.length);

  // One course sits centre stage; several spread around a ring.
  const ringRx = n === 1 ? 0 : 250;
  const ringRy = n === 1 ? 0 : 132;

  courses.forEach((course, ci) => {
    // -90° start places the first cluster up top; even spacing after.
    const a = (-90 + ci * (360 / n)) * (Math.PI / 180);
    const cx = CX + ringRx * Math.cos(a);
    const cy = CY + ringRy * Math.sin(a);

    // Labels radiate outward from the canvas centre so they never
    // overlap the threads converging in the middle.
    const side: "left" | "right" | "below" =
      cx < CX - 70 ? "left" : cx > CX + 70 ? "right" : "below";
    const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";

    const t = Math.max(1, course.topics.length);
    const topicR = t === 1 ? 0 : 46;

    course.topics.forEach((topic, ti) => {
      // Fan topics evenly around the cluster centre.
      const ta = (ti / t) * Math.PI * 2 - Math.PI / 2;
      const x = clamp(cx + topicR * Math.cos(ta), 28, VIEW_W - 28);
      const y = clamp(cy + topicR * Math.sin(ta), 30, VIEW_H - 34);
      const lx = side === "left" ? x - 13 : side === "right" ? x + 13 : x;
      const ly = side === "below" ? y + 22 : y + 4;
      nodes.set(topic.id, { x, y, anchor, lx, ly });
    });

    // Course code caption sits just outside the cluster, outward side.
    const capX = clamp(cx, 40, VIEW_W - 40);
    const capY = clamp(cy < CY ? cy - topicR - 22 : cy + topicR + 30, 18, VIEW_H - 8);
    captions.set(course.id, { x: capX, y: capY });
  });

  return { nodes, captions };
}
