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
    "Schemes tab: browse ALL schemes with category filter pills (🌾Farmer · 📚Student · 👩Women · 👴Senior · 💼Business · 🏠Housing) and state selector (top-right); the All(N) pill shows the live total count",
    "AI Help tab — this AI assistant (Hindi + English)",
    "Profile tab for personalized scheme recommendations",
    "Eligibility quiz: asks about occupation, income, state, housing, age, area",
    "Suggested follow-up chips after each AI response",
    "Reading-time cooldown for rural users (10–15s after each reply)",
    "Light / dark mode, Ashok Chakra animation in header",
    "Powered by Groq AI (llama-3.3-70b-versatile) via Vercel serverless API",
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

// ─── STOP WORDS ───────────────────────────────────────────────────────────────
// Generic words that appear in almost every query but should NOT boost any scheme's score.
// Without this, "how many scheme record you have" matches every scheme because "scheme"
// appears in every scheme name → all 70+ schemes score > 0 → chaos.
const STOP_WORDS = new Set([
  "scheme","yojana","yojna","total","many","have","give","show","list","about",
  "what","which","tell","please","karo","batao","dikha","kitne","kitni","kuch",
  "aapke","aapki","your","you","this","that","with","from","more","also","just",
  "know","want","need","find","help","info","data","record","database","much",
  "each","every","some","only","here","does","when","where",
]);

// ─── PER-STATE SCHEME COUNT BUILDER ──────────────────────────────────────────
// Returns exact per-state counts derived from SCHEME_DB — never hallucinated.
function buildStateBreakdown() {
  const byState = {};
  SCHEME_DB.filter(s => s.scope === "state").forEach(s => {
    const key = s.state ?? "Unknown";
    byState[key] = (byState[key] ?? 0) + 1;
  });
  return Object.entries(byState)
    .sort((a, b) => b[1] - a[1])
    .map(([state, count]) => `  ${state}: ${count} scheme${count > 1 ? "s" : ""}`)
    .join("\n");
}


// ─── COUNT GUIDANCE BUILDER ───────────────────────────────────────────────────
// Returns a bilingual in-app navigation guide for any count-related question.
// The Schemes tab shows LIVE counts directly from SCHEME_DB — always accurate,
// even after new schemes are added to state files without redeploying the AI.
function buildCountGuidance(lang, context = "total") {
  const isHindi = lang === "hi";

  if (isHindi) {
    const base = `\n\n📱 **ऐप में सटीक गिनती देखें (हमेशा सही रहती है):**
1. नीचे नेविगेशन बार में **"योजनाएं"** टैब पर टैप करें
2. सबसे ऊपर **"सभी योजनाएं"** पिल में लाइव कुल संख्या दिखती है
3. श्रेणी के अनुसार: 🌾 किसान · 📚 छात्र · 👩 महिला · 👴 वरिष्ठ · 💼 व्यापार · 🏠 आवास — किसी भी पिल पर टैप करें
4. अपने राज्य की योजनाएं: ऊपर दाईं ओर **"🇮🇳 सभी राज्य"** बटन → अपना राज्य चुनें`;

    if (context === "state") {
      return base + `\n5. राज्य चुनने के बाद **"सभी योजनाएं"** पिल में केवल उस राज्य की + केंद्रीय योजनाएं दिखेंगी`;
    }
    if (context === "category") {
      return base + `\n   (श्रेणी पिल में टैप करने पर उस श्रेणी की कुल योजनाएं दिखती हैं)`;
    }
    return base;
  }

  const base = `\n\n📱 **Check the exact count live in the app (always accurate):**
1. Tap the **"Schemes"** tab in the bottom navigation bar
2. The **"All Schemes"** pill at the top shows the live total — updates whenever new schemes are added
3. By category: tap 🌾 Farmer · 📚 Student · 👩 Women · 👴 Senior · 💼 Business · 🏠 Housing to see each category's count
4. By state: tap the **"🇮🇳 All States"** button (top-right) → select your state`;

  if (context === "state") {
    return base + `\n5. After selecting a state, the **"All Schemes"** pill shows only that state's schemes + Central schemes`;
  }
  if (context === "category") {
    return base + `\n   (The **"All Schemes"** pill updates as you switch category filters)`;
  }
  return base;
}

// ─── SMART CONTEXT BUILDER ───────────────────────────────────────────────────
// Scores every scheme against the query, then auto-picks detail depth:
//   • Total/global count query  → exact totals + per-state breakdown (NO listing)
//   • 1 scheme matched          → full card (docs, annual, link, ministry)
//   • 2–4 matched               → medium (benefit + link per scheme)
//   • 5+ matched / list query   → names only, capped at 6
//   • Nothing matched           → top 5 national, compact
//
// FIX Bug 2: accepts `profile` so implicit attributes (gender, occupation, state)
// boost keyword scoring even when the query itself omits those words.
function buildSmartContext(query, lang = "en", profile = null) {
  const q = query.toLowerCase();

  // ── Build a profile-augmented query string for keyword scoring ───────────────
  // Example: female farmer in Assam asking "what schemes can I get?" now also
  // scores against "farmer kisan women mahila assam" even though none appear in q.
  const profileTokens = [];
  if (profile) {
    if (profile.occupation) {
      const occMap = { farmer:"farmer kisan kheti", student:"student scholarship padhai", women:"homemaker mahila", senior:"senior elderly pension", business:"business loan udyog", general:"" };
      profileTokens.push(occMap[profile.occupation] ?? profile.occupation);
    }
    if (profile.gender === "female") profileTokens.push("women mahila female girl beti nari");
    if (profile.state)     profileTokens.push(profile.state.toLowerCase());
    if (profile.ration === "bpl" || profile.ration === "aay") profileTokens.push("bpl poverty ration food");
    if (profile.disability && profile.disability !== "none")  profileTokens.push("disability divyang");
    if (profile.income === "below1") profileTokens.push("below poverty poor");
    if (profile.area === "rural")    profileTokens.push("rural gramin village");
  }
  // Merge: original query gets full weight; profile tokens augment it
  const augQ = (q + " " + profileTokens.join(" ")).trim();
  const l = lang === "hi" ? "hi" : "en";

  // ── Detect state & detail-level signals from query ──────────────────────────
  // Use augQ (profile-aware) for state detection so profile.state boosts state schemes
  const mentionedState = ALL_STATES.find(s => augQ.includes(s)) ?? null;
  const wantsCount  = /how many|kitni|kitne|total|count/.test(q);
  const wantsList   = /list|all scheme|sabhi|show all|sab yojna|sab yojana/.test(q);
  const wantsDetail = /document|kagaz|apply|avedan|eligib|yogyta|how to|kaise|kya chahiye|detail|full info|link|website|portal/.test(q);

  // ── Detect "total/overall count" queries (no specific topic) ─────────────────
  // Use q (raw query) so profile tokens don't accidentally suppress total-count detection
  const NO_TOPIC = !ALL_STATES.find(s => q.includes(s)) &&
    !/farmer|kisan|health|student|women|mahila|housing|awas|business|pension|senior|insurance|ration|water|jal|skill/.test(q);
  const wantsTotalCount = (wantsCount || wantsList) && NO_TOPIC;

  // ── Detect per-state breakdown request ───────────────────────────────────────
  const wantsStateBreakdown = /each state|state.?wise|har state|per state|state mein kitni|state ke liye|every state/.test(q) && (wantsCount || wantsList);

  // ── Score each scheme against the profile-augmented query ───────────────────
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

    // Exact scheme name / id mention → very high boost (query only, not profile)
    if (q.includes(s.id.replace(/_/g, " "))) score += 20;
    if (q.includes(s.name.en.toLowerCase()))  score += 15;
    if (q.includes(s.name.hi.toLowerCase()))  score += 15;

    // State match — uses augQ so profile.state boosts correct state schemes
    if (mentionedState) {
      if (s.scope === "state" && s.state?.toLowerCase().includes(mentionedState)) score += 8;
      else if (s.scope === "national") score += 2; // national schemes always somewhat relevant
    }

    // Keyword category matches — uses augQ so profile occupation/gender fire keywords
    for (const [, kws] of Object.entries(KEYWORD_MAP)) {
      for (const kw of kws) {
        if (augQ.includes(kw) && searchText.includes(kw)) score += 3;
      }
    }

    // Words found in scheme text — augQ includes profile tokens, skip stop words
    const words = augQ.split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    for (const w of words) {
      if (searchText.includes(w)) score += 1;
    }

    return { scheme: s, score };
  })
  .filter(x => x.score >= 2)   // >= 2 prevents spurious matches on generic words
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

  // CASE B checked first — it is more specific than CASE A.
  // "how many for each state" matches both wantsTotalCount AND wantsStateBreakdown;
  // without this ordering, Case A would fire and swallow the state breakdown query.

  // CASE B: User asks per-state count breakdown
  if (wantsStateBreakdown) {
    const national = SCHEME_DB.filter(s => s.scope === "national").length;
    const stateTotal = SCHEME_DB.filter(s => s.scope === "state").length;
    const breakdown = buildStateBreakdown();
    const guidance = buildCountGuidance(l, "state");
    return (
      `The ${stateTotal} state-specific schemes are distributed as follows (use these EXACT numbers — do not change them):\n` +
      breakdown + "\n\n" +
      `There are also ${national} Central (national) schemes available to all states.\n` +
      `Do NOT invent or modify these numbers.\n\n` +
      `AFTER giving the breakdown, append this navigation tip for the user:` +
      guidance
    );
  }

  // CASE A: User asks total count OR wants to list all schemes (no specific topic)
  // → Give exact numbers + guide user to Schemes tab for live counts.
  if (wantsTotalCount) {
    const national = SCHEME_DB.filter(s => s.scope === "national").length;
    const stateTotal = SCHEME_DB.filter(s => s.scope === "state").length;
    const total = SCHEME_DB.length;
    const guidance = buildCountGuidance(l, "total");

    if (wantsList) {
      // User wants to SEE all schemes — provide full compact index + app guidance
      return (
        `EXACT DATABASE TOTAL: ${total} schemes (${national} Central + ${stateTotal} State-specific).\n` +
        `List them ALL using ONLY the names below — do NOT add, remove, or rename any:\n\n` +
        buildAllSchemesIndex() +
        `\n\nAPPEND THIS GUIDANCE AT THE END OF YOUR REPLY (translate to ${l === "hi" ? "Hindi" : "English"}):` +
        guidance
      );
    }

    // User only wants the COUNT
    const breakdown = buildStateBreakdown();
    return (
      `ANSWER THIS EXACTLY: The database currently has ${total} total schemes — ${national} Central (national) schemes and ${stateTotal} State-specific schemes.\n` +
      `Do NOT list all scheme names unless explicitly asked.\n` +
      `Per-state distribution (use EXACT numbers — do not invent):\n` +
      breakdown +
      `\n\nAFTER giving the count, ALWAYS append this guidance (it helps users see live counts):` +
      guidance
    );
  }

  // CASE C: Count/list for a specific topic (e.g. "how many farmer schemes")
  if (wantsCount || wantsList) {
    if (matched.length === 0) {
      return `No schemes found in the database matching that specific criteria. There are ${SCHEME_DB.length} total schemes (${SCHEME_DB.filter(s=>s.scope==="national").length} Central + ${SCHEME_DB.filter(s=>s.scope==="state").length} State).`;
    }
    // Numbered list with links.
    // Pre-build the opening sentence so AI copies it exactly — never recounts.
    const lines = matched.map((s, i) => formatName(s, i)).join("\n");
    const label = matched.length === 1 ? "scheme" : "schemes";
    const guidance = buildCountGuidance(l, "category");
    return (
      `YOUR FIRST LINE MUST BE EXACTLY THIS (do not include this label in your reply):\n` +
      `There are ${matched.length} ${label} in our database for this.\n\n` +
      `TOTAL: ${matched.length} — do NOT recount, do NOT deduplicate by link.\n\n` +
      lines +
      `\n\nAFTER the numbered list, append this navigation tip for the user:` +
      guidance
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
function buildSystemPrompt(query, lang, profile = null) {
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
  const smartContext = buildSmartContext(query, lang, profile);

  return `You are YojanaSetu AI — the official AI assistant of the YojanaSetu app.

══ YOUR IDENTITY ══
- App: ${APP.name} (${APP.tagline})
- Built by: ${DEVELOPER.name} aka "${DEVELOPER.alias}"
- If asked about the developer, share: Portfolio: ${DEVELOPER.portfolio} | Email: ${DEVELOPER.email} | Instagram: ${DEVELOPER.instagram}

══ DATABASE ══
- EXACT total: ${total} schemes (${national} Central + ${state} State-specific)
- NEVER guess or invent scheme counts — the context below always has the exact numbers
- NEVER invent per-state counts — only use the breakdown provided in the context
- You only know what's in our database — never add or rename schemes

══ APP NAVIGATION (guide users here for live counts) ══
- Schemes tab (bottom nav): shows ALL schemes with live count in "All (N)" pill
- Category filter pills in Schemes tab: 🌾 Farmer · 📚 Student · 👩 Women · 👴 Senior · 💼 Business · 🏠 Housing
- State selector button (top-right of Schemes tab): filter by state → shows that state's + Central schemes
- Home tab: category tiles show count badges — always live
- Eligibility Checker: Home/Profile → "Check Eligibility" → 6 questions → personal matched schemes
- COUNT QUERIES: Always give the number from context, THEN guide user to Schemes tab to verify live

══ RULES ══
${langRule}
- PROFILE CONTEXT: When the conversation history contains a "[Profile context for personalization …]" message, use EVERY field — Gender, Occupation, State, Income, Ration card, Disability, Marital status, Children — to personalize ALL recommendations. Never ignore the profile.
- GENDER AWARENESS: If profile Gender is Female, proactively include women-specific schemes (Mahila, Beti, Maternity, SHG, Widow, Nari schemes) alongside other relevant ones — even if the user's query does not mention "women". If Gender is Male, skip women-only schemes unless the user explicitly asks.
- GREETINGS: When the user's message is ONLY a greeting (hi / hello / hey / namaste / हेलो / नमस्ते / हाय / good morning / good evening) — respond warmly using the respectful address, ask how you can help, and briefly mention what you can assist with. Never dump scheme data as a reply to a pure greeting.
- SMART NAME USE: Use the respectful address (Mr./Mrs./Ms. + first name in English; [Name] जी in Hindi) at greetings, when giving personalized advice, and at the start of key recommendations. Do NOT repeat the name in every sentence — once per response is enough.
- Use simple words — many users are rural citizens

FORMATTING (follow strictly):
- When listing multiple schemes: ALWAYS number them as "1. **Scheme Name**" with bold name
- Show each scheme's OFFICIAL_LINK immediately below it as "🔗 https://..." on a new line
- NEVER use plain bullet dots (•) for scheme lists — use numbers
- COUNT RULE: If data has "YOUR FIRST LINE MUST BE EXACTLY THIS", use that sentence as your very first line — do NOT include the label itself. NEVER recount the list yourself — two schemes sharing the same website are still two separate schemes
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
// FIX Bug 2: accepts profile so buildSmartContext can score schemes against
// the user's implicit attributes (occupation, gender, state) not just the query.
export async function sendMessage(conversationHistory, userQuery, lang = "en", profile = null) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  lang === "hi" ? 1200 : 800, // Hindi responses are longer — extra headroom to avoid mid-sentence cutoff
      temperature: 0.5,        // More factual accuracy for scheme data
      messages: (() => {
        // FIX Bug 1: Profile context (positions 0 & 1) must ALWAYS be included.
        // Detect profile prefix by the sentinel text injected in AIChat.jsx.
        // Slice only the actual conversation messages (everything after the 2 profile rows).
        const hasProfile =
          conversationHistory.length >= 2 &&
          conversationHistory[0]?.content?.includes("[Profile context for personalization");
        const profilePart = hasProfile ? conversationHistory.slice(0, 2) : [];
        const chatPart    = (hasProfile ? conversationHistory.slice(2) : conversationHistory).slice(-6);
        return [
          { role: "system", content: buildSystemPrompt(userQuery, lang, profile) },
          ...profilePart,   // always present — never sliced away
          ...chatPart,      // last 6 chat turns (3 exchanges) — fits 70b context easily
        ];
      })(),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error (${res.status})`);
  }

  const data = await res.json();
  return parseResponse(data.choices[0].message.content.trim());
}
