// groqClient.js — YojanaSetu AI · Groq API handler
// REDESIGNED: Two-tier context system
//   Tier 1 (always present): App info, developer info, ALL scheme names + counts
//   Tier 2 (dynamic):        Full details of up to 6 relevant schemes per query
// This gives the AI complete awareness while keeping token usage low.

import { SCHEME_DB } from "./schemesData.js";

// ─── MODEL SELECTION ─────────────────────────────────────────────────────────
// llama-3.3-70b-versatile → 128K context · best quality on Groq free tier
//   • Much better at multi-turn conversations, Hindi, and nuanced scheme answers
//   • Same free-tier rate limits as 8b (30 RPM / 6K TPM / 1K RPD per key)
//   • Groq LPU keeps it fast despite 70B size (~300 tok/s)
//
// Alternatives (swap MODEL string if needed):
//   "llama-3.1-8b-instant"    → fastest, lowest quality, same limits
//   "llama-3.3-70b-versatile" → best quality ← CURRENT CHOICE
//   "llama-3.1-70b-versatile" → similar to 3.3-70b
//
const MODEL = "llama-3.3-70b-versatile";

// ─── DEVELOPER & APP IDENTITY ────────────────────────────────────────────────
// Single source of truth — update here to update AI knowledge everywhere.
const DEVELOPER = {
  name:      "Sahnawaz Ahmed Laskar",
  alias:     "The Digital Alchemist / SHZ",
  role:      "Full Stack Developer & UI/UX Designer",
  location:  "Silchar, Assam, India",
  education: "MCA, Yenepoya University, Bangalore",
  portfolio: "https://sahnawaz-portfolio.vercel.app",
  email:     "shzthedigitalalchemist@gmail.com",
  instagram: "https://instagram.com/sahnawaz.ui.dev",
  clients:   "Flipkart, Xiaomi India, Rapido",
  skills:    "React.js, Node.js, JavaScript, Python, PHP, Tailwind CSS, Figma, Firebase, Groq AI",
};

const APP = {
  name:        "YojanaSetu",
  tagline:     "Bridge between citizens and government schemes",
  url:         "https://yojana-setu-bice.vercel.app",
  description: "A mobile-first web app that helps Indian citizens (especially rural) discover, check eligibility for, and apply to Central and State government schemes in Hindi and English.",
  features: [
    "Home screen with popular schemes and category tiles",
    "Search tab to browse and filter all schemes",
    "Schemes tab with detailed eligibility checker",
    "AI Help tab — this AI assistant (Hindi + English)",
    "Profile tab for personalized scheme recommendations",
    "Eligibility quiz: asks about occupation, income, state, housing, age, area",
    "Suggested follow-up chips after each AI response",
    "Reading-time cooldown for rural users (10–15s after each reply)",
    "Light / dark mode, Ashok Chakra animation in header",
    "Powered by Groq AI (llama-3.1-8b-instant) via Vercel serverless API",
  ],
  tech: "React.js, Vercel, Groq API, Tailwind CSS, Vite",
  builtBy: DEVELOPER.name,
};

// ─── KEYWORD MAP ──────────────────────────────────────────────────────────────
const KEYWORD_MAP = {
  farmer:   ["farmer","kisan","farming","agriculture","crop","kheti","khet","krishi","ryot","shetkari","annadata","fasal","bima","rythu","kalia"],
  housing:  ["house","housing","home","awas","ghar","shelter","makaan","flat","room","plot","construction","build","pmay","gramin","abua"],
  women:    ["women","woman","female","girl","mahila","beti","widow","vidhwa","maternity","shg","ladki","nari","stri","sakhi","lakshmi","bahin","orunodoi"],
  student:  ["student","scholarship","education","study","college","school","padhai","chhatravritti","shiksha","university","degree","merit","nsp","vidyarthi","tablet","smartphone","nijut","moina","pragyan"],
  business: ["business","loan","mudra","startup","entrepreneur","shop","vyapar","udyog","msme","self employ","trade","dukaan","rozgar","vendor","artisan","vishwakarma","svanidhi","standup","atmanirbhar"],
  health:   ["health","hospital","medical","ayushman","treatment","doctor","swasthya","bimari","insurance","pmjay","dawai","ilaaj","chiranjeevi","amrutum","karunya","mohalla","sahara","atal amrit"],
  senior:   ["senior","pension","old age","elderly","budhapa","vridha","vridh","aged","retire","widow pension","60 year","bujurg","apy","atal pension"],
  ration:   ["ration","food","card","bpl","poverty","apl","pds","anaj","gehu","chawal","subsidy","antyodaya","nfsa"],
  insurance:["insurance","bima","jeevan","suraksha","pmjjby","pmsby","accident"],
  skill:    ["skill","training","kaushal","pmkvy","ddu","rozgar","employment","job","saksham","yuva"],
  water:    ["water","jal","jeevan","piped","toilet","swachh","sanitation","shauchalay"],
};

const ALL_STATES = [
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa",
  "gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala",
  "madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland",
  "odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura",
  "uttar pradesh","uttarakhand","west bengal","delhi","jammu","kashmir",
  "ladakh","puducherry","chandigarh","andaman",
  "up","mp","wb","ap","tn","hp","uk","mh","ka","rj","gj","pb","hr",
];

// ─── TIER 1: COMPACT INDEX OF ALL SCHEMES ────────────────────────────────────
// Gives the AI awareness of EVERY scheme name + count — tiny token footprint.
// Format: "🌾 PM Kisan Samman Nidhi | 🏠 PM Awas Yojana (Gramin) | ..."
function buildAllSchemesIndex() {
  const national = SCHEME_DB.filter(s => s.scope === "national");
  const byState  = {};

  SCHEME_DB.filter(s => s.scope === "state").forEach(s => {
    if (!byState[s.state]) byState[s.state] = [];
    byState[s.state].push(s);
  });

  const natList = national.map(s => `${s.icon} ${s.name.en}`).join(" | ");
  const stateList = Object.entries(byState)
    .map(([state, schemes]) =>
      `  ${state}: ${schemes.map(s => `${s.icon} ${s.name.en}`).join(", ")}`
    ).join("\n");

  return (
    `NATIONAL SCHEMES (${national.length}):\n${natList}\n\n` +
    `STATE SCHEMES (${Object.values(byState).flat().length}) — grouped by state:\n${stateList}`
  );
}

// ─── SMART CONTEXT BUILDER ───────────────────────────────────────────────────
// Scores every scheme against the query, then auto-picks detail depth:
//   • 1 scheme matched  → full card (docs, annual, link, ministry)
//   • 2–4 matched       → medium (benefit + link per scheme)
//   • 5+ matched / list → names only
//   • Nothing matched   → top 5 national, compact
function buildSmartContext(query, lang = "en") {
  const q = query.toLowerCase();
  const l = lang === "hi" ? "hi" : "en";

  // ── Detect state & detail-level signals from query ──────────────────────────
  const mentionedState = ALL_STATES.find(s => q.includes(s)) ?? null;
  const wantsCount  = /how many|kitni|kitne|total|count/.test(q);
  const wantsList   = /list|all scheme|sabhi|show all|sab yojna/.test(q);
  const wantsDetail = /document|kagaz|apply|avedan|eligib|yogyta|how to|kaise|kya chahiye|detail|full info|link|website|portal/.test(q);

  // ── Score each scheme against the query ─────────────────────────────────────
  const scored = SCHEME_DB.map(s => {
    const searchText = [
      s.name.en, s.name.hi,
      s.tag.en,  s.tag.hi,
      s.benefit.en, s.benefit.hi,
      s.id,
      s.state ?? "",
      s.ministry?.en ?? "",
    ].join(" ").toLowerCase();

    let score = 0;

    // Exact scheme name / id mention → very high boost
    if (q.includes(s.id.replace(/_/g, " "))) score += 20;
    if (q.includes(s.name.en.toLowerCase()))  score += 15;
    if (q.includes(s.name.hi.toLowerCase()))  score += 15;

    // State match
    if (mentionedState) {
      if (s.scope === "state" && s.state?.toLowerCase().includes(mentionedState)) score += 8;
      else if (s.scope === "national") score += 2; // national schemes always somewhat relevant
    }

    // Keyword category matches
    for (const [, kws] of Object.entries(KEYWORD_MAP)) {
      for (const kw of kws) {
        if (q.includes(kw) && searchText.includes(kw)) score += 3;
      }
    }

    // Query words found in scheme text
    const words = q.split(/\s+/).filter(w => w.length > 3);
    for (const w of words) {
      if (searchText.includes(w)) score += 1;
    }

    return { scheme: s, score };
  })
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

  // Fallback: top 5 national if nothing scored
  const matched = scored.length > 0
    ? scored.map(x => x.scheme)
    : SCHEME_DB.filter(s => s.scope === "national").slice(0, 5);

  // ── Helper: build official link ──────────────────────────────────────────────
  const getLink = (s) => {
    const raw = s.apply?.[l] ?? "";
    return raw ? (raw.startsWith("http") ? raw : `https://${raw}`) : null;
  };

  // ── FORMAT FUNCTIONS ─────────────────────────────────────────────────────────
  const formatFull = (s) => {
    const link = getLink(s);
    const docs = (s.docs?.[l] ?? []).join(", ") || "Aadhaar Card";
    const annual = s.annual > 0 ? `₹${s.annual.toLocaleString("en-IN")}/year` : "Non-monetary";
    return (
      `📌 ${s.name[l]} [${s.scope === "state" ? s.state : "Central"}]\n` +
      `  Ministry : ${s.ministry?.[l] ?? "—"}\n` +
      `  Benefit  : ${s.benefit[l]}\n` +
      `  Annual   : ${annual}\n` +
      `  Docs     : ${docs}\n` +
      `  Apply    : ${s.applyType === "online" ? "Online" : "At office"}` +
      (link ? `\n  OFFICIAL_LINK: ${link}` : "")
    );
  };

  const formatMedium = (s) => {
    const link = getLink(s);
    return (
      `• ${s.name[l]} [${s.scope === "state" ? s.state : "Central"}]\n` +
      `  ${s.benefit[l]}` +
      (link ? `\n  OFFICIAL_LINK: ${link}` : "")
    );
  };

  const formatName = (s, i) => {
    const link = getLink(s);
    return (
      `${i + 1}. **${s.name[l]}** [${s.scope === "state" ? s.state : "Central"}]` +
      (link ? `\n   OFFICIAL_LINK: ${link}` : "")
    );
  };

  // ── AUTO-PICK DEPTH based on match count + query signals ─────────────────────
  if (wantsCount || wantsList) {
    // Numbered list with links.
    // Pre-build the opening sentence so AI copies it exactly — never recounts.
    const lines = matched.map((s, i) => formatName(s, i)).join("\n");
    const label = matched.length === 1 ? "scheme" : "schemes";
    return (
      `START_YOUR_REPLY_WITH_EXACTLY: "There are ${matched.length} ${label} in our database for this."\n` +
      `TOTAL: ${matched.length} — do NOT recount, do NOT deduplicate by link.\n\n` +
      lines
    );
  }

  if (matched.length === 1 || wantsDetail) {
    // Full detail — 1 exact match OR user explicitly asked for details
    return matched.slice(0, 3).map(formatFull).join("\n\n");
  }

  if (matched.length <= 4) {
    // Medium — benefit + link per scheme
    return matched.slice(0, 4).map(formatMedium).join("\n\n");
  }

  // Many matches — compact names + benefit + link, cap at 6
  return matched.slice(0, 6).map(formatMedium).join("\n\n");
}


// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
// Built once per request. Contains:
//   • Language rule
//   • Identity (who you are, who built you, what app you live in)
//   • Scheme counts + full index (Tier 1) — AI knows everything
//   • Relevant scheme details (Tier 2) — injected at the end
function buildSystemPrompt(query, lang) {
  const isHindi  = lang === "hi";
  const national = SCHEME_DB.filter(s => s.scope === "national").length;
  const state    = SCHEME_DB.filter(s => s.scope === "state").length;
  const total    = SCHEME_DB.length;

  const langRule = isHindi
    ? "- ALWAYS reply in Hindi (हिंदी). Even if user writes in English, reply in Hindi only."
    : "- ALWAYS reply in English. Even if user writes in Hindi, reply in English only.";

  const chipsRule = isHindi
    ? `अपने जवाब के एकदम अंत में एक नई लाइन पर लिखें (valid JSON array):
CHIPS:["सवाल 1","सवाल 2","सवाल 3"]
- योजनाओं से संबंधित होने पर ही chips दें; असंबंधित सवालों पर CHIPS:[] लिखें
- हर chip 4–6 शब्द की हो`
    : `At the very END of your reply, on a new line, append (valid JSON array):
CHIPS:["question 1","question 2","question 3"]
- Provide chips ONLY for scheme-related queries; for off-topic messages use CHIPS:[]
- Keep each chip 4–7 words, specific and actionable`;

  // ── Context: only smart-scored relevant schemes for this query ───────────────
  const smartContext = buildSmartContext(query, lang);

  return `You are YojanaSetu AI — the official AI assistant of the YojanaSetu app.

══ YOUR IDENTITY ══
- App: ${APP.name} (${APP.tagline})
- Built by: ${DEVELOPER.name} aka "${DEVELOPER.alias}"
- If asked about the developer, share: Portfolio: ${DEVELOPER.portfolio} | Email: ${DEVELOPER.email} | Instagram: ${DEVELOPER.instagram}

══ DATABASE ══
- Total schemes: ${total} (${national} Central + ${state} State-specific)
- You only know what's in our database — never invent schemes not provided below

══ RULES ══
${langRule}
- Use simple words — many users are rural citizens

FORMATTING (follow strictly):
- When listing multiple schemes: ALWAYS number them as "1. **Scheme Name**" with bold name
- Show each scheme's OFFICIAL_LINK immediately below it as "🔗 https://..." on a new line
- NEVER use plain bullet dots (•) for scheme lists — use numbers
- COUNT RULE: If data has START_YOUR_REPLY_WITH_EXACTLY, copy that sentence word-for-word as your first line. NEVER recount the list yourself — two schemes sharing the same website are still two separate schemes
- NEVER hallucinate links — ONLY use links from OFFICIAL_LINK field in data below
- NEVER show "${APP.url}" as a link — user is already in the app
- If OFFICIAL_LINK is missing for a scheme: write "🔗 Apply at nearest govt. office"
- Full detail (docs, annual, ministry) only when user asks for details/documents/how to apply
- Do NOT use: # headers, backticks, or tables
- Only answer about: government schemes, eligibility, documents, how to apply, app features, developer info
- If off-topic, politely redirect to schemes
${chipsRule}

══ RELEVANT SCHEME DATA FOR THIS QUERY ══
${smartContext}
`;
}

// ─── PARSE AI RESPONSE → { reply, followUps } ────────────────────────────────
function parseResponse(raw) {
  const chipsMatch = raw.match(/CHIPS:\s*(\[[\s\S]*?\])/);
  let followUps = [];

  if (chipsMatch) {
    try { followUps = JSON.parse(chipsMatch[1]); } catch { followUps = []; }
  }

  // Strip ALL CHIPS blocks globally — handles mid-reply leaks too
  const reply = raw.replace(/\n?CHIPS:\s*\[[\s\S]*?\]/g, "").trim();

  followUps = [...new Set(followUps.filter(c => typeof c === "string" && c.trim()))].slice(0, 3);
  return { reply, followUps };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
// Returns { reply: string, followUps: string[] }
export async function sendMessage(conversationHistory, userQuery, lang = "en") {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  800,        // smart context keeps this well within Groq free tier limits
      temperature: 0.5,        // More factual accuracy for scheme data
      messages: [
        { role: "system", content: buildSystemPrompt(userQuery, lang) },
        ...conversationHistory.slice(-8), // 70b + 128K context handles 8 turns (4 exchanges) well
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error (${res.status})`);
  }

  const data = await res.json();
  return parseResponse(data.choices[0].message.content.trim());
}
