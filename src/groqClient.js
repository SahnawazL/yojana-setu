// groqClient.js — YojanaSetu AI · Groq API handler
// Sends ALL scheme data to AI so it can answer any question from the database

import { SCHEME_DB } from "./schemesData.js";

const MODEL = "llama3-8b-8192";

// ─── BUILD FULL SCHEME CONTEXT (ALL schemes, compact format) ──────────────────
// Gives the AI knowledge of every scheme in the database
function buildFullSchemeContext() {
  const national = SCHEME_DB.filter(s => s.scope === "national");
  const state    = SCHEME_DB.filter(s => s.scope === "state");

  const format = (s) =>
    `• ${s.name.en} | ${s.name.hi} | ${s.tag.en} | ${s.benefit.en} | Apply: ${s.apply.en}`;

  return (
    "=== NATIONAL SCHEMES ===\n" +
    national.map(format).join("\n") +
    "\n\n=== STATE SCHEMES ===\n" +
    state.map(s => `[${s.state}] ${format(s)}`).join("\n")
  );
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are YojanaSetu AI — a friendly, helpful assistant for Indian government schemes.

Rules:
- Always reply in the SAME language the user writes in (Hindi → Hindi, English → English)
- Keep answers SHORT and mobile-friendly — 3 to 5 lines maximum
- Use simple words — many users are from rural areas with basic education
- Use emojis occasionally to stay warm and friendly
- Only answer questions about Indian government schemes, eligibility, documents, and application process
- If asked unrelated questions, politely redirect to schemes topic
- Use ONLY the scheme data provided below — never make up scheme details
- For step-by-step guides, use numbered steps (1. 2. 3.)
- Always end with a helpful follow-up offer like "Want to know how to apply?" or "कोई और सवाल?"

COMPLETE SCHEME DATABASE (use this to answer any question):
`;

// ─── MAIN EXPORT: sendMessage ─────────────────────────────────────────────────
export async function sendMessage(conversationHistory, userQuery) {
  const schemeContext = buildFullSchemeContext();

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  500,
      temperature: 0.65,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + schemeContext },
        ...conversationHistory.slice(-6),
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
