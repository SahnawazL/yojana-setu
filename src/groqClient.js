// groqClient.js — YojanaSetu AI · Groq API handler
// REDESIGNED: Two-tier context system
//   Tier 1 (always present): App info, developer info, ALL scheme names + counts
//   Tier 2 (dynamic):        Full details of up to 6 relevant schemes per query
// This gives the AI complete awareness while keeping token usage low.

import { SCHEME_DB } from "./schemesData.js";

const MODEL = "llama-3.1-8b-instant"; // Free tier · 131K context · fastest on Groq

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
  instagram: "@sahnawaz.ui.dev",
  github:    "https://github.com/sahnawazl",
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

// ─── TIER 2: SMART RELEVANT SCHEME FILTER ────────────────────────────────────
// Returns full details of up to 6 most relevant schemes for the query.
function getRelevantSchemes(query) {
  const q = query.toLowerCase();
  const matchedState      = ALL_STATES.find(s => q.includes(s));
  const matchedCategories = Object.entries(KEYWORD_MAP)
    .filter(([, kws]) => kws.some(kw => q.includes(kw)))
    .map(([cat]) => cat);

  let relevant = SCHEME_DB.filter(scheme => {
    const allText = `${scheme.name.en} ${scheme.name.hi} ${scheme.tag.en} ${scheme.benefit.en}`.toLowerCase();
    const stateOk = !matchedState || scheme.scope === "national" ||
      (scheme.state && scheme.state.toLowerCase().includes(matchedState));
    const categoryOk = matchedCategories.length === 0 ||
      matchedCategories.some(cat => KEYWORD_MAP[cat].some(kw => allText.includes(kw)));
    return stateOk && categoryOk;
  });

  // Boost state-specific schemes to top when state is mentioned
  if (matchedState) {
    const stateSchemes    = relevant.filter(s => s.scope === "state");
    const nationalSchemes = relevant.filter(s => s.scope === "national");
    relevant = [...stateSchemes, ...nationalSchemes];
  }

  // Fallback: send top 6 national schemes if nothing matched
  if (relevant.length === 0) {
    relevant = SCHEME_DB.filter(s => s.scope === "national").slice(0, 6);
  }

  // Cap at 6 — enough detail without blowing token budget
  return relevant.slice(0, 6);
}

// ─── BUILD TIER 2 CONTEXT (full details for relevant schemes only) ─────────────
function buildSmartContext(query, lang = "en") {
  const schemes = getRelevantSchemes(query);
  const l = lang === "hi" ? "hi" : "en";

  const format = (s) =>
    `• [${s.id}] ${s.name[l]}\n` +
    `  Benefit: ${s.benefit[l]}\n` +
    `  Tag: ${s.tag[l]} | Apply: ${s.apply[l]}`;

  const stateSchemes    = schemes.filter(s => s.scope === "state");
  const nationalSchemes = schemes.filter(s => s.scope === "national");

  let ctx = "";
  if (nationalSchemes.length)
    ctx += "=== NATIONAL ===\n" + nationalSchemes.map(format).join("\n\n");
  if (stateSchemes.length)
    ctx += "\n\n=== STATE ===\n" + stateSchemes.map(s => `[${s.state}]\n${format(s)}`).join("\n\n");

  return ctx;
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

  // ── Tier 1: static knowledge ─────────────────────────────────────────────
  const allSchemesIndex = buildAllSchemesIndex();
  const smartContext    = buildSmartContext(query, lang);

  return `You are YojanaSetu AI — the official AI assistant of the YojanaSetu app.

══ YOUR IDENTITY ══
- You are built into the YojanaSetu app (${APP.url})
- App purpose: ${APP.tagline}
- App description: ${APP.description}
- App features: ${APP.features.join("; ")}
- Built with: ${APP.tech}

══ YOUR CREATOR ══
- Developer: ${DEVELOPER.name} (also known as "${DEVELOPER.alias}")
- Role: ${DEVELOPER.role}
- Location: ${DEVELOPER.location}
- Education: ${DEVELOPER.education}
- Portfolio: ${DEVELOPER.portfolio}
- Email: ${DEVELOPER.email}
- Instagram: ${DEVELOPER.instagram}
- GitHub: ${DEVELOPER.github}
- Past clients: ${DEVELOPER.clients}
- Skills: ${DEVELOPER.skills}
- If anyone asks who built this app or who you were made by, answer with the above details warmly and proudly.

══ SCHEME DATABASE STATS (use these exact numbers when asked) ══
- Total schemes in our database: ${total}
- National / Central schemes: ${national}
- State-specific schemes: ${state}

══ COMPLETE SCHEME INDEX (all ${total} schemes) ══
${allSchemesIndex}

══ RULES ══
${langRule}
- Keep answers SHORT and mobile-friendly — 4 to 7 lines max
- Use simple words — many users are from rural areas
- Use emojis occasionally to be warm and friendly
- Answer about: Indian government schemes, eligibility, documents, application process, app features, developer info
- If asked anything unrelated (jokes, weather, general knowledge), politely redirect to schemes
- Formatting: **bold** for scheme names and key terms, numbered lists (1. 2. 3.) for steps, bullet (- item) for options
- Do NOT use: # headers, backticks, tables, or heavy formatting
${chipsRule}

══ FULL DETAILS — RELEVANT SCHEMES FOR THIS QUERY ══
${smartContext}
`;
}

// ─── PARSE AI RESPONSE → { reply, followUps } ────────────────────────────────
function parseResponse(raw) {
  const chipsMatch = raw.match(/CHIPS:\s*(\[[\s\S]*?\])\s*$/m);
  let followUps = [];
  let reply = raw;

  if (chipsMatch) {
    try {
      followUps = JSON.parse(chipsMatch[1]);
      reply = raw.slice(0, chipsMatch.index).trim();
    } catch {
      reply = raw.replace(/CHIPS:\s*\[[\s\S]*?\]\s*$/m, "").trim();
    }
  }

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
      max_tokens:  600,        // Slightly more room for richer answers
      temperature: 0.55,       // Slightly more focused/factual
      messages: [
        { role: "system", content: buildSystemPrompt(userQuery, lang) },
        ...conversationHistory.slice(-4), // Last 4 turns for context
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
