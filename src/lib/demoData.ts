import type { Course, CrossLink, DeckState, Flashcard } from "./types";

/* ─────────────────────────────────────────────────────────
   DEMO SEED — three courses, two faculties, one engine.
   Every citation line number below points at a REAL line in
   the syllabus arrays, so hover-to-verify works honestly.
   ───────────────────────────────────────────────────────── */

const crimSyllabus = [
  "LAW 301 — Criminal Law I",
  "Faculty of Law · First semester",
  "",
  "Course objectives:",
  "Understand the foundations of criminal liability in Nigeria",
  "Apply statutory and case authority to fact patterns",
  "",
  "Module 1 — Elements of a crime",
  "A crime requires proof of actus reus (the guilty act) and mens rea (the guilty mind), subject to statutory exceptions.",
  "Criminal Code Act, ss. 24-25: intention, motive and accident.",
  "",
  "Module 2 — Police powers and arrest",
  "An arrest is lawful only where effected under warrant or under recognised statutory powers, and the suspect must be informed of the reason for the arrest.",
  "Administration of Criminal Justice Act 2015, ss. 6-8.",
  "",
  "Module 3 — General defences",
  "Defences include self-defence, provocation, insanity and mistake of fact; each defence presumes the accused's right to be heard.",
];

const constSyllabus = [
  "LAW 205 — Constitutional Law",
  "Faculty of Law · First semester",
  "",
  "Module 1 — Fundamental rights",
  "Chapter IV of the 1999 Constitution guarantees fundamental rights, including personal liberty (s. 35) and dignity of the person (s. 34).",
  "",
  "Module 2 — Fair hearing",
  "Section 36 guarantees fair hearing: every person is entitled to a hearing within a reasonable time by an impartial court or tribunal.",
  "",
  "Module 3 — Separation of powers",
  "Legislative, executive and judicial powers are allocated under ss. 4, 5 and 6; each arm checks the others.",
];

const cyberSyllabus = [
  "CSC 312 — Introduction to Cybersecurity",
  "Department of Computer Science",
  "",
  "Module 1 — Network fundamentals",
  "TCP/IP, ports and the OSI model; how data moves across a network and where it can be intercepted.",
  "",
  "Module 2 — Web application attacks",
  "SQL injection occurs when untrusted input is concatenated into a database query, letting an attacker read or modify data.",
  "Defence: parameterised queries and strict input validation.",
  "",
  "Module 3 — Authentication and access control",
  "Authentication verifies identity; access control decides what an identity may do. Broken authentication is a top OWASP risk.",
];

export const demoCourses: Course[] = [
  {
    id: "crim",
    code: "LAW 301",
    name: "Criminal Law",
    color: "#6fc7bd",
    examDate: "2026-07-08",
    weight: 3,
    syllabus: crimSyllabus,
    topics: [
      { id: "t-actus", courseId: "crim", title: "Actus reus & mens rea", syllabusLine: 9 },
      { id: "t-arrest", courseId: "crim", title: "Arrest & police powers", syllabusLine: 13 },
      { id: "t-defences", courseId: "crim", title: "General defences", syllabusLine: 17 },
    ],
  },
  {
    id: "const",
    code: "LAW 205",
    name: "Constitutional Law",
    color: "#b79bf0",
    examDate: "2026-07-15",
    weight: 2,
    syllabus: constSyllabus,
    topics: [
      { id: "t-rights", courseId: "const", title: "Fundamental rights (Ch. IV)", syllabusLine: 5 },
      { id: "t-fairhearing", courseId: "const", title: "Fair hearing (s. 36)", syllabusLine: 8 },
      { id: "t-separation", courseId: "const", title: "Separation of powers", syllabusLine: 11 },
    ],
  },
  {
    id: "cyber",
    code: "CSC 312",
    name: "Cybersecurity",
    color: "#f0876a",
    examDate: "2026-07-02",
    weight: 2,
    syllabus: cyberSyllabus,
    topics: [
      { id: "t-network", courseId: "cyber", title: "Network fundamentals", syllabusLine: 5 },
      { id: "t-sqli", courseId: "cyber", title: "SQL injection", syllabusLine: 8 },
      { id: "t-auth", courseId: "cyber", title: "Authentication & access", syllabusLine: 12 },
    ],
  },
];

export const demoLinks: CrossLink[] = [
  {
    id: "l1",
    fromTopicId: "t-arrest",
    toTopicId: "t-rights",
    insight:
      "A lawful-arrest question is secretly a Chapter IV personal-liberty question — one fact pattern, two courses.",
  },
  {
    id: "l2",
    fromTopicId: "t-defences",
    toTopicId: "t-fairhearing",
    insight: "Every defence presumes the s. 36 right to be heard. Raise one, invoke the other.",
  },
  {
    id: "l3",
    fromTopicId: "t-sqli",
    toTopicId: "t-auth",
    insight:
      "Injection that bypasses a login is an authentication failure — input validation guards the same gate.",
  },
];

function card(
  id: string,
  topicId: string,
  courseId: string,
  question: string,
  answer: string,
  docName: string,
  line: number,
  excerpt: string,
  kind: Flashcard["kind"] = "qa",
): Flashcard {
  return {
    id,
    topicId,
    courseId,
    question,
    answer,
    kind,
    citation: { docId: courseId, docName, line, excerpt, tier: "verbatim" },
    due: Date.now(),
    interval: 0,
    ease: 2.5,
    reps: 0,
  };
}

export const demoCards: Flashcard[] = [
  card(
    "c1",
    "t-actus",
    "crim",
    "What two elements must the prosecution prove for criminal liability?",
    "Actus reus (the guilty act) and mens rea (the guilty mind) — subject to statutory exceptions.",
    "LAW301-syllabus.txt",
    9,
    crimSyllabus[8],
  ),
  card(
    "c2",
    "t-arrest",
    "crim",
    "When is an arrest lawful?",
    "Only under warrant or recognised statutory powers — and the suspect must be told the reason for the arrest.",
    "LAW301-syllabus.txt",
    13,
    crimSyllabus[12],
  ),
  card(
    "c3",
    "t-fairhearing",
    "const",
    "What does s. 36 of the 1999 Constitution guarantee?",
    "Fair hearing — within a reasonable time, by an impartial court or tribunal.",
    "LAW205-syllabus.txt",
    8,
    constSyllabus[7],
  ),
  card(
    "c4",
    "t-rights",
    "const",
    "Which chapter of the Constitution guarantees fundamental rights?",
    "Chapter IV — including personal liberty (s. 35) and dignity of the person (s. 34).",
    "LAW205-syllabus.txt",
    5,
    constSyllabus[4],
  ),
  card(
    "c5",
    "t-sqli",
    "cyber",
    "What causes SQL injection, and what is the defence?",
    "Untrusted input concatenated into a database query. Defence: parameterised queries and strict input validation.",
    "CSC312-syllabus.txt",
    8,
    cyberSyllabus[7],
  ),
  card(
    "c6",
    "t-auth",
    "cyber",
    "Authentication vs access control — what is the difference?",
    "Authentication verifies who you are; access control decides what you may do.",
    "CSC312-syllabus.txt",
    12,
    cyberSyllabus[11],
  ),

  /* Study cards ("Did you know…") — facts straight from their notes, no
     grading. Repetition without pressure, drawn from the same source. */
  card(
    "f1",
    "t-actus",
    "crim",
    "Did you know?",
    "Under the Criminal Code Act ss. 24–25, intention, motive and accident are treated differently — a crime needs both a guilty act and a guilty mind.",
    "LAW301-syllabus.txt",
    10,
    crimSyllabus[9],
    "fact",
  ),
  card(
    "f2",
    "t-separation",
    "const",
    "Did you know?",
    "Legislative, executive and judicial powers sit under ss. 4, 5 and 6 of the 1999 Constitution — each arm exists to check the others.",
    "LAW205-syllabus.txt",
    11,
    constSyllabus[10],
    "fact",
  ),
  card(
    "f3",
    "t-network",
    "cyber",
    "Did you know?",
    "The OSI model and TCP/IP describe how data moves across a network — and every hop is a place where traffic can be intercepted.",
    "CSC312-syllabus.txt",
    5,
    cyberSyllabus[4],
    "fact",
  ),
];

export function freshDeck(): DeckState {
  return {
    courses: demoCourses,
    links: demoLinks,
    cards: demoCards,
    reviews: [],
    streak: 4,
  };
}
