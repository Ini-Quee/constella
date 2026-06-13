import type { DeckState } from "./types";
import { prioritized } from "./analytics";
import { dueCards } from "./scheduler";

/* ─────────────────────────────────────────────────────────
   NOTIFICATIONS — gentle, invitational, never guilt.
   One nudge with a REAL question from the course that most
   needs attention (highest priority × most overdue card).

   Honest scope: the browser Notification API fires while the
   app/tab is alive. True all-day background push (app closed)
   needs a Service Worker push subscription + a server to send
   them — that's the post-hackathon backend job. Installing the
   PWA puts Constella on the home screen so those nudges have a
   place to land.
   ───────────────────────────────────────────────────────── */

export type Perm = NotificationPermission | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): Perm {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<Perm> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export interface Nudge {
  title: string;
  body: string;
}

/** Build a nudge from the highest-priority course with an overdue card. */
export function buildNudge(deck: DeckState, now = Date.now()): Nudge | null {
  const order = prioritized(deck.courses, deck.cards, deck.reviews, now);
  for (const it of order) {
    const due = dueCards(
      deck.cards.filter((c) => c.courseId === it.course.id && c.kind === "qa"),
      now,
    );
    if (due.length > 0) {
      return { title: `A minute for ${it.course.code}?`, body: due[0].question };
    }
  }
  return null;
}

export function sendNudge(n: Nudge): boolean {
  if (notificationPermission() !== "granted") return false;
  new Notification(n.title, { body: n.body, icon: "/icon.svg", tag: "constella-nudge" });
  return true;
}
