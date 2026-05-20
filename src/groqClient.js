// groqClient.js — YojanaSetu AI · Groq API handler
// SMART VERSION: only sends relevant schemes per query (not all 80+)
// Uses free llama-3.1-8b-instant (131K context, 560 t/s)

import { SCHEME_DB } from "./schemesData.js";

const MODEL = "llama-3.1-8b-instant"; // ✅ Free tier · 131K context · fastest on Groq

// ─── KEYWORD MAP ──────────────────────────────────────────────────────────────
// Maps topic categories to Hindi + English keywords
const KEYWORD_MAP = {
  farmer:   ["farmer","kisan","farming","agriculture","crop","kheti","khet","krishi","ryot","shetkari","annadata"],
  housing:  ["house","housing","home","awas","ghar","shelter","makaan","flat","room","plot","construction","build","pmay","gramin"],
  women:    ["women","woman","female","girl","mahila","beti","widow","vidhwa","maternity","shg","ladki","nari","stri","sakhi"],
  student:  ["student","scholarship","education","study","college","school","padhai","chhatravritti","shiksha","university","degree","merit","nsp","vidyarthi"],
  business: ["business","loan","mudra","startup","entrepreneur","shop","vyapar","udyog","msme","self employ","trade","dukaan","rozgar"],
  health:   ["health","hospital","medical","ayushman","treatment","doctor","swasthya","bimari","insurance","pmjay","dawai","ilaaj"],
  senior:   ["senior","pension","old age","elderly","budhapa","vridha","vridh","aged","retire","widow pension","60 year","bujurg"],
  ration:   ["ration","food","card","bpl","poverty","apl","pds","anaj","gehu","chawal","subsidy","antyodaya"],
  farmer2:  ["pm kisan","pmkisan","samman nidhi","6000"],
};

// All state names for detection
const ALL_STATES = [
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa",
  "gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala",
  "madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland",
  "odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura",
  "uttar pradesh","uttarakhand","west bengal","delhi","jammu","kashmir",
  "ladakh","puducherry","chandigarh","andaman",
  // Short forms
  "up","mp","wb","ap","tn","hp","uk","mh","ka","rj","gj","pb","hr",
];

// ─── SMART SCHEME FILTER ──────────────────────────────────────────────────────
// Returns only relevant schemes (max 12) based on query keywords
function getRelevantSchemes(query) {
  const q = query.toLowerCase();

  // 1. Detect state in query
  const matchedState = ALL_STATES.find(s => q.includes(s));

  // 2. Detect topic categories
  const matchedCategories = Object.entries(KEYWORD_MAP)
    .filter(([, keywords]) => keywords.some(kw => q.includes(kw)))
    .map(([cat]) => cat);

  // 3. Filter schemes
  let relevant = SCHEME_DB.filter(scheme => {
    const nameEn  = scheme.name.en.toLowerCase();
    const nameHi  = scheme.name.hi.toLowerCase();
    const tagEn   = scheme.tag.en.toLowerCase();
    const benefit = scheme.benefit.en.toLowerCase();

    // State filter: include national + matching state schemes
    const stateOk = !matchedState || scheme.scope === "national" ||
      (scheme.state && scheme.state.toLowerCase().includes(matchedState));

    // Category filter
    const allText = `${nameEn} ${nameHi} ${tagEn} ${benefit}`;
    const categoryOk = matchedCategories.length === 0 ||
      matchedCategories.some(cat =>
        KEYWORD_MAP[cat].some(kw => allText.includes(kw))
      );

    return stateOk && categoryOk;
  });

  // 4. If state was asked, boost state-specific schemes to top
  if (matchedState) {
    const stateSchemes   = relevant.filter(s => s.scope === "state");
    const nationalSchemes = relevant.filter(s => s.scope === "national");
    relevant = [...stateSchemes, ...nationalSchemes];
  }

  // 5. Fallback: if no match, send top 10 national schemes
  if (relevant.length === 0) {
    relevant = SCHEME_DB.filter(s => s.scope === "national").slice(0, 10);
  }

  // 6. Cap at 12 to keep tokens low
  return relevant.slice(0, 12);
}

// ─── BUILD COMPACT CONTEXT (only relevant schemes) ────────────────────────────
function buildSmartContext(query) {
  const schemes = getRelevantSchemes(query);

  const format = (s) =>
    `• [${s.id}] ${s.name.en} | ${s.name.hi}\n` +
    `  Benefit: ${s.benefit.en}\n` +
    `  Tag: ${s.tag.en} | Apply: ${s.apply.en}`;

  const stateSchemes    = schemes.filter(s => s.scope === "state");
  const nationalSchemes = schemes.filter(s => s.scope === "national");

  let context = "";
  if (nationalSchemes.length) {
    context += "=== NATIONAL SCHEMES ===\n" + nationalSchemes.map(format).join("\n\n");
  }
  if (stateSchemes.length) {
    context += "\n\n=== STATE SCHEMES ===\n" +
      stateSchemes.map(s => `[${s.state}]\n${format(s)}`).join("\n\n");
  }

  return context;
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
function buildSystemPrompt(lang) {
  const langRule = lang === "hi"
    ? "- ALWAYS reply in Hindi (हिंदी) only. No exceptions, even if user writes in English."
    : "- ALWAYS reply in English only. No exceptions, even if user writes in Hindi.";

  const followUp = lang === "hi"
    ? "- अंत में पूछें: \"कोई और सवाल?\""
    : "- End with: \"Want to know how to apply?\"";

  return `You are YojanaSetu AI — a friendly assistant for Indian government schemes.

Rules:
${langRule}
- Keep answers SHORT and mobile-friendly — 3 to 5 lines max
- Use simple words — users are from rural areas
- Use emojis occasionally to be warm and friendly
- Only answer about Indian government schemes, eligibility, documents, application
- If asked unrelated questions, politely redirect to schemes
- Use ONLY the scheme data provided — never make up scheme details
- For steps, use numbered list (1. 2. 3.)
${followUp}

RELEVANT SCHEMES FOR THIS QUERY:
`;
}

// ─── MAIN EXPORT: sendMessage ─────────────────────────────────────────────────
export async function sendMessage(conversationHistory, userQuery, lang = "en") {
  // Build context with ONLY relevant schemes for this query
  const smartContext = buildSmartContext(userQuery);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  400,        // Enough for mobile-friendly answers
      temperature: 0.6,
      messages: [
        { role: "system", content: buildSystemPrompt(lang) + smartContext },
        ...conversationHistory.slice(-4), // Last 4 messages only (saves tokens)
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error (${res.status})`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}
