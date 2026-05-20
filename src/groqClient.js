// groqClient.js — YojanaSetu AI · Groq API handler
// Filters relevant schemes from schemesData and sends to Groq LLM

import { SCHEME_DB } from "./schemesData.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL        = "llama3-8b-8192"; // fast + free tier

// ─── KEYWORD → CATEGORY MAP ────────────────────────────────────────────────────
const KEYWORD_MAP = {
  farmer:   ["farmer","kisan","किसान","agriculture","fasal","crop","khet","kheti","pm kisan","rythu","shetkari","krishi"],
  student:  ["student","scholarship","education","छात्र","study","padhai","college","school","nsp","merit","tuition"],
  women:    ["women","mahila","महिला","girl","beti","widow","maternity","ladies","shg","naari","stree"],
  senior:   ["senior","old age","pension","वरिष्ठ","बुजुर्ग","elderly","aged","60 year","retire"],
  business: ["business","mudra","loan","व्यापार","entrepreneur","startup","shop","msme","small business","self employ"],
  housing:  ["house","awas","housing","ghar","घर","मकान","home","flat","construction","shelter","makaan"],
  health:   ["health","hospital","ayushman","स्वास्थ्य","treatment","medical","doctor","insurance","illness","bimari"],
};

// ─── SMART SCHEME FILTER ───────────────────────────────────────────────────────
// Returns lightweight text of 3–5 relevant schemes only (saves tokens)
function getRelevantSchemes(query) {
  const q = query.toLowerCase();
  let matched = [];

  for (const [cat, words] of Object.entries(KEYWORD_MAP)) {
    if (words.some(w => q.includes(w))) {
      const filtered = SCHEME_DB.filter(s => {
        if (cat === "health")   return s.tag.en.toLowerCase().includes("health");
        if (cat === "housing")  return ["housing","awas"].some(k => s.tag.en.toLowerCase().includes(k));
        return s.match({
          who: cat, income: "below1", age: "18to35",
          area: "rural", house: "no", state: "",
        });
      });
      matched = [...matched, ...filtered];
    }
  }

  // Fallback — top 4 national schemes if no keyword matched
  if (matched.length === 0) {
    matched = SCHEME_DB.filter(s => s.scope === "national").slice(0, 4);
  }

  // Deduplicate + limit to 5
  const unique = [...new Map(matched.map(s => [s.id, s])).values()].slice(0, 5);

  // Lightweight format: name · benefit · apply link only (saves ~60% tokens)
  return unique
    .map(s => `• ${s.name.en} (${s.name.hi}): ${s.benefit.en} — Apply: ${s.apply.en}`)
    .join("\n");
}

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are YojanaSetu AI — a friendly, helpful assistant for Indian government schemes.

Rules:
- Always reply in the SAME language the user writes in (Hindi → Hindi, English → English)
- Keep answers SHORT and mobile-friendly — 3 to 5 lines maximum
- Use simple words — many users are from rural areas with basic education
- Use emojis occasionally to stay warm and friendly
- Only answer questions about Indian government schemes, eligibility, documents, and application process
- If asked unrelated questions, politely redirect to schemes topic
- Never make up scheme details — use only the scheme data provided below
- For step-by-step guides, use numbered steps (1. 2. 3.)
- Always end with a helpful follow-up offer like "Want to know how to apply?" or "कोई और सवाल?"`;

// ─── MAIN EXPORT: sendMessage ──────────────────────────────────────────────────
export async function sendMessage(conversationHistory, userQuery) {
  const schemes      = getRelevantSchemes(userQuery);
  const schemeContext = schemes
    ? `\n\nRelevant schemes for this query:\n${schemes}`
    : "";

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  400,
      temperature: 0.65,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + schemeContext },
        ...conversationHistory.slice(-6), // last 6 messages for context window
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Groq API error");
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}
