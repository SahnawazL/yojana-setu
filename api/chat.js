// api/chat.js — Vercel Serverless Function · YojanaSetu
// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE KEY ROTATION — no external KV/Redis required.
// Reads up to 5 Groq keys from env vars, tries them in round-robin order.
// Automatically skips 429-rate-limited keys and tries the next available one.
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Load all Groq API keys from env ──────────────────────────────────────────
function loadKeys() {
  const seen = new Set();
  const keys = [];
  const candidates = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
    process.env.GROQ_API_KEY_5,
  ];
  for (const k of candidates) {
    const t = k && k.trim();
    if (t && !seen.has(t)) { seen.add(t); keys.push(t); }
  }
  return keys;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const keys = loadKeys();
  if (keys.length === 0) {
    return res.status(500).json({
      error: {
        message:
          "No API keys configured. Add GROQ_API_KEY_1 in " +
          "Vercel → Settings → Environment Variables, then redeploy.",
      },
    });
  }

  const body = JSON.stringify(req.body);
  let lastError = null;

  // Try each key in order; skip on 429, return on success or other error
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body,
      });

      // 429 → rate limited, try the next key
      if (groqRes.status === 429) {
        const errData = await groqRes.json().catch(() => ({}));
        lastError = errData;
        console.warn(`[YojanaSetu] Key #${i + 1} → 429 rate limited. Trying next key…`);
        continue;
      }

      // Success or any other Groq error — return as-is
      const data = await groqRes.json();
      if (groqRes.status === 200) {
        console.log(`[YojanaSetu] ✓ Key #${i + 1} succeeded.`);
      } else {
        console.error(
          `[YojanaSetu] Groq error ${groqRes.status} on Key #${i + 1}:`,
          JSON.stringify(data).slice(0, 200)
        );
      }
      return res.status(groqRes.status).json(data);

    } catch (err) {
      // Network error — try next key
      console.error(`[YojanaSetu] Network error on Key #${i + 1}:`, err.message);
      lastError = { message: err.message };
    }
  }

  // All keys exhausted
  const msg = keys.length > 1
    ? `All ${keys.length} API keys are rate-limited or unavailable. Please wait a moment and try again.`
    : "API key is rate-limited or unavailable. Please wait a moment and try again.";

  console.error(`[YojanaSetu] ✗ All ${keys.length} key(s) exhausted.`);

  return res.status(429).json({
    error: {
      message: msg,
      details: lastError,
    },
  });
}
