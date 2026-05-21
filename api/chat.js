// api/chat.js — Vercel Serverless Function · YojanaSetu
// ─────────────────────────────────────────────────────────────────────────────
// SMART 5-KEY ROTATION with PERSISTENT state via Vercel KV (Upstash Redis)
//
// SETUP (one-time):
//   1. Vercel Dashboard → Storage → Create KV store → Connect to project
//      (This auto-adds KV_REST_API_URL and KV_REST_API_TOKEN to env vars)
//   2. npm install @vercel/kv
//   3. Add your 5 Groq keys in Vercel → Settings → Environment Variables:
//        GROQ_API_KEY_1 … GROQ_API_KEY_5
//
// HOW STATE IS STORED IN KV:
//   Key: "yojanasetu:rotation"
//   Value: {
//     cursor: 2,                        ← next key index to try
//     blocked: { "0": 1716300000000 }   ← key index → blockedUntil ms timestamp
//   }
//   TTL: 24 hours (auto-expires daily, clean slate each day)
//
// All Vercel instances share this single KV record — true cross-instance state.
// ─────────────────────────────────────────────────────────────────────────────

import { kv } from "@vercel/kv";

const GROQ_URL  = "https://api.groq.com/openai/v1/chat/completions";
const STATE_KEY = "yojanasetu:rotation";
const STATE_TTL = 60 * 60 * 24; // 24 hours in seconds

// ── Load all 5 Groq API keys from env ────────────────────────────────────────
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

// ── Read rotation state from KV (shared across all instances) ─────────────────
async function readState() {
  try {
    const state = await kv.get(STATE_KEY);
    return state ?? { cursor: 0, blocked: {} };
  } catch (err) {
    console.warn("[YojanaSetu] KV read failed — falling back to fresh state:", err.message);
    return { cursor: 0, blocked: {} };
  }
}

// ── Write rotation state back to KV ──────────────────────────────────────────
async function writeState(state) {
  try {
    await kv.set(STATE_KEY, state, { ex: STATE_TTL });
  } catch (err) {
    console.warn("[YojanaSetu] KV write failed — state not persisted:", err.message);
  }
}

// ── Check if a key index is available (not blocked, or block expired) ─────────
function isAvailable(blocked, index) {
  const until = blocked[String(index)];
  if (!until) return true;
  if (Date.now() >= until) return true; // cooldown expired — available again
  return false;
}

// ── Build ordered attempt list (round-robin from cursor, available first) ──────
function buildAttemptList(keys, state) {
  const now       = Date.now();
  const total     = keys.length;
  const available = [];
  const stillBlocked = [];

  for (let offset = 0; offset < total; offset++) {
    const index = (state.cursor + offset) % total;
    if (isAvailable(state.blocked, index)) {
      available.push({ key: keys[index], index });
    } else {
      stillBlocked.push({
        key:          keys[index],
        index,
        blockedUntil: state.blocked[String(index)],
      });
    }
  }

  // Try available keys first; blocked keys sorted by soonest recovery (last resort)
  stillBlocked.sort((a, b) => a.blockedUntil - b.blockedUntil);
  return [...available, ...stillBlocked];
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
          "No API keys configured. Add GROQ_API_KEY_1 … GROQ_API_KEY_5 " +
          "in Vercel → Settings → Environment Variables.",
      },
    });
  }

  // ── Read shared state from KV ──────────────────────────────────────────────
  const state      = await readState();
  const attemptList = buildAttemptList(keys, state);
  const body        = JSON.stringify(req.body);
  let   lastError   = null;

  for (const { key, index } of attemptList) {
    try {
      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body,
      });

      // ── 429: rate limited — block this key, try the next ──────────────────
      if (groqRes.status === 429) {
        const rawRetry   = groqRes.headers.get("retry-after");
        const retryAfterS = rawRetry ? Math.ceil(parseFloat(rawRetry)) : 62;
        const blockedUntil = Date.now() + retryAfterS * 1000;

        // Only extend block — never shorten an existing longer cooldown
        const existing = state.blocked[String(index)] || 0;
        if (blockedUntil > existing) {
          state.blocked[String(index)] = blockedUntil;
        }

        const errData = await groqRes.json().catch(() => ({}));
        lastError = errData;

        console.warn(
          `[YojanaSetu] Key #${index + 1} → 429. ` +
          `Blocked for ${retryAfterS}s. Trying next key…`
        );
        continue;
      }

      // ── Success (or non-429 error from Groq) ──────────────────────────────
      const data = await groqRes.json();

      if (groqRes.status === 200) {
        // Advance cursor so next request starts from the key AFTER this one
        state.cursor = (index + 1) % keys.length;

        // Clean up any expired blocks before saving
        const now = Date.now();
        for (const [i, until] of Object.entries(state.blocked)) {
          if (now >= until) delete state.blocked[i];
        }

        await writeState(state); // persist new cursor + cleaned state
        console.log(
          `[YojanaSetu] ✓ Key #${index + 1} succeeded. ` +
          `Next rotation cursor → Key #${state.cursor + 1}.`
        );
      } else {
        console.error(
          `[YojanaSetu] Groq error ${groqRes.status} on Key #${index + 1}:`,
          JSON.stringify(data).slice(0, 200)
        );
      }

      return res.status(groqRes.status).json(data);

    } catch (err) {
      // Network error — don't block the key, just try the next one
      console.error(`[YojanaSetu] Network error Key #${index + 1}:`, err.message);
      lastError = { message: err.message };
    }
  }

  // ── All keys tried and failed — save final blocked state ──────────────────
  await writeState(state);

  const now          = Date.now();
  const unblockTimes = Object.values(state.blocked).filter(t => t > now);
  const soonestSec   = unblockTimes.length
    ? Math.ceil((Math.min(...unblockTimes) - now) / 1000)
    : 60;

  const blockedCount = Object.values(state.blocked).filter(t => t > now).length;
  const msg = blockedCount === keys.length
    ? `All ${keys.length} API keys are rate-limited. ` +
      `First key recovers in ~${soonestSec}s. Please wait and try again.`
    : "All API keys failed (network error). Please try again.";

  console.error(`[YojanaSetu] ✗ All ${keys.length} keys exhausted. ${msg}`);

  return res.status(429).json({
    error: {
      message:           msg,
      retryAfterSeconds: soonestSec,
      keysConfigured:    keys.length,
      keysBlocked:       blockedCount,
      details:           lastError,
    },
  });
}
