import { writeFileSync, mkdirSync } from "fs";

/* Generates 7 scene images (SVG, 1280x720) matching Constella's real design.
   Faithful to the app's tokens: night bg, glass panels, gold = sources,
   indigo = connections, the constellation, the amber refusal. */

const OUT = "/home/user/constella/scenes";
mkdirSync(OUT, { recursive: true });

const C = {
  bg: "#07080f", night7: "#12141f", night6: "#1a1d2c",
  ink1: "#f2f4fa", ink3: "#ccd1de", ink5: "#a6acbe", ink7: "#7d8399",
  thread3: "#aab5ff", thread5: "#6f7ff2",
  star3: "#ffe1a3", star5: "#f5b83d",
  ember: "#ff9d7a",
  gold: "#f5b83d", indigo: "#8b9afb", teal: "#6fc7bd", orange: "#f0876a", cloud: "#7fb5f0",
};
const DISP = "'Space Grotesk','Segoe UI',Arial,sans-serif";
const BODY = "'Instrument Sans','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas',monospace";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function t(x, y, str, o = {}) {
  const { size = 18, fill = C.ink1, weight = 400, anchor = "start", family = BODY, spacing = 0, opacity = 1 } = o;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}">${esc(str)}</text>`;
}
function panel(x, y, w, h, r = 20) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.09)"/>`;
}
const AMBIENT = [[120,90],[330,70],[520,110],[980,80],[1140,260],[90,470],[1180,520],[640,140],[420,520],[760,560],[210,600],[1080,150]];
function ambient() {
  return AMBIENT.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.6" fill="${C.thread3}" opacity="${0.18+ (i%3)*0.06}"/>`).join("");
}
function logo(cx, cy, s) {
  const p = (dx,dy)=>[cx+dx*s, cy+dy*s];
  const [a,b]=p(-22,18),[c,d]=p(0,-22),[e,f]=p(22,8);
  return `<path d="M${a} ${b} L${c} ${d} L${e} ${f}" stroke="${C.thread5}" stroke-width="${1.6*s}" fill="none" opacity="0.7"/>
  <circle cx="${a}" cy="${b}" r="${4.2*s}" fill="${C.gold}"/>
  <circle cx="${c}" cy="${d}" r="${4.2*s}" fill="${C.indigo}"/>
  <circle cx="${e}" cy="${f}" r="${4.2*s}" fill="${C.teal}"/>`;
}
function frame(inner, caption) {
  const cap = caption ? `
  <rect x="0" y="650" width="1280" height="70" fill="rgba(7,8,15,0.66)"/>
  ${t(640, 692, caption, { size: 22, fill: C.ink3, anchor: "middle", family: DISP, weight: 500 })}` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <radialGradient id="g1" cx="75%" cy="-10%" r="60%"><stop offset="0%" stop-color="${C.thread5}" stop-opacity="0.13"/><stop offset="100%" stop-color="${C.thread5}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="8%" cy="112%" r="55%"><stop offset="0%" stop-color="${C.star5}" stop-opacity="0.07"/><stop offset="100%" stop-color="${C.star5}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1280" height="720" fill="${C.bg}"/>
  <rect width="1280" height="720" fill="url(#g1)"/>
  <rect width="1280" height="720" fill="url(#g2)"/>
  ${ambient()}
  ${inner}
  ${cap}
</svg>`;
}

// header bar reused on app-screen scenes
function header() {
  return `${logo(60, 52, 0.9)} ${t(96, 60, "Constella", { size: 24, family: DISP, weight: 600 })}
  <rect x="980" y="36" width="240" height="34" rx="17" fill="rgba(245,184,61,0.10)" stroke="rgba(245,184,61,0.40)"/>
  <circle cx="1004" cy="53" r="5" fill="${C.star5}"/>
  ${t(1018, 59, "Grounded · cite or refuse", { size: 14, fill: C.star3, family: BODY, weight: 500 })}`;
}

// ── constellation drawing ────────────────────────────────
function star(cx, cy, color, label, lx, ly, anchor) {
  return `<circle cx="${cx}" cy="${cy}" r="14" fill="${color}" opacity="0.18"/>
  <circle cx="${cx}" cy="${cy}" r="6.5" fill="${color}"/>
  ${label ? t(lx, ly, label, { size: 15, fill: C.ink3, anchor }) : ""}`;
}
function thread(ax, ay, bx, by, dashed) {
  const mx=(ax+bx)/2, my=Math.min(ay,by)-46;
  return `<path d="M${ax} ${ay} Q ${mx} ${my} ${bx} ${by}" fill="none" stroke="${dashed?C.indigo:C.thread5}" stroke-width="${dashed?2:2.4}" opacity="${dashed?0.7:0.6}" ${dashed?'stroke-dasharray="6 7"':''}/>`;
}
function constellation(withCloud) {
  // clusters
  const law = [[300,300,"Actus reus & mens rea",276,250,"end"],[380,380,"Arrest & police powers",380,418,"middle"],[250,400,"General defences",234,406,"end"]];
  const con = [[930,300,"Fundamental rights",952,255,"start"],[1000,380,"Fair hearing (s.36)",1022,386,"start"],[900,420,"Separation of powers",922,440,"start"]];
  const cyb = [[600,510,"Network fundamentals",600,548,"middle"],[715,455,"SQL injection",735,460,"start"],[560,460,"Authentication & access",560,498,"middle"]];
  const cloud = [[600,250,"Identity & access",600,224,"middle"],[520,300,"Network & connectivity",504,306,"end"],[660,310,"Cloud concepts",682,316,"start"]];
  let s = "";
  // threads (curated)
  s += thread(380,380,930,300,false); // arrest ↔ rights
  s += thread(250,400,1000,380,false); // defences ↔ fair hearing
  s += thread(715,455,560,460,false); // sqli ↔ auth
  if (withCloud) {
    s += thread(520,300,600,510,true); // cloud network ↔ cyber network (inferred)
    s += thread(600,250,560,460,true); // cloud identity ↔ cyber auth (inferred)
  }
  const draw = (arr,color)=>arr.map(([x,y,l,lx,ly,an])=>star(x,y,color,l,lx,ly,an)).join("");
  s += draw(law,C.gold)+draw(con,C.indigo)+draw(cyb,C.orange);
  if (withCloud) s += draw(cloud,C.cloud);
  // captions
  s += t(300,210,"LAW 301",{size:14,fill:C.gold,family:MONO,anchor:"middle",spacing:1});
  s += t(960,225,"LAW 205",{size:14,fill:C.indigo,family:MONO,anchor:"middle",spacing:1});
  s += t(600,560,"CSC 312",{size:14,fill:C.orange,family:MONO,anchor:"middle",spacing:1});
  if (withCloud) s += t(600,200,"AZ-900",{size:14,fill:C.cloud,family:MONO,anchor:"middle",spacing:1});
  return s;
}

// ── Scene 1 : title ──────────────────────────────────────
const s1 = frame(`
  ${logo(640, 235, 2.2)}
  ${t(640, 360, "Constella", { size: 76, family: DISP, weight: 600, anchor: "middle", fill: C.ink1 })}
  ${t(640, 432, "Every answer has a source.", { size: 32, family: DISP, weight: 500, anchor: "middle", fill: C.ink1 })}
  ${t(640, 476, "Every subject has a thread.", { size: 32, family: DISP, weight: 500, anchor: "middle", fill: C.thread3 })}
  ${t(640, 540, "A field-agnostic AI study companion that studies from your own material —", { size: 20, anchor: "middle", fill: C.ink5 })}
  ${t(640, 568, "citing the exact line, or refusing honestly.", { size: 20, anchor: "middle", fill: C.ink5 })}
`, "");

// ── Scene 2 : constellation ──────────────────────────────
const s2 = frame(`
  ${header()}
  ${panel(80, 120, 1120, 510)}
  ${t(112, 168, "Your constellation", { size: 22, family: DISP, weight: 600 })}
  ${t(112, 196, "3 courses · 3 threads found across subjects", { size: 15, fill: C.ink5 })}
  <g transform="translate(0,40)">${constellation(false)}</g>
`, "Your courses, connected — understanding is connection.");

// ── Scene 3 : flashcard with proof ───────────────────────
const badge = (x,y,doc) => `<rect x="${x}" y="${y}" width="360" height="34" rx="17" fill="rgba(245,184,61,0.10)" stroke="rgba(245,184,61,0.45)"/>
  <path d="M${x+18} ${y+9} l8 0 0 9 -4 7 -4 -7 z" fill="none" stroke="${C.star3}" stroke-width="1.6"/>
  ${t(x+38, y+23, doc, { size: 14, fill: C.star3, family: MONO })}
  ${t(x+250, y+23, "from your material", { size: 11, fill: C.star3, family: BODY, spacing: 1, opacity: 0.8 })}`;
const ratebtns = (x,y) => {
  const defs=[["1 Again",C.ember],["2 Hard",C.star5],["3 Good",C.thread5],["4 Easy",C.ink5]];
  return defs.map((d,i)=>`<rect x="${x+i*150}" y="${y}" width="138" height="46" rx="12" fill="rgba(255,255,255,0.02)" stroke="${d[1]}" stroke-opacity="0.5"/>${t(x+i*150+69,y+30,d[0],{size:16,anchor:"middle",fill:d[1],weight:500})}`).join("");
};
const s3 = frame(`
  ${header()}
  ${panel(340, 150, 600, 400)}
  ${badge(372, 184, "LAW301-syllabus.txt · L13")}
  ${t(372, 280, "Only under warrant or recognised statutory", { size: 26, family: DISP, fill: C.ink1 })}
  ${t(372, 314, "powers — and the suspect must be told the", { size: 26, family: DISP, fill: C.ink1 })}
  ${t(372, 348, "reason for the arrest.", { size: 26, family: DISP, fill: C.ink1 })}
  ${ratebtns(372, 470)}
`, "Cite, don't guess — every answer carries its proof.");

// ── Scene 4 : tutor, cited ───────────────────────────────
function ledger(x, y, activeIdx) {
  const steps=["Reading question","Searching your material","Grounding answer","Cited & done"];
  let cx=x;
  return steps.map((s,i)=>{
    const done=i<activeIdx, active=i===activeIdx;
    const dot=`<circle cx="${cx}" cy="${y}" r="4" fill="${done?C.star5:active?C.thread5:C.ink7}"/>`;
    const lab=t(cx+12,y+5,s,{size:13,fill:done?C.ink3:active?C.thread3:C.ink7});
    const w=12+s.length*7+24;
    const arrow=i<3?t(cx+w-14,y+5,"→",{size:12,fill:C.ink7}):"";
    const out=dot+lab+arrow; cx+=w; return out;
  }).join("");
}
const s4 = frame(`
  ${header()}
  ${panel(80, 120, 1120, 510)}
  ${t(112, 166, "Ask your material", { size: 22, family: DISP, weight: 600 })}
  ${t(112, 194, "Answers come from your uploads, with the exact line cited — or an honest refusal.", { size: 15, fill: C.ink5 })}
  <rect x="112" y="222" width="900" height="48" rx="12" fill="${C.night7}" stroke="rgba(255,255,255,0.10)"/>
  ${t(132, 252, "When is an arrest lawful?", { size: 18, fill: C.ink1 })}
  <rect x="1028" y="222" width="140" height="48" rx="12" fill="${C.thread5}"/>
  ${t(1098, 252, "Ask", { size: 18, anchor: "middle", fill: "#0b0d16", weight: 600 })}
  <g transform="translate(112,320)">${ledger(0,0,3)}</g>
  <rect x="112" y="350" width="1056" height="210" rx="14" fill="rgba(18,20,31,0.6)" stroke="rgba(255,255,255,0.08)"/>
  ${badge(136, 374, "LAW301-syllabus.txt · L13")}
  ${t(136, 444, "From your own material in LAW 301 Criminal Law: an arrest is lawful only", { size: 19, fill: C.ink1 })}
  ${t(136, 476, "where effected under warrant or recognised statutory powers, and the", { size: 19, fill: C.ink1 })}
  ${t(136, 508, "suspect must be informed of the reason for the arrest.", { size: 19, fill: C.ink1 })}
`, "Grounded in your own notes — and read aloud, if you like.");

// ── Scene 5 : refusal + sources (KEY) ────────────────────
function srcRow(x, y, name, blurb) {
  return `${t(x, y, "↗", { size: 16, fill: C.thread3 })}
  ${t(x+24, y, name, { size: 17, fill: C.ink1, weight: 500 })}
  ${t(x+24, y+22, blurb, { size: 13, fill: C.ink5 })}`;
}
const s5 = frame(`
  ${header()}
  ${panel(80, 120, 1120, 510)}
  ${t(112, 166, "Ask your material", { size: 22, family: DISP, weight: 600 })}
  <rect x="112" y="196" width="900" height="48" rx="12" fill="${C.night7}" stroke="rgba(255,255,255,0.10)"/>
  ${t(132, 226, "What did the Supreme Court decide in 2025 about crypto?", { size: 17, fill: C.ink3 })}
  <rect x="112" y="270" width="1056" height="150" rx="14" fill="rgba(245,184,61,0.05)" stroke="rgba(245,184,61,0.40)"/>
  ${t(136, 300, "HONEST REFUSAL — NOT IN YOUR MATERIAL", { size: 13, fill: C.star3, family: MONO, spacing: 1 })}
  ${t(136, 338, "That isn't covered in the material you've uploaded, so I won't guess —", { size: 18, fill: C.ink1 })}
  ${t(136, 366, "a confident wrong answer is worse than an honest gap. You can upload the", { size: 18, fill: C.ink1 })}
  ${t(136, 394, "relevant notes, or flag this for your lecturer.", { size: 18, fill: C.ink1 })}
  <rect x="112" y="436" width="1056" height="170" rx="14" fill="rgba(26,29,44,0.5)" stroke="rgba(255,255,255,0.10)"/>
  <circle cx="140" cy="466" r="7" fill="none" stroke="${C.thread3}" stroke-width="2"/>
  ${t(156, 472, "Where to get trustworthy material on law", { size: 16, fill: C.ink3, weight: 500 })}
  ${srcRow(140, 512, "Cornell Legal Information Institute", "Authoritative statutes, cases & legal definitions, free.")}
  ${srcRow(640, 512, "Harvard Open Casebooks (H2O)", "Openly-licensed law casebooks from Harvard faculty.")}
  ${srcRow(140, 572, "MIT OpenCourseWare", "Free MIT lecture notes, assignments & full courses.")}
`, "It refuses to bluff — then points to trusted material.");

// ── Scene 6 : same engine, any subject ───────────────────
const s6 = frame(`
  ${header()}
  ${panel(80, 120, 1120, 510)}
  ${t(112, 168, "Your constellation", { size: 22, family: DISP, weight: 600 })}
  ${t(112, 196, "4 courses · 5 threads found across subjects", { size: 15, fill: C.ink5 })}
  <rect x="900" y="150" width="276" height="34" rx="17" fill="rgba(111,127,242,0.12)" stroke="rgba(111,127,242,0.45)"/>
  ${t(1038, 173, "✦ New course threaded in", { size: 14, fill: C.thread3, anchor: "middle", weight: 500 })}
  <g transform="translate(0,40)">${constellation(true)}</g>
`, "Same engine. Any subject. Threads itself in.");

// ── Scene 7 : readiness ──────────────────────────────────
function readRow(y, color, code, name, score, band, bandColor, barW, trend, focus, weak, weightActive, ready) {
  const x=112, w=1056;
  let s=`<rect x="${x}" y="${y}" width="${w}" height="96" rx="14" fill="${focus?'rgba(111,127,242,0.06)':'rgba(18,20,31,0.45)'}" stroke="${focus?'rgba(111,127,242,0.40)':'rgba(255,255,255,0.08)'}"/>`;
  s+=`<circle cx="${x+24}" cy="${y+30}" r="6" fill="${color}"/>`;
  s+=t(x+42,y+35,code,{size:14,fill:C.ink3,family:MONO});
  s+=t(x+120,y+35,name,{size:18,fill:C.ink1});
  if(focus) { s+=`<rect x="${x+330}" y="${y+18}" width="92" height="26" rx="13" fill="rgba(111,127,242,0.12)" stroke="rgba(111,127,242,0.40)"/>`+t(x+376,y+35,"focus now",{size:12,fill:C.thread3,anchor:"middle",weight:500}); }
  s+=t(x+w-70,y+36,trend,{size:18,fill:trend==="↑"?C.thread3:trend==="↓"?C.ember:C.ink5,anchor:"middle"});
  s+=t(x+w-26,y+36,String(score),{size:20,fill:bandColor,weight:600,anchor:"end"});
  // bar
  s+=`<rect x="${x+24}" y="${y+54}" width="${w-48}" height="8" rx="4" fill="rgba(255,255,255,0.08)"/>`;
  s+=`<rect x="${x+24}" y="${y+54}" width="${(w-48)*barW/100}" height="8" rx="4" fill="${bandColor}"/>`;
  let meta=band+(ready?"  ✓":"")+(weak?"   · weak on "+weak:"");
  s+=t(x+24,y+84,meta,{size:13,fill:bandColor});
  // weight buttons
  const ws=["Low","Med","High"];
  ws.forEach((wl,i)=>{ const act=i===weightActive; s+=`<rect x="${x+w-180+i*58}" y="${y+72}" width="52" height="22" rx="6" fill="${act?'rgba(111,127,242,0.12)':'transparent'}" stroke="${act?'rgba(111,127,242,0.5)':'rgba(255,255,255,0.12)'}"/>`+t(x+w-180+i*58+26,y+87,wl,{size:11,anchor:"middle",fill:act?C.thread3:C.ink5}); });
  return s;
}
const s7 = frame(`
  ${header()}
  ${panel(80, 120, 1120, 510)}
  ${t(112, 166, "What to study next", { size: 22, family: DISP, weight: 600 })}
  ${t(112, 194, "Your priority × the data from your daily answers. Not a grade — a diagnosis.", { size: 15, fill: C.ink5 })}
  ${readRow(220, C.gold, "LAW 301", "Criminal Law", 8, "needs work", C.ember, 8, "↓", true, "Arrest & police powers", 2, false)}
  ${readRow(330, C.indigo, "LAW 205", "Constitutional Law", 0, "not started", C.ink5, 4, "·", false, "", 1, false)}
  ${readRow(440, C.orange, "CSC 312", "Cybersecurity", 94, "exam-ready", C.thread3, 94, "↑", false, "", 1, true)}
  ${t(112, 590, "The course you've mastered drops down the list. The weak, high-priority one rises to the top.", { size: 15, fill: C.ink5 })}
`, "Diagnose, don't just score — what to study next.");

// ── Scene : the problem ──────────────────────────────────
function gripe(x, y, l1, l2) {
  return panel(x, y, 360, 150, 16) + t(x+24, y+58, l1, { size: 18, fill: C.ink1, family: DISP }) + t(x+24, y+90, l2, { size: 18, fill: C.ink1, family: DISP }) + t(x+24, y+122, "— a real student", { size: 13, fill: C.ink5 });
}
const sProblem = frame(`
  ${t(640, 150, "THE PROBLEM", { size: 16, family: MONO, fill: C.ember, anchor: "middle", spacing: 3 })}
  ${t(640, 222, "Students are drowning in material —", { size: 40, family: DISP, weight: 600, anchor: "middle" })}
  ${t(640, 274, "and can't trust the AI that summarises it.", { size: 40, family: DISP, weight: 600, anchor: "middle", fill: C.ink1 })}
  ${gripe(100, 360, "“500 pages a day.", "Law school is self-taught.”")}
  ${gripe(480, 360, "“The AI gave me case", "law that doesn't exist.”")}
  ${gripe(860, 360, "“I recognise it — then", "freeze in the exam.”")}
  ${t(640, 600, "Constella fixes all three.", { size: 22, family: DISP, weight: 500, anchor: "middle", fill: C.thread3 })}
`, "The problem we set out to solve.");

// ── Scene : onboarding survey ────────────────────────────
function fieldBox(x, y, w, lab, val) {
  return t(x, y, lab, { size: 11, fill: C.ink5, family: MONO, spacing: 1 }) +
    `<rect x="${x}" y="${y+10}" width="${w}" height="44" rx="10" fill="${C.night7}" stroke="rgba(255,255,255,0.10)"/>` +
    t(x+14, y+38, val, { size: 16, fill: C.ink1 });
}
const sOnboard = frame(`
  ${panel(330, 70, 620, 560)}
  ${t(362, 128, "✦ WELCOME TO CONSTELLA", { size: 12, family: MONO, fill: C.thread3, spacing: 2 })}
  ${t(362, 166, "Let's build your study plan", { size: 30, family: DISP, weight: 600 })}
  ${t(362, 196, "Two minutes now, and every card and deadline becomes about you.", { size: 15, fill: C.ink5 })}
  ${t(362, 236, "YOU", { size: 12, family: MONO, fill: C.ink3, spacing: 2 })}
  ${fieldBox(362, 252, 270, "YOUR NAME", "Erica")}
  ${fieldBox(652, 252, 270, "INSTITUTION", "University of Warwick")}
  ${t(362, 336, "YOUR DEGREE", { size: 12, family: MONO, fill: C.ink3, spacing: 2 })}
  ${fieldBox(362, 352, 190, "PROGRAMME", "LLB Law")}
  ${fieldBox(572, 352, 100, "YEAR", "2")}
  ${fieldBox(692, 352, 230, "FINALS", "08 Jul 2026")}
  ${t(362, 436, "YOUR GOAL BEYOND THE DEGREE", { size: 12, family: MONO, fill: C.star3, spacing: 2 })}
  ${fieldBox(362, 452, 180, "CAREER", "Cloud Engineer")}
  ${fieldBox(562, 452, 200, "CERTIFICATION", "AWS Cloud Pract.")}
  ${fieldBox(782, 452, 140, "CERT EXAM", "02 Aug")}
  ${t(362, 552, "Use the demo profile (Erica · Warwick)", { size: 13, fill: C.ink5 })}
  <rect x="742" y="528" width="180" height="46" rx="12" fill="${C.thread5}"/>
  ${t(832, 557, "Create my plan →", { size: 15, anchor: "middle", fill: "#0b0d16", weight: 600 })}
`, "The first thing you do is plan — a quick survey.");

// ── Scene : the personalised plan ────────────────────────
function statTile(x, y, lab, val, unit, accent) {
  return panel(x, y, 258, 104, 16) +
    t(x+20, y+34, lab, { size: 12, fill: C.ink5, family: MONO, spacing: 1 }) +
    `<text x="${x+20}" y="${y+82}" font-family="${DISP}" font-size="38" font-weight="600" fill="${accent}">${val}<tspan font-size="17" fill="${C.ink5}" font-weight="400"> ${unit}</tspan></text>`;
}
const sPlan = frame(`
  ${header()}
  ${t(112, 150, "YOUR STUDY PLAN", { size: 12, family: MONO, fill: C.thread3, spacing: 2 })}
  ${t(112, 192, "Hi Erica — here's your plan", { size: 36, family: DISP, weight: 600 })}
  <rect x="112" y="214" width="210" height="30" rx="15" fill="${C.night7}" stroke="rgba(255,255,255,0.10)"/>${t(132, 234, "University of Warwick", { size: 14, fill: C.ink3 })}
  <rect x="334" y="214" width="170" height="30" rx="15" fill="${C.night7}" stroke="rgba(255,255,255,0.10)"/>${t(354, 234, "LLB Law · Year 2", { size: 14, fill: C.ink3 })}
  <rect x="516" y="214" width="190" height="30" rx="15" fill="rgba(245,184,61,0.10)" stroke="rgba(245,184,61,0.35)"/>${t(536, 234, "→ Cloud Engineer", { size: 14, fill: C.star3 })}
  ${t(112, 282, "Your degree and your AWS Cloud Practitioner goal, threaded into one sky.", { size: 15, fill: C.ink5 })}
  <rect x="980" y="176" width="190" height="48" rx="12" fill="${C.thread5}"/>${t(1075, 206, "+ Add a course", { size: 16, anchor: "middle", fill: "#0b0d16", weight: 600 })}
  ${statTile(112, 330, "FINALS IN", "24", "days", C.ink1)}
  ${statTile(384, 330, "CERT EXAM IN", "49", "days", C.star3)}
  ${statTile(656, 330, "TOPICS TO MASTER", "9", "", C.ink1)}
  ${statTile(928, 330, "OVERALL READINESS", "34", "%", C.ember)}
  ${t(112, 500, "Statistics that update from your daily answers — so you always know where you stand.", { size: 15, fill: C.ink5 })}
`, "Your degree + your career, with the numbers that matter.");

// ── Scene : notifications / study all day ────────────────
const sNotify = frame(`
  ${header()}
  ${t(640, 190, "STUDY IN THE GAPS", { size: 14, family: MONO, fill: C.thread3, anchor: "middle", spacing: 3 })}
  <rect x="390" y="230" width="500" height="132" rx="18" fill="${C.night6}" stroke="rgba(255,255,255,0.12)"/>
  ${logo(430, 296, 0.9)}
  ${t(470, 266, "Constella", { size: 15, fill: C.ink3, family: MONO })}
  ${t(866, 266, "now", { size: 13, fill: C.ink7, anchor: "end" })}
  ${t(470, 300, "A minute for LAW 301?", { size: 20, fill: C.ink1, family: DISP, weight: 500 })}
  ${t(470, 332, "When is an arrest lawful?", { size: 16, fill: C.ink3 })}
  ${t(640, 444, "Flashcards resurface as gentle notifications all day —", { size: 22, family: DISP, anchor: "middle", fill: C.ink1 })}
  ${t(640, 480, "so you study in the gaps, not just in hour-long sessions.", { size: 22, family: DISP, anchor: "middle", fill: C.ink1 })}
  ${t(640, 540, "Tap to answer by voice or text. Repetition, without the guilt.", { size: 16, anchor: "middle", fill: C.ink5 })}
`, "Flashcards all day — study without sitting down to study.");

const scenes = {
  "scene01-problem": sProblem,
  "scene02-title": s1,
  "scene03-onboarding": sOnboard,
  "scene04-plan": sPlan,
  "scene05-constellation": s2,
  "scene06-flashcard": s3,
  "scene07-notify": sNotify,
  "scene08-refusal": s5,
  "scene09-anysubject": s6,
  "scene10-readiness": s7,
};
for (const [name, svg] of Object.entries(scenes)) writeFileSync(`${OUT}/${name}.svg`, svg);

// gallery so they can open ONE file in a browser and screenshot each frame
const gallery = `<!doctype html><html><head><meta charset="utf-8"><title>Constella — scenes</title>
<style>body{margin:0;background:#05060c;font-family:Segoe UI,Arial,sans-serif}.f{display:block;width:1280px;max-width:100%;margin:0 auto 28px}h2{color:#a6acbe;font-weight:500;max-width:1280px;margin:24px auto 8px}</style></head><body>
${Object.keys(scenes).map((n)=>`<h2>${n}</h2><img class="f" src="${n}.svg">`).join("\n")}
</body></html>`;
writeFileSync(`${OUT}/index.html`, gallery);

console.log("wrote", Object.keys(scenes).length, "scenes + index.html to", OUT);
